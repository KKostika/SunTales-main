from rest_framework import serializers
from .models import Activities, Announcement, Classroom, FinancialRecord, Meals, Meetings, Messages, Parent, Student, Teacher, MedicalInfo, DailyMenu, ActivitiesPhoto, Event, Announcement
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model



User = get_user_model()
class ParentSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    name = serializers.SerializerMethodField()
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    student = serializers.SerializerMethodField()
    activities = serializers.SerializerMethodField()
    finance = serializers.SerializerMethodField()

    class Meta:
        model = Parent
        fields = [
            'id', 'name', 'phone', 'user',
            'first_name', 'last_name', 'email',
            'student', 'activities', 'finance'
        ]
        read_only_fields = ['name', 'first_name', 'last_name', 'email']

    def get_student(self, obj):
        return [
            {
                'id': s.id,
                'name': s.name,
                'classroom': s.classroom.id if s.classroom else None,
                'age': s.age
            }
            for s in obj.students.all()
        ]

    
    def get_name(self, obj):
        user = obj.user
        full_name = f"{user.first_name} {user.last_name}".strip()
        return full_name or "Unnamed"

    def get_activities(self, obj):
        student = Student.objects.filter(parents=obj).first()
        if student and student.classroom:
            activities = Activities.objects.filter(classroom_id=student.classroom.id)
            return [{'name': a.name, 'description': a.description} for a in activities]
        return []

    def get_finance(self, obj):
        student = Student.objects.filter(parents=obj).first()
        if student:
            txs = FinancialRecord.objects.filter(student=student)
            return [{'description': tx.description, 'amount': tx.amount, 'status': tx.status} for tx in txs]
        return []

class MealsSerializer(serializers.ModelSerializer):
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())
    class Meta:
        model = Meals
        fields = '__all__'


class SimpleTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ['id', 'name']


class ClassroomSerializer(serializers.ModelSerializer):
    students = serializers.SerializerMethodField()
    teacher = SimpleTeacherSerializer(read_only=True)

    class Meta:
        model = Classroom
        fields = ['id', 'name', 'teacher', 'students']

    def get_students(self, obj):
        user = self.context['request'].user
        role = getattr(user, 'role', None)

        if role == 'parent':
            try:
                parent = Parent.objects.get(user=user)
                students = obj.students.filter(parents=parent)
            except Parent.DoesNotExist:
                students = Student.objects.none()
        elif role == 'teacher':
            try:
                teacher = Teacher.objects.get(user=user)
                students = obj.students.filter(teacher=teacher)
            except Teacher.DoesNotExist:
                students = Student.objects.none()
        else:
            students = obj.students.all()

        return [
            {
                'id': student.id,
                'name': student.name,
                'age': student.age,
            }
            for student in students
        ]

class TeacherSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='teacher')
    )
    name = serializers.CharField(read_only=True)
    phone = serializers.SerializerMethodField()
    activities = serializers.SerializerMethodField()
    classrooms = ClassroomSerializer(many=True, read_only=True)
    classroom_ids = serializers.PrimaryKeyRelatedField(
        source='classrooms',
        many=True,
        write_only=True,
        queryset=Classroom.objects.all()
    )

    class Meta:
        model = Teacher
        fields = [
            'id', 'name', 'phone', 'user',
            'classrooms', 'classroom_ids', 'activities'
        ]
        read_only_fields = ['name']


    def get_phone(self, obj):
        return obj.user.phone

    def get_activities(self, obj):
        qs = Activities.objects.filter(classroom__in=obj.classrooms.all())
        return [{'name': a.name, 'description': a.description} for a in qs]

    def create(self, validated_data):
        classrooms = validated_data.pop('classrooms', [])
        teacher = Teacher.objects.create(**validated_data)
        teacher.classrooms.set(classrooms)
        return teacher

    def update(self, instance, validated_data):
        classrooms = validated_data.pop('classrooms', None)
        instance = super().update(instance, validated_data)
        if classrooms is not None:
            instance.classrooms.set(classrooms)
        return instance






class StudentSerializer(serializers.ModelSerializer):
    parents = serializers.PrimaryKeyRelatedField(queryset=Parent.objects.all(), many=True)
    parent_details = serializers.SerializerMethodField()
    meals = MealsSerializer(many=True, read_only=True)
    teacher_details = serializers.SerializerMethodField()
    classroom_id = serializers.PrimaryKeyRelatedField(source='classroom', queryset=Classroom.objects.all())
    classroom = ClassroomSerializer(read_only=True)


    class Meta:
        model = Student
        fields = [
            'id',
            'name',
            'age',
            'enrollment_date',
            'teacher',
            'teacher_details',
            'classroom_id',
            'classroom',
            'parents',
            'parent_details',
            'allergies',
            'meals'
        ]

    def get_teacher_details(self, obj):
        if obj.teacher and obj.teacher.user:
            return {
                'name': obj.teacher.name,
                'email': obj.teacher.user.email,
                'phone': obj.teacher.phone,
            }
        return None

    def get_parent_details(self, obj):
        return [
            {
                'id': parent.id,
                'name': parent.name,
                'phone': parent.phone,
                'user_id': parent.user.id,  
                'user': UserSerializer(parent.user).data  
            }
            for parent in obj.parents.all()
        ]



class FinancialRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    parent_name = serializers.SerializerMethodField()

    class Meta:
        model = FinancialRecord
        fields = ['id', 'student', 'student_name', 'parent_name', 'amount', 'date', 'description', 'status']

    def get_parent_name(self, obj):
        try:
            parent = obj.student.parents.first()
            if parent and parent.user:
                return f"{parent.user.first_name} {parent.user.last_name}".strip()
            return '—'
        except Exception:
            return '—'







class MealsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meals
        fields = ['id', 'student', 'meal', 'date', 'status', 'notes', 'updated_by']
        read_only_fields = ['notes', 'updated_by']

    def validate(self, data):
        student = data.get('student')
        meal = data.get('meal')
        date = data.get('date')

        if Meals.objects.filter(student=student, meal=meal, date=date).exists():
            raise serializers.ValidationError(
                f"Meal '{meal}' for student '{student}' on {date} already exists."
            )

        return data

    def create(self, validated_data):
        # Emoji map based on status
        emoji_map = {
            0: "🐦",
            1: "🐭",
            2: "🐼",
            3: "🦁"
        }

        status = validated_data.get('status')
        emoji = emoji_map.get(status, '')
        status_label = dict(Meals.MEAL_STATUS_CHOICES).get(status, 'Unknown')

        # Auto-generate notes
        validated_data['notes'] = f"{emoji} {status_label}"
        validated_data['updated_by'] = self.context['request'].user

        return super().create(validated_data)



class DailyMenuSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyMenu
        fields = ['id', 'date', 'breakfast', 'lunch']

class ActivitiesPhotoSerializer(serializers.ModelSerializer):
    activity = serializers.PrimaryKeyRelatedField(queryset=Activities.objects.all())

    class Meta:
        model = ActivitiesPhoto
        fields = ['id', 'image', 'caption', 'activity', 'uploaded_at']

class ActivitiesSerializer(serializers.ModelSerializer):
    classroom = ClassroomSerializer(read_only=True)
    classroom_id = serializers.PrimaryKeyRelatedField(
        queryset=Classroom.objects.all(),
        write_only=True,
        source='classroom'
    )

    photos = ActivitiesPhotoSerializer(many=True, read_only=True)
    photo_ids = serializers.PrimaryKeyRelatedField(
        queryset=ActivitiesPhoto.objects.all(),
        many=True,
        write_only=True,
        required=False
    )

    class Meta:
        model = Activities
        fields = [
            'id',
            'name',
            'date',
            'description',
            
            'classroom',
            'classroom_id',
            'photos',
            'photo_ids'
        ]




# class MessagesSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Messages
#         fields = '__all__'

# class MeetingsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Meetings
#         fields = '__all__'  

#     def __str__(self):
#         return f"{self.name} on {self.date} at {self.time}"
    

# class MedicalInfoSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = MedicalInfo
#         fields = "__all__"



class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = get_user_model()
        fields = ['id', 'username', 'email', 'role', 'password', 'first_name', 'last_name', 'phone']
        read_only_fields = ['id']

    def validate_role(self, value):
        user = self.context['request'].user
        if user.role != 'admin':
            raise serializers.ValidationError("Only admins can assign roles.")
        return value

    def create(self, validated_data):
        user = get_user_model().objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', '')
        )
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Προσθέτεις custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role if hasattr(user, 'role') else 'user'

        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)

        # Προσθέτεις έξτρα πεδία στο response
        data['username'] = self.user.username
        data['email'] = self.user.email
        data['role'] = self.user.role if hasattr(self.user, 'role') else 'user'

        return data
    

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = '__all__'

