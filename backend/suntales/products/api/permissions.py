from rest_framework import permissions
from rest_framework.permissions import BasePermission
import logging

logger = logging.getLogger(__name__)


def allowed_roles(roles):
    """
    Decorator που επισυνάπτει στο view attribute 'allowed_roles'.
    """
    def decorator(view_func):
        view_func.allowed_roles = roles
        return view_func
    return decorator

class HasRolePermission(BasePermission):
    def __init__(self, roles=None):
        self.roles = roles if isinstance(roles, list) else [roles]

    def has_permission(self, request, view):
        if request.method == 'OPTIONS':
            return True
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