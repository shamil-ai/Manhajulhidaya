from django.db import models
from django.contrib.auth.models import User

class Admission(models.Model):
    # ലോഗിൻ ചെയ്യാനായി യൂസറുമായി ബന്ധിപ്പിക്കുന്നു
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    dob = models.DateField()
    phone = models.CharField(max_length=15)
    whatsapp = models.CharField(max_length=15, blank=True)
    address = models.TextField()
    father_name = models.CharField(max_length=100)
    mother_name = models.CharField(max_length=100)
    selected_class = models.CharField(max_length=50)
    qualification = models.CharField(max_length=100)
    photo_url = models.URLField(max_length=500, blank=True) # Cloudinary URL
    
    # ഓട്ടോമാറ്റിക് ജനറേറ്റ് ആകുന്നവ
    admission_no = models.CharField(max_length=20, unique=True, blank=True)
    reg_id = models.CharField(max_length=20, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name