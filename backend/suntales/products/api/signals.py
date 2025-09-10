from django.db.models.signals import post_save
from django.dispatch import receiver
from products.models import Teacher, Parent, User

# Automatically creates a related Teacher or Parent profile 
# whenever a new User is created, based on their assigned role.
# This ensures that every user with a specific role has a corresponding profile instance.


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'teacher':
            Teacher.objects.create(user=instance, name=instance.username)
        elif instance.role == 'parent':
            Parent.objects.create(user=instance, name=instance.username)
