from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
import json
from .models import Admission, ContactMessage
from django.contrib.auth.models import User
import random

# 1. അഡ്മിഷൻ ഫോം സബ്മിറ്റ് ചെയ്യാൻ
@csrf_exempt
def submit_admission(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # പുതിയ അഡ്മിഷൻ നമ്പർ ഉണ്ടാക്കുന്നു
            rand_num = random.randint(1000, 9999)
            adm_no = f"MH2026{rand_num}"
            reg_id = f"MHD26A{rand_num}"

            # Django User ആയി അക്കൗണ്ട് ഉണ്ടാക്കുന്നു (കുട്ടിക്ക് ലോഗിൻ ചെയ്യാൻ)
            # പാസ്‌വേഡ് ആയി ഫോൺ നമ്പർ അല്ലെങ്കിൽ DOB നൽകാം (ഇവിടെ phone number കൊടുക്കുന്നു)
            user = User.objects.create_user(
                username=data.get('email'),
                email=data.get('email'),
                password=data.get('phone') # ലോഗിൻ പാസ്‌വേഡ്
            )

            admission = Admission.objects.create(
                user=user,
                name=data.get('name'),
                email=data.get('email'),
                dob=data.get('dob'),
                phone=data.get('phone'),
                whatsapp=data.get('whatsapp'),
                address=data.get('address'),
                father_name=data.get('father_name'),
                mother_name=data.get('mother_name'),
                selected_class=data.get('classSelect'),
                qualification=data.get('qualification'),
                photo_url=data.get('photo', ''), # ഇവിടെ Cloudinary ലേക്ക് അപ്‌ലോഡ് ചെയ്ത URL വരണം
                admission_no=adm_no,
                reg_id=reg_id
            )
            return JsonResponse({"success": True, "message": "Admission Successful", "adm_no": adm_no})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=400)

# 2. കോൺടാക്ട് ഫോം സബ്മിറ്റ് ചെയ്യാൻ
@csrf_exempt
def submit_contact(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            ContactMessage.objects.create(
                name=data.get('Name'),
                email=data.get('Email'),
                phone=data.get('Phone'),
                message=data.get('Message')
            )
            return JsonResponse({"success": True, "message": "Message Sent"})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=400)

# 3. കുട്ടിക്ക് ലോഗിൻ ചെയ്യാൻ (candidate-dashboard-ലേക്ക് പോകാൻ)
@csrf_exempt
def candidate_login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('email')
        password = data.get('password')
        
        user = authenticate(username=username, password=password)
        if user is not None:
            adm = Admission.objects.get(user=user)
            student_data = {
                "name": adm.name,
                "email": adm.email,
                "phone": adm.phone,
                "course": adm.selected_class,
                "admNo": adm.admission_no,
                "regId": adm.reg_id,
                "photo": adm.photo_url
            }
            return JsonResponse({"success": True, "student": student_data})
        else:
            return JsonResponse({"success": False, "error": "Invalid Credentials"}, status=400)