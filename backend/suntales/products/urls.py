from rest_framework.routers import DefaultRouter
from django.urls import path, include
from . import views
from .views import (
    ActivitiesPhotoViewSet,
    DailyMenuViewSet,
    StudentViewSet,
    TeacherViewSet,
    ParentViewSet,
    ClassroomViewSet,
    FinancialRecordViewSet,
    MealsViewSet,
    ActivitiesViewSet,
    MessagesViewSet,
    MeetingsViewSet,
    UpdateMedicalInfo,
    UserViewSet,
    EventViewSet,
    AnnouncementViewSet


   
)

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'teachers', TeacherViewSet)
router.register(r'parents', ParentViewSet)
router.register(r'classrooms', ClassroomViewSet)
router.register(r'financial_records', FinancialRecordViewSet)
router.register(r'meals', MealsViewSet)
router.register(r'daily-menus', DailyMenuViewSet)
router.register(r'activities', ActivitiesViewSet)
router.register(r'activities_photos', ActivitiesPhotoViewSet)
router.register(r'messages', MessagesViewSet)
router.register(r'meetings', MeetingsViewSet)
router.register(r'update_medical_info', UpdateMedicalInfo, basename='update_medical_info')
router.register(r'users', UserViewSet)
router.register(r'events', EventViewSet)
router.register(r'announcements', AnnouncementViewSet)




urlpatterns = [
    path('', include(router.urls)),
]
