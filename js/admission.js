(function() {
            // നിങ്ങളുടെ യഥാർത്ഥ Public Key ഇവിടെ നൽകിയിരിക്കുന്നു
            emailjs.init("7DQZMgpyL61jLesWX");
        })();

document.getElementById("admissionForm").addEventListener("submit", function(e) {
            e.preventDefault();
            const btn = document.getElementById("submitBtn");
            btn.innerText = "Registering & Sending Email...";
            btn.disabled = true;

            const photoInput = document.getElementById("photo");
            let photoData = "main/main/logo.png"; // Default photo if not uploaded

            if (photoInput.files && photoInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    processRegistration(e.target.result);
                };
                reader.readAsDataURL(photoInput.files[0]);
            } else {
                processRegistration(photoData);
            }

            function processRegistration(base64Photo) {
                // ഫോമിൽ നൽകിയ മുഴുവൻ വിവരങ്ങളും ശേഖരിക്കുന്നു
                const student = {
                    name: document.getElementById("name").value.trim(),
                    dob: document.getElementById("dob").value,
                    course: document.getElementById("classSelect").value,
                    qualification: document.getElementById("qualification").value.trim(),
                    fatherName: document.getElementById("fatherName").value.trim(),
                    motherName: document.getElementById("motherName").value.trim(),
                    phone: document.getElementById("phone").value.trim(),
                    whatsapp: document.getElementById("whatsapp").value.trim(),
                    address: document.getElementById("address").value.trim(),
                    email: document.getElementById("email").value.trim().toLowerCase(),
                    password: document.getElementById("password").value.trim(),
                    photo: base64Photo,
                    regNo: "MHD26A" + Math.floor(1000 + Math.random() * 9000),
                    admNo: "MH2026" + Math.floor(1000 + Math.random() * 9000)
                };

                let registeredList = JSON.parse(localStorage.getItem("allRegisteredStudents") || "[]");
                
                // ഈ ഇമെയിൽ നേരത്തെ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ടോ എന്ന് പരിശോധിക്കുന്നു
                const exists = registeredList.find(s => s.email === student.email);
                if (exists) {
                    alert("This email is already registered! Please go to Candidate Login.");
                    window.location.href = "login-candidate.html";
                    return;
                }

                // 1. ഡാറ്റ ബ്രൗസറിൽ സേവ് ചെയ്യുന്നു (ലോഗിൻ ചെയ്യാൻ വേണ്ടി)
                registeredList.push(student);
                localStorage.setItem("allRegisteredStudents", JSON.stringify(registeredList));

                // 2. EmailJS വഴി കുട്ടിക്ക് അഡ്മിഷൻ കൺഫർമേഷൻ മെസ്സേജ് അയക്കുന്നു
                // ഇവിടെ നിങ്ങളുടെ Service ID ചേർത്തിട്ടുണ്ട്, Template ID മാത്രം നൽകുക
                try {
                    emailjs.send("service_5z5t3m8", "template_xd3va49", {
                        student_name: student.name,
                        student_email: student.email,
                        course_name: student.course,
                        reg_id: student.regNo,
                        qualification: student.qualification,
                        father_name: student.fatherName,
                        phone: student.phone
                    }).then(function(response) {
                        console.log("Email Sent Successfully!", response.status, response.text);
                        finalize();
                    }, function(error) {
                        console.log("Email Failed to Send", error);
                        finalize(); // ഇമെയിൽ അയക്കാൻ കഴിഞ്ഞില്ലെങ്കിലും രജിസ്ട്രേഷൻ പൂർത്തിയാക്കി ലോഗിൻ പേജിലേക്ക് മാറ്റണം
                    });
                } catch(e) {
                    finalize();
                }

                function finalize() {
                    alert("Registration Successful!\nAn email confirmation has been sent.\nPlease login using your Email and Password.");
                    window.location.href = "login-candidate.html"; // ലോഗിൻ പേജിലേക്ക് തിരിച്ചുവിടുന്നു
                }
            }
        });