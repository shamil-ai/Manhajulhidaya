document.getElementById('scrollTopBtn').addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        document.addEventListener("DOMContentLoaded", function() {
            $('.login-dropdown-menu').on('click', function(e) {
                e.stopPropagation();
            });

            var video = document.getElementById("bgVideo");
            var muteBtn = document.getElementById("muteBtn");
            if (muteBtn && video) {
                document.body.addEventListener('click', function() {
                    if (video.muted) { video.muted = false; muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>'; }
                }, { once: true });
                muteBtn.addEventListener("click", function(e) {
                    e.stopPropagation();
                    video.muted = !video.muted;
                    muteBtn.innerHTML = video.muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
                });
            }

            const animationElements = document.querySelectorAll('.scroll-animate');
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => { entry.target.classList.toggle('animated', entry.isIntersecting); });
            }, { threshold: 0.15 });
            animationElements.forEach(el => animationObserver.observe(el));

            const counters = document.querySelectorAll('.counter-val');
            const runCounters = (el) => {
                const targetText = el.innerText;
                const target = parseInt(targetText.replace(/\D/g, ''));
                if (isNaN(target)) return;
                let count = 0; const step = target / 40;
                const update = () => {
                    if (count < target) { count += step; el.innerText = Math.ceil(count); setTimeout(update, 30); } 
                    else { el.innerText = targetText; }
                }; update();
            };
            const section = document.querySelector('.counter-section');
            let counted = false;
            if (section) {
                new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting && !counted) { counters.forEach(runCounters); counted = true; }
                }, { threshold: 0.3 }).observe(section);
            }

            let current = 0;
            const slides = document.querySelectorAll('.slide');
            const dots = document.querySelectorAll('.dot');
            window.currentSlide = function(i) {
                if(slides.length === 0) return;
                slides.forEach(s => s.classList.remove('active'));
                dots.forEach(d => d.classList.remove('active'));
                current = (i + slides.length) % slides.length;
                slides[current].classList.add('active');
                dots[current].classList.add('active');
            };
            if (slides.length > 0) setInterval(() => { currentSlide(current + 1); }, 5000);

            document.querySelectorAll('.slide-scroll').forEach(el => {
                const text = el.textContent.trim().replace(/\s+/g, ' ');
                el.innerHTML = '';
                text.split('').forEach(char => {
                    const span = document.createElement('span'); span.classList.add('char'); span.textContent = char; el.appendChild(span);
                });
            });
            const scrollElements = document.querySelectorAll('.slide-scroll');
            function animateTextScroll() {
                scrollElements.forEach(slide => {
                    const chars = slide.querySelectorAll('.char');
                    if (chars.length === 0) return;
                    const rect = slide.getBoundingClientRect();
                    const start = window.innerHeight * 0.90; const end = window.innerHeight * 0.25;  
                    let progress = (start - rect.top) / (start - end);
                    progress = Math.max(0, Math.min(progress, 1)); 
                    chars.forEach((char, index) => {
                        const charProgress = index / chars.length;
                        char.style.opacity = progress > charProgress ? 1 : 0.1;
                    });
                });
            }
            let isScrolling = false;
            window.addEventListener('scroll', () => {
                if (!isScrolling) { window.requestAnimationFrame(() => { animateTextScroll(); isScrolling = false; }); isScrolling = true; }
            });
            window.addEventListener('resize', animateTextScroll);
            animateTextScroll();
        });

        window.addEventListener('load', function() {
            var video = document.getElementById("bgVideo");
            if (video) video.play().catch(() => {});
        });

        // AI Chatbot UI functions
        function toggleChat() {
            const chatWindow = document.getElementById('aiChatWindow');
            chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
        }

        function sendSuggested(text) {
            document.getElementById('aiChatInput').value = text;
            sendUserMessage();
        }

        function handleKeyPress(e) {
            if (e.key === 'Enter') {
                sendUserMessage();
            }
        }

        function sendUserMessage() {
            const input = document.getElementById('aiChatInput');
            const msg = input.value.trim();
            if (!msg) return;

            appendMessage(msg, 'chat-user');
            input.value = '';
            
            showTyping();

            setTimeout(() => {
                removeTyping();
                const response = getAiResponse(msg);
                appendMessage(response, 'chat-bot');
            }, 500);
        }

        function appendMessage(text, className) {
            const body = document.getElementById('aiChatBody');
            const div = document.createElement('div');
            div.className = `chat-msg ${className}`;
            div.textContent = text;
            body.appendChild(div);
            body.scrollTop = body.scrollHeight;
        }

        function showTyping() {
            const body = document.getElementById('aiChatBody');
            const div = document.createElement('div');
            div.className = 'chat-msg chat-bot typing-indicator';
            div.id = 'typingIndicator';
            div.innerHTML = '<span></span><span></span><span></span>';
            body.appendChild(div);
            body.scrollTop = body.scrollHeight;
        }

        function removeTyping() {
            const indicator = document.getElementById('typingIndicator');
            if (indicator) indicator.remove();
        }

        // ================= SMART AI INTEGRATION =================
        function getAiResponse(query) {
            if (typeof window.askSmartWebsiteBrain === "function") {
                return window.askSmartWebsiteBrain(query);
            } else {
                return "AI സിസ്റ്റം ലോഡ് ആയിക്കൊണ്ടിരിക്കുന്നു. ദയവായി അല്പം കഴിഞ്ഞ് ശ്രമിക്കുക.";
            }
        }