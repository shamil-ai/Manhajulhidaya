// api/chat.js
const QUESTIONS = require('./questions.js');

const STOP_WORDS = new Set([
  'what', 'is', 'are', 'am', 'was', 'were', 'be', 'a', 'an', 'the', 'in', 'on', 'of', 'for', 'to', 'about', 'tell', 'me', 'can', 'could', 'you', 'give', 'please', 'details', 'info',
  'enthanu', 'entha', 'parayamo', 'paranjutharumo', 'parayoo', 'onnu', 'enikku', 'ariyanam', 'chodichotte', 'undo', 'aano', 'kaanam', 'kittum', 'ninnu',
  'എന്താണ്', 'എന്താ', 'പറയാമോ', 'പറഞ്ഞുതരുമോ', 'പറയൂ', 'ഒന്ന്', 'എനിക്ക്', 'അറിയണം', 'ചോദിച്ചോട്ടെ', 'ഉള്ളത്', 'ഉണ്ടോ', 'ആണോ', 'എവിടെയാണ്', 'എങ്ങനെയാണ്', 'ലഭ്യമാണോ'
]);

function normalize(s) {
  if (!s || typeof s !== 'string') return '';
  return s.toLowerCase().replace(/[^\w\s\u0D00-\u0D7F]/g, '').replace(/\s+/g, ' ').trim();
}

function tokenize(s) {
  const norm = normalize(s);
  if (!norm) return [];
  return norm.split(/\s+/).filter(t => t.length > 1);
}

const exactMap = new Map();
const tokenIndex = new Map();
const keywordIndex = new Map();
const domainVocabulary = new Set();

QUESTIONS.forEach((item, index) => {
  const normQ = normalize(item.question);
  if (!exactMap.has(normQ)) exactMap.set(normQ, item);

  const tokens = tokenize(item.question);
  tokens.forEach(tok => {
    if (!STOP_WORDS.has(tok)) domainVocabulary.add(tok);
    if (!tokenIndex.has(tok)) tokenIndex.set(tok, []);
    tokenIndex.get(tok).push(index);
  });

  if (item.keywords && Array.isArray(item.keywords)) {
    item.keywords.forEach(kw => {
      const normKw = normalize(kw);
      if (!keywordIndex.has(normKw)) keywordIndex.set(normKw, []);
      keywordIndex.get(normKw).push(index);
      tokenize(kw).forEach(t => {
        if (!STOP_WORDS.has(t)) domainVocabulary.add(t);
      });
    });
  }
});

const FALLBACK_RESPONSE = {
  success: true,
  answer: "ക്ഷമിക്കണം, ലഭ്യമായ വിവരങ്ങളിൽ ഈ ചോദ്യത്തിന് കൃത്യമായ മറുപടി കണ്ടെത്താനായില്ല. ദയവായി ചോദ്യം മറ്റൊരു രീതിയിൽ ചോദിക്കൂ.",
  intent: "UNKNOWN_FALLBACK_INTENT",
  confidence: 0.0
};

function search(userQuery) {
  if (!userQuery || typeof userQuery !== 'string' || userQuery.trim() === '') return FALLBACK_RESPONSE;
  const normQuery = normalize(userQuery);

  if (exactMap.has(normQuery)) {
    const item = exactMap.get(normQuery);
    return { success: true, answer: item.answer, intent: item.intent, confidence: 1.0 };
  }

  const qTokens = tokenize(userQuery);
  if (qTokens.length === 0) return FALLBACK_RESPONSE;

  const userContentTokens = qTokens.filter(t => !STOP_WORDS.has(t));
  const matchedDomainTokens = userContentTokens.filter(t => domainVocabulary.has(t));

  if (userContentTokens.length > 0 && matchedDomainTokens.length === 0) return FALLBACK_RESPONSE;

  const candidateScores = new Map();
  qTokens.forEach(tok => {
    if (keywordIndex.has(tok)) {
      keywordIndex.get(tok).forEach(idx => candidateScores.set(idx, (candidateScores.get(idx) || 0) + 3.0));
    }
  });

  const searchTokens = matchedDomainTokens.length > 0 ? matchedDomainTokens : qTokens;
  searchTokens.forEach(tok => {
    const list = tokenIndex.get(tok);
    if (list) list.forEach(idx => candidateScores.set(idx, (candidateScores.get(idx) || 0) + 1.5));
  });

  if (candidateScores.size === 0) return FALLBACK_RESPONSE;

  let bestIdx = -1;
  let maxScore = 0;

  candidateScores.forEach((score, idx) => {
    const item = QUESTIONS[idx];
    const itemTokens = tokenize(item.question);
    const similarity = (2 * score) / (qTokens.length + itemTokens.length + 1);
    if (similarity > maxScore) { maxScore = similarity; bestIdx = idx; }
  });

  if (bestIdx !== -1 && maxScore >= 0.25) {
    const item = QUESTIONS[bestIdx];
    const confidence = Math.min(0.98, Number(Math.max(0.65, maxScore * 1.5).toFixed(2)));
    return { success: true, answer: item.answer, intent: item.intent, confidence: confidence };
  }
  return FALLBACK_RESPONSE;
}

// Vercel Serverless API Handler
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { query } = req.body;
  const result = search(query);
  res.status(200).json(result);
}
