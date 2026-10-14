// FORM SUBMISSION TO LOCAL STORAGE (Connects to admin-portal.html)
        const form = document.getElementById('contactForm');
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('span');
        const btnIcon = submitBtn.querySelector('i');

        form.addEventListener('submit', e => {
            e.preventDefault();
            
            // ബട്ടൺ ലോഡിങ് ആക്കുന്നു
            submitBtn.disabled = true;
            btnText.textContent = 'Sending...';
            btnIcon.className = 'fa-solid fa-spinner fa-spin';

            // ഫോമിലെ ഡാറ്റ എടുക്കുന്നു
            const newMsg = {
                id: "MSG" + Math.floor(Math.random() * 100000),
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                subject: "Website Enquiry",
                message: document.getElementById('address').value.trim(),
                date: new Date().toLocaleString()
            };

            // Local Storage-ലേക്ക് സേവ് ചെയ്യുന്നു
            setTimeout(() => {
                let messages = JSON.parse(localStorage.getItem("contactMessages") || "[]");
                messages.push(newMsg);
                localStorage.setItem("contactMessages", JSON.stringify(messages));

                // മെസ്സേജ് അയച്ച ശേഷം ഫോം ക്ലിയർ ചെയ്യുന്നു
                alert('Thank you! Your message has been sent successfully.');
                form.reset(); 
                document.querySelectorAll('.input-group-custom input, .input-group-custom textarea').forEach(input => { input.blur(); });
                
                // ബട്ടൺ പഴയ രൂപത്തിലാക്കുന്നു
                submitBtn.disabled = false;
                btnText.textContent = 'Send Message';
                btnIcon.className = 'fa-solid fa-paper-plane';
            }, 600); // ഒരു ചെറിയ ഡിലേ കൊടുക്കുന്നു (യഥാർത്ഥത്തിൽ സെൻഡ് ആവുന്നത് പോലെ തോന്നാൻ)
        });

        // Scroll Animation
        window.addEventListener('scroll', () => {
            const animates = document.querySelectorAll('.scroll-animate');
            animates.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight - 40) { el.classList.add('animated'); }
            });
        });
        window.dispatchEvent(new Event('scroll'));