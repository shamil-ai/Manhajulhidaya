document.addEventListener("DOMContentLoaded", function() {
            // ഡ്രോപ്പ്ഡൗൺ മെനുവിൽ ക്ലിക്ക് ചെയ്യുമ്പോൾ തനിയെ അടഞ്ഞുപോകാതിരിക്കാൻ
            $('.login-dropdown-menu').on('click', function(e) {
                e.stopPropagation();
            });

            // വീഡിയോ എപ്പോഴും സൗണ്ട് ഇല്ലാതെ (Muted) പ്ലേ ആകുന്നു എന്ന് ഉറപ്പുവരുത്താൻ
            var loginVideo = document.getElementById("loginBgVideo");
            if (loginVideo) {
                loginVideo.muted = true;
                loginVideo.play().catch(function() {});
            }
        });