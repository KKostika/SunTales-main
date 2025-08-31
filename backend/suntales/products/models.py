from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from datetime import timezone, timedelta
from django.utils import timezone
import jwt


# Create your models here.
class Student(models.Model):
    name = models.CharField(max_length=100, default="Unnamed")
    age = models.PositiveIntegerField()
    enrollment_date = models.DateField(default=timezone.now)

    teacher = models.ForeignKey(
        'Teacher',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students'
    )

    parents = models.ManyToManyField(
        'Parent',
        related_name='students',
        blank=True
    )

    classroom = models.ForeignKey(
        'Classroom',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students'
    )

    allergies = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.age} y.o.)"

class Teacher(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    classrooms = models.ManyToManyField('Classroom', related_name='teachers', blank=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    name = models.CharField(max_length=100, editable=False, default="Unnamed")

    def save(self, *args, **kwargs):
        self.name = f"{self.user.first_name} {self.user.last_name}".strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Parent(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, blank=True)
    name = models.CharField(max_length=100, editable=False, default="Unnamed")


    def save(self, *args, **kwargs):
        # Συγχρονισμός ονόματος πριν από την αποθήκευση
        name = f"{self.user.first_name} {self.user.last_name}".strip()
        if name:
            self.name = name
           
        # Αντιγραφή από User προς Parent
        if self.user and self.user.phone != self.phone:
            self.phone = self.user.phone
        super().save(*args, **kwargs)

        # Αντιγραφή από Parent προς User (αν έχει αλλάξει)
        if self.user.phone != self.phone:
            self.user.phone = self.phone
            self.user.save()

    def __str__(self):
        return self.name


class Classroom(models.Model):
    name = models.CharField(max_length=100, default="Unnamed")
    

    def __str__(self):
        return self.name
    

class FinancialRecord(models.Model):
    STATUS_CHOICES = (
        ('paid', 'Paid'),
        ('unpaid', 'Unpaid'),
    )

    student = models.ForeignKey('Student', on_delete=models.CASCADE, related_name='financial_records')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid')

    def __str__(self):
        return f"{self.student.name} - {self.amount}€ on {self.date}"

    
class Meals(models.Model):
    MEAL_STATUS_CHOICES = [
       (0, 'Bird skip'),
        (1, 'Mouse nibble'),
        (2, 'Panda munch'),
        (3, 'Lion feast')
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    meal = models.CharField(max_length=50)  # π.χ. lunch, snack
    date = models.DateField()
    status = models.IntegerField(choices=MEAL_STATUS_CHOICES, default=0)
    notes = models.TextField(blank=True)
    updated_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        emoji_map = {
            0: "🐦",
            1: "🐭",
            2: "🐼",
            3: "🦁"
        }
        return f"{self.student.name} - {self.meal} on {self.date} ({emoji_map.get(self.status)} {self.get_status_display()})"



    


class DailyMenu(models.Model):
    date = models.DateField()
    breakfast = models.TextField(blank=True)
    lunch = models.TextField(blank=True)

    def __str__(self):
        return f"{self.date.strftime('%A')} - {self.date}"

    
class Activities(models.Model):
    name = models.CharField(max_length=100, default="Unnamed")
    date = models.DateField()
    description = models.TextField(blank=True)
    classroom = models.ForeignKey('Classroom', on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Activities.objects.all()
        elif hasattr(user, 'teacher_classroom'):
            return Activities.objects.filter(classroom=user.teacher_classroom)
        elif hasattr(user, 'children'):
            classrooms = [child.classroom for child in user.children.all()]
            return Activities.objects.filter(classroom__in=classrooms)
        return Activities.objects.none()


class ActivitiesPhoto(models.Model):
    activity = models.ForeignKey(Activities, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='activities_photos/')
    caption = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo for {self.activity.name}"
    
class Messages(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    parent = models.ForeignKey(Parent, on_delete=models.CASCADE)
    administrator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date_sent = models.DateTimeField(auto_now_add=True)
    content = models.TextField()

    def __str__(self):
        return f"Message from {self.teacher.name} to {self.parent.name} on {self.date_sent}"
    
class Meetings(models.Model):
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=255)
    agenda = models.TextField(blank=True)
    participants = models.ManyToManyField(Teacher, blank=True)

    def __str__(self):
        return f"Meeting on {self.date} at {self.time} - {self.location}"


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('parent', 'Parent'),
    )

    role = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES,
        default='parent'
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    teacher_classroom = models.OneToOneField(
        'Classroom',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='teacher_user'
    )

    def generate_jwt(self):
        payload = {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'exp': timezone.now() + timedelta(days=1),
            'iat': timezone.now()
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

    def __str__(self):
        return f"{self.username} ({self.role})"


    
class MedicalInfo(models.Model):
    student = models.OneToOneField("Student", on_delete=models.CASCADE)
    allergies = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"Medical Info for {self.student.name}"
