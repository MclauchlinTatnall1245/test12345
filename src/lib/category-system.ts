// Central Category Management System
// Dit bestand bevat alle categorieën, subcategorieën en detectielogica

export type GoalCategory = 
  | 'health' // gezondheid & fitness
  | 'productivity' // werk & productiviteit
  | 'household' // huishouden & wonen
  | 'practical' // praktisch & regelen
  | 'personal_development' // persoonlijke ontwikkeling
  | 'entertainment' // ontspanning & hobby's
  | 'social' // sociaal & relaties
  | 'finance' // financieel
  | 'shopping' // shopping & aankopen
  | 'other';

export type MissedReason = 
  | 'no_motivation' // geen zin
  | 'too_tired' // te moe
  | 'no_time' // geen tijd
  | 'forgot' // vergeten
  | 'unexpected' // onverwachte omstandigheden
  | 'too_difficult' // te moeilijk/te hoog gegrepen
  | 'distraction' // afgeleid
  | 'wrong_goal' // foutief/per ongeluk toegevoegd
  | 'other';

// Category labels for display
export const GOAL_CATEGORY_LABELS: Record<GoalCategory, string> = {
  health: 'Gezondheid & Fitness',
  productivity: 'Werk & Productiviteit',
  household: 'Huishouden & Wonen',
  practical: 'Praktisch & Regelen',
  personal_development: 'Persoonlijke Ontwikkeling',
  entertainment: 'Ontspanning & Hobby\'s',
  social: 'Sociaal & Relaties',
  finance: 'Financieel',
  shopping: 'Shopping & Aankopen',
  other: 'Anders'
};

// Missed reason labels for display
export const MISSED_REASON_LABELS: Record<MissedReason, string> = {
  no_motivation: 'Geen zin/motivatie',
  too_tired: 'Te moe',
  no_time: 'Geen tijd',
  forgot: 'Vergeten',
  unexpected: 'Onverwachte omstandigheden',
  too_difficult: 'Te moeilijk/hoog gegrepen',
  distraction: 'Afgeleid',
  wrong_goal: 'Per ongeluk/foutief toegevoegd',
  other: 'Anders'
};

// Subcategory structure - define which subcategories belong to each main category
export const CATEGORY_SUBCATEGORIES: Record<GoalCategory, string[]> = {
  health: ['sport', 'medical', 'nutrition', 'sleep'],
  productivity: ['daily_work', 'projects', 'professional_learning'],
  household: ['cleaning', 'cooking', 'laundry', 'home_maintenance'],
  practical: ['transportation', 'administration', 'appointments', 'repairs'],
  personal_development: ['learning', 'creative', 'mindfulness'],
  entertainment: ['entertainment', 'relaxation', 'hobbies'],
  social: ['family', 'friends', 'romantic', 'social_activities'],
  finance: ['budgeting', 'bills', 'investments'],
  shopping: ['necessities', 'lifestyle'],
  other: []
};

// Subcategory labels for display
export const SUBCATEGORY_LABELS: Record<string, string> = {
  // Health subcategories
  'sport': 'Sport & Beweging',
  'medical': 'Medisch & Zorg',
  'nutrition': 'Voeding & Drinken',
  'sleep': 'Slaap & Rust',
  
  // Productivity subcategories
  'daily_work': 'Dagelijks Werk',
  'projects': 'Werk Projecten',
  'professional_learning': 'Professionele Vaardigheden',
  
  // Household subcategories
  'cleaning': 'Schoonmaken',
  'cooking': 'Koken & Maaltijden',
  'laundry': 'Was & Kleding',
  'home_maintenance': 'Huis Onderhoud',
  
  // Practical subcategories
  'transportation': 'Auto & Vervoer',
  'administration': 'Administratie & Papierwerk',
  'appointments': 'Afspraken & Planning',
  'repairs': 'Reparaties & Klussen',
  
  // Personal Development subcategories
  'learning': 'Lezen & Studie',
  'creative': 'Creativiteit & Kunst',
  'mindfulness': 'Reflectie & Meditatie',
  
  // Entertainment subcategories
  'entertainment': 'TV & Gaming',
  'relaxation': 'Ontspanning & Wellness',
  'hobbies': 'Persoonlijke Hobby\'s',
  
  // Social subcategories
  'family': 'Familie',
  'friends': 'Vrienden',
  'romantic': 'Romantiek & Dating',
  'social_activities': 'Sociale Activiteiten',
  
  // Finance subcategories
  'budgeting': 'Budget & Planning',
  'bills': 'Rekeningen & Betalingen',
  'investments': 'Sparen & Investeren',
  
  // Shopping subcategories
  'necessities': 'Noodzakelijke Aankopen',
  'lifestyle': 'Lifestyle Shopping'
};

// Detection system - keywords mapped to categories and subcategories
export const GOAL_DETECTION: Record<string, { category: GoalCategory; subcategory: string; confidence: number }> = {
  // Multi-category keywords (LOW confidence - context determines winner)
  'kopen': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.5 }, // Very low - needs context
  'bestellen': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.6 },
  'aanschaffen': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.65 },
  'halen': { category: 'shopping', subcategory: 'necessities', confidence: 0.4 }, // Very low, needs context
  'organiseren': { category: 'household', subcategory: 'organization', confidence: 0.5 }, // Can be productivity too
  'plannen': { category: 'productivity', subcategory: 'planning', confidence: 0.5 }, // Can be practical too
  'regelen': { category: 'practical', subcategory: 'administration', confidence: 0.5 }, // Can be household too
  'training': { category: 'health', subcategory: 'sport', confidence: 0.4 }, // Very low - context determines work vs fitness
  'leren': { category: 'productivity', subcategory: 'professional_learning', confidence: 0.4 }, // Can be personal development too
  'oefenen': { category: 'personal_development', subcategory: 'skills', confidence: 0.4 }, // Can be health/sport too
  'maken': { category: 'household', subcategory: 'cooking', confidence: 0.4 }, // Can be personal development too
  'bouwen': { category: 'personal_development', subcategory: 'hobbies', confidence: 0.5 }, // Can be household too
  'repareren': { category: 'practical', subcategory: 'repairs', confidence: 0.8 }, // Higher confidence - more specific
  'opruimen': { category: 'household', subcategory: 'cleaning', confidence: 0.8 }, // Higher confidence
  'sorteren': { category: 'household', subcategory: 'organization', confidence: 0.6 }, // Can be productivity too
  
  // Context-sensitive overlapping keywords
  'tijd': { category: 'productivity', subcategory: 'time_management', confidence: 0.6 }, // Can be personal development
  'contact': { category: 'social', subcategory: 'friends', confidence: 0.6 }, // Can be practical/administration
  'afspraak': { category: 'practical', subcategory: 'appointments', confidence: 0.7 }, // Can be social
  'bezoek': { category: 'social', subcategory: 'family', confidence: 0.6 }, // Can be practical/health
  'uitzoeken': { category: 'productivity', subcategory: 'research', confidence: 0.6 }, // Can be practical
  'zoeken': { category: 'productivity', subcategory: 'research', confidence: 0.6 }, // Can be shopping/practical
  'vergelijken': { category: 'productivity', subcategory: 'research', confidence: 0.7 }, // Can be shopping
  'controleren': { category: 'productivity', subcategory: 'work_tasks', confidence: 0.6 }, // Can be practical
  'checken': { category: 'productivity', subcategory: 'work_tasks', confidence: 0.6 }, // Can be practical/health
  'nakijken': { category: 'productivity', subcategory: 'work_tasks', confidence: 0.6 }, // Can be practical

  // Health & Fitness - Sport & Movement (HIGH confidence for specific activities)
  'gym': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'fitness': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'sporten': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'hardlopen': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'joggen': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'rennen': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'lopen': { category: 'health', subcategory: 'sport', confidence: 0.8 },
  'zwemmen': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'fietsen': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'mountainbike': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'tennis': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'voetbal': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'basketbal': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'volleybal': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'yoga': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'wandelen': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'wandeling': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'hiking': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'pilates': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'crossfit': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'bootcamp': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'strength training': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'krachttraining': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'gewichten': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'bodybuilding': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'cardio': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'stretchen': { category: 'health', subcategory: 'sport', confidence: 0.8 },
  'rekken': { category: 'health', subcategory: 'sport', confidence: 0.8 },
  'warming up': { category: 'health', subcategory: 'sport', confidence: 0.8 },
  'opwarmen': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'cooling down': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'afkoelen': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'sport': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'sportschool': { category: 'health', subcategory: 'sport', confidence: 0.98 },
  'workout': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'oefening': { category: 'health', subcategory: 'sport', confidence: 0.8 },
  'oefeningen': { category: 'health', subcategory: 'sport', confidence: 0.8 },
  'beweging': { category: 'health', subcategory: 'sport', confidence: 0.8 },
  'lichaamsbeweging': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  
  // HEALTH & FITNESS EXTRA KEYWORDS (TOEGEVOEGD)
  'conditie': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'uithoudingsvermogen': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'endurance': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'stamina': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'kracht': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'spieren': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'spiermassa': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'muscle': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'muscles': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'biceps': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'triceps': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'abs': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'buikspieren': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'core': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'cardio training': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'intervaltraining': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'hiit': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'tabata': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'circuit training': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'personal trainer': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'sportcoach': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'trainer': { category: 'health', subcategory: 'sport', confidence: 0.8 },
  'sportclub': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'sportvereniging': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'team sport': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'teamsport': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'wedstrijd': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'competitie': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'marathon': { category: 'health', subcategory: 'sport', confidence: 0.98 },
  'halve marathon': { category: 'health', subcategory: 'sport', confidence: 0.98 },
  '10km': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  '5km': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'run': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'running': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'jogging': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'sprint': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'sprinten': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'atletiek': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'track and field': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'outdoor workout': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'buitensport': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'indoor workout': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'home workout': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'thuis sporten': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'bodyweight': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'eigenlichaamsgewicht': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'push ups': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'push-ups': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'opdrukken': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'sit ups': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'sit-ups': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'squats': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'squat': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'lunges': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'burpees': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'planking': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'plank': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'deadlift': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'deadlifts': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'bench press': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'bankdrukken': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'dumbbells': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'halteres': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'barbell': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'halters': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'fitness apparaten': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'loopband': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'treadmill': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'hometrainer': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'crosstrainer': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'roeimachine': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'roeiapparaat': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'spinning': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'indoor cycling': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'kickboksen': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'kickboxing': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'boksen': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'boxing': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'judo': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'karate': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'taekwondo': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'martial arts': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'vechtsporten': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'klimmen': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'boulderen': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'rock climbing': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'skateboarden': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'skateboard': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'inlineskaten': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'rollerbladen': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'schaatsen': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'ice skating': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'ski': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'skiën': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'snowboard': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'snowboarden': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'surfen': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'surfing': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'windsurfen': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'kitesurfen': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'duiken': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'diving': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'snorkelen': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'zeilen': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'sailing': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'roeien': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'kanoën': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'kayak': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'kano': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'peddelen': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'golf': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'golfen': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'honkbal': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'baseball': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'softball': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'hockey': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'rugby': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'american football': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'handbal': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'handball': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'badminton': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'squash': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'padel': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'padellen': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'padelspelen': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'tafeltennis': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'ping pong': { category: 'health', subcategory: 'sport', confidence: 0.95 },
  'darts': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'biljart': { category: 'health', subcategory: 'sport', confidence: 0.8 },
  'pool': { category: 'health', subcategory: 'sport', confidence: 0.7 },
  'snooker': { category: 'health', subcategory: 'sport', confidence: 0.85 },
  'paardenrijden': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'horse riding': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  'paardrijden': { category: 'health', subcategory: 'sport', confidence: 0.9 },
  
  // Health & Fitness - Medical & Care
  'dokter': { category: 'health', subcategory: 'medical', confidence: 0.98 },
  'doktersafspraak': { category: 'health', subcategory: 'medical', confidence: 0.99 },
  'arts': { category: 'health', subcategory: 'medical', confidence: 0.95 },
  'tandarts': { category: 'health', subcategory: 'medical', confidence: 0.98 },
  'huisarts': { category: 'health', subcategory: 'medical', confidence: 0.98 },
  'specialist': { category: 'health', subcategory: 'medical', confidence: 0.95 },
  'ziekenhuis': { category: 'health', subcategory: 'medical', confidence: 0.98 },
  'kliniek': { category: 'health', subcategory: 'medical', confidence: 0.95 },
  'apotheek': { category: 'health', subcategory: 'medical', confidence: 0.95 },
  'medicijn': { category: 'health', subcategory: 'medical', confidence: 0.9 },
  'medicijnen': { category: 'health', subcategory: 'medical', confidence: 0.9 },
  'pil': { category: 'health', subcategory: 'medical', confidence: 0.8 },
  'pillen': { category: 'health', subcategory: 'medical', confidence: 0.8 },
  'therapie': { category: 'health', subcategory: 'medical', confidence: 0.9 },
  'fysiotherapie': { category: 'health', subcategory: 'medical', confidence: 0.95 },
  'psycholoog': { category: 'health', subcategory: 'medical', confidence: 0.95 },
  'controle': { category: 'health', subcategory: 'medical', confidence: 0.8 },
  'bloedonderzoek': { category: 'health', subcategory: 'medical', confidence: 0.98 },
  'rontgen': { category: 'health', subcategory: 'medical', confidence: 0.95 },
  'vaccinatie': { category: 'health', subcategory: 'medical', confidence: 0.98 },
  'inenting': { category: 'health', subcategory: 'medical', confidence: 0.95 },
  'medische afspraak': { category: 'health', subcategory: 'medical', confidence: 0.99 },
  
  // Health & Fitness - Nutrition & Diet
  'voeding': { category: 'health', subcategory: 'nutrition', confidence: 0.9 },
  'dieet': { category: 'health', subcategory: 'nutrition', confidence: 0.95 },
  'afvallen': { category: 'health', subcategory: 'nutrition', confidence: 0.95 },
  'aankomen': { category: 'health', subcategory: 'nutrition', confidence: 0.9 },
  'gewicht': { category: 'health', subcategory: 'nutrition', confidence: 0.85 },
  'gezond eten': { category: 'health', subcategory: 'nutrition', confidence: 0.95 },
  'gezond': { category: 'health', subcategory: 'nutrition', confidence: 0.85 },
  'gezonde voeding': { category: 'health', subcategory: 'nutrition', confidence: 0.95 },
  'water drinken': { category: 'health', subcategory: 'nutrition', confidence: 0.9 },
  'water': { category: 'health', subcategory: 'nutrition', confidence: 0.8 },
  'hydratatie': { category: 'health', subcategory: 'nutrition', confidence: 0.9 },
  'vitamines': { category: 'health', subcategory: 'nutrition', confidence: 0.9 },
  'supplementen': { category: 'health', subcategory: 'nutrition', confidence: 0.9 },
  'proteïne': { category: 'health', subcategory: 'nutrition', confidence: 0.85 },
  'koolhydraten': { category: 'health', subcategory: 'nutrition', confidence: 0.85 },
  'calorieën': { category: 'health', subcategory: 'nutrition', confidence: 0.9 },
  'calorieen tellen': { category: 'health', subcategory: 'nutrition', confidence: 0.95 },
  'voedingsschema': { category: 'health', subcategory: 'nutrition', confidence: 0.95 },
  
  // Health & Fitness - Sleep & Rest
  'slapen': { category: 'health', subcategory: 'sleep', confidence: 0.95 },
  'vroeg slapen': { category: 'health', subcategory: 'sleep', confidence: 0.98 },
  'naar bed': { category: 'health', subcategory: 'sleep', confidence: 0.9 },
  'opstaan': { category: 'health', subcategory: 'sleep', confidence: 0.9 },
  'vroeg opstaan': { category: 'health', subcategory: 'sleep', confidence: 0.95 },
  'wakker worden': { category: 'health', subcategory: 'sleep', confidence: 0.85 },
  'bed': { category: 'health', subcategory: 'sleep', confidence: 0.8 },
  'slaap': { category: 'health', subcategory: 'sleep', confidence: 0.9 },
  'slaapschema': { category: 'health', subcategory: 'sleep', confidence: 0.98 },
  'slaapritme': { category: 'health', subcategory: 'sleep', confidence: 0.98 },
  'dutje': { category: 'health', subcategory: 'sleep', confidence: 0.9 },
  'powernap': { category: 'health', subcategory: 'sleep', confidence: 0.9 },
  'uitrusten': { category: 'health', subcategory: 'sleep', confidence: 0.8 },
  
  // Work & Productivity - Daily Work
  'werk': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'kantoor': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'werken': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'job': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'baan': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'email': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'emails': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'mail': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'mails': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'vergadering': { category: 'productivity', subcategory: 'daily_work', confidence: 0.98 },
  'meeting': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'overleg': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'bespreking': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'presentatie': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'rapport': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'computer': { category: 'productivity', subcategory: 'daily_work', confidence: 0.7 },
  'laptop': { category: 'productivity', subcategory: 'daily_work', confidence: 0.7 },
  'planning': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'agenda': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'taken': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'taak': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  
  // PRODUCTIVITY & WORK EXTRA KEYWORDS (TOEGEVOEGD)
  'werkdag': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'workday': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'kantoordag': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'thuiswerken': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'work from home': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'wfh': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'remote work': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'telewerken': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'home office': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'werkplek': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'workspace': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'productiviteit': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'productivity': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'efficiëntie': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'efficiency': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'workflow': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'werkstroom': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'proces': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'process': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'time management': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'tijdmanagement': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'tijdplanning': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'prioriteiten': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'priorities': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'to do list': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'todo lijst': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'checklist': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'takenlijst': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'task list': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'deliverables': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'oplevering': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'milestone': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'mijlpaal': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'kpi': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'performance': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'prestatie': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'resultaat': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'result': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'output': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'outcome': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'doelstelling': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'objective': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'target': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'doel': { category: 'productivity', subcategory: 'daily_work', confidence: 0.7 },
  'goal': { category: 'productivity', subcategory: 'daily_work', confidence: 0.7 },
  'spreadsheet': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'excel': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'powerpoint': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'word document': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'document': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'documenten maken': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'typen': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'typing': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'schrijfwerk': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'administratie werk': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'admin': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'data entry': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'data invoer': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'invoeren': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'analyseren': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'analyse': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'analysis': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'rapportage': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'reporting': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'dashboard': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'metrics': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'review': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'beoordeling': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'evaluatie': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'evaluation': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'feedback geven': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'feedback ontvangen': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'one on one': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  '1-op-1': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'werkoverleg': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'team meeting': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'stand-up': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'standup': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'scrum': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'work sprint': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'retrospective': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'retro': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'planning poker': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'estimation': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'schatting': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'code review': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'pull request': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'merge request': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'git': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'github': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'gitlab': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'bitbucket': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'version control': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'versiebeheer': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'deployment': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'deploy': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'release': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'testing': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'testen': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'debugging': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'debug': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'troubleshooting': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'bug fixing': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'bug fix': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'hotfix': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'patch': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'update': { category: 'productivity', subcategory: 'daily_work', confidence: 0.75 },
  'upgrade': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'migration': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'migratie': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'backup': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'back-up': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'security': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'beveiliging': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'monitoring': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'logging': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'maintenance': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'onderhoud systeem': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'server': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'database': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'sql': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'query': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'api': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'integration': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'integratie': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'development': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'ontwikkeling': { category: 'productivity', subcategory: 'daily_work', confidence: 0.85 },
  'programming': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'programmeren': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'coding': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'coderen': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'software': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'application': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'applicatie': { category: 'productivity', subcategory: 'daily_work', confidence: 0.8 },
  'web development': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'webontwikkeling': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'frontend': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'backend': { category: 'productivity', subcategory: 'daily_work', confidence: 0.9 },
  'full stack': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  'fullstack': { category: 'productivity', subcategory: 'daily_work', confidence: 0.95 },
  
  // Work & Productivity - Projects
  'project': { category: 'productivity', subcategory: 'projects', confidence: 0.9 },
  'projectwerk': { category: 'productivity', subcategory: 'projects', confidence: 0.95 },
  'deadline': { category: 'productivity', subcategory: 'projects', confidence: 0.95 },
  'schoolopdracht': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'werkopdracht': { category: 'productivity', subcategory: 'projects', confidence: 0.9 },
  'werkproject': { category: 'productivity', subcategory: 'projects', confidence: 0.95 },
  'klant': { category: 'productivity', subcategory: 'projects', confidence: 0.8 },
  'client': { category: 'productivity', subcategory: 'projects', confidence: 0.8 },
  'business': { category: 'productivity', subcategory: 'projects', confidence: 0.9 },
  'bedrijf': { category: 'productivity', subcategory: 'projects', confidence: 0.8 },
  'startup': { category: 'productivity', subcategory: 'projects', confidence: 0.9 },
  'freelance': { category: 'productivity', subcategory: 'projects', confidence: 0.9 },
  'zelfstandig': { category: 'productivity', subcategory: 'projects', confidence: 0.8 },
  'eigen bedrijf': { category: 'productivity', subcategory: 'projects', confidence: 0.9 },
  
  // Work & Productivity - Professional Learning
  'werktraining': { category: 'productivity', subcategory: 'professional_learning', confidence: 0.95 },
  'professionele training': { category: 'productivity', subcategory: 'professional_learning', confidence: 0.95 },
  'vakcursus': { category: 'productivity', subcategory: 'professional_learning', confidence: 0.9 },
  'werkcursus': { category: 'productivity', subcategory: 'professional_learning', confidence: 0.9 },
  'certificaat': { category: 'productivity', subcategory: 'professional_learning', confidence: 0.85 },
  'diploma': { category: 'productivity', subcategory: 'professional_learning', confidence: 0.8 },
  'werkboek': { category: 'productivity', subcategory: 'professional_learning', confidence: 0.8 },
  'conferentie': { category: 'productivity', subcategory: 'professional_learning', confidence: 0.85 },
  'seminar': { category: 'productivity', subcategory: 'professional_learning', confidence: 0.85 },
  'workshop': { category: 'productivity', subcategory: 'professional_learning', confidence: 0.85 },
  'netwerken': { category: 'productivity', subcategory: 'professional_learning', confidence: 0.8 },
  'networking': { category: 'productivity', subcategory: 'professional_learning', confidence: 0.8 },
  'vaardigheden': { category: 'productivity', subcategory: 'professional_learning', confidence: 0.8 },
  'skills': { category: 'productivity', subcategory: 'professional_learning', confidence: 0.8 },
  
  // Household & Living - Cleaning
  'schoonmaken': { category: 'household', subcategory: 'cleaning', confidence: 0.98 },
  'schoonmaak': { category: 'household', subcategory: 'cleaning', confidence: 0.98 },
  'stofzuigen': { category: 'household', subcategory: 'cleaning', confidence: 0.98 },
  'zuigen': { category: 'household', subcategory: 'cleaning', confidence: 0.9 },
  'dweil': { category: 'household', subcategory: 'cleaning', confidence: 0.95 },
  'dweilen': { category: 'household', subcategory: 'cleaning', confidence: 0.95 },
  'moppen': { category: 'household', subcategory: 'cleaning', confidence: 0.9 },
  'poetsen': { category: 'household', subcategory: 'cleaning', confidence: 0.95 },
  'poetswerk': { category: 'household', subcategory: 'cleaning', confidence: 0.98 },
  'badkamer schoonmaken': { category: 'household', subcategory: 'cleaning', confidence: 0.99 },
  'badkamer': { category: 'household', subcategory: 'cleaning', confidence: 0.85 },
  'keuken schoonmaken': { category: 'household', subcategory: 'cleaning', confidence: 0.99 },
  'keuken': { category: 'household', subcategory: 'cleaning', confidence: 0.7 }, // Kan ook cooking zijn
  'toilet': { category: 'household', subcategory: 'cleaning', confidence: 0.9 },
  'wc': { category: 'household', subcategory: 'cleaning', confidence: 0.9 },
  'oprui': { category: 'household', subcategory: 'cleaning', confidence: 0.85 },
  'huishouden': { category: 'household', subcategory: 'cleaning', confidence: 0.9 },
  'ramen lappen': { category: 'household', subcategory: 'cleaning', confidence: 0.98 },
  'ramen': { category: 'household', subcategory: 'cleaning', confidence: 0.8 },
  'afstoffen': { category: 'household', subcategory: 'cleaning', confidence: 0.95 },
  'stof': { category: 'household', subcategory: 'cleaning', confidence: 0.8 },
  
  // Household & Living - Cooking & Meals
  'koken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'eten maken': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'eten koken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'maaltijd': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'maaltijd bereiden': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'lunch maken': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'diner koken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'avondeten': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'ontbijt maken': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'boodschappen': { category: 'household', subcategory: 'cooking', confidence: 0.98 },
  'boodschappen doen': { category: 'household', subcategory: 'cooking', confidence: 0.99 },
  'supermarkt': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'boodschap': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'boodschappenlijst': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'ingrediënten': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'recept': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'groenten': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'fruit': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'vlees': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'vis': { category: 'household', subcategory: 'cooking', confidence: 0.75 },
  
  // HOUSEHOLD COOKING EXTRA KEYWORDS (TOEGEVOEGD)
  'bakken': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'braden': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'frituren': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'stoven': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'roosteren': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'grillen': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'stomen': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'pocheren': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'sautéren': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'wokken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'slow cooking': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'meal prep': { category: 'household', subcategory: 'cooking', confidence: 0.98 },
  'maaltijd voorbereiden': { category: 'household', subcategory: 'cooking', confidence: 0.98 },
  'voorbereiding': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'prep work': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'snijden': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'hakken': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'raspen': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'mengen': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'mixen': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'blenden': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'pureren': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'marineren': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'kruiden': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'specerijen': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'seasoning': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'op smaak brengen': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'proeven': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'bijsmaken': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'garneren': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'presenteren': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'opdienen': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'serveren': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'opscheppen': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'bord opmaken': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'plating': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'salade maken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'soep maken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'pasta koken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'rijst koken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'aardappels koken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'aardappelen': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'pasta': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'rijst': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'noodles': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'noedels': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'brood maken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'bakken brood': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'deeg maken': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'kneden': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'rijzen': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'gist': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'bloem': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'eieren': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'melk': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'boter': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'olie': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'zout': { category: 'household', subcategory: 'cooking', confidence: 0.75 },
  'peper': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'suiker': { category: 'household', subcategory: 'cooking', confidence: 0.75 },
  'azijn': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'knoflook': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'ui': { category: 'household', subcategory: 'cooking', confidence: 0.75 },
  'uien': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'tomaten': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'paprika': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'wortel': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'wortelen': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'courgette': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'aubergine': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'broccoli': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'bloemkool': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'sla': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'spinazie': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'champignons': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'paddestoelen': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'kaas': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'ham': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'kip': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'kippenvlees': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'rundvlees': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'varkensvlees': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'gehakt': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'zalm': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'tonijn': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'garnalen': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'mosselen': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'zeevruchten': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'seafood': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'vegetarisch': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'vegan': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'veganistisch': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'plantaardig': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'vleesvervanger': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'tofu': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'tempeh': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'seitan': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'linzen': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'kikkererwten': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'bonen': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'quinoa': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'couscous': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'bulgur': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'noten': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'walnoten': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'amandelen': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'pijnboompitten': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'zaden': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'sesam': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'tahini': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'hummus': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'dressing': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'vinaigrette': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'saus maken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'jus': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'bouillon': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'stock': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'fond': { category: 'household', subcategory: 'cooking', confidence: 0.85 },
  'roux': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'bechamel': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'hollandaise': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'mayonaise maken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'pesto maken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'taart bakken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'cake bakken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'koekjes bakken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'muffins bakken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'cupcakes bakken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'pannenkoeken': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'pancakes': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'wafels': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'waffles': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'smoothie maken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  'sap maken': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'thee zetten': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'koffie zetten': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'espresso': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'cappuccino': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'latte': { category: 'household', subcategory: 'cooking', confidence: 0.8 },
  'barbecuen': { category: 'household', subcategory: 'cooking', confidence: 0.9 },
  'bbq maken': { category: 'household', subcategory: 'cooking', confidence: 0.95 },
  
  // Household & Living - Laundry & Clothing
  'was': { category: 'household', subcategory: 'laundry', confidence: 0.95 },
  'was doen': { category: 'household', subcategory: 'laundry', confidence: 0.98 },
  'wassen': { category: 'household', subcategory: 'laundry', confidence: 0.9 },
  'wasgoed': { category: 'household', subcategory: 'laundry', confidence: 0.95 },
  'strijken': { category: 'household', subcategory: 'laundry', confidence: 0.95 },
  'strijkgoed': { category: 'household', subcategory: 'laundry', confidence: 0.98 },
  'wasmachine': { category: 'household', subcategory: 'laundry', confidence: 0.98 },
  'droger': { category: 'household', subcategory: 'laundry', confidence: 0.95 },
  'waslijn': { category: 'household', subcategory: 'laundry', confidence: 0.9 },
  'ophangen': { category: 'household', subcategory: 'laundry', confidence: 0.8 },
  'vouwen': { category: 'household', subcategory: 'laundry', confidence: 0.85 },
  'kleding vouwen': { category: 'household', subcategory: 'laundry', confidence: 0.95 },
  'kleding opruimen': { category: 'household', subcategory: 'laundry', confidence: 0.9 },
  'kast opruimen': { category: 'household', subcategory: 'laundry', confidence: 0.85 },
  
  // Household & Living - Home Maintenance
  'huis onderhoud': { category: 'household', subcategory: 'home_maintenance', confidence: 0.98 },
  'onderhoud': { category: 'household', subcategory: 'home_maintenance', confidence: 0.85 },
  'tuin': { category: 'household', subcategory: 'home_maintenance', confidence: 0.9 },
  'tuinieren': { category: 'household', subcategory: 'home_maintenance', confidence: 0.95 },
  'gras maaien': { category: 'household', subcategory: 'home_maintenance', confidence: 0.98 },
  'onkruid': { category: 'household', subcategory: 'home_maintenance', confidence: 0.9 },
  'planten': { category: 'household', subcategory: 'home_maintenance', confidence: 0.8 },
  'bloemen': { category: 'household', subcategory: 'home_maintenance', confidence: 0.75 },
  'water geven': { category: 'household', subcategory: 'home_maintenance', confidence: 0.85 },
  'begieten': { category: 'household', subcategory: 'home_maintenance', confidence: 0.9 },
  'huis': { category: 'household', subcategory: 'home_maintenance', confidence: 0.6 },
  'woning': { category: 'household', subcategory: 'home_maintenance', confidence: 0.6 },
  'appartement': { category: 'household', subcategory: 'home_maintenance', confidence: 0.6 },
  
  // Practical & Administrative
  'auto': { category: 'practical', subcategory: 'transportation', confidence: 0.85 },
  'apk': { category: 'practical', subcategory: 'transportation', confidence: 0.98 },
  'tanken': { category: 'practical', subcategory: 'transportation', confidence: 0.9 },
  'garage': { category: 'practical', subcategory: 'transportation', confidence: 0.8 },
  'parkeren': { category: 'practical', subcategory: 'transportation', confidence: 0.7 },
  'rijden': { category: 'practical', subcategory: 'transportation', confidence: 0.6 },
  'benzine': { category: 'practical', subcategory: 'transportation', confidence: 0.85 },
  'diesel': { category: 'practical', subcategory: 'transportation', confidence: 0.85 },
  'ov': { category: 'practical', subcategory: 'transportation', confidence: 0.8 },
  'trein': { category: 'practical', subcategory: 'transportation', confidence: 0.7 },
  'bus': { category: 'practical', subcategory: 'transportation', confidence: 0.7 },
  
  'bank': { category: 'practical', subcategory: 'administration', confidence: 0.9 },
  'rekening': { category: 'practical', subcategory: 'administration', confidence: 0.85 },
  'betalen': { category: 'practical', subcategory: 'administration', confidence: 0.7 },
  'overboeken': { category: 'practical', subcategory: 'administration', confidence: 0.9 },
  'pinnen': { category: 'practical', subcategory: 'administration', confidence: 0.8 },
  'formulier': { category: 'practical', subcategory: 'administration', confidence: 0.9 },
  'aanvraag': { category: 'practical', subcategory: 'administration', confidence: 0.85 },
  'documenten': { category: 'practical', subcategory: 'administration', confidence: 0.8 },
  'papierwerk': { category: 'practical', subcategory: 'administration', confidence: 0.95 },
  
  'afspraak maken': { category: 'practical', subcategory: 'appointments', confidence: 0.9 },
  'zakelijk bellen': { category: 'practical', subcategory: 'appointments', confidence: 0.85 },
  'reserveren': { category: 'practical', subcategory: 'appointments', confidence: 0.8 },
  'inplannen': { category: 'practical', subcategory: 'appointments', confidence: 0.75 },
  
  'verzekering': { category: 'practical', subcategory: 'administration', confidence: 0.95 },
  'polis': { category: 'practical', subcategory: 'administration', confidence: 0.9 },
  'schade': { category: 'practical', subcategory: 'administration', confidence: 0.8 },
  
  'reparatie': { category: 'practical', subcategory: 'repairs', confidence: 0.9 },

  'klus': { category: 'practical', subcategory: 'repairs', confidence: 0.85 },
  'monteur': { category: 'practical', subcategory: 'repairs', confidence: 0.9 },
  'kapot': { category: 'practical', subcategory: 'repairs', confidence: 0.8 },
  'vervangen': { category: 'practical', subcategory: 'repairs', confidence: 0.8 },
  
  'gemeente': { category: 'practical', subcategory: 'administration', confidence: 0.9 },
  'digid': { category: 'practical', subcategory: 'administration', confidence: 0.95 },
  'belasting': { category: 'practical', subcategory: 'administration', confidence: 0.95 },
  'paspoort': { category: 'practical', subcategory: 'administration', confidence: 0.95 },
  'rijbewijs': { category: 'practical', subcategory: 'administration', confidence: 0.95 },
  
  // Personal Development - Learning
  'lezen': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'boek': { category: 'personal_development', subcategory: 'learning', confidence: 0.8 },
  'podcast': { category: 'personal_development', subcategory: 'learning', confidence: 0.8 },
  'studeren': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'cursus': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'documentaire': { category: 'personal_development', subcategory: 'learning', confidence: 0.8 },
  'artikel': { category: 'personal_development', subcategory: 'learning', confidence: 0.75 },
  'onderzoek': { category: 'personal_development', subcategory: 'learning', confidence: 0.8 },
  'educatie': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'kennis': { category: 'personal_development', subcategory: 'learning', confidence: 0.7 },
  'language': { category: 'personal_development', subcategory: 'learning', confidence: 0.85 },
  'taal': { category: 'personal_development', subcategory: 'learning', confidence: 0.85 },
  'engels': { category: 'personal_development', subcategory: 'learning', confidence: 0.8 },
  'spaans': { category: 'personal_development', subcategory: 'learning', confidence: 0.8 },
  'frans': { category: 'personal_development', subcategory: 'learning', confidence: 0.8 },
  'duolingo': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'online course': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  
  // SCHOOL & STUDIE KEYWORDS (TOEGEVOEGD)
  'school': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'schoolwerk': { category: 'personal_development', subcategory: 'learning', confidence: 0.98 },
  'huiswerk': { category: 'personal_development', subcategory: 'learning', confidence: 0.98 },
  'homework': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'studie': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'university': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'universiteit': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'college': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'hogeschool': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'mbo': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'hbo': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'wo': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'bachelor': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'master': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'phd': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'doctoraal': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'examen': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'exam': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'tentamen': { category: 'personal_development', subcategory: 'learning', confidence: 0.98 },
  'toets': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'test': { category: 'personal_development', subcategory: 'learning', confidence: 0.85 },
  'opdracht': { category: 'personal_development', subcategory: 'learning', confidence: 0.85 },
  'assignment': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'essay': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'scriptie': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'thesis': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'onderzoek doen': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'research': { category: 'personal_development', subcategory: 'learning', confidence: 0.85 },
  'literatuur': { category: 'personal_development', subcategory: 'learning', confidence: 0.85 },
  'bronnen zoeken': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'studie materiaal': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'lesmateriaal': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'studiegids': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'syllabus': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'college bijwonen': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'hoorcollege': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'lecture': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'les': { category: 'personal_development', subcategory: 'learning', confidence: 0.85 },
  'lessen': { category: 'personal_development', subcategory: 'learning', confidence: 0.85 },
  'werkcollege': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'practicum': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'lab': { category: 'personal_development', subcategory: 'learning', confidence: 0.8 },
  'laboratorium': { category: 'personal_development', subcategory: 'learning', confidence: 0.85 },
  'stage': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'internship': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'afstuderen': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'graduation': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'studenten': { category: 'personal_development', subcategory: 'learning', confidence: 0.8 },
  'student': { category: 'personal_development', subcategory: 'learning', confidence: 0.85 },
  'klasgenoot': { category: 'personal_development', subcategory: 'learning', confidence: 0.8 },
  'medestudent': { category: 'personal_development', subcategory: 'learning', confidence: 0.85 },
  'samen studeren school': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'studie buddy': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'samen studeren': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'groepswerk': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'groepsopdracht': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'presentatie geven': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'voordracht': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'studie planning': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'studieschema': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'lesrooster': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'rooster': { category: 'personal_development', subcategory: 'learning', confidence: 0.8 },
  'cijfers': { category: 'personal_development', subcategory: 'learning', confidence: 0.85 },
  'grades': { category: 'personal_development', subcategory: 'learning', confidence: 0.85 },
  'school beoordeling': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'feedback': { category: 'personal_development', subcategory: 'learning', confidence: 0.7 },
  'studie punten': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'ects': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  'credits': { category: 'personal_development', subcategory: 'learning', confidence: 0.85 },
  'leren voor school': { category: 'personal_development', subcategory: 'learning', confidence: 0.98 },
  'school voorbereiden': { category: 'personal_development', subcategory: 'learning', confidence: 0.98 },
  'naar school': { category: 'personal_development', subcategory: 'learning', confidence: 0.9 },
  'aan school zitten': { category: 'personal_development', subcategory: 'learning', confidence: 0.95 },
  
  // Personal Development - Creative
  'tekenen': { category: 'personal_development', subcategory: 'creative', confidence: 0.9 },
  'schilderen': { category: 'personal_development', subcategory: 'creative', confidence: 0.9 },
  'muziek': { category: 'personal_development', subcategory: 'creative', confidence: 0.75 },
  'gitaar': { category: 'personal_development', subcategory: 'creative', confidence: 0.9 },
  'piano': { category: 'personal_development', subcategory: 'creative', confidence: 0.9 },
  'schrijven': { category: 'personal_development', subcategory: 'creative', confidence: 0.8 },
  'fotografie': { category: 'personal_development', subcategory: 'creative', confidence: 0.85 },
  'kunst': { category: 'personal_development', subcategory: 'creative', confidence: 0.8 },
  'creatief': { category: 'personal_development', subcategory: 'creative', confidence: 0.8 },
  'handwerk': { category: 'personal_development', subcategory: 'creative', confidence: 0.8 },
  'breien': { category: 'personal_development', subcategory: 'creative', confidence: 0.9 },
  'haken': { category: 'personal_development', subcategory: 'creative', confidence: 0.9 },
  
  // Personal Development - Mindfulness  
  'meditatie': { category: 'personal_development', subcategory: 'mindfulness', confidence: 0.95 },
  'mindfulness': { category: 'personal_development', subcategory: 'mindfulness', confidence: 0.95 },
  'dagboek': { category: 'personal_development', subcategory: 'mindfulness', confidence: 0.8 },
  'journaling': { category: 'personal_development', subcategory: 'mindfulness', confidence: 0.9 },
  'reflectie': { category: 'personal_development', subcategory: 'mindfulness', confidence: 0.8 },
  'zelfreflectie': { category: 'personal_development', subcategory: 'mindfulness', confidence: 0.9 },
  'spiritueel': { category: 'personal_development', subcategory: 'mindfulness', confidence: 0.8 },
  'zelfhulp': { category: 'personal_development', subcategory: 'mindfulness', confidence: 0.8 },
  'personal growth': { category: 'personal_development', subcategory: 'mindfulness', confidence: 0.85 },
  
  // Entertainment & Relaxation
  'gamen': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'gaming': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'film': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'netflix': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'serie': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'tv': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'televisie': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'youtube': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.7 },
  'tiktok': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'instagram': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.7 },
  'social media': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.75 },
  
  'ontspannen': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'chillen': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'rust': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.7 },
  'wellness': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'spa': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'massage': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'sauna': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  
  'hobby': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.8 },
  'puzzel': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.85 },
  'legpuzzel': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.9 },
  'bordspel': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.8 },
  'kaartspel': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.8 },
  'model': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.7 },
  'collectie': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.8 },
  
  // Entertainment & Relaxation (continued)
  'videospel': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'console': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'playstation': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'xbox': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'nintendo': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'pc gaming': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'streaming': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'kijken': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.7 },
  'binge watching': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'amazon prime kijken': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'disney+': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'hbo max': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'videoland': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'bioscoop': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'cinema': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'theater': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'concert': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'festival': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'show': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.75 },
  'entertainment': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'vermaak': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'plezier': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'fun': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  
  // Entertainment - Relaxation (continued)
  'relaxen': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.95 },
  'relaxatie': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.95 },
  'ontspanning': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.95 },
  'wellness center': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.95 },
  'spa dag': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.98 },
  'hottub': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'jacuzzi': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'bubbelbad': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'bad nemen': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'badschuim': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'aromatherapie': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'geurkaars': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'muziek luisteren': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'luisteren': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.7 },
  'spotify': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'apple music': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'radio': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.75 },
  'natuur': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'park': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.75 },
  'strand': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'bos': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.75 },
  'wandeling in natuur': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'picknicken': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'picknick': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  
  // Entertainment - Hobbies (continued)
  'hobby project': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.95 },
  'verzamelen': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.9 },
  'verzameling': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.9 },
  'modelbouw': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.95 },
  'lego': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.9 },
  'knutselen': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.9 },
  'klussen hobby': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.9 },
  'crafting': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.9 },
  'diy project': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.85 },
  'hobby kamer': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.9 },
  'spelletje': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.85 },
  'game night': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.9 },
  'spellenavond': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.95 },
  'kaarten': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.85 },
  'poker': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.9 },
  'schaak': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.9 },
  'dammen': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.9 },
  'sudoku': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.9 },
  'kruiswoordpuzzel': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.95 },
  'crossword': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.9 },
  'escape room': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.9 },
  'quiz': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.85 },
  'trivia': { category: 'entertainment', subcategory: 'hobbies', confidence: 0.85 },
  
  // ENTERTAINMENT EXTRA KEYWORDS (TOEGEVOEGD)
  'binge series': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'tv series': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'serie kijken': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'film kijken': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'movie watching': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'documentaire kijken': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'documentary': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'anime': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'anime kijken': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'manga': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'manga lezen': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'comic': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'strip': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'stripboek': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'graphic novel': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'romans lezen': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'fiction': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'non-fiction': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.75 },
  'thriller': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'crime': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.75 },
  'detective': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.75 },
  'fantasy': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'sci-fi': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'science fiction': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'romance novel': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'romantic': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.75 },
  'comedy': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'horror': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'action': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.75 },
  'drama': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.75 },
  'adventure': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.75 },
  'musical': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'stand-up comedy': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'comedian': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'cabaret': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'music listening': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'playlist maken': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'album luisteren': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'nieuwe muziek': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'discover music': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'podcast luisteren': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'audiobook': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'luisterboek': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'audiobook luisteren': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.95 },
  'audible': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'storytel': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'radio luisteren': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'fm radio': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'online radio': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'radio show': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'dj mix': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'ambient music': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'chill music': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'lofi': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'classical music': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'klassieke muziek': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'jazz': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'blues': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'folk': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.75 },
  'indie': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.75 },
  'pop music': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'rock music': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'electronic': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.75 },
  'edm': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'house music': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'techno': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'rap': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.75 },
  'hip-hop': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'hip hop': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'r&b': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'soul': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.75 },
  'reggae': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.8 },
  'country': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.75 },
  'meditation music': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'meditatie muziek': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.95 },
  'nature sounds': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'natuurgeluiden': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'white noise': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'brown noise': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'pink noise': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'sleep sounds': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'slaap geluiden': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'rain sounds': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'regengeluiden': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'ocean sounds': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'golf geluiden': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'binaurale beats': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'binaural beats': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'singing bowls': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.85 },
  'klankschalen': { category: 'entertainment', subcategory: 'relaxation', confidence: 0.9 },
  'gaming chair': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'gaming setup': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'gaming gear': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'controller': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'gamepad': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'joystick': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'keyboard gaming': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'gaming mouse': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'gaming keyboard': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'headset gaming': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'gaming headset': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'vr gaming': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'virtual reality': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'vr headset': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'oculus': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'meta quest': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'psvr': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'steam vr': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'retro gaming': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'emulator': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'rom': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'arcade': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'pinball': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'flipper': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'twitch kijken': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.95 },
  'stream kijken': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'livestream': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'gamer content': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'let\'s play': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'gameplay': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'speedrun': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'walkthrough': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'game review': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'gaming news': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.85 },
  'esports': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'e-sports': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.9 },
  'tournament': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'competition': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.75 },
  'leaderboard': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'achievement': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.8 },
  'trophy': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.75 },
  'badge': { category: 'entertainment', subcategory: 'entertainment', confidence: 0.7 },
  
  // Social & Relationships (continued)
  'familie tijd': { category: 'social', subcategory: 'family', confidence: 0.95 },
  'familiebezoek': { category: 'social', subcategory: 'family', confidence: 0.95 },
  'family time': { category: 'social', subcategory: 'family', confidence: 0.95 },
  'vader': { category: 'social', subcategory: 'family', confidence: 0.9 },
  'moeder': { category: 'social', subcategory: 'family', confidence: 0.9 },
  'mama': { category: 'social', subcategory: 'family', confidence: 0.9 },
  'papa': { category: 'social', subcategory: 'family', confidence: 0.9 },
  'zoon': { category: 'social', subcategory: 'family', confidence: 0.85 },
  'dochter': { category: 'social', subcategory: 'family', confidence: 0.85 },
  'kinderen': { category: 'social', subcategory: 'family', confidence: 0.9 },
  'kind': { category: 'social', subcategory: 'family', confidence: 0.8 },
  'baby': { category: 'social', subcategory: 'family', confidence: 0.85 },
  'kleinkinderen': { category: 'social', subcategory: 'family', confidence: 0.9 },
  'neef': { category: 'social', subcategory: 'family', confidence: 0.85 },
  'nicht': { category: 'social', subcategory: 'family', confidence: 0.85 },
  'oom': { category: 'social', subcategory: 'family', confidence: 0.85 },
  'tante': { category: 'social', subcategory: 'family', confidence: 0.85 },
  'schoonfamilie': { category: 'social', subcategory: 'family', confidence: 0.9 },
  'familiereünie': { category: 'social', subcategory: 'family', confidence: 0.95 },
  'familie-uitje': { category: 'social', subcategory: 'family', confidence: 0.95 },
  'familiediner': { category: 'social', subcategory: 'family', confidence: 0.95 },
  
  // Social - Friends (continued)
  'vrienden bezoeken': { category: 'social', subcategory: 'friends', confidence: 0.95 },
  'op bezoek': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'bezoek krijgen': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'vriendin': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'beste vriend': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'beste vriendin': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'vriendschap': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'social': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'gezellig': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'gezelligheid': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'samen': { category: 'social', subcategory: 'friends', confidence: 0.75 },
  'quality time': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'koffie drinken': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'thee drinken': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'lunchen': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'lunch date': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'coffee date': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'borrel': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'aperitief': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'happy hour': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'drankje doen': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'terrasje': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'terras': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  
  // Social - Romantic (continued)
  'dating': { category: 'social', subcategory: 'romantic', confidence: 0.95 },
  'dating app': { category: 'social', subcategory: 'romantic', confidence: 0.95 },
  'tinder': { category: 'social', subcategory: 'romantic', confidence: 0.95 },
  'bumble': { category: 'social', subcategory: 'romantic', confidence: 0.95 },
  'liefde': { category: 'social', subcategory: 'romantic', confidence: 0.9 },
  'romance': { category: 'social', subcategory: 'romantic', confidence: 0.95 },
  'romantisch': { category: 'social', subcategory: 'romantic', confidence: 0.9 },
  'romantiek': { category: 'social', subcategory: 'romantic', confidence: 0.95 },
  'vriend': { category: 'social', subcategory: 'friends', confidence: 0.7 }, // Geslacht gebruiker onbekend - kan romantic of platonic zijn

  'boyfriend': { category: 'social', subcategory: 'romantic', confidence: 0.9 },
  'girlfriend': { category: 'social', subcategory: 'romantic', confidence: 0.9 },
  'echtgenoot': { category: 'social', subcategory: 'romantic', confidence: 0.95 },
  'echtgenote': { category: 'social', subcategory: 'romantic', confidence: 0.95 },
  'man': { category: 'social', subcategory: 'romantic', confidence: 0.7 },
  'vrouw': { category: 'social', subcategory: 'romantic', confidence: 0.7 },
  'huwelijk': { category: 'social', subcategory: 'romantic', confidence: 0.95 },
  'trouwen': { category: 'social', subcategory: 'romantic', confidence: 0.95 },
  'verloving': { category: 'social', subcategory: 'romantic', confidence: 0.95 },
  'verloofd': { category: 'social', subcategory: 'romantic', confidence: 0.95 },
  'anniversary': { category: 'social', subcategory: 'romantic', confidence: 0.9 },
  'verjaardag relatie': { category: 'social', subcategory: 'romantic', confidence: 0.95 },
  'romantisch diner': { category: 'social', subcategory: 'romantic', confidence: 0.98 },
  'date night': { category: 'social', subcategory: 'romantic', confidence: 0.95 },
  'samen tijd': { category: 'social', subcategory: 'romantic', confidence: 0.8 },
  
  // Social - Social Activities (continued)
  'activiteit': { category: 'social', subcategory: 'social_activities', confidence: 0.75 },
  'sociale activiteit': { category: 'social', subcategory: 'social_activities', confidence: 0.95 },
  'evenement': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'event': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'party': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'feestje': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'verjaardag': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'verjaardagsfeest': { category: 'social', subcategory: 'social_activities', confidence: 0.95 },
  'birthday': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'bruiloft': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'wedding': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'begrafenis': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'uitvaart': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'barbecue': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'bbq': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'bbq feest': { category: 'social', subcategory: 'social_activities', confidence: 0.95 },
  'etentje': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'dineren': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'diner': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'restaurant bezoek': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'uit eten': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'café bezoek': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'kroeg': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'bar': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'club': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'discotheek': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'disco': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'dancing': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },

  // Shopping - Necessities (HIGH confidence for obvious necessities)
  'winkelen': { category: 'shopping', subcategory: 'necessities', confidence: 0.6 }, // Context bepaalt subcategory
  'albert heijn': { category: 'shopping', subcategory: 'necessities', confidence: 0.95 },
  'jumbo': { category: 'shopping', subcategory: 'necessities', confidence: 0.95 },
  'lidl': { category: 'shopping', subcategory: 'necessities', confidence: 0.95 },
  'aldi': { category: 'shopping', subcategory: 'necessities', confidence: 0.95 },
  'plus': { category: 'shopping', subcategory: 'necessities', confidence: 0.9 },
  'coop': { category: 'shopping', subcategory: 'necessities', confidence: 0.9 },
  'spar': { category: 'shopping', subcategory: 'necessities', confidence: 0.9 },
  'drinken kopen': { category: 'shopping', subcategory: 'necessities', confidence: 0.9 },
  'toiletpapier': { category: 'shopping', subcategory: 'necessities', confidence: 0.95 },
  'huishoudproducten': { category: 'shopping', subcategory: 'necessities', confidence: 0.9 },
  'etos': { category: 'shopping', subcategory: 'necessities', confidence: 0.85 },
  'kruidvat': { category: 'shopping', subcategory: 'necessities', confidence: 0.85 },
  'batterijen': { category: 'shopping', subcategory: 'necessities', confidence: 0.85 },
  'gloeilamp': { category: 'shopping', subcategory: 'necessities', confidence: 0.85 },
  'reparatie onderdelen': { category: 'shopping', subcategory: 'necessities', confidence: 0.9 },
  'kantoorspullen': { category: 'shopping', subcategory: 'necessities', confidence: 0.85 },
  'schoolspullen': { category: 'shopping', subcategory: 'necessities', confidence: 0.85 },
  'werkkleding': { category: 'shopping', subcategory: 'necessities', confidence: 0.85 },
  'uniform': { category: 'shopping', subcategory: 'necessities', confidence: 0.85 },
  
  // Shopping - Lifestyle (MEDIUM confidence - context can override)
  'fashion': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.85 },
  'mode': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.8 },
  'shirt': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.75 },
  'broek': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.75 },
  'jurk': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.8 },
  'rok': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.75 },
  'jas': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.75 },
  'trui': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.75 },
  'sweater': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.75 },
  'hoodie': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.75 },
  'jeans': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.8 },
  'sneakers': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.8 },
  'boots': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.75 },
  'laarzen': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.75 },
  'sandalen': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.75 },
  'accessoires': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.8 },
  'sieraden': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.8 },
  'horloge': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.75 },
  'ketting': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.7 },
  'armband': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.7 },
  'oorbellen': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.75 },
  'ring': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.65 },
  'tas': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.7 },
  'handtas': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.8 },
  'rugzak': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.7 },
  'portemonnee': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.75 },
  'wallet': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.75 },
  'bril': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.7 },
  'zonnebril': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.8 },
  'parfum': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.9 },
  'cosmetica': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.9 },
  'makeup': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.9 },
  'gadgets': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.85 },
  'smartphone': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.85 },
  'headphones': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.85 },
  'koptelefoon': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.85 },
  'speaker': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.8 },
  'muziek apparatuur': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.9 },
  'decoratie': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.9 },
  'interieur': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.85 },
  'meubels': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.85 },
  'furniture': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.85 },
  'stoel': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.8 },
  'tafel': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.8 },
  'kast': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.8 },
  'cadeautje': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.9 },
  'cadeau': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.9 },
  'gift': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.85 },
  'present': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.85 },
  'hobby spullen': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.9 },
  'speelgoed': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.9 },
  'tijdschrift': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.8 },
  'magazine': { category: 'shopping', subcategory: 'lifestyle', confidence: 0.8 },

  // Finance - Budgeting (MEDIUM confidence - can overlap with shopping)
  'budget': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'budgetteren': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'uitgaven': { category: 'finance', subcategory: 'budgeting', confidence: 0.8 },
  'inkomsten': { category: 'finance', subcategory: 'budgeting', confidence: 0.8 },
  'financieel': { category: 'finance', subcategory: 'budgeting', confidence: 0.75 },
  'geld': { category: 'finance', subcategory: 'budgeting', confidence: 0.6 }, // Low - context determines
  'kosten': { category: 'finance', subcategory: 'budgeting', confidence: 0.7 },
  'prijzen': { category: 'finance', subcategory: 'budgeting', confidence: 0.6 },
  'money': { category: 'finance', subcategory: 'budgeting', confidence: 0.6 },
  'euro': { category: 'finance', subcategory: 'budgeting', confidence: 0.7 },
  'dollar': { category: 'finance', subcategory: 'budgeting', confidence: 0.7 },
  'financiële planning': { category: 'finance', subcategory: 'budgeting', confidence: 0.95 },
  'maandbudget': { category: 'finance', subcategory: 'budgeting', confidence: 0.95 },
  'weekbudget': { category: 'finance', subcategory: 'budgeting', confidence: 0.95 },
  'uitgavenpatroon': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'kostenbesparing': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'besparen': { category: 'finance', subcategory: 'budgeting', confidence: 0.8 },
  
  // FINANCE EXTRA KEYWORDS (TOEGEVOEGD)
  'salaris': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'loon': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'salary': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'inkomen': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'income': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'uitkering': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'benefit': { category: 'finance', subcategory: 'budgeting', confidence: 0.8 },
  'pensioen': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'pension': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'aow': { category: 'finance', subcategory: 'budgeting', confidence: 0.95 },
  'financiële doelen': { category: 'finance', subcategory: 'budgeting', confidence: 0.95 },
  'financial goals': { category: 'finance', subcategory: 'budgeting', confidence: 0.95 },
  'spaardoel stellen': { category: 'finance', subcategory: 'budgeting', confidence: 0.95 },
  'budget app': { category: 'finance', subcategory: 'budgeting', confidence: 0.95 },
  'budget tracker': { category: 'finance', subcategory: 'budgeting', confidence: 0.95 },
  'uitgaven bijhouden': { category: 'finance', subcategory: 'budgeting', confidence: 0.95 },
  'expense tracking': { category: 'finance', subcategory: 'budgeting', confidence: 0.95 },
  'kasboek': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'boekhouding': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'bookkeeping': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'administratie': { category: 'finance', subcategory: 'budgeting', confidence: 0.8 },
  'financiële administratie': { category: 'finance', subcategory: 'budgeting', confidence: 0.95 },
  'receipts': { category: 'finance', subcategory: 'budgeting', confidence: 0.8 },
  'bonnetjes': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'kassakaart': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'bon bewaren': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'financieel overzicht': { category: 'finance', subcategory: 'budgeting', confidence: 0.95 },
  'financial overview': { category: 'finance', subcategory: 'budgeting', confidence: 0.95 },
  'maandoverzicht': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'jaaroverzicht': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'kwartaaloverzicht': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'cashflow': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'cash flow': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'liquiditeit': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'liquidity': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'debt': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'schuld': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'schulden': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'hypotheek': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'mortgage': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'lening': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'loan': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'krediet': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'credit': { category: 'finance', subcategory: 'budgeting', confidence: 0.8 },
  'creditcard': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'credit card': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'studieschuld': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'student loan': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'duo': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'aflossen': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'repayment': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'afbetalen': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'termijn': { category: 'finance', subcategory: 'budgeting', confidence: 0.8 },
  'installment': { category: 'finance', subcategory: 'budgeting', confidence: 0.85 },
  'maandlasten': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'monthly expenses': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'vaste lasten': { category: 'finance', subcategory: 'budgeting', confidence: 0.95 },
  'fixed costs': { category: 'finance', subcategory: 'budgeting', confidence: 0.95 },
  'variabele kosten': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  'variable costs': { category: 'finance', subcategory: 'budgeting', confidence: 0.9 },
  
  // Finance - Investment (HIGH confidence - very specific)
  'investeren': { category: 'finance', subcategory: 'investment', confidence: 0.95 },
  'belegging': { category: 'finance', subcategory: 'investment', confidence: 0.95 },
  'beleggen': { category: 'finance', subcategory: 'investment', confidence: 0.95 },
  'aandelen': { category: 'finance', subcategory: 'investment', confidence: 0.95 },
  'stocks': { category: 'finance', subcategory: 'investment', confidence: 0.9 },
  'etf': { category: 'finance', subcategory: 'investment', confidence: 0.95 },
  'obligaties': { category: 'finance', subcategory: 'investment', confidence: 0.9 },
  'crypto': { category: 'finance', subcategory: 'investment', confidence: 0.9 },
  'cryptocurrency': { category: 'finance', subcategory: 'investment', confidence: 0.95 },
  'bitcoin': { category: 'finance', subcategory: 'investment', confidence: 0.9 },
  'portfolio': { category: 'finance', subcategory: 'investment', confidence: 0.85 },
  'rendement': { category: 'finance', subcategory: 'investment', confidence: 0.85 },
  'return': { category: 'finance', subcategory: 'investment', confidence: 0.7 },
  'dividend': { category: 'finance', subcategory: 'investment', confidence: 0.9 },
  'koers': { category: 'finance', subcategory: 'investment', confidence: 0.8 },
  'trading': { category: 'finance', subcategory: 'investment', confidence: 0.85 },
  'broker': { category: 'finance', subcategory: 'investment', confidence: 0.85 },
  'degiro': { category: 'finance', subcategory: 'investment', confidence: 0.95 },
  'rabobank beleggen': { category: 'finance', subcategory: 'investment', confidence: 0.95 },
  
  // Finance - Saving (HIGH confidence for specific terms)
  'sparen': { category: 'finance', subcategory: 'saving', confidence: 0.9 },
  'spaarrekening': { category: 'finance', subcategory: 'saving', confidence: 0.95 },
  'spaargeld': { category: 'finance', subcategory: 'saving', confidence: 0.9 },
  'opzij zetten': { category: 'finance', subcategory: 'saving', confidence: 0.85 },
  'savings': { category: 'finance', subcategory: 'saving', confidence: 0.85 },
  'noodpot': { category: 'finance', subcategory: 'saving', confidence: 0.9 },
  'buffer': { category: 'finance', subcategory: 'saving', confidence: 0.7 },
  'emergency fund': { category: 'finance', subcategory: 'saving', confidence: 0.95 },
  'spaardoel': { category: 'finance', subcategory: 'saving', confidence: 0.9 },
  'depositogarantie': { category: 'finance', subcategory: 'saving', confidence: 0.9 },
  'rente': { category: 'finance', subcategory: 'saving', confidence: 0.75 },
  'interest': { category: 'finance', subcategory: 'saving', confidence: 0.75 },
  'spaarrente': { category: 'finance', subcategory: 'saving', confidence: 0.9 },
  
  // Finance - Taxes
  'belastingaangifte': { category: 'finance', subcategory: 'taxes', confidence: 0.98 },
  'aangifte': { category: 'finance', subcategory: 'taxes', confidence: 0.9 },
  'btw': { category: 'finance', subcategory: 'taxes', confidence: 0.95 },
  'inkomstenbelasting': { category: 'finance', subcategory: 'taxes', confidence: 0.98 },
  'vat': { category: 'finance', subcategory: 'taxes', confidence: 0.9 },
  'tax': { category: 'finance', subcategory: 'taxes', confidence: 0.85 },
  'taxes': { category: 'finance', subcategory: 'taxes', confidence: 0.9 },
  'belastingdienst': { category: 'finance', subcategory: 'taxes', confidence: 0.98 },
  'fiscaal': { category: 'finance', subcategory: 'taxes', confidence: 0.9 },
  'aftrekpost': { category: 'finance', subcategory: 'taxes', confidence: 0.95 },
  'teruggave': { category: 'finance', subcategory: 'taxes', confidence: 0.9 },
  'voorlopige aanslag': { category: 'finance', subcategory: 'taxes', confidence: 0.98 },
  'definitieve aanslag': { category: 'finance', subcategory: 'taxes', confidence: 0.98 },
  'toeslag': { category: 'finance', subcategory: 'taxes', confidence: 0.9 },
  'zorgtoeslag': { category: 'finance', subcategory: 'taxes', confidence: 0.95 },
  'huurtoeslag': { category: 'finance', subcategory: 'taxes', confidence: 0.95 },
  'kinderopvangtoeslag': { category: 'finance', subcategory: 'taxes', confidence: 0.98 },
  
  // FINANCE BILLS & PAYMENTS KEYWORDS (TOEGEVOEGD)  
  'rekening betalen': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'bill payment': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'factuur betalen': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'invoice payment': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'automatische incasso': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'direct debit': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'incasso': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'machtiging': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'betaalopdracht': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'payment order': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'overschrijving': { category: 'finance', subcategory: 'bills', confidence: 0.8 },
  'bank transfer': { category: 'finance', subcategory: 'bills', confidence: 0.8 },
  'internetbankieren': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'online banking': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'mobiel bankieren': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'mobile banking': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'bank app': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'banking app': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'rabobank': { category: 'finance', subcategory: 'bills', confidence: 0.8 },
  'ing': { category: 'finance', subcategory: 'bills', confidence: 0.8 },
  'abn amro': { category: 'finance', subcategory: 'bills', confidence: 0.8 },
  'sns bank': { category: 'finance', subcategory: 'bills', confidence: 0.8 },
  'bunq': { category: 'finance', subcategory: 'bills', confidence: 0.8 },
  'n26': { category: 'finance', subcategory: 'bills', confidence: 0.8 },
  'revolut': { category: 'finance', subcategory: 'bills', confidence: 0.8 },
  'ideal': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'paypal': { category: 'finance', subcategory: 'bills', confidence: 0.8 },
  'tikkie': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'wiebetaaltwat': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'splitwise': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'energy bill': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'energierekening': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'gas rekening': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'elektriciteit': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'electricity bill': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'stroomrekening': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'water rekening': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'water bill': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'waternet': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'essent': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'eneco': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'vattenfall': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'budget energie': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'greenchoice': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'internet rekening': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'internet bill': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'telefoon rekening': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'phone bill': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'mobiel abonnement': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'mobile subscription': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'kpn': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'vodafone': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  't-mobile': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'tmobile': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'tele2': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'lebara': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'lycamobile': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'simpel': { category: 'finance', subcategory: 'bills', confidence: 0.8 },
  'hollandsnieuwe': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'ziggo': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'delta': { category: 'finance', subcategory: 'bills', confidence: 0.8 },
  'caiway': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'tv abonnement': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'tv subscription': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'streaming abonnement': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'streaming subscription': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'netflix abonnement': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'spotify premium': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'youtube premium': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'disney+ abonnement': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'amazon prime': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'hbo max abonnement': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'videoland abonnement': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'huur betalen': { category: 'finance', subcategory: 'bills', confidence: 0.98 },
  'rent payment': { category: 'finance', subcategory: 'bills', confidence: 0.98 },
  'huur': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'rent': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'huurbetaling': { category: 'finance', subcategory: 'bills', confidence: 0.98 },
  'servicekosten': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'service charges': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'bijdrage': { category: 'finance', subcategory: 'bills', confidence: 0.8 },
  'contribution': { category: 'finance', subcategory: 'bills', confidence: 0.75 },
  'lidmaatschap': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'membership': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'membership fee': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'contributie': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'gym abonnement': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'gym membership': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'fitness abonnement': { category: 'finance', subcategory: 'bills', confidence: 0.95 },
  'sportschool abonnement': { category: 'finance', subcategory: 'bills', confidence: 0.98 },
  'basic fit': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'bandencheck': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'subscription': { category: 'finance', subcategory: 'bills', confidence: 0.8 },
  'abonnement': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'abonnement opzeggen': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'cancel subscription': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'opzegging': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'cancellation': { category: 'finance', subcategory: 'bills', confidence: 0.8 },
  'contract beëindigen': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'terminate contract': { category: 'finance', subcategory: 'bills', confidence: 0.9 },
  'verlengd abonnement': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'subscription renewal': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'automatische verlenging': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'auto renewal': { category: 'finance', subcategory: 'bills', confidence: 0.85 },
  'stappen': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'night out': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'avondje uit': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'weekendje weg': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'citytrip': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'dagje uit': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'uitstapje': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'roadtrip': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'reis': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'reizen': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'vakantie plannen': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'trip': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  
  // SOCIAL EXTRA KEYWORDS (TOEGEVOEGD)
  'whatsapp': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'whatsappen': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'bellen': { category: 'social', subcategory: 'friends', confidence: 0.75 },
  'videobellen': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'facetime': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'skype': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'zoom call': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'teams call': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'discord': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'telegram': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'snapchat': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'instagram berichten': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'dm sturen': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'sms': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'sms sturen': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'tekstbericht': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'app sturen': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'contact opnemen': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'bereiken': { category: 'social', subcategory: 'friends', confidence: 0.75 },
  'spreken': { category: 'social', subcategory: 'friends', confidence: 0.7 },
  'praten': { category: 'social', subcategory: 'friends', confidence: 0.75 },
  'kletsen': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'babbelen': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'conversatie': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'gesprek': { category: 'social', subcategory: 'friends', confidence: 0.75 },
  'bijkletsen': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'catch up': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'bijpraten': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'update geven': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'nieuws delen': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'roddelen': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'gossip': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'koffiedate': { category: 'social', subcategory: 'friends', confidence: 0.95 },
  'lunchdate': { category: 'social', subcategory: 'friends', confidence: 0.95 },
  'dinner date': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'eten met vrienden': { category: 'social', subcategory: 'friends', confidence: 0.95 },
  'uitgaan': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'stappen gaan': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'naar de stad': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'shoppen met vrienden': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'winkelen samen': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'film kijken samen': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'movie night': { category: 'social', subcategory: 'friends', confidence: 0.95 },
  'filmavond': { category: 'social', subcategory: 'friends', confidence: 0.95 },
  'netflix and chill': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'gaming samen': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'samen gamen': { category: 'social', subcategory: 'friends', confidence: 0.95 },
  'online gaming': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'multiplayer': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'co-op spelen': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'sporten samen': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'sportbuddy': { category: 'social', subcategory: 'friends', confidence: 0.95 },
  'workout partner': { category: 'social', subcategory: 'friends', confidence: 0.95 },
  'gym buddy': { category: 'social', subcategory: 'friends', confidence: 0.95 },
  'wandelen samen': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'fietsen samen': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'hardlopen samen': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'running buddy': { category: 'social', subcategory: 'friends', confidence: 0.95 },
  'hobby delen': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'interesse delen': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'samen leren': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'studiegroep': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'huiswerk samen': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'project samen': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'samenwerken': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'teamwork': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'groepsactiviteit': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'group activity': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'uitje organiseren': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'plannen maken': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'afspraken maken': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'agenda afstemmen': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'beschikbaarheid checken': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'plek zoeken': { category: 'social', subcategory: 'friends', confidence: 0.75 },
  'restaurant uitzoeken': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'activiteit kiezen': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'vriendendag': { category: 'social', subcategory: 'friends', confidence: 0.95 },
  'vriendschap onderhouden': { category: 'social', subcategory: 'friends', confidence: 0.95 },
  'contact houden': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'stay in touch': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'reconnect': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'oude vrienden': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'old friends': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'schoolvrienden': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'studievrienden': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'werkvrienden': { category: 'social', subcategory: 'friends', confidence: 0.9 },
  'colleagues': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'collega\'s': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'teamgenoten': { category: 'social', subcategory: 'friends', confidence: 0.85 },
  'buren': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'neighbors': { category: 'social', subcategory: 'friends', confidence: 0.8 },
  'buurtfeest': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'neighborhood party': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'community event': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'buurt evenement': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'lokaal evenement': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'festival bezoeken': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'concert bezoeken': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'show bezoeken': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'theater bezoeken': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'museum bezoeken': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'tentoonstellling': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'exhibition': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'expo bezoeken': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'beurs bezoeken': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'markt bezoeken': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'farmer\'s market': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'boerenmarkt': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'vlooienmarkt': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'flea market': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'kermis': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'carnival': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'pretpark': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'theme park': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'attractiepark': { category: 'social', subcategory: 'social_activities', confidence: 0.95 },
  'efteling': { category: 'social', subcategory: 'social_activities', confidence: 0.95 },
  'disneyland': { category: 'social', subcategory: 'social_activities', confidence: 0.95 },
  'dierentuin': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'zoo bezoeken': { category: 'social', subcategory: 'social_activities', confidence: 0.95 },
  'safari': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'aquarium': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'speeltuin': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'playground': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'park bezoeken': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'wandeling in park': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'natuur bezoeken': { category: 'social', subcategory: 'social_activities', confidence: 0.8 },
  'hiking samen': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'kamperen': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'camping': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'weekend weg': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'short trip': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
  'road trip': { category: 'social', subcategory: 'social_activities', confidence: 0.9 },
  'auto reis': { category: 'social', subcategory: 'social_activities', confidence: 0.85 },
};

// Helper functions
export class CategorySystemHelper {
  /**
   * Get all categories as an array of [category, label] entries
   */
  static getAllCategories(): [GoalCategory, string][] {
    return Object.entries(GOAL_CATEGORY_LABELS) as [GoalCategory, string][];
  }

  /**
   * Get all available categories
   */
  static getAllCategoryKeys(): GoalCategory[] {
    return Object.keys(GOAL_CATEGORY_LABELS) as GoalCategory[];
  }

  /**
   * Get all subcategories for a specific category
   */
  static getSubcategoriesForCategory(category: GoalCategory): string[] {
    return CATEGORY_SUBCATEGORIES[category] || [];
  }

  /**
   * Get all available subcategories across all categories
   */
  static getAllSubcategories(): string[] {
    const allSubcategories = new Set<string>();
    Object.values(CATEGORY_SUBCATEGORIES).forEach(subcategories => {
      subcategories.forEach(sub => allSubcategories.add(sub));
    });
    return Array.from(allSubcategories).sort();
  }

  /**
   * Get category label for display
   */
  static getCategoryLabel(category: GoalCategory): string {
    return GOAL_CATEGORY_LABELS[category] || category;
  }

  /**
   * Get subcategory label for display
   */
  static getSubcategoryLabel(subcategory: string): string {
    return SUBCATEGORY_LABELS[subcategory] || subcategory;
  }

  /**
   * Get missed reason label for display
   */
  static getMissedReasonLabel(reason: MissedReason): string {
    return MISSED_REASON_LABELS[reason] || reason;
  }

  /**
   * Detect category and subcategory from text with advanced multi-keyword scoring
   */
  static detectCategoryAndSubcategory(title: string, description?: string, timeSlot?: string): { category: GoalCategory; subcategory?: string } | null {
    const text = `${title} ${description || ''} ${timeSlot || ''}`.toLowerCase();
    const words = text.split(/\s+/);
    
    // Multi-category scoring system
    const categoryScores: { [key in GoalCategory]: { score: number; subcategories: { [subcategory: string]: number } } } = {
      health: { score: 0, subcategories: {} },
      productivity: { score: 0, subcategories: {} },
      household: { score: 0, subcategories: {} },
      entertainment: { score: 0, subcategories: {} },
      personal_development: { score: 0, subcategories: {} },
      social: { score: 0, subcategories: {} },
      shopping: { score: 0, subcategories: {} },
      practical: { score: 0, subcategories: {} },
      finance: { score: 0, subcategories: {} },
      other: { score: 0, subcategories: {} }
    };

    const matchedKeywords: string[] = [];
    
    // Phase 1: Score exact phrases (highest priority - longer phrases get more points)
    const exactPhrases = Object.keys(GOAL_DETECTION).filter(key => key.includes(' '));
    for (const phrase of exactPhrases.sort((a, b) => b.length - a.length)) {
      if (text.includes(phrase)) {
        const match = GOAL_DETECTION[phrase];
        const phraseBonus = phrase.split(' ').length * 0.3; // Extra points for longer phrases
        const score = match.confidence + phraseBonus;
        
        categoryScores[match.category].score += score;
        if (match.subcategory) {
          categoryScores[match.category].subcategories[match.subcategory] = 
            (categoryScores[match.category].subcategories[match.subcategory] || 0) + score;
        }
        matchedKeywords.push(phrase);
      }
    }
    
    // Phase 2: Score individual words (avoid double counting from phrases)
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      const match = GOAL_DETECTION[cleanWord];
      if (match && !matchedKeywords.some(mk => mk.includes(cleanWord))) {
        categoryScores[match.category].score += match.confidence;
        if (match.subcategory) {
          categoryScores[match.category].subcategories[match.subcategory] = 
            (categoryScores[match.category].subcategories[match.subcategory] || 0) + match.confidence;
        }
        matchedKeywords.push(cleanWord);
      }
    });

    // Phase 3: Enhanced context-based scoring with purchase intent detection
    if (matchedKeywords.length > 0) {
      
      // UNIVERSAL PURCHASE DETECTION - Override category if purchase intent is clear
      const purchaseIndicators = ['kopen', 'bestellen', 'aanschaffen', 'halen', 'koop', 'bestelling', 'order', 'aankoop', 'shop', 'winkelen'];
      const necessityIndicators = ['nodig', 'moet', 'moeten', 'kapot', 'vervangen', 'essentieel', 'urgent', 'belangrijk', 'broken', 'defect', 'leeg', 'op', 'noodzakelijk', 'dringend', 'snel', 'emergency', 'repair', 'stuk', 'af', 'geen', 'zonder'];
      const lifestyleIndicators = ['leuk', 'mooi', 'cool', 'want', 'wil', 'graag', 'nice', 'trendy', 'fashion', 'style', 'zin', 'inspiratie', 'uitproberen', 'nieuw', 'upgrade', 'fancy', 'decoratie', 'gezellig'];
      
      const hasPurchaseIntent = purchaseIndicators.some(indicator => text.includes(indicator));
      const hasNecessityContext = necessityIndicators.some(indicator => text.includes(indicator));
      const hasLifestyleContext = lifestyleIndicators.some(indicator => text.includes(indicator));
      
      // If purchase intent detected, boost shopping significantly
      if (hasPurchaseIntent) {
        categoryScores.shopping.score += 0.8; // Strong boost for purchase intent
        
        // Determine subcategory based on context and item type
        if (hasNecessityContext && !hasLifestyleContext) {
          categoryScores.shopping.subcategories.necessities = 
            (categoryScores.shopping.subcategories.necessities || 0) + 0.7;
        } else if (hasLifestyleContext && !hasNecessityContext) {
          categoryScores.shopping.subcategories.lifestyle = 
            (categoryScores.shopping.subcategories.lifestyle || 0) + 0.7;
        } else {
          // Default logic based on item type
          const foodItems = ['boodschappen', 'eten', 'voedsel', 'melk', 'brood', 'groente', 'fruit', 'vlees', 'vis'];
          const householdItems = ['toiletpapier', 'wasmiddel', 'zeep', 'shampoo', 'tandpasta', 'schoonmaakmiddel'];
          const clothingItems = ['kleding', 'shirt', 'broek', 'schoenen', 'jas', 'trui'];
          
          const isFoodItem = foodItems.some(item => text.includes(item));
          const isHouseholdItem = householdItems.some(item => text.includes(item));
          const isClothingItem = clothingItems.some(item => text.includes(item));
          
          if (isFoodItem || isHouseholdItem) {
            categoryScores.shopping.subcategories.necessities = 
              (categoryScores.shopping.subcategories.necessities || 0) + 0.6;
          } else if (isClothingItem) {
            categoryScores.shopping.subcategories.lifestyle = 
              (categoryScores.shopping.subcategories.lifestyle || 0) + 0.6;
          } else {
            // Default to necessities if unclear
            categoryScores.shopping.subcategories.necessities = 
              (categoryScores.shopping.subcategories.necessities || 0) + 0.5;
          }
        }
      }
      
      // HEALTH ITEM PURCHASE OVERRIDE - Health items with purchase intent go to shopping
      const healthPurchaseItems = ['medicijnen', 'vitamines', 'supplement', 'protein', 'sportvoeding', 'gezonde snacks', 'superfood', 'organic', 'bio', 'creatine', 'whey', 'multivitamine'];
      const hasHealthPurchaseItem = healthPurchaseItems.some(item => text.includes(item));
      
      if (hasPurchaseIntent && hasHealthPurchaseItem) {
        // Override: health items being purchased go to shopping/necessities
        categoryScores.shopping.score += 0.9;
        categoryScores.shopping.subcategories.necessities = 
          (categoryScores.shopping.subcategories.necessities || 0) + 0.8;
        // Reduce health score to prevent confusion
        categoryScores.health.score = Math.max(0, categoryScores.health.score - 0.3);
      }
      
      // Health vs Household cooking context (only if no purchase intent)
      const healthContext = ['gezond', 'dieet', 'afvallen', 'nutrition', 'calories', 'healthy', 'fit', 'abnehmen', 'vitamines', 'supplement', 'protein'];
      const cookingContext = ['maken', 'koken', 'bereiden', 'recept', 'ingredienten', 'cooking', 'menu', 'maaltijd', 'oven', 'pan', 'keuken'];
      
      const hasHealthContext = healthContext.some(ctx => text.includes(ctx));
      const hasCookingContext = cookingContext.some(ctx => text.includes(ctx));
      
      // HOUSEHOLD ITEM PURCHASE OVERRIDE  
      const householdPurchaseItems = ['wasmiddel', 'schoonmaakmiddel', 'toiletpapier', 'zeep', 'shampoo', 'tandpasta', 'afwasmiddel', 'stofzuiger zakjes', 'sponzen', 'doekjes', 'vaatwastabletten'];
      const hasHouseholdPurchaseItem = householdPurchaseItems.some(item => text.includes(item));
      
      if (hasPurchaseIntent && hasHouseholdPurchaseItem) {
        // Override: household items being purchased go to shopping/necessities
        categoryScores.shopping.score += 0.9;
        categoryScores.shopping.subcategories.necessities = 
          (categoryScores.shopping.subcategories.necessities || 0) + 0.8;
        // Reduce household score to prevent confusion
        categoryScores.household.score = Math.max(0, categoryScores.household.score - 0.3);
      }
      
      // PRACTICAL ITEM PURCHASE OVERRIDE
      const practicalPurchaseItems = ['tools', 'gereedschap', 'lamp', 'batterijen', 'kabels', 'adapter', 'sloten', 'sleutels', 'reparatie spullen', 'onderdelen', 'schroeven', 'bevestiging'];
      const hasPracticalPurchaseItem = practicalPurchaseItems.some(item => text.includes(item));
      
      if (hasPurchaseIntent && hasPracticalPurchaseItem) {
        // Override: practical items being purchased go to shopping/necessities or lifestyle based on context
        const isNecessaryPractical = hasNecessityContext || 
                                   ['reparatie', 'kapot', 'defect', 'nodig', 'moet'].some((urgent: string) => text.includes(urgent));
        
        categoryScores.shopping.score += 0.9;
        if (isNecessaryPractical) {
          categoryScores.shopping.subcategories.necessities = 
            (categoryScores.shopping.subcategories.necessities || 0) + 0.8;
        } else {
          categoryScores.shopping.subcategories.lifestyle = 
            (categoryScores.shopping.subcategories.lifestyle || 0) + 0.7;
        }
        // Reduce practical score to prevent confusion
        categoryScores.practical.score = Math.max(0, categoryScores.practical.score - 0.3);
      }
      
      // ENTERTAINMENT ITEM PURCHASE OVERRIDE
      const entertainmentPurchaseItems = ['game', 'console', 'film', 'boek', 'muziek', 'tickets', 'concert', 'bioscoop', 'streaming', 'netflix', 'spotify', 'playstation', 'xbox', 'nintendo'];
      const hasEntertainmentPurchaseItem = entertainmentPurchaseItems.some(item => text.includes(item));
      
      if (hasPurchaseIntent && hasEntertainmentPurchaseItem) {
        // Override: entertainment items being purchased go to shopping/lifestyle (entertainment is rarely necessity)
        categoryScores.shopping.score += 0.9;
        categoryScores.shopping.subcategories.lifestyle = 
          (categoryScores.shopping.subcategories.lifestyle || 0) + 0.8;
        // Reduce entertainment score to prevent confusion
        categoryScores.entertainment.score = Math.max(0, categoryScores.entertainment.score - 0.3);
      }
      
      // PRODUCTIVITY ITEM PURCHASE OVERRIDE
      const productivityPurchaseItems = ['laptop', 'computer', 'telefoon', 'software', 'app', 'abonnement', 'office', 'adobe', 'notitie boek', 'agenda', 'pen', 'marker', 'bureau', 'stoel', 'monitor'];
      const hasProductivityPurchaseItem = productivityPurchaseItems.some(item => text.includes(item));
      
      if (hasPurchaseIntent && hasProductivityPurchaseItem) {
        // Override: productivity items being purchased go to shopping, subcategory based on work vs personal context
        const isWorkRelated = ['werk', 'kantoor', 'professional', 'business', 'project', 'meeting'].some((workCtx: string) => text.includes(workCtx));
        
        categoryScores.shopping.score += 0.9;
        if (isWorkRelated || hasNecessityContext) {
          categoryScores.shopping.subcategories.necessities = 
            (categoryScores.shopping.subcategories.necessities || 0) + 0.8;
        } else {
          categoryScores.shopping.subcategories.lifestyle = 
            (categoryScores.shopping.subcategories.lifestyle || 0) + 0.7;
        }
        // Reduce productivity score to prevent confusion
        categoryScores.productivity.score = Math.max(0, categoryScores.productivity.score - 0.3);
      }
      
      // ENHANCED "MOET" DETECTION - Universal necessity override for unclear items with purchase intent
      if (hasPurchaseIntent && !hasHealthPurchaseItem && !hasHouseholdPurchaseItem && 
          !hasPracticalPurchaseItem && !hasEntertainmentPurchaseItem && !hasProductivityPurchaseItem) {
        
        // For items not in specific categories but with clear purchase + necessity intent
        const strongNecessityIndicators = ['moet', 'moeten', 'nodig', 'kapot', 'defect', 'vervangen', 'urgent', 'dringend', 'emergency', 'broken', 'stuk', 'leeg', 'op'];
        const hasStrongNecessity = strongNecessityIndicators.some((indicator: string) => text.includes(indicator));
        
        if (hasStrongNecessity) {
          // Boost shopping/necessities for unclear items with strong necessity context
          categoryScores.shopping.score += 0.7;
          categoryScores.shopping.subcategories.necessities = 
            (categoryScores.shopping.subcategories.necessities || 0) + 0.6;
        }
      }
      
      // Only apply cooking vs health context if no purchase intent detected
      else if ((matchedKeywords.includes('eten') || matchedKeywords.includes('water')) && hasHealthContext && !hasCookingContext) {
        categoryScores.health.score += 0.6;
        categoryScores.health.subcategories.nutrition = (categoryScores.health.subcategories.nutrition || 0) + 0.6;
      } else if ((matchedKeywords.includes('eten') || matchedKeywords.includes('water')) && hasCookingContext && !hasHealthContext) {
        categoryScores.household.score += 0.6;
        categoryScores.household.subcategories.cooking = (categoryScores.household.subcategories.cooking || 0) + 0.6;
      }
      
      // Work vs Personal training context  
      const workContext = ['werk', 'kantoor', 'professional', 'vak', 'cursus', 'certificaat', 'skills', 'carriere', 'baan', 'collega', 'meeting', 'project'];
      const fitnessContext = ['gym', 'sport', 'fitness', 'cardio', 'strength', 'workout', 'conditie', 'kracht', 'spieren', 'beweging'];
      
      const hasWorkContext = workContext.some(ctx => text.includes(ctx));
      const hasFitnessContext = fitnessContext.some(ctx => text.includes(ctx));
      
      if (matchedKeywords.includes('training') && hasWorkContext && !hasFitnessContext) {
        categoryScores.productivity.score += 0.6;
        categoryScores.productivity.subcategories.professional_learning = (categoryScores.productivity.subcategories.professional_learning || 0) + 0.6;
      } else if (matchedKeywords.includes('training') && hasFitnessContext && !hasWorkContext) {
        categoryScores.health.score += 0.6;
        categoryScores.health.subcategories.sport = (categoryScores.health.subcategories.sport || 0) + 0.6;
      }
      
      // Social vs Romantic friend/partner context
      const romanticContext = ['date', 'liefde', 'samen', 'relationship', 'romantic', 'love', 'partner', 'boyfriend', 'girlfriend', 'kus', 'romantic'];
      const friendContext = ['vrienden', 'groep', 'uitjes', 'social', 'friends', 'gezellig', 'party', 'feest', 'club'];
      
      const hasRomanticContext = romanticContext.some(ctx => text.includes(ctx));
      const hasFriendContext = friendContext.some(ctx => text.includes(ctx));
      
      if ((matchedKeywords.includes('vriend') || matchedKeywords.includes('vriendin')) && hasRomanticContext && !hasFriendContext) {
        categoryScores.social.subcategories.romantic = (categoryScores.social.subcategories.romantic || 0) + 0.5;
      } else if ((matchedKeywords.includes('vriend') || matchedKeywords.includes('vriendin')) && hasFriendContext && !hasRomanticContext) {
        categoryScores.social.subcategories.friends = (categoryScores.social.subcategories.friends || 0) + 0.5;
      }
      
      // Finance vs Practical administration context
      const financeContext = ['geld', 'belasting', 'bank', 'financieel', 'budget', 'kosten', 'sparen', 'investeren', 'euro', 'dollar'];
      const practicalContext = ['gemeente', 'paspoort', 'rijbewijs', 'aanvraag', 'formulier', 'digid', 'overheid', 'officieel'];
      
      const hasFinanceContext = financeContext.some(ctx => text.includes(ctx));
      const hasPracticalContext = practicalContext.some(ctx => text.includes(ctx));
      
      if ((matchedKeywords.includes('documenten') || matchedKeywords.includes('administratie')) && hasFinanceContext && !hasPracticalContext) {
        categoryScores.finance.score += 0.5;
        categoryScores.finance.subcategories.budgeting = (categoryScores.finance.subcategories.budgeting || 0) + 0.5;
      } else if ((matchedKeywords.includes('documenten') || matchedKeywords.includes('administratie')) && hasPracticalContext && !hasFinanceContext) {
        categoryScores.practical.score += 0.5;
        categoryScores.practical.subcategories.administration = (categoryScores.practical.subcategories.administration || 0) + 0.5;
      }
      
      // Productivity vs Personal Development learning context
      const productivityContext = ['werk', 'professional', 'carriere', 'efficiency', 'deadline', 'project', 'task', 'time management'];
      const personalContext = ['hobby', 'interesse', 'persoonlijk', 'passion', 'creatief', 'fun', 'ontspanning', 'zelfverbetering'];
      
      const hasProductivityContext = productivityContext.some(ctx => text.includes(ctx));
      const hasPersonalContext = personalContext.some(ctx => text.includes(ctx));
      
      if (matchedKeywords.includes('leren') && hasProductivityContext && !hasPersonalContext) {
        categoryScores.productivity.score += 0.4;
        categoryScores.productivity.subcategories.professional_learning = (categoryScores.productivity.subcategories.professional_learning || 0) + 0.4;
      } else if (matchedKeywords.includes('leren') && hasPersonalContext && !hasProductivityContext) {
        categoryScores.personal_development.score += 0.4;
        categoryScores.personal_development.subcategories.skills = (categoryScores.personal_development.subcategories.skills || 0) + 0.4;
      }
    }

    // Phase 4: Time-based bonus scoring
    if (timeSlot) {
      const slot = timeSlot.toLowerCase();
      if (slot.includes('voor 0') || slot.includes('vroeg') || slot.includes('ochtend')) {
        if (title.toLowerCase().includes('opstaan') || title.toLowerCase().includes('wakker')) {
          return { category: 'health', subcategory: 'sleep' };
        }
      }
      if (slot.includes('10:00') || slot.includes('11:00') || slot.includes('gym') || slot.includes('sport')) {
        const sportsWords = ['beweging', 'actief', 'training', 'workout', 'exercise'];
        if (sportsWords.some(word => text.includes(word))) {
          categoryScores.health.score += 0.3;
          categoryScores.health.subcategories.sport = (categoryScores.health.subcategories.sport || 0) + 0.3;
        }
      }
    }

    // Phase 5: Find winning category and subcategory (with improved logic)
    let bestCategory: GoalCategory | null = null;
    let bestScore = 0;
    
    // Apply negative penalties for conflicting contexts
    Object.entries(categoryScores).forEach(([category, data]) => {
      let adjustedScore = data.score;
      
      // Penalty for health when shopping context is strong
      if (category === 'health' && categoryScores.shopping.score > 0.7) {
        adjustedScore -= 0.2;
      }
      
      // Penalty for household when productivity context is strong  
      if (category === 'household' && categoryScores.productivity.score > 0.7) {
        adjustedScore -= 0.15;
      }
      
      // Penalty for shopping when specific activity context is strong
      if (category === 'shopping' && (categoryScores.health.score > 0.8 || categoryScores.productivity.score > 0.8)) {
        adjustedScore -= 0.1;
      }
      
      if (adjustedScore > bestScore && adjustedScore >= 0.5) { // Lower threshold due to adjusted scores
        bestScore = adjustedScore;
        bestCategory = category as GoalCategory;
      }
    });
    
    if (!bestCategory) return null;
    
    // Find best subcategory for the winning category
    let bestSubcategory: string | undefined;
    let bestSubScore = 0;
    
    const winningCategoryData = categoryScores[bestCategory as keyof typeof categoryScores];
    for (const [subcategory, score] of Object.entries(winningCategoryData.subcategories)) {
      const numScore = score as number;
      if (numScore > bestSubScore) {
        bestSubScore = numScore;
        bestSubcategory = subcategory;
      }
    }
    
    return {
      category: bestCategory,
      subcategory: bestSubcategory
    };
  }

  /**
   * Validate if a subcategory belongs to a category
   */
  static isValidSubcategoryForCategory(category: GoalCategory, subcategory: string): boolean {
    return CATEGORY_SUBCATEGORIES[category]?.includes(subcategory) || false;
  }

  /**
   * Get all missed reasons as an array of [reason, label] entries
   */
  static getAllMissedReasons(): [MissedReason, string][] {
    return Object.entries(MISSED_REASON_LABELS) as [MissedReason, string][];
  }

  /**
   * Get suggestions condition types for smart suggestions
   */
  static getSuggestionConditions(): string[] {
    return ['no_exercise', 'no_cleaning', 'no_relaxation', 'no_learning', 'no_practical'];
  }
}
