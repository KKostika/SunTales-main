from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.conf import settings
from .models import User, Teacher, Parent

# Register your models here.

@admin.register(User)
class UserAdmin(UserAdmin):
    model = settings.AUTH_USER_MODEL
    fieldsets = UserAdmin.fieldsets + (
        ('Πληροφορίες Ρόλου', {'fields': ('role',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Ρόλος κατά την εγγραφή', {'fields': ('role',)}),
    )



@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'user_username')

    def user_username(self, obj):
        return obj.user.username if obj.user else ''
    user_username.short_description = 'Username'
    search_fields = ('name', 'classroom__name', 'user__username')

@admin.register(Parent)
class ParentAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'user', 'user_username')

    def user_username(self, obj):
        return obj.user.username if obj.user else ''
    user_username.short_description = 'Username' 
    search_fields = ('name', 'phone', 'student__name')