from rest_framework import permissions
from rest_framework.permissions import BasePermission
import logging

logger = logging.getLogger(__name__)


def allowed_roles(roles):
    """
    Decorator που επισυνάπτει στο view attribute 'allowed_roles'.
    Χρησιμοποιείται για να δηλώνονται ρητά οι επιτρεπόμενοι ρόλοι σε κάθε view.
    """
    def decorator(view_func):
        view_func.allowed_roles = roles
        return view_func
    return decorator

class HasRolePermission(BasePermission):
    # Επιτρέπει GET/HEAD σε όλους τους επιτρεπόμενους ρόλους και POST/PUT/DELETE μόνο σε admin & teacher.
    def __init__(self, roles=None):
        self.roles = roles if isinstance(roles, list) else [roles]

    # def has_permission(self, request, view):
    #     if request.method == 'OPTIONS':
    #         return True
    #     user_role = getattr(request.user, 'role', None)
    #     allowed_roles = getattr(view, 'allowed_roles', [])
    #     logger.warning(f"Checking permission: user={request.user}, role={user_role}, allowed_roles={allowed_roles}")
    #     return request.user.is_authenticated and user_role in allowed_roles

    def has_permission(self, request, view):
        # Ελέγχει αν ο χρήστης είναι authenticated και αν ο ρόλος του περιλαμβάνεται στους επιτρεπόμενους.
        if request.method == 'OPTIONS':
            return True

        user_role = getattr(request.user, 'role', None)
        allowed_roles = getattr(view, 'allowed_roles', [])

        logger.warning(f"Checking permission: user={request.user}, role={user_role}, allowed_roles={allowed_roles}")

        #  GET/HEAD/OPTIONS: επιτρέπεται σε όλους τους allowed_roles
        if request.method in ['GET', 'HEAD']:
                return request.user.is_authenticated and user_role in allowed_roles

        #  POST/PUT/PATCH/DELETE: επιτρέπεται μόνο σε admin & teacher
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return request.user.is_authenticated and user_role in ['admin', 'teacher']

        return False



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
