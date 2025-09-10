from django.shortcuts import render
from rest_framework import viewsets, status, filters
from products.api.permissions import HasRolePermission, HasRoleAdminPermission, allowed_roles
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.views import APIView
from products.api.permissions import CanEditMedicalInfo
from django.contrib.auth import get_user_model
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend





from .models import ( 
    ActivitiesPhoto,
    MedicalInfo, 
    Student, 
    Teacher, 
    Parent, 
    Classroom, 
    FinancialRecord, 
    Meals, 
    Activities, 
    DailyMenu,
    Event,
    Announcement
    
)




from .serializers import (
    DailyMenuSerializer,
    MedicalInfoSerializer,
    StudentSerializer,
    TeacherSerializer,
    ParentSerializer,
    ClassroomSerializer,
    FinancialRecordSerializer,
    MealsSerializer,
    ActivitiesSerializer,
    MyTokenObtainPairSerializer,
    UserSerializer,
    ActivitiesPhotoSerializer,
    EventSerializer,
    AnnouncementSerializer
)


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'teacher', 'parent']

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Student.objects.none()

        role = getattr(user, 'role', None)

        if role == 'parent':
            return Student.objects.filter(parents__user=user)
        elif role == 'teacher':
            try:
                teacher = Teacher.objects.get(user=user)
            except Teacher.DoesNotExist:
                return Student.objects.none()
            return Student.objects.filter(
                classroom__in=teacher.classrooms.all()
            )
        elif role == 'admin':
            return Student.objects.all()

        return Student.objects.none()

    def update(self, request, *args, **kwargs):
        student = self.get_object()
        user = request.user
        role = getattr(user, 'role', None)

        if role == 'parent':
            if not student.parents.filter(user=user).exists():
                return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)

            # Περιορίζουμε τα πεδία που μπορεί να ενημερώσει ο γονέας
            allowed_fields = ['allergies']
            data = {field: request.data[field] for field in allowed_fields if field in request.data}

            serializer = self.get_serializer(student, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)

        # Για admin/teacher συνεχίζουμε κανονικά
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['post'], url_path='meals')
    def track_meal(self, request, pk=None):
        student = self.get_object()
        status_level = request.data.get('status')
        meal_type = request.data.get('meal', 'lunch')
        date = request.data.get('date')

        if not status_level:
            return Response({'error': 'Missing status'}, status=status.HTTP_400_BAD_REQUEST)

        Meals.objects.create(
            student=student,
            status=status_level,
            meal=meal_type,
            date=date or timezone.now().date(),
            updated_by=request.user if request.user.is_authenticated else None
        )

        return Response({'message': 'Meal tracked successfully'}, status=status.HTTP_201_CREATED)
@api_view(['GET'])
@permission_classes([HasRolePermission])
def teacher_list(request):
    teachers = Teacher.objects.select_related('user').all()
    data = [
        {
            'id': teacher.id,
            'name': teacher.name,
            'user_id': teacher.user.id,
            'username': teacher.user.username
        }
        for teacher in teachers
    ]
    return Response(data)



class ParentList(APIView):
    """
    Επιστρέφει λίστα όλων των Parent instances.
    Ελέγχει authentication και role-based authorization.
    """
    permission_classes = [ HasRolePermission]
    allowed_roles      = ['admin', 'teacher', 'parent']

    def get(self, request):
        # Φόρτωση γονέων με related user για efficiency
        parents = Parent.objects.select_related('user').all()

        # Σειριοποίηση σε JSON-φιλικά dicts
        data = [
            {
                'id':       parent.id,
                'name':     parent.name,
                'user_id':  parent.user.id,
                'username': parent.user.username
            }
            for parent in parents
        ]

        return Response(data)


class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.select_related('user') \
                              .prefetch_related('classrooms')
    serializer_class = TeacherSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'teacher']

    # filter_backends = [DjangoFilterBackend]
    filterset_fields = ['classrooms']

    def get_queryset(self):
        qs = super().get_queryset()
        classroom_id = self.request.query_params.get('classroom')
        if classroom_id:
            qs = qs.filter(classrooms__id=classroom_id)
        return qs
    
    @action(detail=False, methods=['get'], url_path='by-user/(?P<user_id>[^/.]+)')
    def get_by_user(self, request, user_id=None):
        try:
            teacher = Teacher.objects.get(user__id=user_id)
            serializer = self.get_serializer(teacher)
            return Response(serializer.data)
        except Teacher.DoesNotExist:
            return Response({'detail': 'Teacher not found.'}, status=404)
    
    


class TeacherUsersView(APIView):
    permission_classes = [HasRoleAdminPermission]
    

    def get(self, request):
        User = get_user_model()
        teachers = User.objects.filter(role='teacher')
        data = [{'id': u.id, 'name': f"{u.first_name} {u.last_name}".strip()} for u in teachers]
        return Response(data)


class ParentViewSet(viewsets.ModelViewSet):
    queryset = Parent.objects.all()
    serializer_class = ParentSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'parent', 'teacher']
    # filter_backends = [filters.SearchFilter]
    search_fields = [
    'user__first_name',
    'user__last_name',
    'students__name', 
]

@api_view(['GET'])
def parent_users(request, pk=None):
    User = get_user_model()

    if pk is not None:
        try:
            user = User.objects.get(pk=pk, role='parent')
            data = {
                'id': user.id,
                'name': f"{user.first_name} {user.last_name}".strip(),
                'phone': user.phone
            }
            return Response(data)
        except User.DoesNotExist:
            return Response({'detail': 'Parent user not found.'}, status=404)

    # Αν δεν δόθηκε ID, επιστρέφει λίστα
    parents = User.objects.filter(role='parent')
    data = [
        {
            'id': user.id,
            'name': f"{user.first_name} {user.last_name}".strip(),
            'phone': user.phone
        }
        for user in parents
    ]
    return Response(data)



class ClassroomViewSet(viewsets.ModelViewSet):
    queryset = Classroom.objects.all()
    serializer_class = ClassroomSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'teacher', 'parent']

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', None)

        if role == 'admin' or user.is_staff:
            return Classroom.objects.all()

        if role == 'teacher':
            try:
                teacher = Teacher.objects.get(user=user)
                return teacher.classrooms.all()
            except Teacher.DoesNotExist:
                return Classroom.objects.none()

        if role == 'parent':
            try:
                parent = Parent.objects.get(user=user)
                student_classroom_ids = parent.students.values_list('classroom_id', flat=True)
                return Classroom.objects.filter(id__in=student_classroom_ids)
            except Parent.DoesNotExist:
                return Classroom.objects.none()

        return Classroom.objects.none()


class FinancialRecordViewSet(viewsets.ModelViewSet):
    queryset = FinancialRecord.objects.all()
    serializer_class = FinancialRecordSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'parent']

    def get_queryset(self):
        user = self.request.user
        print(f"User: {user}, Role: {user.role}")

        if user.role == 'admin':
            return FinancialRecord.objects.all()

        elif user.role == 'parent':
            try:
                parent = Parent.objects.get(user=user)
                return FinancialRecord.objects.filter(student__parents=parent)
            except Parent.DoesNotExist:
                return FinancialRecord.objects.none()

        return FinancialRecord.objects.none()



class MealsViewSet(viewsets.ModelViewSet):
    queryset = Meals.objects.all()
    serializer_class = MealsSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'teacher', 'parent']
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['student', 'date']

    def get_queryset(self):
        user = self.request.user

        if user.role == 'admin':
            return Meals.objects.all()

        if user.role == 'teacher':
            try:
                teacher = Teacher.objects.get(user=user)
                classrooms = teacher.classrooms.all()
                students = Student.objects.filter(classroom__in=classrooms)
                return Meals.objects.filter(student__in=students)
            except Teacher.DoesNotExist:
                return Meals.objects.none()

        if user.role == 'parent':
            try:
                parent = Parent.objects.get(user=user)
                student_ids = parent.students.values_list('id', flat=True)
                return Meals.objects.filter(student_id__in=student_ids)
            except Parent.DoesNotExist:
                return Meals.objects.none()

        return Meals.objects.none()


    


class DailyMenuViewSet(viewsets.ModelViewSet):
    queryset = DailyMenu.objects.all()
    serializer_class = DailyMenuSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'parent', 'teacher']

# class MessagesViewSet(viewsets.ModelViewSet):
#     queryset = Messages.objects.all()
#     serializer_class = MessagesSerializer
#     permission_classes = [HasRolePermission]
#     allowed_roles = ['admin', 'teacher', 'parent']


class ActivitiesPhotoViewSet(viewsets.ModelViewSet):
    queryset = ActivitiesPhoto.objects.all()
    serializer_class = ActivitiesPhotoSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'teacher', 'parent']

    


class ActivitiesViewSet(viewsets.ModelViewSet):
    queryset = Activities.objects.all()
    serializer_class = ActivitiesSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'teacher', 'parent']

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', None)

        if user.is_staff or role == 'admin':
            return Activities.objects.all()

        if role == 'teacher':
            try:
                teacher = Teacher.objects.get(user=user)
                return Activities.objects.filter(classroom__in=teacher.classrooms.all())
            except Teacher.DoesNotExist:
                return Activities.objects.none()


        if role == 'parent':
            try:
                parent = Parent.objects.get(user=user)
                students = parent.students.all()
                classroom_ids = students.values_list('classroom_id', flat=True)
                return Activities.objects.filter(classroom__in=classroom_ids)
            except Parent.DoesNotExist:
                return Activities.objects.none()

        return Activities.objects.none()



# class MeetingsViewSet(viewsets.ModelViewSet):
#     queryset = Meetings.objects.all()
#     serializer_class = MeetingsSerializer
#     permission_classes = [HasRolePermission]
#     allowed_roles = ['admin', 'teacher', 'parent']



class UpdateMedicalInfo(viewsets.ModelViewSet):
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'parent']
    queryset = MedicalInfo.objects.all()
    serializer_class = MedicalInfoSerializer

    def get_queryset(self):
        student_id = self.kwargs.get('student_id')
        return MedicalInfo.objects.filter(student__id=student_id)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        try:
            instance = self.get_object()
        except MedicalInfo.DoesNotExist:
            return Response({"error": "Δεν βρέθηκε ιατρικός φάκελος."}, status=404)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response({"message": "Ο ιατρικός φάκελος ενημερώθηκε επιτυχώς."})
        return Response(serializer.errors, status=400)
    
class UserViewSet(viewsets.ModelViewSet):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
    permission_classes = [HasRoleAdminPermission]

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer



class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'parent', 'teacher'] 

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'parent', 'teacher'] 
