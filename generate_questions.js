/**
 * File Name: generate_questions.js
 * Purpose: 'All questions' ഫയലിലെ ചോദ്യങ്ങൾ തനിയെ വായിച്ച് ബ്രൗസർ ക്യാഷ് ഒഴിവാക്കി
 * തത്സമയം AI ചാറ്റ്ബോട്ടിലേക്ക് നൽകുന്നു.
 */

(function () {
    if (typeof window === 'undefined') return;

    window.ALL_LOADED_QUESTIONS = [];

    async function loadDynamicQuestions() {
        // ബ്രൗസർ ക്യാഷ് തടയാൻ ടൈംസ്റ്റാമ്പ് (Cache Busting)
        const cacheBuster = '?t=' + new Date().getTime();
        const possibleFiles = ['All questions', 'All questions.json', 'All questions.txt', 'All%20questions'];
        let rawContent = null;

        for (let file of possibleFiles) {
            try {
                const res = await fetch(file + cacheBuster);
                if (res.ok) {
                    const text = await res.text();
                    if (text && text.trim().length > 20) {
                        rawContent = text;
                        break;
                    }
                }
            } catch (e) {
                // അടുത്ത ഫയൽ പരിശോധിക്കുന്നു
            }
        }

        if (!rawContent) {
            console.warn("പുതിയ ചോദ്യ ഫയൽ ലഭ്യമായില്ല. നിലവിലുള്ള ചോദ്യങ്ങൾ ഉപയോഗിക്കുന്നു.");
            return;
        }

        const formattedData = extractAndFormatQuestions(rawContent);

        if (formattedData.length > 0) {
            window.ALL_LOADED_QUESTIONS = formattedData;

            // index.html-ലെ ACTIVE_QUESTION_BANK-ലേക്ക് ഏറ്റവും മുകളിലായി ചേർക്കുന്നു
            if (typeof ACTIVE_QUESTION_BANK !== 'undefined' && Array.isArray(ACTIVE_QUESTION_BANK)) {
                ACTIVE_QUESTION_BANK.unshift(...formattedData);
            } else {
                window.ACTIVE_QUESTION_BANK = formattedData;
            }

            // MANHAJ_KNOWLEDGE_BASE അപ്‌ഡേറ്റ് ചെയ്യുന്നു
            if (typeof MANHAJ_KNOWLEDGE_BASE !== 'undefined' && Array.isArray(MANHAJ_KNOWLEDGE_BASE)) {
                MANHAJ_KNOWLEDGE_BASE.unshift(...formattedData);
            } else {
                window.MANHAJ_KNOWLEDGE_BASE = formattedData;
            }

            console.log(`വിജയകരമായി ${formattedData.length} ചോദ്യങ്ങൾ പുതിയ അപ്‌ഡേറ്റിൽ നിന്ന് ചാറ്റ്ബോട്ടിലേക്ക് ലോഡ് ചെയ്തു!`);
        }
    }

    function extractAndFormatQuestions(rawText) {
        let cleanText = rawText.trim();
        let parsedArray = [];

        // 1. ശുദ്ധമായ JSON ഫോർമാറ്റ് ആണെങ്കിൽ
        try {
            let data = JSON.parse(cleanText);
            if (Array.isArray(data)) parsedArray = data;
            else if (data.questions && Array.isArray(data.questions)) parsedArray = data.questions;
        } catch (e) {
            // 2. const QUESTIONS = [...] അല്ലെങ്കിൽ const MANHAJ_KNOWLEDGE_BASE = [...] ആണെങ്കിൽ
            try {
                const start = cleanText.indexOf('[');
                const end = cleanText.lastIndexOf(']');
                if (start !== -1 && end !== -1 && end > start) {
                    const arrayStr = cleanText.substring(start, end + 1);
                    parsedArray = new Function('return ' + arrayStr)();
                }
            } catch (err) {
                console.error("ചോദ്യങ്ങൾ വായിച്ചെടുക്കുന്നതിൽ പിശക്:", err);
            }
        }

        // ചോദ്യങ്ങൾ ഒരൊറ്റ ഫോർമാറ്റിലേക്ക് മാറ്റുന്നു
        return parsedArray.map((item, idx) => {
            let qArray = [];
            if (Array.isArray(item.questions)) {
                qArray = item.questions;
            } else if (item.question) {
                qArray = [item.question];
            } else if (item.q) {
                qArray = [item.q];
            }

            let ans = item.answer || item.response || item.a || "";
            let topic = item.topic || (qArray[0] ? qArray[0].substring(0, 30) : "General");
            let keywords = Array.isArray(item.keywords) ? item.keywords : [];

            return {
                id: item.id || `Q_${idx + 1}`,
                intent: item.intent || `INTENT_${idx + 1}`,
                topic: topic,
                keywords: keywords,
                questions: qArray,
                question: qArray[0] || "",
                answer: ans
            };
        }).filter(item => item.answer && item.questions.length > 0);
    }

    // പേജ് തുറക്കുമ്പോൾ തനിയെ റൺ ചെയ്യുന്നു
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadDynamicQuestions);
    } else {
        loadDynamicQuestions();
    }
})();
