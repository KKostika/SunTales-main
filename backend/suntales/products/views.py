from django.shortcuts import render
from rest_framework import viewsets, status, filters
from products.api.permissions import HasRolePermission, HasRoleAdminPermission
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
    Messages, 
    Meetings,
    DailyMenu,
    
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
    MessagesSerializer,
    ActivitiesSerializer,
    MeetingsSerializer,
    MyTokenObtainPairSerializer,
    UserSerializer,
    ActivitiesPhotoSerializer,
)


# Create your views here.


# class StudentViewSet(viewsets.ModelViewSet):
#     queryset = Student.objects.all()
#     serializer_class = StudentSerializer
#     permission_classes = [partial(HasRolePermission, roles=['admin', 'teacher'])]
#     # def get_permissions(self):
#     #     return [HasRolePermission(roles=['admin']), HasRolePermission(roles=['teacher'])]


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
            return Student.objects.filter(classroom__teacher__user=user)
        elif role == 'admin':
            return Student.objects.all()

        return Student.objects.none()

    def update(self, request, *args, **kwargs):
        student = self.get_object()
        user = request.user
        role = getattr(user, 'role', None)

        if role == 'parent' and not student.parents.filter(user=user).exists():
            return Response({'error': 'Not allowed'}, status=status.HTTP_403_FORBIDDEN)

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
@permission_classes([HasRoleAdminPermission])
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

@api_view(['GET'])
@permission_classes([HasRoleAdminPermission])
def parent_list(request):
    parents = Parent.objects.select_related('user').all()
    data = [
        {
            'id': parent.id,
            'name': parent.name,
            'user_id': parent.user.id,
            'username': parent.user.username
        }
        for parent in parents
    ]
    return Response(data)



class TeacherViewSet(viewsets.ModelViewSet):
    """
    Επιστρέφει μόνο τους teachers που ανήκουν στο classroom
    που δίνεται στο query param `classroom`.
    """
    queryset = Teacher.objects.select_related('user') \
                              .prefetch_related('classrooms')
    serializer_class = TeacherSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'teacher']

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['classrooms']

    def get_queryset(self):
        """
        Αντί για το default `?classrooms=…`, δέχεται `?classroom=…`
        και φιλτράρει με βάση το id του classroom.
        """
        qs = super().get_queryset()
        classroom_id = self.request.query_params.get('classroom')
        if classroom_id:
            qs = qs.filter(classrooms__id=classroom_id)
        return qs


@api_view(['GET'])
@permission_classes([HasRoleAdminPermission])
def teacher_users(request):
    User = get_user_model()
    teachers = User.objects.filter(role='teacher')
    data = [{'id': u.id, 'name': f"{u.first_name} {u.last_name}".strip()} for u in teachers]
    return Response(data)


class ParentViewSet(viewsets.ModelViewSet):
    queryset = Parent.objects.all()
    serializer_class = ParentSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'parent']
    filter_backends = [filters.SearchFilter]
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
            teacher = getattr(user, 'teacher_profile', None)
            if teacher:
                return teacher.classrooms.all()

        if role == 'parent':
            children = getattr(user, 'children', None)
            if children:
                classroom_ids = children.values_list('classroom_id', flat=True)
                return Classroom.objects.filter(id__in=classroom_ids)

        return Classroom.objects.none()

class FinancialRecordViewSet(viewsets.ModelViewSet):
    queryset = FinancialRecord.objects.all()
    serializer_class = FinancialRecordSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'parent']

    def get_queryset(self):
        user = self.request.user

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

        if user.role in ['admin', 'teacher']:
            return Meals.objects.all()

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
    allowed_roles = ['admin', 'parent']

class MessagesViewSet(viewsets.ModelViewSet):
    queryset = Messages.objects.all()
    serializer_class = MessagesSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'teacher', 'parent']


class ActivitiesPhotoViewSet(viewsets.ModelViewSet):
    queryset = ActivitiesPhoto.objects.all()
    serializer_class = ActivitiesPhotoSerializer
    permission_classes = [HasRoleAdminPermission]
    allowed_roles = ['admin', 'teacher']

    


class ActivitiesViewSet(viewsets.ModelViewSet):
    queryset = Activities.objects.all()
    serializer_class = ActivitiesSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'teacher', 'parent']

    def get_queryset(self):
        user = self.request.user
       
        if user.is_staff or getattr(user, 'role', None) == 'admin':
            return Activities.objects.all()

        if getattr(user, 'role', None) == 'teacher':
            classroom = getattr(user, 'teacher_classroom', None)
            if classroom:
                return Activities.objects.filter(classroom=classroom)

        if getattr(user, 'role', None) == 'parent':
            children = getattr(user, 'children', None)
            if children:
                classrooms = children.values_list('classroom', flat=True)
                return Activities.objects.filter(classroom__in=classrooms)

        return Activities.objects.none()
    
@api_view(['GET'])
@permission_classes([HasRolePermission])
def activities_by_classroom(request):
    user = request.user
    role = getattr(user, 'role', None)

    if role == 'admin' or user.is_staff:
        classrooms = Classroom.objects.all()
    elif role == 'teacher':
        teacher = getattr(user, 'teacher_profile', None)
        classrooms = teacher.classrooms.all() if teacher else Classroom.objects.none()
    elif role == 'parent':
        children = getattr(user, 'children', None)
        classroom_ids = children.values_list('classroom_id', flat=True) if children else []
        classrooms = Classroom.objects.filter(id__in=classroom_ids)
    else:
        classrooms = Classroom.objects.none()

    data = []
    for classroom in classrooms:
        activities = Activities.objects.filter(classroom=classroom)
        data.append({
            'classroom': {
                'id': classroom.id,
                'name': classroom.name
            },
            'activities': [
                {
                    'id': activity.id,
                    'title': activity.title,
                    'description': activity.description,
                    'date': activity.date
                }
                for activity in activities
            ]
        })

    return Response(data)



class MeetingsViewSet(viewsets.ModelViewSet):
    queryset = Meetings.objects.all()
    serializer_class = MeetingsSerializer
    permission_classes = [HasRolePermission]
    allowed_roles = ['admin', 'teacher', 'parent']



class UpdateMedicalInfo(viewsets.ModelViewSet):
    permission_classes = [CanEditMedicalInfo]
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


   


