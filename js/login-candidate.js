document.getElementById("loginForm").addEventListener("submit", function(e) {
            e.preventDefault();

            const inputEmail = document.getElementById("logEmail").value.trim().toLowerCase();
            const inputPass = document.getElementById("logPass").value;

            // അഡ്മിഷൻ പേജിൽ നിന്നും സേവ് ചെയ്ത ഡാറ്റ എടുക്കുന്നു
            let registeredStudents = JSON.parse(localStorage.getItem("allRegisteredStudents") || "[]");

            // ഇമെയിലും പാസ്‌വേർഡും ഒത്തുനോക്കുന്നു
            const validUser = registeredStudents.find(s => s.email === inputEmail && s.password === inputPass);

            if (validUser) {
                // ശരിയാണെങ്കിൽ ഈ കുട്ടിയെ 'currentLoggedInStudent' ആയി സെറ്റ് ചെയ്യുന്നു
                localStorage.setItem("currentLoggedInStudent", JSON.stringify(validUser));
                window.location.href = "candidate-dashboard.html"; // ഡാഷ്‌ബോർഡിലേക്ക് തിരിച്ചുവിടുന്നു
            } else {
                alert("Invalid Email or Password! Please check your details or Register first.");
            }
        });