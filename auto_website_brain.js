
// ========================================================
// DEEP FUZZY AI SEARCH ENGINE (MULTI-LEVEL ANALYSIS)
// ========================================================
window.MANHAJ_STORED_QA = [{"q": "m", "a": "വഅലൈക്കുമുസ്സലാം! മൻഹജുൽ ഹിദായയുടെ എഐ അസിസ്റ്റന്റിലേക്ക് സ്വാഗതം. നിങ്ങൾക്ക് എന്താണ് അറിയേണ്ടത്?"}, {"q": "manhajul", "a": "വഅലൈക്കുമുസ്സലാം! മൻഹജുൽ ഹിദായയുടെ എഐ അസിസ്റ്റന്റിലേക്ക് സ്വാഗതം. നിങ്ങൾക്ക് എന്താണ് അറിയേണ്ടത്?"}, {"q": "manhajul hidaya", "a": "വഅലൈക്കുമുസ്സലാം! മൻഹജുൽ ഹിദായയുടെ എഐ അസിസ്റ്റന്റിലേക്ക് സ്വാഗതം. നിങ്ങൾക്ക് എന്താണ് അറിയേണ്ടത്?"}, {"q": "alini", "a": "മൻഹജുൽ ഹിദായയിൽ നിലവിൽ 100+ അലൂംനികളും (Alumni), 50+ വിദ്യാർത്ഥികളും (Students), 2+ സ്ഥാപനങ്ങളും, 14+ വർഷത്തെ പ്രവർത്തന പാരമ്പര്യവുമുണ്ട്."}, {"q": "alumni", "a": "മൻഹജുൽ ഹിദായയിൽ നിലവിൽ 100+ അലൂംനികളും (Alumni), 50+ വിദ്യാർത്ഥികളും (Students), 2+ സ്ഥാപനങ്ങളും, 14+ വർഷത്തെ പ്രവർത്തന പാരമ്പര്യവുമുണ്ട്."}, {"q": "nifast", "a": "അലിഫ് ഫെസ്റ്റ് (Alif Fest 2k26) മൻഹജുൽ ഹിദായയിലെ വിദ്യാർത്ഥികളുടെ സർഗ്ഗാത്മക കഴിവുകൾ മാറ്റുരയ്ക്കുന്ന സംസ്ഥാനതല കലാ-സാഹിത്യ മത്സര വേദിയാണ്."}, {"q": "fest", "a": "അലിഫ് ഫെസ്റ്റ് (Alif Fest 2k26) മൻഹജുൽ ഹിദായയിലെ വിദ്യാർത്ഥികളുടെ സർഗ്ഗാത്മക കഴിവുകൾ മാറ്റുരയ്ക്കുന്ന സംസ്ഥാനതല കലാ-സാഹിത്യ മത്സര വേദിയാണ്."}, {"q": "alif fest", "a": "അലിഫ് ഫെസ്റ്റ് (Alif Fest 2k26) മൻഹജുൽ ഹിദായയിലെ വിദ്യാർത്ഥികളുടെ സർഗ്ഗാത്മക കഴിവുകൾ മാറ്റുരയ്ക്കുന്ന സംസ്ഥാനതല കലാ-സാഹിത്യ മത്സര വേദിയാണ്."}, {"q": "കോഴ്സുകൾ", "a": "മൻഹജുൽ ഹിദായയിൽ ദഅ്‌വ കോഴ്സ്, ശരീഅത്ത് പഠനം, ഹിഫ്ളുൽ ഖുർആൻ, റെഗുലർ സ്കൂൾ/കോളേജ് ടൈ-അപ്പ് കോഴ്സുകൾ എന്നിവ ലഭ്യമാണ്."}, {"q": "അഡ്മിഷൻ", "a": "പുതിയ അധ്യയന വർഷത്തേക്കുള്ള അഡ്മിഷൻ നടപടികൾ ആരംഭിച്ചിട്ടുണ്ട്. അഡ്മിഷൻ ഫോം വഴി ഓൺലൈനായി രജിസ്റ്റർ ചെയ്യാം."}];

function performDeepSearch(rawText) {
    if (!rawText || !rawText.trim()) return null;
    let query = rawText.toLowerCase().trim().replace(/[?,.!/\\-]/g, '');
    let qWords = query.split(/\s+/).filter(w => w.length > 0);

    // 1. റൺടൈമിൽ വിൻഡോയിലുള്ള എല്ലാ ചോദ്യങ്ങളും ഒന്നിച്ച് ചേർക്കുന്നു
    let masterList = [...window.MANHAJ_STORED_QA];
    const globals = [window.questions, window.questionsData, window.generatedQuestions, window.customUpdates, window.websiteBrainQA];
    globals.forEach(g => {
        if (Array.isArray(g)) masterList.push(...g);
    });

    let bestAnswer = null;
    let highestScore = 0;

    for (let item of masterList) {
        let targets = Array.isArray(item.question) ? item.question : (item.q ? (Array.isArray(item.q) ? item.q : [item.q]) : [item.question]);
        let reply = item.answer || item.a || item.response || item.reply;
        if (!reply) continue;

        for (let t of targets) {
            if (!t) continue;
            let target = String(t).toLowerCase().trim().replace(/[?,.!/\\-]/g, '');
            let score = 0;

            // എ) പൂർണ്ണമായും ഒത്തുപോയാൽ (Exact match)
            if (target === query) score += 300;

            // ബി) ഒറ്റ അക്ഷരം (ഉദാ: 'm' -> 'manhajul', 'ഫ' -> 'ഫെസ്റ്റ്')
            if (query.length === 1 && target.startsWith(query)) score += 150;

            // സി) ഉള്ളടക്ക സാമ്യം (Substring matching)
            if (target.includes(query) || query.includes(target)) score += 120;

            // ഡി) അക്ഷരത്തെറ്റുകൾ കണ്ടെത്തൽ (Fuzzy character overlap - ഉദാ: 'nifast' -> 'fest', 'alini' -> 'alumni')
            let tWords = target.split(/\s+/);
            for (let qw of qWords) {
                for (let tw of tWords) {
                    if (qw === tw) {
                        score += 80;
                    } else if (tw.includes(qw) || qw.includes(tw)) {
                        score += 50;
                    } else {
                        let matchedChars = 0;
                        for (let ch of qw) if (tw.includes(ch)) matchedChars++;
                        if (matchedChars >= Math.min(qw.length, tw.length) - 1 && qw.length >= 3) {
                            score += 45;
                        }
                    }
                }
            }

            if (score > highestScore) {
                highestScore = score;
                bestAnswer = reply;
            }
        }
    }

    // ചെറിയ സാമ്യമെങ്കിലും ഉണ്ടെങ്കിൽ ഉത്തരം നൽകും
    return highestScore >= 35 ? bestAnswer : null;
}

// യൂസർ ടൈപ്പ് ചെയ്യുന്ന ഏത് ഇൻപുട്ടും പിടിച്ചെടുക്കുന്നു
window.lastBotInput = "";
document.addEventListener("input", function(e) {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
        window.lastBotInput = e.target.value;
    }
}, true);

// ബോട്ടിന്റെ ഡിഫോൾട്ട് റെസ്‌പോൺസ് ഓവർറൈഡ് ചെയ്യുന്നു
setInterval(function() {
    const inputElem = document.querySelector('input[type="text"], textarea');
    if (inputElem && inputElem.value) window.lastBotInput = inputElem.value;
}, 300);

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

        return (performDeepSearch(window.lastBotInput) || "ക്ഷമിക്കണം, ഈ ചോദ്യത്തിനുള്ള കൃത്യമായ മറുപടി കണ്ടെത്താനായില്ല. അഡ്മിഷൻ, കോഴ്സുകൾ, അലിഫ് ഫെസ്റ്റ് എന്നിവയെക്കുറിച്ച് ചോദിച്ചുനോക്കൂ അല്ലെങ്കിൽ ഞങ്ങളുടെ ഓഫീസുമായി ബന്ധപ്പെടുക: +91 98955 80156");
    };
})();

// SUPER_FUZZY_SEARCH
function getFuzzyAnswer(input) {
    if(!input) return null;
    let text = input.toLowerCase().trim();
    let allData = [];
    if(typeof questions !== 'undefined') allData = allData.concat(questions);
    if(typeof questionsData !== 'undefined') allData = allData.concat(questionsData);
    if(typeof generatedQuestions !== 'undefined') allData = allData.concat(generatedQuestions);
    if(typeof customUpdates !== 'undefined') allData = allData.concat(customUpdates);
    if(typeof websiteBrainQA !== 'undefined') allData = allData.concat(websiteBrainQA);
    if(typeof qaList !== 'undefined') allData = allData.concat(qaList);
    
    for(let item of allData) {
        let qArray = Array.isArray(item.question) ? item.question : (item.q ? (Array.isArray(item.q) ? item.q : [item.q]) : [item.question]);
        let ans = item.answer || item.a || item.response;
        if(!ans) continue;

        for(let q of qArray) {
            if(!q) continue;
            let cleanQ = String(q).toLowerCase();
            // പൂർണ്ണമല്ലാത്ത വാക്കുകൾ അടിച്ചാലും കണ്ടെത്തും (ഉദാ: manhaj, alini)
            if(cleanQ.includes(text) || text.includes(cleanQ)) return ans;
            let words = text.split(" ");
            for(let w of words) {
                if(w.length >= 3 && cleanQ.includes(w)) return ans;
            }
        }
    }
    return null;
}

// നിലവിലുള്ള സിസ്റ്റത്തിന് മുകളിൽ ഈ പുതിയ സ്മാർട്ട് സിസ്റ്റം സെറ്റ് ചെയ്യുന്നു
if(typeof getBotResponse === 'function') {
    const oldR = getBotResponse;
    getBotResponse = function(text) { return getFuzzyAnswer(text) || oldR(text); };
} else if (typeof generateResponse === 'function') {
    const oldG = generateResponse;
    generateResponse = function(text) { return getFuzzyAnswer(text) || oldG(text); };
} else if (typeof getAnswer === 'function') {
    const oldA = getAnswer;
    getAnswer = function(text) { return getFuzzyAnswer(text) || oldA(text); };
}
