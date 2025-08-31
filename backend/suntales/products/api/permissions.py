# from rest_framework import permissions
# from rest_framework.permissions import BasePermission

# class HasRolePermission(permissions.BasePermission):
#     def __init__(self, role):
#         self.role = role

#     def has_permission(self, request, view):
#         if request.method in permissions.SAFE_METHODS:
#             return True
#         return request.user.is_authenticated and request.user.role == self.role

#     def has_object_permission(self, request, view, obj):
#         if request.method in permissions.SAFE_METHODS:
#             return True
#         return request.user.role == self.role or request.user.is_staff



# class CanEditMedicalInfo(BasePermission):
#     def has_permission(self, request, view):
#         return request.user.role in ["admin", "parent"]

#     def has_object_permission(self, request, view, obj):
#         return request.user.role in ["admin", "parent"]



# class HasRoleAdminPermission(permissions.BasePermission):
#     def has_permission(self, request, view):
#         return (
#             request.user.is_authenticated 
#             #and
#             #getattr(request.user, 'role', '') == 'admin'
#         )

from rest_framework import permissions
from rest_framework.permissions import BasePermission
import logging

logger = logging.getLogger(__name__)

# class HasRolePermission(BasePermission):
#     def __init__(self, role=None):
#         self.role = role

#     def has_permission(self, request, view):
#         if request.method in permissions.SAFE_METHODS:
#             return True
#         return request.user.is_authenticated and getattr(request.user, 'role', None) == self.role

#     def has_object_permission(self, request, view, obj):
#         if request.method in permissions.SAFE_METHODS:
#             return True
#         user_role = getattr(request.user, 'role', None)
#         return user_role == self.role or getattr(request.user, 'is_staff', False)


class HasRolePermission(BasePermission):
    def __init__(self, roles=None):
        self.roles = roles if isinstance(roles, list) else [roles]

    def has_permission(self, request, view):
        user_role = getattr(request.user, 'role', None)
        allowed_roles = getattr(view, 'allowed_roles', [])
        logger.warning(f"Checking permission: user={request.user}, role={user_role}, allowed_roles={allowed_roles}")
        return request.user.is_authenticated and user_role in allowed_roles



class CanEditMedicalInfo(BasePermission):
    def has_permission(self, request, view):
        user_role = getattr(request.user, 'role', None)
        return request.user.is_authenticated and user_role in ["admin", "parent"]

    def has_object_permission(self, request, view, obj):
        user_role = getattr(request.user, 'role', None)
        return user_role in ["admin", "parent"]


class HasRoleAdminPermission(BasePermission):
    def has_permission(self, request, view):
        user_role = getattr(request.user, 'role', None)
        return request.user.is_authenticated and user_role == "admin"


