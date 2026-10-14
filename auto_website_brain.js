/**
 * File: auto_website_brain.js
 * Description: വെബ്‌സൈറ്റിലെ പേജിൽ വരുന്ന മാറ്റങ്ങൾ തത്സമയം സ്വയം റീഡ് ചെയ്ത് 
 * ചാറ്റ്ബോട്ടിലേക്ക് നൽകുന്ന ഓട്ടോമാറ്റിക് ലോക്കൽ AI സിസ്റ്റം.
 */

(function () {
    if (typeof window === 'undefined') return;

    // 1. വെബ്‌സൈറ്റ് പേജുകളിൽ നിന്ന് തത്സമയം ഡാറ്റ സ്വയം ശേഖരിക്കുന്ന ഫംഗ്ഷൻ
    function scrapeLiveWebsiteContent() {
        let liveDatabase = [];

        // എ) ഹോംപേജിലെ കൗണ്ടറുകൾ തനിയെ റീഡ് ചെയ്യുന്നു (Alumni, Students, Years, Institutions)
        const counters = document.querySelectorAll('.counter-item');
        if (counters.length > 0) {
            let statsMap = {};
            counters.forEach(c => {
                let num = c.querySelector('h3') ? c.querySelector('h3').innerText.trim() : '';
                let label = c.querySelector('p') ? c.querySelector('p').innerText.trim().toLowerCase() : '';
                statsMap[label] = num;
            });

            let alumniCount = statsMap['alumni'] || '100+';
            let studentCount = statsMap['students'] || '50+';
            let instCount = statsMap['institutions'] || '2+';
            let yearsCount = statsMap['years'] || '14+';

            liveDatabase.push({
                keywords: ["alumni", "alumi", "students", "institutions", "years", "കുട്ടികൾ", "വർഷം", "പാരമ്പര്യം", "അലൂംനി", "എണ്ണം", "കണക്കുകൾ"],
                answer: `മൻഹജുൽ ഹിദായയിൽ നിലവിൽ ${alumniCount} അലൂംനികളും (Alumni), ${studentCount} വിദ്യാർത്ഥികളും (Students), ${instCount} സ്ഥാപനങ്ങളും, ${yearsCount} വർഷത്തെ പ്രവർത്തന പാരമ്പര്യവുമുണ്ട്.`
            });
        }

        // ബി) ന്യൂസ് & അഡ്മിഷൻ സെക്ഷനുകൾ തനിയെ റീഡ് ചെയ്യുന്നു
        const newsItems = document.querySelectorAll('.news-item');
        if (newsItems.length > 0) {
            let newsText = [];
            newsItems.forEach(n => {
                let title = n.querySelector('h4') ? n.querySelector('h4').innerText.trim() : '';
                let desc = n.querySelector('p') ? n.querySelector('p').innerText.trim() : '';
                if (title) newsText.push(`${title}: ${desc}`);
            });

            liveDatabase.push({
                keywords: ["news", "admission", "അഡ്മിഷൻ", "വാർത്തകൾ", "തിയ്യതി", "അപേക്ഷ"],
                answer: `ഏറ്റവും പുതിയ അഡ്മിഷൻ വിവരങ്ങൾ: ${newsText.join(' | ')}. ഓൺലൈൻ വഴി അപേക്ഷിക്കാം.`
            });
        }

        // സി) ഡയറക്ടർ സെക്ഷൻ തനിയെ റീഡ് ചെയ്യുന്നു
        const directorNameEl = document.querySelector('.director-text h2');
        const directorDescEl = document.querySelector('.director-text .slide-scroll');
        if (directorNameEl) {
            liveDatabase.push({
                keywords: ["director", "usthad", "ali abdunoor", "ഡയറക്ടർ", "ഉസ്താദ്", "അലി അബ്ദുന്നൂർ", "മേധാവി"],
                answer: `മൻഹജുൽ ഹിദായയുടെ ഡയറക്ടർ ${directorNameEl.innerText.trim()} ആണ്. ${directorDescEl ? directorDescEl.innerText.trim().substring(0, 150) + '...' : ''}`
            });
        }

        // ഡി) അഡ്രസ്സും ഫോൺ നമ്പറും ഫൂട്ടറിൽ നിന്ന് തനിയെ റീഡ് ചെയ്യുന്നു
        const addressEl = document.querySelector('.footer-address');
        const phoneEl = document.querySelector('.footer-contact-item');
        if (addressEl && phoneEl) {
            liveDatabase.push({
                keywords: ["location", "address", "phone", "സ്ഥലം", "വിലാസം", "ഫോൺ", "എവിടെയാണ്", "നമ്പർ", "contact"],
                answer: `വിലാസം: ${addressEl.innerText.replace(/\n/g, ', ')}. ഫോൺ നമ്പർ: ${phoneEl.innerText.trim()}.`
            });
        }

        return liveDatabase;
    }

    // 2. അക്ഷരത്തെറ്റുകൾ സഹിക്കാൻ സഹായിക്കുന്ന Fuzzy Match
    function getFuzzySimilarity(s1, s2) {
        if (!s1 || !s2) return 0;
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();
        if (s1 === s2) return 1.0;

        let longer = s1.length > s2.length ? s1 : s2;
        let shorter = s1.length > s2.length ? s2 : s1;
        let costs = [];

        for (let i = 0; i <= longer.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= shorter.length; j++) {
                if (i === 0) costs[j] = j;
                else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[shorter.length] = lastValue;
        }
        return (longer.length - costs[shorter.length]) / parseFloat(longer.length);
    }

    // 3. തത്സമയം ഉത്തരം നൽകുന്ന സ്മാർട്ട് സെർച്ച് ഫംഗ്ഷൻ
    window.askSmartWebsiteBrain = function (userQuery) {
        const q = userQuery.toLowerCase().trim();

        // ഗ്രീറ്റിംഗ്സ്
        if (['hi', 'hello', 'hey', 'ഹലോ', 'ഹായ്', 'സലാം', 'assalamu alaikum'].some(g => q.includes(g))) {
            return "വഅലൈക്കുമുസ്സലാം! മൻഹജുൽ ഹിദായയുടെ എഐ അസിസ്റ്റന്റിലേക്ക് സ്വാഗതം. നിങ്ങൾക്ക് എന്താണ് അറിയേണ്ടത്?";
        }

        const queryWords = q.split(/[\s,?.!]+/).filter(w => w.length > 1);
        const liveKnowledge = scrapeLiveWebsiteContent();
        let bestAnswer = null;
        let highestScore = 0;

        // മുൻഗണന 1: വെബ്‌സൈറ്റ് പേജിൽ നിന്ന് സ്ക്രാപ്പ് ചെയ്ത ലൈവ് ഡാറ്റയിൽ തിരയുന്നു
        for (let entry of liveKnowledge) {
            let score = 0;
            for (let qw of queryWords) {
                for (let kw of entry.keywords) {
                    if (qw === kw) score += 60;
                    else if (getFuzzySimilarity(qw, kw) >= 0.70) score += 40; // ഉദാഹരണത്തിന് 'alumi' -> 'alumni'
                }
            }
            if (score > highestScore) {
                highestScore = score;
                bestAnswer = entry.answer;
            }
        }

        if (bestAnswer && highestScore >= 35) {
            return bestAnswer;
        }

        // മുൻഗണന 2: പഴയ 'All questions' അല്ലെങ്കിൽ questions.js ഫയലുകളിൽ തിരയുന്നു
        if (typeof ACTIVE_QUESTION_BANK !== 'undefined' && Array.isArray(ACTIVE_QUESTION_BANK)) {
            for (let item of ACTIVE_QUESTION_BANK) {
                let itemScore = 0;
                let questionsList = item.questions || (item.question ? [item.question] : []);

                for (let qText of questionsList) {
                    let cleanQ = qText.toLowerCase();
                    for (let qw of queryWords) {
                        if (cleanQ.includes(qw)) itemScore += 25;
                        for (let sqw of cleanQ.split(/\s+/)) {
                            if (getFuzzySimilarity(qw, sqw) >= 0.75) itemScore += 20;
                        }
                    }
                }

                if (item.keywords && Array.isArray(item.keywords)) {
                    for (let kw of item.keywords) {
                        for (let qw of queryWords) {
                            if (getFuzzySimilarity(qw, kw.toLowerCase()) >= 0.75) itemScore += 25;
                        }
                    }
                }

                if (itemScore > highestScore) {
                    highestScore = itemScore;
                    bestAnswer = item.answer || item.response;
                }
            }
        }

        if (bestAnswer && highestScore >= 25) {
            return bestAnswer;
        }

        return "ക്ഷമിക്കണം, ഈ ചോദ്യത്തിനുള്ള കൃത്യമായ മറുപടി കണ്ടെത്താനായില്ല. അഡ്മിഷൻ, കോഴ്സുകൾ, അലിഫ് ഫെസ്റ്റ് എന്നിവയെക്കുറിച്ച് ചോദിച്ചുനോക്കൂ, അല്ലെങ്കിൽ ഞങ്ങളുടെ ഓഫീസുമായി ബന്ധപ്പെടുക: +91 98955 80156";
    };
})();