from django.db.models.signals import post_save
from django.dispatch import receiver
from products.models import Teacher, Parent, User 



@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'teacher':
            Teacher.objects.create(user=instance, name=instance.username)
        elif instance.role == 'parent':
            Parent.objects.create(user=instance, name=instance.username)
