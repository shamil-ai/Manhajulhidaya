document.addEventListener("DOMContentLoaded", function() {
            // ലോഗിൻ ചെയ്ത കുട്ടിയുടെ ഡാറ്റ എടുക്കുന്നു
            const currentStudentStr = localStorage.getItem("currentLoggedInStudent");

            // ആരും ലോഗിൻ ചെയ്തിട്ടില്ലെങ്കിൽ (URL നേരിട്ട് അടിച്ചാൽ) ലോഗിൻ പേജിലേക്ക് തിരിച്ചുവിടുന്നു
            if (!currentStudentStr) {
                alert("Please login first to view your dashboard!");
                window.location.href = "login-candidate.html";
                return;
            }

            // ഡാറ്റ പേജിൽ റീപ്ലേസ് ചെയ്യുന്നു
            const student = JSON.parse(currentStudentStr);
            
            document.getElementById("dashName").innerText = student.name || "-";
            document.getElementById("dashEmail").innerText = student.email || "-";
            document.getElementById("dashPhone").innerText = student.phone || "-";
            document.getElementById("dashCourse").innerText = student.course || "-";
            document.getElementById("dashReg").innerText = student.regNo || "-";
            document.getElementById("dashAdm").innerText = student.admNo || "-";
            
            // പുതിയതായി ചേർത്ത രക്ഷിതാക്കളുടെ വിവരങ്ങളും മറ്റും
            document.getElementById("dashFather").innerText = student.fatherName || "-";
            document.getElementById("dashMother").innerText = student.motherName || "-";
            document.getElementById("dashQual").innerText = student.qualification || "-";
            document.getElementById("dashWhatsapp").innerText = student.whatsapp || "-";

            if (student.photo && student.photo.startsWith("data:image")) {
                document.getElementById("dashAvatar").src = student.photo;
            }
        });

        function logout() {
            if (confirm("Are you sure you want to logout?")) {
                localStorage.removeItem("currentLoggedInStudent"); // സെഷൻ ഒഴിവാക്കുന്നു
                window.location.href = "login-candidate.html";
            }
        }