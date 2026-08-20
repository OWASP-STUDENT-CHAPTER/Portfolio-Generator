/**
 * =====================================================================
 * Layer 1: Veil Ultra-Strict Multi-Engine Local Moderation System
 * =====================================================================
 * High-performance, zero-API-cost client-and-server moderation engine.
 * Specifically engineered for public academic & professional portfolio sites.
 *
 * Engines:
 * 1. Phonetic Signature Engine (Soundex/Metaphone phonetic distance)
 * 2. Damerau-Levenshtein Fuzzy Edit Distance Matcher
 * 3. N-gram Character Shingle & Sliding Window Scanner
 * 4. Hinglish / Hindi Slang Transliteration Normalizer
 * 5. Unicode Homoglyph & Leetspeak Decoder
 * 6. Severe Stem & Regex Matrix
 * 7. Scunthorpe Whitelist Protection for CS/Academic Terms
 */

// ==========================================
// 1. Homoglyph / Confusable Mapping
// ==========================================
const HOMOGLYPH_MAP: Record<string, string> = {
  // Cyrillic to Latin
  'а': 'a', 'А': 'a', 'б': 'b', 'Б': 'b', 'в': 'v', 'В': 'v', 'г': 'g', 'Г': 'g',
  'д': 'd', 'Д': 'd', 'е': 'e', 'Е': 'e', 'ё': 'e', 'Ё': 'e', 'ж': 'zh', 'Ж': 'zh',
  'з': 'z', 'З': 'z', 'и': 'i', 'И': 'i', 'й': 'y', 'Й': 'y', 'к': 'k', 'К': 'k',
  'л': 'l', 'Л': 'l', 'м': 'm', 'М': 'm', 'н': 'n', 'Н': 'n', 'о': 'o', 'О': 'o',
  'п': 'p', 'П': 'p', 'р': 'r', 'Р': 'r', 'с': 'c', 'С': 'c', 'т': 't', 'Т': 't',
  'у': 'u', 'У': 'u', 'ф': 'f', 'Ф': 'f', 'х': 'x', 'Х': 'x', 'ц': 'ts', 'Ц': 'ts',
  'ч': 'ch', 'Ч': 'ch', 'ш': 'sh', 'Ш': 'sh', 'щ': 'shch', 'Щ': 'shch',
  'ъ': '', 'Ъ': '', 'ы': 'y', 'Ы': 'y', 'ь': '', 'Ь': '', 'э': 'e', 'Э': 'e',
  'ю': 'yu', 'Ю': 'yu', 'я': 'ya', 'Я': 'ya', 'і': 'i', 'І': 'i', 'ј': 'j', 'Ј': 'j',
  'ѕ': 's', 'Ѕ': 's', 'ѵ': 'v', 'Ѵ': 'v', 'ӏ': 'l', 'Ӏ': 'l',

  // Greek to Latin
  'α': 'a', 'Α': 'a', 'β': 'b', 'Β': 'b', 'γ': 'g', 'Γ': 'g', 'δ': 'd', 'Δ': 'd',
  'ε': 'e', 'Ε': 'e', 'ζ': 'z', 'Ζ': 'z', 'η': 'n', 'Η': 'h', 'θ': 'th', 'Θ': 'th',
  'ι': 'i', 'Ι': 'i', 'κ': 'k', 'Κ': 'k', 'λ': 'l', 'Λ': 'l', 'μ': 'm', 'Μ': 'm',
  'ν': 'v', 'Ν': 'n', 'ξ': 'x', 'Ξ': 'x', 'ο': 'o', 'Ο': 'o', 'π': 'p', 'Π': 'p',
  'ρ': 'r', 'Ρ': 'r', 'σ': 's', 'Σ': 's', 'τ': 't', 'Τ': 't', 'υ': 'u', 'Υ': 'u',
  'φ': 'f', 'Φ': 'f', 'χ': 'x', 'Χ': 'x', 'ψ': 'ps', 'Ψ': 'ps', 'ω': 'w', 'Ω': 'w',
};

// ==========================================
// 2. Leetspeak / Symbol Mapping
// ==========================================
const LEET_MAP: Record<string, string> = {
  '@': 'a',
  '4': 'a',
  '8': 'b',
  '(': 'c',
  '<': 'c',
  '{': 'c',
  '[': 'c',
  '3': 'e',
  '€': 'e',
  '6': 'g',
  '9': 'g',
  '#': 'h',
  '!': 'i',
  '1': 'i',
  '|': 'i',
  '$': 's',
  '5': 's',
  '7': 't',
  '+': 't',
  '0': 'o',
  'vv': 'w',
  '\\/\\/': 'w',
  '%': 'x',
};

// ==========================================
// 3. Whitelist / False-Positive Safe List (Scunthorpe Prevention)
// ==========================================
const SAFE_WHITELIST = new Set([
  'analyst', 'analytics', 'analyze', 'analyzing', 'analysis', 'analytical',
  'assessment', 'assessing', 'assessed', 'associate', 'associated', 'association',
  'assistant', 'assisting', 'assisted', 'assistance',
  'assume', 'assuming', 'assumed', 'assumption', 'assure', 'assurance',
  'asset', 'assets', 'assemble', 'assembled', 'assembly',
  'bass', 'grass', 'glass', 'glasses', 'mass', 'massive', 'compass', 'compassion',
  'pass', 'passage', 'passenger', 'passport', 'password', 'passwords', 'surpass',
  'classic', 'classical', 'classify', 'classified', 'classification', 'classroom',
  'document', 'documented', 'documenting', 'documentation', 'documents',
  'execute', 'executing', 'executed', 'executive', 'execution', 'executable',
  'cocktail', 'cocktails', 'peacock', 'hitchcock', 'cockpit',
  'penistone', 'scunthorpe', 'arsenal', 'dickinson', 'cummins', 'titular',
  'button', 'butter', 'butterfly', 'cassette', 'circumstance', 'basement',
  'title', 'titles', 'subtitle', 'subtitles',
  'resume', 'resumes', 'skills', 'skillset', 'portfolio', 'developer',
  'algorithm', 'bitbucket', 'github', 'gitlab', 'git', 'commit', 'branch',
  'essex', 'sussex', 'middlesex', 'section', 'sections',
  'bootstrap', 'tailwind', 'backend', 'frontend', 'fullstack',
  'software', 'engineer', 'engineering', 'computer', 'science', 'technology',
  'patiala', 'thapar', 'punjab', 'india', 'university', 'institute', 'student',
  'javascript', 'typescript', 'react', 'nextjs', 'python', 'database', 'postgres',
  'consensus', 'concurrency', 'concurrent', 'distributed', 'engine', 'performance',
  'systems', 'system', 'architect', 'architecture', 'programming', 'project',
  'research', 'academic', 'cloud', 'network', 'protocol', 'development',
  'designer', 'design', 'management', 'manager', 'optimization',
  'led', 'lead', 'leader', 'leadership', 'leading',
  'store', 'storage', 'state', 'stack', 'score', 'source', 'service', 'services',
  'land', 'landing', 'landscape', 'island', 'farmland', 'woodland', 'highland', 'mainland', 'grassland', 'wetland',
  'own', 'owner', 'ownership', 'property', 'estate', 'real',
  'hand', 'sand', 'band', 'grand', 'stand', 'brand', 'expand', 'command', 'demand',
  'cook', 'deck', 'dock', 'duck', 'load', 'lord', 'loud', 'gold', 'hold',
  'shot', 'shut', 'slot', 'seed', 'feed', 'need', 'rate', 'fits', 'bits', 'hits', 'tips', 'pits', 'kits',
  // Academic Degrees & Credentials (Prevents false positives on abbreviations like B.Tech)
  'btech', 'mtech', 'barch', 'march', 'mca', 'bca', 'phd', 'dphil', 'bsc', 'msc',
  'ba', 'ma', 'bcom', 'mcom', 'bba', 'mba', 'bdes', 'mdes', 'bse', 'mse', 'be', 'me',
  'llb', 'llm', 'mbbs', 'md', 'ms', 'bds', 'bpharm', 'mpharm', 'bed', 'med',
  'bachelor', 'bachelors', 'master', 'masters', 'doctorate', 'diploma', 'degree',
  'graduate', 'undergraduate', 'postgraduate', 'intern', 'internship', 'tech', 'technology',
  'fellow', 'fellowship', 'trainee', 'apprentice', 'specialist',
]);

// ==========================================
// 4. Word Lists & Category Taxonomies
// ==========================================
const EXACT_PROFANITY_WORDS = [
  // High-severity English Profanity & Slang variations
  'fuck', 'fuk', 'fuc', 'fck', 'fux', 'fukk', 'fucc', 'phuck', 'phuk', 'feck', 'fak',
  'fucker', 'fuker', 'fucer', 'fucking', 'fukin', 'fuking', 'fucing', 'fucked', 'fuked', 'fuced',
  'fucks', 'fuks', 'fucs', 'fuckhead', 'fukhead', 'fuchead', 'motherfucker', 'motherfucking',
  'fucit', 'fukit', 'fuckit', 'fucall', 'fukall', 'fuckall', 'unfuc', 'unfuk', 'unfuck',
  'stfu', 'wtf', 'gtfo',
  'shit', 'shitty', 'shitting', 'bullshit', 'horseshit', 'dipshit', 'shithead', 'sh1t', 'sh!t', 'shite', 'shyt',
  'bitch', 'bitches', 'bitching', 'bitchy', 'b1tch', 'b!tch', 'biatch', 'beeyotch', 'btch',
  'asshole', 'assholes', 'dumbass', 'jackass', 'badass', 'fatass', 'a$$hole', 'azzhole',
  'bastard', 'bastards',
  'cunt', 'cunts',
  'dick', 'dicks', 'dickhead', 'dickheads', 'd1ck', 'd!ck', 'dik', 'dix',
  'cock', 'cocks', 'cocksucker', 'c0ck',
  'pussy', 'pussies', 'pussie', 'pussiee', 'pusy', 'pussi',
  'whore', 'whores', 'slut', 'sluts', 'slutty',
  'twat', 'wanker', 'wankers', 'prick', 'pricks',
  'blowjob', 'handjob', 'circlejerk',
  'porn', 'porno', 'pornography', 'hentai', 'milf', 'dildo',
  'sex', 'sexy', 'nude', 'nudes', 'naked', 'nsfw', 'xxx', 'horny', 'erotic', 'escort', 'escorts',
  'pedophile', 'pedo', 'rapist', 'rape',

  // Alcohol, Drinking & Substance Abuse (Strict Professional Portfolio Policy)
  'booze', 'boozy', 'boozing', 'boozer',
  'alcohol', 'alchohol', 'alcohal', 'alcoholic', 'alcoholism', 'alkohol',
  'liquor', 'liqour',
  'whiskey', 'whisky', 'vodka', 'tequila', 'rum', 'gin', 'beer', 'beers', 'wine', 'champagne', 'brandy', 'bourbon', 'scotch',
  'drunk', 'drunken', 'drunkard', 'hangover', 'wasted', 'intoxicated', 'intoxication',
  'daru', 'daaru', 'sharab', 'sharaab', 'sharabi', 'sharaabi', 'desi daru', 'theka', 'nasha', 'nashedi', 'nasheedi',

  // Drugs, Narcotics & Controlled Substances
  'weed', 'cannabis', 'marijuana', 'pothead', 'stoner', 'ganja', 'gaanja', 'charas', 'afeem', 'chitta', 'bhang',
  'cocaine', 'coke', 'heroin', 'meth', 'methamphetamine', 'ecstasy', 'mdma', 'lsd', 'shrooms', 'psychedelics', 'ketamine', 'opioid', 'fentanyl',
  'bong', 'joint', 'blunt', 'spliff',

  // Tobacco, Smoking & Vaping
  'vape', 'vaping', 'juul', 'hookah', 'sheesha', 'shisha', 'cigarette', 'cigarettes', 'tobacco', 'bidi', 'beedi', 'gutka', 'tambaku',

  // Gambling, Betting & Casinos
  'casino', 'casinos', 'gambling', 'gamble', 'gambler', 'betting', 'bookie', 'roulette', 'blackjack', 'poker', 'slots', 'slot machine',
  'satta', 'matka', 'sattamatka', 'teenpatti',

  // Adult, Dating & NSFW Services & Anatomy
  'bosom', 'bosoms', 'boosom', 'boosoms', 'boozom',
  'breast', 'breasts', 'boob', 'boobs', 'boobie', 'boobies', 'booty', 'booties',
  'tits', 'titties', 'titty', 'nipple', 'nipples', 'areola',
  'panties', 'thong', 'thongs', 'lingerie',
  'onlyfans', 'hookup', 'hookups', 'hooker', 'hookers', 'sugar daddy', 'sugardaddy', 'sugar mommy', 'sugar baby',
  'fetish', 'bdsm', 'stripper', 'strip club', 'threesome', 'orgy', 'incest',
  'masturbate', 'masturbation', 'orgasm', 'ejaculate', 'ejaculation', 'cum', 'cumming', 'creampie',
  'moan', 'moans', 'moaning', 'moaned', 'groan', 'groaning',
  'penis', 'vagina', 'clit', 'clitoris', 'cleavage', 'sexwork', 'sexworker', 'brothel',

  // Hate Speech & Slurs (Strict Block)
  'nigger', 'niggers', 'nigga', 'niggas',
  'faggot', 'faggots', 'fag', 'fags',
  'kike', 'kikes', 'spic', 'spics', 'chink', 'chinks', 'gook', 'gooks', 'wetback', 'coon', 'tranny',
  'retard', 'retarded', 'retards',

  // Violent Threats / Harm
  'kill yourself', 'kys', 'die in a fire', 'hang yourself', 'commit suicide',

  // Hindi / Hinglish Profanities & Abusive Phrases (Latin & Devanagari)
  'bhenchod', 'behenchod', 'bhen ke lode', 'bhenkelode', 'behen ke lode', 'bc',
  'madarchod', 'maderchod', 'mc', 'maadarchod', 'maa chuda', 'maa chudao', 'behen chuda',
  'chutiya', 'chutiye', 'chutya', 'chutiyapa', 'chootiya', 'chootiye',
  'bhosdike', 'bhosadiwale', 'bhosadike', 'bhosada', 'bhosdi', 'bsdk', 'bhosad', 'bhosda',
  'gaand', 'gand', 'gandu', 'gaandu', 'gandfat', 'gaandmasti', 'gandmasti', 'gand mara', 'gaand mara', 'gaand marva', 'gand marva',
  'lauda', 'lawda', 'loda', 'lodu', 'lodun', 'lavde', 'laude',
  'lund', 'lund lele', 'land lele', 'lund le', 'land le', 'muh mein lund', 'muh mein land', 'muh me lund', 'muh me land', 'lund chus', 'land chus',
  'harami', 'haraami', 'kameena', 'kamina', 'kaminey',
  'randi', 'raandi', 'randwa', 'randibaaz',
  'bhadwe', 'bhadwa', 'bhadve', 'bhadva',
  'tatti', 'bakchod', 'bakchodi', 'jhaatu', 'jhatu', 'chudaap', 'chudap',
  'chodna', 'chudai', 'chudna', 'chodne', 'chudva', 'chudwa', 'chodunga', 'chudoge',
  'suar ke bacche', 'kuttiya', 'kuttiya ke', 'kutte ke pille',
  'chut', 'chooth', 'choot', 'chut marwa', 'choot marwa',
  'teri maa ki chut', 'teri bhen ki chut', 'teri maa ka bhosda',
  'tatte', 'tatton', 'jhaant', 'jhant', 'muth maar', 'mutth maar',
  'tumhari maiya', 'tumhari maiyaa', 'teri maiya', 'teri maiyaa', 'baja denge', 'baja dunga', 'pel denge', 'pel dunga',

  // Devanagari Hindi Profanities & Prohibited Substances
  'मादरचोद', 'बहनचोद', 'भोसड़ीके', 'चूतिया', 'गांडू', 'लौड़ा', 'रंडी', 'भड़वा',
  'हरामी', 'कमीना', 'झाटू', 'बकचोद', 'टट्टी', 'कुतिया', 'चुदाई', 'गांड', 'लंड', 'मुंह में लंड',
  'दारू', 'शराब', 'शराबी', 'नशा', 'गांजा', 'चरस', 'अफीम', 'गुटखा', 'तंबाकू', 'सट्टा', 'मटका', 'जुआ'
];

// Set for exact O(1) membership
const EXACT_PROFANITY_SET = new Set([
  ...EXACT_PROFANITY_WORDS.map((w) => w.toLowerCase()),
  ...EXACT_PROFANITY_WORDS.map((w) => w.normalize('NFKD').toLowerCase()),
]);

const NORMALIZED_PROFANITY_WORDS = EXACT_PROFANITY_WORDS.map((w) =>
  w.normalize('NFKD').toLowerCase()
);

const WORD_BOUNDARY_PATTERNS = NORMALIZED_PROFANITY_WORDS.map((w) => {
  const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-zA-Z0-9_\u0900-\u097F])${escaped}([^a-zA-Z0-9_\u0900-\u097F]|$)`, 'i');
});

// Common severe roots / stems that should never appear in portfolio text unless whitelisted
const SEVERE_STEMS = [
  'fuck', 'fuk', 'fuc', 'fck', 'fux', 'fukk', 'fucc', 'phuck', 'phuk', 'feck', 'fak',
  'bitch', 'b1tch', 'biatch', 'beeyotch', 'btch',
  'asshole', 'azzhole', 'dumbass', 'jackass', 'fatass',
  'cunt', 'dick', 'd1ck', 'dickhead', 'cock', 'c0ck', 'pussy', 'pussie', 'pussiee', 'slut', 'whore',
  'blowjob', 'handjob', 'circlejerk', 'porn', 'porno', 'hentai', 'dildo', 'milf',
  'nigger', 'nigga', 'faggot', 'fag', 'kike', 'spic', 'chink', 'retard',
  'bhenchod', 'behenchod', 'madarchod', 'maderchod', 'chutiya', 'chootiya', 'chutya',
  'bhosdike', 'bhosadi', 'bhosda', 'bhosad', 'gaandu', 'gandu', 'gaand',
  'lauda', 'lawda', 'loda', 'lodu', 'lavde', 'laude',
  'lund', 'harami', 'randi', 'bhadwe', 'bhadwa', 'tatti', 'bakchod', 'jhaatu', 'jhatu',
  'booze', 'boozy', 'alcohol', 'alchohol', 'alcohal', 'whiskey', 'vodka', 'tequila', 'beer', 'drunk', 'daru', 'sharab',
  'weed', 'cannabis', 'marijuana', 'ganja', 'charas', 'afeem', 'cocaine', 'heroin', 'meth',
  'casino', 'gambl', 'satta', 'matka', 'teenpatti',
  'onlyfans', 'hookup', 'sugardaddy', 'sugar daddy', 'sugar baby',
  'bosom', 'boosom', 'boob', 'tits', 'titties', 'titty', 'nipple', 'vagina', 'penis', 'moan', 'moaning',
  'kys', 'kill yourself', 'suicide',
];

// Severe stems that must NEVER appear even inside unspaced continuous strings (e.g. "thisisfuckdeveloper", "tumharimaiyakothalikitarahbajadenge")
const CONTINUOUS_SEVERE_STEMS = [
  // High-severity English profanities
  'fuck', 'fuk', 'fuc', 'fck', 'fux', 'fukk', 'fucc', 'phuck', 'phuk',
  'bullshit', 'horseshit', 'dipshit', 'shithead',
  'bitch', 'b1tch', 'biatch', 'beeyotch', 'btch',
  'asshole', 'azzhole', 'dumbass', 'jackass', 'fatass',
  'cunt', 'dickhead', 'd1ck',
  'pussy', 'pussie', 'pussiee', 'pusy',
  'blowjob', 'handjob', 'circlejerk', 'porn', 'porno', 'hentai', 'dildo', 'milf',
  'nigger', 'nigga', 'faggot', 'kike', 'spic', 'chink', 'retard',
  'whore', 'slut',

  // Hindi / Hinglish severe profanities & threats
  'bhenchod', 'behenchod', 'madarchod', 'maderchod', 'chutiya', 'chootiya', 'chutya',
  'bhosdike', 'bhosadi', 'bhosda', 'bhosad', 'gaandu', 'gandu',
  'lauda', 'lawda', 'loda', 'lodu', 'lavde', 'laude',
  'lund', 'harami', 'randi', 'bhadwe', 'bhadwa', 'tatti', 'bakchod', 'jhaatu', 'jhatu',
  'tumharimaiy', 'terimaiy', 'bajadenge', 'bajadunga', 'peldenge', 'peldunga',
  'terimaakichut', 'teribhenkichut', 'terimaakabhosda', 'maakichut', 'chutmar',
  'gandmar', 'gaandmar', 'mutthmar', 'muthmar',

  // Prohibited substances & adult
  'onlyfans', 'sugardaddy', 'sugarbaby',
  'marijuanna', 'marijuana',
  'alchohol',
  'killyourself', 'suicide'
];

// Complex multi-word regex patterns with spacing and symbol evasions
const SEVERE_PHRASE_REGEXES = [
  /(^|[^a-zA-Z0-9_])f+[\s._\-*~]*[u|a|e|o|*@]?[\s._\-*~]*(c+k+|k+|c+|x+|q+)([^a-zA-Z0-9_]|$)/i,
  /(^|[^a-zA-Z0-9_])s+[\s._\-*~]*h+[\s._\-*~]*[i|1|!]?[\s._\-*~]*t+([^a-zA-Z0-9_]|$)/i,
  /(^|[^a-zA-Z0-9_])b+[\s._\-*~]*[i|1|!]?[\s._\-*~]*t+[\s._\-*~]*c+[\s._\-*~]*h+/i,
  /(^|[^a-zA-Z0-9_])a+[\s._\-*~]*s+[\s._\-*~]*s+[\s._\-*~]*h+[\s._\-*~]*o+[\s._\-*~]*l+[\s._\-*~]*e+/i,
  /(^|[^a-zA-Z0-9_])c+[\s._\-*~]*u+[\s._\-*~]*n+[\s._\-*~]*t+/i,
  /(^|[^a-zA-Z0-9_])d+[\s._\-*~]*i+[\s._\-*~]*c+[\s._\-*~]*k+[\s._\-*~]*h+[\s._\-*~]*e+[\s._\-*~]*a+[\s._\-*~]*d+/i,
  /(^|[^a-zA-Z0-9_])b+[\s._\-*~]*h+[\s._\-*~]*e+[\s._\-*~]*n+[\s._\-*~]*c+[\s._\-*~]*h+[\s._\-*~]*o+[\s._\-*~]*d+/i,
  /(^|[^a-zA-Z0-9_])m+[\s._\-*~]*a+[\s._\-*~]*d+[\s._\-*~]*a+[\s._\-*~]*r+[\s._\-*~]*c+[\s._\-*~]*h+[\s._\-*~]*o+[\s._\-*~]*d+/i,
  /(^|[^a-zA-Z0-9_])c+[\s._\-*~]*h+[\s._\-*~]*u+[\s._\-*~]*t+[\s._\-*~]*i+[\s._\-*~]*y+[\s._\-*~]*a+/i,
  /(^|[^a-zA-Z0-9_])b+[\s._\-*~]*h+[\s._\-*~]*o+[\s._\-*~]*s+[\s._\-*~]*d+[\s._\-*~]*i+[\s._\-*~]*k+[\s._\-*~]*e+/i,
  /(^|[^a-zA-Z0-9_])g+[\s._\-*~]*a+[\s._\-*~]*a+[\s._\-*~]*n+[\s._\-*~]*d+[\s._\-*~]*u+/i,
  /(^|[^a-zA-Z0-9_])n+[\s._\-*~]*i+[\s._\-*~]*g+[\s._\-*~]*g+[\s._\-*~]*e+[\s._\-*~]*r+/i,
  /(^|[^a-zA-Z0-9_])f+[\s._\-*~]*a+[\s._\-*~]*g+[\s._\-*~]*g+[\s._\-*~]*o+[\s._\-*~]*t+/i,
  /k+i+l+l+[\s._\-*~]+y+o+u+r+s+e+l+f+/i,
  /c+o+m+m+i+t+[\s._\-*~]+s+u+i+c+i+d+e+/i,
  /d+i+e+[\s._\-*~]+i+n+[\s._\-*~]+a+[\s._\-*~]+f+i+r+e+/i,
  /h+a+n+g+[\s._\-*~]+y+o+u+r+s+e+l+f+/i,
  /(^|[^a-zA-Z0-9_])k+y+s+([^a-zA-Z0-9_]|$)/i,

  // Hindi / Hinglish Sexual & Abusive Compound Phrases
  /(^|[^a-zA-Z0-9_])(m+u+h+|m+o+o+h+)[\s._\-*~]+(m+e+|m+e+i+n+|m+a+i+n+)[\s._\-*~]+(l+u+n+d+|l+a+n+d+|l+a+u+d+a+|l+o+d+a+)[\s._\-*~]*(l+e+|l+e+l+e+|c+h+u+s+|c+h+u+s+o+)?/i,
  /(^|[^a-zA-Z0-9_])(l+u+n+d+|l+a+n+d+|l+a+u+d+a+|l+o+d+a+)[\s._\-*~]+(l+e+|l+e+l+e+|c+h+u+s+|c+h+u+s+o+|m+a+a?r+)/i,
  /(^|[^a-zA-Z0-9_])(t+e+r+i+|t+e+r+e+)[\s._\-*~]+(m+a+a+|m+a+|b+h+e+n+|b+e+h+e+n+)[\s._\-*~]+(k+i+|k+a+)[\s._\-*~]+(c+h+u+t+|b+h+o+s+d+a+|l+a+u+d+a+|l+u+n+d+)/i,
  /(^|[^a-zA-Z0-9_])(m+a+a+|m+a+|b+h+e+n+|b+e+h+e+n+)[\s._\-*~]+(c+h+u+d+a+|c+h+u+d+a+o+|c+h+o+d+)/i,
  /(^|[^a-zA-Z0-9_])(g+a+a+n+d+|g+a+n+d+)[\s._\-*~]+(m+a+a?r+a+|m+a+a?r+v+a+|m+a+a?r+w+a+|f+a+t+|p+h+a+t+)/i,
  /(^|[^a-zA-Z0-9_])(c+h+u+t+|c+h+o+o+t+)[\s._\-*~]+(m+a+a?r+v+a+|m+a+a?r+w+a+|c+h+a+a?t+|c+h+a+t+o+)/i,
  /(^|[^a-zA-Z0-9_])(m+u+t+h+|m+u+t+t+h+)[\s._\-*~]+(m+a+a?r+|m+a+a?r+n+a+)/i,

  // Hindi / Hinglish Threats, Maternal Abuse & Violence
  /(^|[^a-zA-Z0-9_])(t+u+m+h+a+r+i+|t+e+r+i+|t+e+r+e+)[\s._\-*~]+(m+a+i+y+a+a?|m+a+a?|m+a+a+t+a+|b+a+a+p+|k+h+a+a?n+d+a+a?n+)[\s._\-*~]+(k+o+|k+i+|k+a+)?[\s._\-*~]*(t+h+a+a?l+i+|b+a+j+a+|p+e+l+|c+h+o+d+|m+a+a?r+)/i,
  /(^|[^a-zA-Z0-9_])(b+a+j+a+|p+e+l+)[\s._\-*~]+(d+e+n+g+e+|d+u+n+g+a+|d+e+g+a+|d+i+y+a+)/i,
  /(^|[^a-zA-Z0-9_])(j+a+a+n+|g+o+l+i+)[\s._\-*~]+(s+e+)?[\s._\-*~]*(m+a+a?r+|m+a+r+d+u+n+g+a+|m+a+r+d+e+n+g+e+)/i,
  /(^|[^a-zA-Z0-9_])(t+h+a+l+i+|t+h+a+a+l+i+)[\s._\-*~]+(k+i+|k+e+)[\s._\-*~]+(t+a+r+a+h+|j+a+i+s+e+)[\s._\-*~]+(b+a+j+a+)/i,

  // Anatomy / Explicit variations
  /(^|[^a-zA-Z0-9_])b+o+o+s+o+m+s?/i,
  /(^|[^a-zA-Z0-9_])b+o+s+o+m+s?/i,
  /(^|[^a-zA-Z0-9_])b+o+o+z+e+/i,
  /(^|[^a-zA-Z0-9_])a+l+c+[ho]+h+o+l+/i,

  // Institutional, Academic, Open-Source & Corporate Defamation (OWASP, Linux, Thapar, etc.)
  /(^|[^a-zA-Z0-9_])(owasp|linux|gnu|apache|mozilla|w3c|ieee|acm|thapar|tiet|github|gitlab|google|microsoft|apple|amazon|meta|openai|anthropic)[\s._\-*~]+(is|was|are|were)?[\s._\-*~]*(an?\s+)?(bad|worst|terrible|awful|useless|trash|garbage|scam|fraud|corrupt|fake|chutiya|bakwas|bekar|ghatiya|fuddu|gandu|chor|loot|disaster|shitty|sucks|worthless)/i,
  /(^|[^a-zA-Z0-9_])(bad|worst|terrible|awful|useless|trash|garbage|scam|fraud|corrupt|fake|chutiya|bakwas|bekar|ghatiya|fuddu|gandu|chor|loot|disaster|shitty|worthless)[\s._\-*~]+(owasp|linux|gnu|apache|mozilla|w3c|ieee|acm|thapar|tiet)/i,
  /(^|[^a-zA-Z0-9_])(owasp|thapar|tiet|linux|google|microsoft|apple)[\s._\-*~]+sucks([^a-zA-Z0-9_]|$)/i,

  // General Institutional, Academic, Corporate & Foundation Defamation
  /(^|[^a-zA-Z0-9_])(is|are|was|were)[\s._\-*~]+(an?\s+)?(bad|worst|terrible|awful|useless|trash|garbage|horrible|scam|fraud|corrupt|fake|worthless|shitty|bullshit|fuddu|bekar|bakwas|ghatiya)[\s._\-*~]+(college|university|institute|institution|campus|school|company|workplace|employer|foundation|organization|org|community|project|team|firm|startup|agency)/i,
  /(^|[^a-zA-Z0-9_])(worst|useless|garbage|trash|scam|fraud|corrupt|worthless|shitty|fuddu|bekar|bakwas|ghatiya)[\s._\-*~]+(college|university|institute|institution|campus|company|workplace|foundation|organization|community)/i,
  /(^|[^a-zA-Z0-9_])(college|university|institute|institution|company|workplace|foundation|organization)[\s._\-*~]+(is|are|was|were)[\s._\-*~]+(an?\s+)?(bad|worst|terrible|awful|useless|trash|garbage|horrible|scam|fraud|corrupt|fake|worthless|shitty|fuddu|bekar|bakwas|ghatiya)/i,
  /(^|[^a-zA-Z0-9_])(tier[\s._\-*~]*[3-9]|tier[\s._\-*~]*(three|four|five))[\s._\-*~]+(college|university|institute)/i,
  /(^|[^a-zA-Z0-9_])(scam|fake|fraud|bogus)[\s._\-*~]+(university|college|degree|institute|company|foundation)/i,
  /(^|[^a-zA-Z0-9_])(professors?|teachers?|faculty|dean|director|boss|manager|colleagues?|coworkers?)[\s._\-*~]+(is|are|was|were)[\s._\-*~]+(bad|worst|chutiya|gandu|useless|corrupt|fraud|idiots?|stupid|trash|horrible)/i,

  // Universal Demographic, Religious, Gender & Community Hate Speech
  /(^|[^a-zA-Z0-9_])(hate|despise|loathe|kill|destroy|exterminate|wipe\s*out)[\s._\-*~]+(all\s+)?(indians?|pakistanis?|hindus?|muslims?|christians?|jews?|jewish|sikhs?|blacks?|whites?|asians?|women|men|gays?|lgbtq|trans|queer|dalits?|brahmins?|refugees?|immigrants?)\b/i,
  /(^|[^a-zA-Z0-9_])(all\s+)?(indians?|pakistanis?|hindus?|muslims?|christians?|jews?|jewish|sikhs?|blacks?|whites?|asians?|women|men|gays?|lgbtq|trans|queer|dalits?|brahmins?|refugees?|immigrants?)[\s._\-*~]+(are|should\s+be|must\s+be)[\s._\-*~]+(bad|evil|terrorists?|animals?|dogs?|pigs?|subhuman|scum|parasites?|dirty|trash|garbage|killed|exterminated|raped|hated|banned|destroyed|hateful)/i,
  /(^|[^a-zA-Z0-9_])(death\s+to|burn\s+in\s+hell|go\s+to\s+hell\s+all)[\s._\-*~]+[a-zA-Z0-9_]+/i,

  // Targeted Personal Slander, Defamation & Harassment against ANY individual
  /(^|[^a-zA-Z0-9_])[a-zA-Z0-9_]{2,}[\s._\-*~]+(is|was|are|were)[\s._\-*~]+(an?\s+)?(creep|pervert|psycho|stalker|harasser|rapist|abuser|pedophile|fraud|scam|scammer|thief|chor|criminal|liar|cheater|clown|scumbag|loser|piece\s+of\s+shit|fraudster|idiot|moron|retard|pathetic|disgusting|ugly)\b/i,
  /(^|[^a-zA-Z0-9_])(he|she|they|this\s+guy|this\s+girl|this\s+person|my\s+boss|my\s+manager|my\s+ex)[\s._\-*~]+(is|was|are|were)[\s._\-*~]+(an?\s+)?(creep|pervert|psycho|stalker|harasser|rapist|abuser|pedophile|fraud|scammer|thief|liar|cheater|clown|scumbag|loser|fraudster|idiot|moron|retard|pathetic|disgusting)\b/i,
  /(^|[^a-zA-Z0-9_])[a-zA-Z0-9_]{2,}[\s._\-*~]+(should\s+(die|rot|burn|hang|choke|kill\s+themselves|suffer|be\s+killed|be\s+shot|be\s+fired|be\s+arrested|be\s+jailed|be\s+beaten))\b/i,
  /(^|[^a-zA-Z0-9_])(i\s+hate|we\s+hate)[\s._\-*~]+[a-zA-Z0-9_]{3,}\b/i,

  // Hindi / Hinglish Personal Slander & Harassment
  /(^|[^a-zA-Z0-9_])[a-zA-Z0-9_]{2,}[\s._\-*~]+(chor|fraud|chutiya|gandu|harami|kutte|kutti|kamina|kamine|madarchod|bhosdike|randi)[\s._\-*~]+(hai|tha|thi|h|he)\b/i,
  /(^|[^a-zA-Z0-9_])(ye|yeh|wo|woh)[\s._\-*~]+(insaan|ladka|ladki|aadmi|aurat|banda|bandi)[\s._\-*~]+(chutiya|gandu|harami|chor|fraud|kutte|kutti|kamina|kamine)\b/i,

  // Toxic Personas, Malicious Role Titles & Hate Badges (e.g. Professional Hater, Full-time Troll)
  /(^|[^a-zA-Z0-9_])(professional|proffesional|certified|expert|serial|full[\s._\-*~]*time|part[\s._\-*~]*time|chief|senior|junior|lead)?[\s._\-*~]*(hater|haters|troll|trolls|cyberbully|harasser|abuser|scammer|spammer|stalker|blackmailer|extortionist)([^a-zA-Z0-9_]|$)/i,
  /(^|[^a-zA-Z0-9_])h+a+t+e+r+s?([^a-zA-Z0-9_]|$)/i,
  /(^|[^a-zA-Z0-9_])(i[\s._\-*~]*am[\s._\-*~]*(a\s+)?|proud\s+)?(hater|troll|cyberbully|harasser|scammer)([^a-zA-Z0-9_]|$)/i,
];

// ==========================================
// 4B. OWASP Top 10 Security & Injection Attack Defense
// ==========================================
export const OWASP_SECURITY_PATTERNS: { name: string; regex: RegExp; reason: string }[] = [
  // A03: Injection - Cross-Site Scripting (XSS) & Malicious Script Tags
  { name: 'XSS Script Tag', regex: /<\s*script\b[^>]*>/i, reason: 'OWASP A03: Malicious script tags or executable HTML detected' },
  { name: 'XSS Javascript URI', regex: /javascript\s*:\s*[^;\s]+/i, reason: 'OWASP A03: Malicious JavaScript protocol URI detected' },
  { name: 'XSS Event Handler', regex: /\bon(error|load|click|mouseover|mouseenter|focus|blur|change|submit|keydown|keyup)\s*=/i, reason: 'OWASP A03: Malicious DOM event handler attribute detected' },
  { name: 'XSS Suspicious HTML Tag', regex: /<\s*(iframe|object|embed|applet|meta|base)\b/i, reason: 'OWASP A03: Malicious embedded HTML element detected' },
  { name: 'XSS Vector Injection', regex: /<\s*(img|svg|body|input|audio|video|details)[^>]+on[a-z]+\s*=/i, reason: 'OWASP A03: Malicious inline XSS vector detected' },
  { name: 'XSS Code Execution / Cookie Access', regex: /\b(eval|Function)\s*\(|\bdocument\.(cookie|location|domain)\b/i, reason: 'OWASP A03: Unauthorized client script execution or session access pattern detected' },

  // A03: Injection - SQL Injection (SQLi)
  { name: 'SQL Injection Union Select', regex: /\bUNION\s+(ALL\s+)?SELECT\b/i, reason: 'OWASP A03: SQL injection query union detected' },
  { name: 'SQL Injection Boolean Bypass', regex: /['"][^'"]*?\b(OR|AND)\b\s+['"]?1['"]?\s*=\s*['"]?1/i, reason: 'OWASP A03: SQL injection authentication bypass pattern detected' },
  { name: 'SQL Injection Dangerous DDL/DML', regex: /\b(DROP\s+TABLE|DROP\s+DATABASE|TRUNCATE\s+TABLE|ALTER\s+TABLE)\b/i, reason: 'OWASP A03: SQL injection schema destruction statement detected' },
  { name: 'SQL Injection Time Delay / Blind', regex: /\b(SLEEP\s*\(|WAITFOR\s+DELAY|BENCHMARK\s*\()/i, reason: 'OWASP A03: SQL injection blind time-delay payload detected' },

  // A01 / A03: Broken Access Control & Path Traversal / OS Command Injection
  { name: 'Path Traversal', regex: /(?:\.\.\/|\.\.\\){2,}/, reason: 'OWASP A01: Directory traversal sequence detected' },
  { name: 'Sensitive System File Access', regex: /(\/etc\/passwd|\/etc\/shadow|c:\\windows\\system32)/i, reason: 'OWASP A01: Sensitive OS system file reference detected' },
  { name: 'OS Command Injection', regex: /\b(rm\s+-[a-zA-Z]*r[a-zA-Z]*f?|powershell\s+(-enc|-encodedcommand)|cmd\.exe\s+\/c)\b/i, reason: 'OWASP A03: OS command execution payload detected' },

  // Prototype Pollution / Template Injection
  { name: 'Prototype Pollution', regex: /(__proto__|constructor\.prototype)/i, reason: 'OWASP A03: Prototype pollution vector detected' },
];

// ==========================================
// 5. Phonetic Signature Engine (Soundex / Metaphone inspired)
// ==========================================

/**
 * Computes a lightweight phonetic representation of a word
 * Maps phonetically identical sounds (f/ph, k/c/q/ck, s/z/c, v/b/bh, d/dh, etc.)
 */
export function computePhoneticKey(word: string): string {
  if (!word) return '';
  let str = word.toLowerCase().trim();

  // 1. Initial phonetic replacements
  str = str
    .replace(/^ph/, 'f')
    .replace(/^kn/, 'n')
    .replace(/^wr/, 'r')
    .replace(/^wh/, 'w');

  // 2. Character-level phonetic transformations
  let key = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const next = str[i + 1] || '';

    if (char === 'p' && next === 'h') {
      key += 'F';
      i++;
    } else if (char === 'p') {
      key += 'P';
    } else if (char === 'b') {
      key += 'B';
    } else if (char === 'w') {
      key += 'W';
    } else if (char === 'c' && (next === 'k' || next === 'h')) {
      key += 'K';
      i++;
    } else if (char === 'c' && (next === 'e' || next === 'i' || next === 'y')) {
      key += 'S';
    } else if (['c', 'k', 'q'].includes(char)) {
      key += 'K';
    } else if (['s', 'z'].includes(char)) {
      key += 'S';
    } else if (char === 'f' || char === 'v') {
      key += 'F';
    } else if (char === 'd' || char === 't') {
      key += 'T';
    } else if (char === 'l') {
      key += 'L';
    } else if (char === 'm') {
      key += 'M';
    } else if (char === 'n') {
      key += 'N';
    } else if (char === 'r') {
      key += 'R';
    } else if (char === 'g' || char === 'j') {
      key += 'J';
    } else if (char === 'x') {
      key += 'KS';
    } else if (i === 0 && /[aeiou]/.test(char)) {
      key += char.toUpperCase();
    }
  }

  // Deduplicate consecutive phonetic symbols (e.g. KK -> K)
  return key.replace(/(.)\1+/g, '$1');
}

// Pre-compute phonetic signatures of severe words with stem lengths
const SEVERE_PHONETIC_PAIRS = SEVERE_STEMS.map((s) => ({
  stem: s,
  key: computePhoneticKey(s),
  len: s.length,
})).filter((p) => p.key.length >= 2);

// ==========================================
// 6. Damerau-Levenshtein Edit Distance Engine
// ==========================================

/**
 * Computes minimum edit distance with adjacent transpositions
 */
export function damerauLevenshteinDistance(a: string, b: string): number {
  const al = a.length;
  const bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;

  const matrix: number[][] = [];

  for (let i = 0; i <= al; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= bl; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + 1);
      }
    }
  }

  return matrix[al][bl];
}

/**
 * Checks if a word is within a fuzzy edit-distance threshold of any prohibited stem
 */
export function isFuzzyProhibited(word: string): boolean {
  if (word.length < 6 || isWhitelisted(word)) return false;

  for (const stem of SEVERE_STEMS) {
    if (stem.length < 5) continue;
    const lenDiff = Math.abs(word.length - stem.length);
    if (lenDiff > 2) continue;

    const maxAllowedDistance = stem.length <= 7 ? 1 : 2;
    const dist = damerauLevenshteinDistance(word, stem);
    if (dist <= maxAllowedDistance) {
      return true;
    }
  }

  return false;
}

// ==========================================
// 7. Normalization Helpers
// ==========================================

export function stripInvisibleCharacters(text: string): string {
  if (!text) return '';
  return text.replace(/[\u200B-\u200D\uFEFF\u00AD\u200E\u200F\u202A-\u202E\u0000-\u001F]/g, '');
}

export function mapHomoglyphs(text: string): string {
  if (!text) return '';
  let result = '';
  for (const char of text) {
    result += HOMOGLYPH_MAP[char] !== undefined ? HOMOGLYPH_MAP[char] : char;
  }
  return result;
}

export function decodeLeetspeak(text: string): string {
  if (!text) return '';
  let result = text.toLowerCase();
  for (const [symbol, letter] of Object.entries(LEET_MAP)) {
    result = result.split(symbol).join(letter);
  }
  return result;
}

export function collapseRepeatedCharacters(text: string): string {
  if (!text) return '';
  return text.replace(/(.)\1{2,}/g, '$1$1');
}

export function stripSeparators(text: string): string {
  if (!text) return '';
  return text.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '');
}

export function joinSpacedCharacters(text: string): string {
  if (!text) return '';
  return text.replace(/\b([a-zA-Z0-9])\s+(?=[a-zA-Z0-9]\b)/g, '$1');
}

// ==========================================
// 8. Core Multi-Engine Local Moderation Engine
// ==========================================

export interface LocalModerationResult {
  isSafe: boolean;
  reason?: string;
  matchedToken?: string;
}

/**
 * Validates whether a token is in the safe professional whitelist
 */
export function isWhitelisted(word: string): boolean {
  const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!clean) return false;
  return SAFE_WHITELIST.has(clean);
}

/**
 * Core Veil Local Moderation Filter.
 * Evaluates raw text through multi-pass phonetic, fuzzy, n-gram,
 * and exact stem engines.
 */
export function checkLocalProfanity(rawText: string): LocalModerationResult {
  if (!rawText || typeof rawText !== 'string') {
    return { isSafe: true };
  }

  const trimmed = rawText.trim();
  if (trimmed.length < 2) {
    return { isSafe: true };
  }

  // Whitelisted entire string check
  if (isWhitelisted(trimmed)) {
    return { isSafe: true };
  }

  // 0. OWASP Top 10 Security & Injection Check (XSS, SQLi, Traversal, Command Injection)
  for (const owasp of OWASP_SECURITY_PATTERNS) {
    if (owasp.regex.test(rawText) || owasp.regex.test(trimmed)) {
      return {
        isSafe: false,
        reason: owasp.reason,
        matchedToken: owasp.name,
      };
    }
  }

  // 1. Normalization pipeline
  const decomposed = trimmed.normalize('NFKD');
  const cleaned = stripInvisibleCharacters(decomposed);
  const homoglyphResolved = mapHomoglyphs(cleaned);
  const leetDecoded = decodeLeetspeak(homoglyphResolved);
  const collapsed = collapseRepeatedCharacters(leetDecoded);
  const deSpaced = joinSpacedCharacters(collapsed);
  const singleCharCollapsed = leetDecoded.replace(/(.)\1+/g, '$1');

  // Test set of normalized variants
  const variantsToTest = [
    trimmed.toLowerCase(),
    homoglyphResolved.toLowerCase(),
    leetDecoded,
    collapsed,
    deSpaced,
    singleCharCollapsed,
  ];

  // A. Check against Severe Phrase RegExes across normalized variants
  for (const regex of SEVERE_PHRASE_REGEXES) {
    for (const variant of variantsToTest) {
      if (regex.test(variant)) {
        return {
          isSafe: false,
          reason: 'Prohibited language or inappropriate term detected',
        };
      }
    }
  }

  // B. Continuous stream & full-string separator stripped checks (e.g. "thisisfuckdeveloper", "tumharimaiyakothalikitarahbajadenge", "f_u_c_k_e_r")
  const fullStripped = stripSeparators(leetDecoded).toLowerCase();
  const fullStrippedSingle = fullStripped.replace(/(.)\1+/g, '$1');
  const fullRawStripped = rawText.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (fullStripped.length >= 3 && !isWhitelisted(fullStripped)) {
    if (EXACT_PROFANITY_SET.has(fullStripped) || EXACT_PROFANITY_SET.has(fullStrippedSingle)) {
      return {
        isSafe: false,
        reason: 'Prohibited obfuscated keyword detected',
        matchedToken: fullStripped,
      };
    }

    // Continuous unspaced substring search (catches continuous streams without spaces while respecting whitelisted words)
    let sanitizedForContinuous = fullRawStripped;
    for (const wl of SAFE_WHITELIST) {
      if (wl.length >= 4) {
        sanitizedForContinuous = sanitizedForContinuous.replaceAll(wl, '___');
      }
    }
    const sanitizedSingle = sanitizedForContinuous.replace(/(.)\1+/g, '$1');

    for (const stem of CONTINUOUS_SEVERE_STEMS) {
      if (
        sanitizedForContinuous.includes(stem) ||
        sanitizedSingle.includes(stem)
      ) {
        return {
          isSafe: false,
          reason: 'Prohibited continuous language detected',
          matchedToken: stem,
        };
      }
    }

    for (const stem of SEVERE_STEMS) {
      if (stem.length >= 3 && (fullStripped.startsWith(stem) || fullStripped.endsWith(stem) || fullStripped === stem || fullStrippedSingle === stem)) {
        return {
          isSafe: false,
          reason: 'Prohibited term detected',
          matchedToken: stem,
        };
      }
    }

    // Fuzzy check on full stripped word
    if (isFuzzyProhibited(fullStripped)) {
      return {
        isSafe: false,
        reason: 'Prohibited keyword variant detected',
        matchedToken: fullStripped,
      };
    }
  }

  // C. Check word tokens, phonetic signatures, and fuzzy edit distances
  for (const variant of variantsToTest) {
    const spaceTokens = variant.split(/\s+/);

    for (const rawToken of spaceTokens) {
      const cleanToken = rawToken.trim();
      if (!cleanToken || cleanToken.length < 2) continue;

      const tokenStripped = stripSeparators(cleanToken).toLowerCase();
      const tokenSingleCollapsed = cleanToken.replace(/(.)\1+/g, '$1');
      const tokenStrippedSingle = tokenStripped.replace(/(.)\1+/g, '$1');

      const tokenVariants = [
        cleanToken.toLowerCase(),
        cleanToken.normalize('NFKD').toLowerCase(),
        tokenSingleCollapsed,
        tokenStripped,
        tokenStrippedSingle,
      ];

      for (const candidate of tokenVariants) {
        if (!candidate || candidate.length < 2 || isWhitelisted(candidate)) {
          continue;
        }

        // 1. Exact profanity match
        if (EXACT_PROFANITY_SET.has(candidate)) {
          return {
            isSafe: false,
            reason: 'Prohibited language detected',
            matchedToken: cleanToken,
          };
        }

        // 2. Word boundary regex patterns
        for (const pattern of WORD_BOUNDARY_PATTERNS) {
          if (pattern.test(` ${candidate} `)) {
            return {
              isSafe: false,
              reason: 'Prohibited language detected',
              matchedToken: cleanToken,
            };
          }
        }

        // 3. Continuous unspaced substring check inside candidate token (with whitelist masking)
        let tokenSanitized = candidate;
        for (const wl of SAFE_WHITELIST) {
          if (wl.length >= 4) {
            tokenSanitized = tokenSanitized.replaceAll(wl, '___');
          }
        }
        for (const stem of CONTINUOUS_SEVERE_STEMS) {
          if (tokenSanitized.includes(stem)) {
            return {
              isSafe: false,
              reason: 'Prohibited continuous language detected',
              matchedToken: cleanToken,
            };
          }
        }

        // 4. Severe root / stem boundary check
        for (const stem of SEVERE_STEMS) {
          if (stem.length >= 3 && (candidate.startsWith(stem) || candidate.endsWith(stem) || candidate === stem)) {
            return {
              isSafe: false,
              reason: 'Prohibited term or derivative detected',
              matchedToken: cleanToken,
            };
          }
        }

        // 5. Fuzzy Edit Distance Matcher
        if (candidate.length >= 4 && isFuzzyProhibited(candidate)) {
          return {
            isSafe: false,
            reason: 'Prohibited term variation detected',
            matchedToken: cleanToken,
          };
        }

        // 5. Phonetic Signature Matcher (Strict length, sound, and edit-distance proximity)
        if (candidate.length >= 6) {
          const phoneticKey = computePhoneticKey(candidate);
          for (const pair of SEVERE_PHONETIC_PAIRS) {
            if (
              pair.len >= 5 &&
              phoneticKey === pair.key &&
              Math.abs(candidate.length - pair.len) <= 2 &&
              damerauLevenshteinDistance(candidate, pair.stem) <= 2
            ) {
              return {
                isSafe: false,
                reason: 'Prohibited phonetic variation detected',
                matchedToken: cleanToken,
              };
            }
          }
        }
      }
    }
  }

  return { isSafe: true };
}

/**
 * Checks a complete object or nested string fields locally
 */
export function checkObjectFieldsLocally(
  fields: Record<string, unknown>
): { isSafe: boolean; flaggedField?: string; reason?: string } {
  for (const [key, value] of Object.entries(fields)) {
    if (!value) continue;

    if (typeof value === 'string') {
      const res = checkLocalProfanity(value);
      if (!res.isSafe) {
        return {
          isSafe: false,
          flaggedField: key,
          reason: res.reason || 'Prohibited language detected',
        };
      }
    } else if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (typeof item === 'string') {
          const res = checkLocalProfanity(item);
          if (!res.isSafe) {
            return {
              isSafe: false,
              flaggedField: `${key}[${i}]`,
              reason: res.reason,
            };
          }
        } else if (typeof item === 'object' && item !== null) {
          const res = checkObjectFieldsLocally(item as Record<string, unknown>);
          if (!res.isSafe) {
            return {
              isSafe: false,
              flaggedField: `${key}[${i}].${res.flaggedField}`,
              reason: res.reason,
            };
          }
        }
      }
    }
  }

  return { isSafe: true };
}
