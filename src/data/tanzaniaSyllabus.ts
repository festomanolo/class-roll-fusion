/**
 * Tanzania Education Syllabus Data - 2025 Curriculum (Based on 2023 TIE Framework)
 * Complete competence-based curriculum structure from Primary to Form 6
 * Emphasizing practical skills, critical thinking, creativity, collaboration, and communication
 */

export interface Subtopic {
  id: string;
  name: string;
  description?: string;
  competences?: string[];
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  subtopics?: Subtopic[];
  isCustom?: boolean; // For teacher-added topics
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  topics: Topic[];
  isCore?: boolean;
  isElective?: boolean;
}

export interface EducationLevel {
  id: string;
  name: string;
  description: string;
  subjects: Subject[];
  standards?: string[]; // For primary (I-VII) or forms (I-IV, V-VI)
}

// Primary School Subjects (Standards I-VII) - 2025 Competence-Based Curriculum
const primarySubjects: Subject[] = [
  {
    id: 'kiswahili-primary',
    name: 'Kiswahili',
    code: 'KIS',
    isCore: true,
    topics: [
      {
        id: 'lugha-ya-kiswahili',
        name: 'Lugha ya Kiswahili',
        description: 'Foundational language skills in Kiswahili',
        subtopics: [
          { id: 'kusoma', name: 'Kusoma', description: 'Reading skills development' },
          { id: 'kuandika', name: 'Kuandika', description: 'Writing skills development' },
          { id: 'mazungumzo', name: 'Mazungumzo', description: 'Speaking and conversation skills' },
          { id: 'kusikiliza', name: 'Kusikiliza', description: 'Listening comprehension' }
        ]
      },
      {
        id: 'sarufi-na-lugha',
        name: 'Sarufi na Lugha',
        description: 'Grammar and language structure',
        subtopics: [
          { id: 'sarufi-msingi', name: 'Sarufi ya Msingi', description: 'Basic grammar rules' },
          { id: 'maneno-na-sentensi', name: 'Maneno na Sentensi', description: 'Words and sentence construction' },
          { id: 'alama-za-uandishi', name: 'Alama za Uandishi', description: 'Punctuation marks' },
          { id: 'imla', name: 'Imla', description: 'Spelling and dictation' }
        ]
      },
      {
        id: 'fasihi-simulizi',
        name: 'Fasihi Simulizi',
        description: 'Oral literature and cultural heritage',
        subtopics: [
          { id: 'hadithi', name: 'Hadithi', description: 'Traditional stories and folktales' },
          { id: 'methali', name: 'Methali na Misemo', description: 'Proverbs and sayings' },
          { id: 'nyimbo', name: 'Nyimbo za Jadi', description: 'Traditional songs' },
          { id: 'vitendawili', name: 'Vitendawili', description: 'Riddles' }
        ]
      },
      {
        id: 'fasihi-andishi',
        name: 'Fasihi Andishi',
        description: 'Written literature and creative writing',
        subtopics: [
          { id: 'mashairi', name: 'Mashairi', description: 'Poetry reading and composition' },
          { id: 'hadithi-fupi', name: 'Hadithi Fupi', description: 'Short story writing' },
          { id: 'insha', name: 'Insha', description: 'Essay writing' },
          { id: 'barua', name: 'Barua', description: 'Letter writing' }
        ]
      },
      {
        id: 'utamaduni-na-maadili',
        name: 'Utamaduni na Maadili',
        description: 'Culture and moral values through language',
        subtopics: [
          { id: 'desturi', name: 'Desturi za Kiafrika', description: 'African customs and traditions' },
          { id: 'maadili', name: 'Maadili na Tabia Njema', description: 'Moral values and good behavior' },
          { id: 'mazingira', name: 'Mazingira na Utunzaji', description: 'Environment and conservation' }
        ]
      }
    ]
  },
  {
    id: 'english-primary',
    name: 'English Language',
    code: 'ENG',
    isCore: true,
    topics: [
      {
        id: 'basic-english-skills',
        name: 'Demonstrate mastery of basic English language skills',
        description: 'Foundational English language competences (Standards III-VI)',
        subtopics: [
          {
            id: 'listening-speaking-iii',
            name: 'Develop listening and speaking skills (Standard III)',
            description: '(a) Write dictated words; (b) Listen and respond to questions based on simple stories from familiar contexts (home, school)'
          },
          {
            id: 'phonemic-awareness-iii',
            name: 'Develop phonemic awareness and pronunciation of English letters (Standard III)',
            description: '(a) Read aloud simple short stories; (b) Read short, simple texts for comprehension'
          },
          {
            id: 'grammar-usage-iii',
            name: 'Use appropriate grammar and vocabulary both orally and in writing (Standard III)',
            description: '(a) Use personal pronouns; (b) Express possession using the verbs have and has; (c) Express routines and ongoing activities in school and home contexts (target: simple present tense, present continuous tense); (d) Use conjunctions in oral and written contexts (target: and, but)'
          },
          {
            id: 'vocabulary-development-iv',
            name: 'Develop vocabulary by relating words with objects in the environment (Standard IV)',
            description: '(a) Associate words with objects found in different contexts (e.g., home, hospital, market, bus station); (b) Match objects with their respective characteristics; (c) Construct short sentences using vocabulary referring to objects found in different settings'
          },
          {
            id: 'grammar-usage-iv',
            name: 'Use appropriate grammar and vocabulary both orally and in writing (Standard IV)',
            description: '(a) Talk about quantity using appropriate words (e.g., some, many, any, much); (b) Express location using appropriate prepositions of place and time (target: in, at, on, under, inside, outside, over, near); (c) Express past events (target: simple past tense, past continuous tense); (d) Use conjunctions in oral and written contexts (target: so, because)'
          },
          {
            id: 'vocabulary-development-v',
            name: 'Develop vocabulary by relating words with objects in the environment (Standard V)',
            description: '(a) Find synonyms and antonyms of targeted words in different texts; (b) Solve word puzzles from various media; (c) Construct short passages using vocabulary referring to objects found in different settings'
          },
          {
            id: 'grammar-usage-v',
            name: 'Use appropriate grammar and vocabulary both orally and in writing (Standard V)',
            description: '(a) Compare things based on size, quality and quantity (e.g., big-bigger-biggest, much-more-most); (b) Express location using appropriate prepositions of direction (target: towards, between, beside, from, into, onto, through, across); (c) Express possession using adjectives and pronouns (target: my, mine, yours, his, her, hers, their, theirs); (d) Express completed and unfinished actions (structure: present perfect, past perfect tense); (e) Use conjunctions in oral and written contexts (target: too… to, either …or, neither…nor); (f) Use active and passive voices to communicate in different contexts'
          },
          {
            id: 'vocabulary-development-vi',
            name: 'Develop vocabulary by relating words with objects in the environment (Standard VI)',
            description: '(a) Compose a dialogue using vocabulary referring to objects found in different settings; (b) Compose a story using vocabulary referring to objects found in different settings'
          },
          {
            id: 'grammar-usage-vi',
            name: 'Use appropriate grammar and vocabulary both orally and in writing (Standard VI)',
            description: '(a) Express nationalities using appropriate adjectives (e.g. Tanzanian, Japanese, Norwegian); (b) Use relative pronouns in appropriate contexts (e.g., who, whose, whom); (c) Express future actions (structure: will, shall, going to); (d) Use conjunctions in oral and written contexts (target: yet, despite, in spite of, so… that); (e) Express concession (target: although, though)'
          }
        ]
      },
      {
        id: 'comprehension-skills',
        name: 'Comprehend oral and written information',
        description: 'Reading and listening comprehension across standards',
        subtopics: [
          {
            id: 'reading-comprehension-iii',
            name: 'Read a variety of simple texts appropriately (Standard III)',
            description: '(a) Read two-syllable and grade-appropriate words; (b) Read multi-syllable and grade-appropriate words; (c) Read aloud a variety of grade-level texts'
          },
          {
            id: 'communication-response-iv',
            name: 'Respond appropriately in a familiar communicative context (Standard IV)',
            description: 'Participate in simple dialogues about school, market and home contexts'
          },
          {
            id: 'reading-comprehension-iv',
            name: 'Read appropriately a variety of simple texts (Standard IV)',
            description: '(a) Read aloud grade-level simple texts with appropriate intonation; (b) Read grade-level simple texts of different natures fluently'
          },
          {
            id: 'oral-comprehension-v',
            name: 'Comprehend information presented orally (Standard V)',
            description: '(a) Follow oral instructions to accomplish a task (e.g., operating equipment and making objects); (b) Listen to grade-appropriate myths, fairy tales and fables presented through audio/audiovisual channels and respond accordingly; (c) Identify major and minor ideas in a story; (d) Summarise issues found in the texts heard; (e) Retell oral texts'
          },
          {
            id: 'meaning-construction-v',
            name: 'Construct meaning from simple texts (Standard V)',
            description: '(a) Read grade-appropriate texts to identify their basic components and contents; (b) Deduce the general meaning of a text; (c) Summarise issues found in the texts read'
          },
          {
            id: 'communication-response-v',
            name: 'Respond appropriately in a familiar communicative context (Standard V)',
            description: '(a) Identify main points in conversations; (b) Respond to compliments, apologies, wishes and sympathy messages'
          },
          {
            id: 'reading-comprehension-v',
            name: 'Read appropriately a variety of simple texts (Standard V)',
            description: '(a) Read aloud grade-level simple texts with the correct rhythm; (b) Reading grade-level prose and poetry with accuracy and appropriate speed'
          },
          {
            id: 'oral-comprehension-vi',
            name: 'Comprehend information presented orally (Standard VI)',
            description: '(a) Report information heard from a speech; (b) Participate in dialogues on grade appropriate topical issues; (c) Engage in oral discussions on topical issues (e.g. environment, gender, corruption)'
          },
          {
            id: 'meaning-construction-vi',
            name: 'Construct meaning from simple texts (Standard VI)',
            description: '(a) Interpret figurative and idiomatic language from a text (e.g. idioms, riddles, proverbs); (b) Infer meaning from a text; (c) Relate the content of a text with real life'
          },
          {
            id: 'communication-response-vi',
            name: 'Respond appropriately in a familiar communicative context (Standard VI)',
            description: '(a) Give an appropriate and logical conclusion to a conversation; (b) Debate on topical issues (e.g. gender, entrepreneurship, corruption, education); (c) Give appropriate responses to riddles'
          }
        ]
      },
      {
        id: 'effective-communication',
        name: 'Communicate effectively in different contexts',
        description: 'Oral and written communication skills',
        subtopics: [
          {
            id: 'spoken-language-iii',
            name: 'Demonstrate knowledge of the basic features of spoken language (Standard III)',
            description: '(a) Identify words with short and long vowels (e.g., ship/sheep, full/fool, to/too); (b) Pronounce words with long vowel sounds with speed and fluency; (c) Read short phrases and simple sentences with short and long vowels'
          },
          {
            id: 'spoken-language-iv',
            name: 'Demonstrate knowledge of the basic features of spoken language (Standard IV)',
            description: '(a) Pronounce words with similar sounds (e.g., see/sea, by/bye/buy, right/write); (b) Convey simple ideas using words with similar sounds; (c) Use words with opposite meanings in spoken contexts'
          },
          {
            id: 'written-messages-iv',
            name: 'Produce short written messages using appropriate grammar and vocabulary (Standard IV)',
            description: '(a) Identify the form and content of wishes and messages; (b) Write wishes and messages to parents, teachers and friends; (c) Prepare a schedule of daily routines'
          },
          {
            id: 'creative-writing-iv',
            name: 'Demonstrate basic skills in creative writing (Standard IV)',
            description: '(a) Write simple sentences using visual/audiovisual stimuli (e.g., pictures, charts, diagrams); (b) Write simple guided paragraphs using appropriate and punctuation marks (target: and, but, comma, full stop, question marks)'
          },
          {
            id: 'spoken-language-v',
            name: 'Demonstrate knowledge of the basic features of spoken language (Standard V)',
            description: "(a) Practise connected speech by linking words (e.g. they'll, won't, there's); (b) Practise connected speech by deleting some sounds (e.g. next door –> nexdoor dad take –> datake most common –> moscommon used to –> useto); (c) Use question tags"
          },
          {
            id: 'oral-messages-v',
            name: 'Produce short and basic oral messages with a logical structure and intelligible pronunciation (Standard V)',
            description: '(a) Make statements about objects and ideas that can be judged as true or false; (b) Present simple speeches about self and family members on familiar topics (e.g. my pet, my brother, birthday party, wedding)'
          },
          {
            id: 'written-messages-v',
            name: 'Produce short written messages using appropriate grammar and vocabulary (Standard V)',
            description: '(a) Identify the form and content of appreciation, thanks and apology notes; (b) Write appreciation, thanks and apology notes to teachers, friends and parents'
          },
          {
            id: 'creative-writing-v',
            name: 'Demonstrate basic skills in creative writing (Standard V)',
            description: '(a) Create a journal to record inspiring things (at home, at school, from TV and radio programmes, etc.); (b) Devise a topic for a poem from the ideas recorded in a journal; (c) Use basic figures of speech (simile, metaphor, personification) to write a four-line stanza'
          },
          {
            id: 'spoken-language-vi',
            name: 'Demonstrate knowledge of the basic features of spoken language (Standard VI)',
            description: '(a) Express feelings using appropriate intonation patterns (e.g., surprise, shock, happiness, sadness); (b) Use appropriate backchannels in conversations (e.g. so, well, right, uh-huh, wow, yeah, really); (c) Report messages received orally (virtually and face to face)'
          },
          {
            id: 'oral-messages-vi',
            name: 'Produce short and basic oral messages with a logical structure and intelligible pronunciation (Standard VI)',
            description: 'Engage in discussions on a variety of topical issues and defend arguments'
          },
          {
            id: 'written-messages-vi',
            name: 'Produce short written messages using appropriate grammar and vocabulary (Standard VI)',
            description: '(a) Develop skills for taking notes from oral presentations; (b) Taking notes from various oral presentations (e.g. speech, lecture, discussion and audio/audiovisual materials)'
          },
          {
            id: 'creative-writing-vi',
            name: 'Demonstrate basic skills in creative writing (Standard VI)',
            description: 'Develop a plan for a story (target: setting & plot)'
          }
        ]
      }
    ]
  },
  {
    id: 'mathematics-primary',
    name: 'Mathematics',
    code: 'MATH',
    isCore: true,
    topics: [
      {
        id: 'numbers-operations',
        name: 'Numbers and Basic Operations',
        description: 'Fundamental number concepts and arithmetic operations',
        subtopics: [
          { id: 'counting-numbers', name: 'Counting and Number Recognition', description: 'Numbers 1-1000, place value, number patterns' },
          { id: 'addition-subtraction', name: 'Addition and Subtraction', description: 'Basic operations with whole numbers' },
          { id: 'multiplication-division', name: 'Multiplication and Division', description: 'Times tables, division facts, word problems' },
          { id: 'number-properties', name: 'Properties of Numbers', description: 'Even/odd, factors, multiples, prime numbers' }
        ]
      },
      {
        id: 'fractions-decimals',
        name: 'Fractions and Decimals',
        description: 'Understanding parts of whole and decimal notation',
        subtopics: [
          { id: 'fraction-concepts', name: 'Fraction Concepts', description: 'Parts of whole, equivalent fractions, comparing fractions' },
          { id: 'fraction-operations', name: 'Operations with Fractions', description: 'Adding, subtracting, multiplying simple fractions' },
          { id: 'decimal-concepts', name: 'Decimal Numbers', description: 'Decimal notation, place value, decimal-fraction relationship' },
          { id: 'decimal-operations', name: 'Decimal Operations', description: 'Adding, subtracting decimals in practical contexts' }
        ]
      },
      {
        id: 'measurement-geometry',
        name: 'Measurement and Geometry',
        description: 'Spatial concepts and measurement skills',
        subtopics: [
          { id: 'length-measurement', name: 'Length and Distance', description: 'Units of length, measuring, estimating distances' },
          { id: 'area-perimeter', name: 'Area and Perimeter', description: 'Calculating area and perimeter of basic shapes' },
          { id: 'time-measurement', name: 'Time and Calendar', description: 'Reading clocks, calendar skills, time calculations' },
          { id: 'basic-shapes', name: 'Basic Geometric Shapes', description: '2D and 3D shapes, properties, classification' },
          { id: 'mass-capacity', name: 'Mass and Capacity', description: 'Weighing, measuring liquids, unit conversions' }
        ]
      },
      {
        id: 'money-economics',
        name: 'Money and Basic Economics',
        description: 'Financial literacy and money management',
        subtopics: [
          { id: 'money-recognition', name: 'Money Recognition', description: 'Tanzanian currency, coin and note values' },
          { id: 'money-calculations', name: 'Money Calculations', description: 'Making change, simple transactions, budgeting' },
          { id: 'saving-spending', name: 'Saving and Spending', description: 'Basic financial planning, needs vs wants' },
          { id: 'simple-interest', name: 'Simple Interest', description: 'Basic concepts of borrowing and lending (Standards VI-VII)' }
        ]
      },
      {
        id: 'data-statistics',
        name: 'Data Handling and Statistics',
        description: 'Collecting, organizing and interpreting data',
        subtopics: [
          { id: 'data-collection', name: 'Data Collection', description: 'Surveys, tallying, organizing information' },
          { id: 'graphs-charts', name: 'Graphs and Charts', description: 'Bar graphs, pictographs, simple pie charts' },
          { id: 'data-interpretation', name: 'Data Interpretation', description: 'Reading graphs, drawing conclusions from data' },
          { id: 'probability-basics', name: 'Basic Probability', description: 'Likelihood, chance events, simple predictions' }
        ]
      },
      {
        id: 'patterns-algebra',
        name: 'Patterns and Early Algebra',
        description: 'Pattern recognition and algebraic thinking',
        subtopics: [
          { id: 'number-patterns', name: 'Number Patterns', description: 'Sequences, skip counting, pattern rules' },
          { id: 'shape-patterns', name: 'Shape and Color Patterns', description: 'Visual patterns, extending sequences' },
          { id: 'simple-equations', name: 'Simple Equations', description: 'Missing number problems, balance concepts' },
          { id: 'problem-solving', name: 'Mathematical Problem Solving', description: 'Word problems, logical reasoning, multiple strategies' }
        ]
      }
    ]
  },
  {
    id: 'science-primary',
    name: 'Science and Technology',
    code: 'SCI',
    isCore: true,
    topics: [
      {
        id: 'living-things-processes',
        name: 'Living Things and Life Processes',
        description: 'Understanding life, organisms and biological processes',
        subtopics: [
          { id: 'plants-animals', name: 'Plants and Animals', description: 'Classification, characteristics, habitats' },
          { id: 'human-body', name: 'Human Body Systems', description: 'Body parts, functions, health and hygiene' },
          { id: 'life-cycles', name: 'Life Cycles', description: 'Growth, reproduction, life stages of organisms' },
          { id: 'nutrition-feeding', name: 'Nutrition and Feeding', description: 'Food chains, balanced diet, feeding relationships' },
          { id: 'adaptation-environment', name: 'Adaptation to Environment', description: 'How organisms adapt to their surroundings' }
        ]
      },
      {
        id: 'materials-properties',
        name: 'Materials and Their Properties',
        description: 'Understanding matter and material properties',
        subtopics: [
          { id: 'states-matter', name: 'States of Matter', description: 'Solids, liquids, gases and their properties' },
          { id: 'material-classification', name: 'Material Classification', description: 'Natural vs artificial, properties and uses' },
          { id: 'changes-materials', name: 'Changes in Materials', description: 'Physical and chemical changes, reversible/irreversible' },
          { id: 'recycling-waste', name: 'Recycling and Waste Management', description: 'Environmental responsibility, reuse, reduce' }
        ]
      },
      {
        id: 'physical-processes',
        name: 'Physical Processes',
        description: 'Forces, energy and physical phenomena',
        subtopics: [
          { id: 'forces-motion', name: 'Forces and Motion', description: 'Push, pull, friction, simple machines' },
          { id: 'light-sound', name: 'Light and Sound', description: 'Sources, properties, reflection, shadows' },
          { id: 'heat-temperature', name: 'Heat and Temperature', description: 'Sources of heat, effects, measurement' },
          { id: 'electricity-magnetism', name: 'Electricity and Magnetism', description: 'Simple circuits, magnets, safety' }
        ]
      },
      {
        id: 'earth-space-science',
        name: 'Earth and Space Science',
        description: 'Understanding our planet and the universe',
        subtopics: [
          { id: 'weather-climate', name: 'Weather and Climate', description: 'Weather patterns, seasons, climate change' },
          { id: 'rocks-soil', name: 'Rocks and Soil', description: 'Types of rocks, soil formation, erosion' },
          { id: 'water-cycle', name: 'Water Cycle', description: 'Evaporation, condensation, precipitation' },
          { id: 'solar-system', name: 'Solar System', description: 'Sun, moon, planets, day and night' }
        ]
      },
      {
        id: 'technology-society',
        name: 'Technology and Society',
        description: 'Technology applications and digital literacy',
        subtopics: [
          { id: 'simple-technology', name: 'Simple Technology', description: 'Tools, machines, inventions in daily life' },
          { id: 'communication-technology', name: 'Communication Technology', description: 'Phones, internet, media, responsible use' },
          { id: 'transport-technology', name: 'Transport Technology', description: 'Vehicles, safety, environmental impact' },
          { id: 'digital-literacy', name: 'Basic Digital Literacy', description: 'Computer basics, internet safety, digital citizenship' }
        ]
      },
      {
        id: 'health-safety',
        name: 'Health and Safety',
        description: 'Personal and community health practices',
        subtopics: [
          { id: 'personal-hygiene', name: 'Personal Hygiene', description: 'Cleanliness, dental care, grooming' },
          { id: 'nutrition-health', name: 'Nutrition and Health', description: 'Balanced diet, food safety, malnutrition prevention' },
          { id: 'disease-prevention', name: 'Disease Prevention', description: 'Common diseases, vaccination, first aid' },
          { id: 'safety-practices', name: 'Safety Practices', description: 'Home safety, road safety, emergency procedures' }
        ]
      }
    ]
  },
  {
    id: 'social-studies-primary',
    name: 'Social Studies',
    code: 'SS',
    isCore: true,
    topics: [
      {
        id: 'family-community-life',
        name: 'Family and Community Life',
        description: 'Understanding social relationships and community structures',
        subtopics: [
          { id: 'family-structure', name: 'Family Structure and Roles', description: 'Family members, responsibilities, relationships' },
          { id: 'community-services', name: 'Community Services', description: 'Schools, hospitals, markets, government offices' },
          { id: 'cultural-diversity', name: 'Cultural Diversity', description: 'Different cultures, traditions, languages in Tanzania' },
          { id: 'social-values', name: 'Social Values and Norms', description: 'Respect, cooperation, honesty, ubuntu philosophy' }
        ]
      },
      {
        id: 'geography-environment',
        name: 'Geography and Environment',
        description: 'Physical and human geography of Tanzania and beyond',
        subtopics: [
          { id: 'physical-features', name: 'Physical Features', description: 'Mountains, rivers, lakes, climate zones' },
          { id: 'human-activities', name: 'Human Activities', description: 'Farming, fishing, mining, tourism' },
          { id: 'environmental-conservation', name: 'Environmental Conservation', description: 'Protecting nature, sustainable practices' },
          { id: 'map-skills', name: 'Basic Map Skills', description: 'Reading maps, directions, symbols, scale' }
        ]
      },
      {
        id: 'history-heritage',
        name: 'History and Cultural Heritage',
        description: 'Tanzania\'s past and cultural identity',
        subtopics: [
          { id: 'local-history', name: 'Local History', description: 'Community origins, historical sites, oral traditions' },
          { id: 'national-history', name: 'National History', description: 'Independence, national heroes, important events' },
          { id: 'cultural-practices', name: 'Cultural Practices', description: 'Traditional ceremonies, festivals, customs' },
          { id: 'historical-sources', name: 'Historical Sources', description: 'Artifacts, stories, documents, archaeological sites' }
        ]
      },
      {
        id: 'civics-citizenship',
        name: 'Civics and Citizenship',
        description: 'Rights, responsibilities and democratic participation',
        subtopics: [
          { id: 'rights-responsibilities', name: 'Rights and Responsibilities', description: 'Children\'s rights, civic duties, law and order' },
          { id: 'government-structure', name: 'Government Structure', description: 'Local government, national government, leadership' },
          { id: 'democratic-values', name: 'Democratic Values', description: 'Participation, voting, decision-making, consensus' },
          { id: 'national-symbols', name: 'National Symbols', description: 'Flag, anthem, coat of arms, national identity' }
        ]
      }
    ]
  },
  {
    id: 'civics-morals-primary',
    name: 'Civics and Morals',
    code: 'CM',
    isCore: true,
    topics: [
      {
        id: 'moral-values',
        name: 'Moral Values and Ethics',
        description: 'Character development and ethical behavior',
        subtopics: [
          { id: 'honesty-integrity', name: 'Honesty and Integrity', description: 'Truthfulness, trustworthiness, reliability' },
          { id: 'respect-tolerance', name: 'Respect and Tolerance', description: 'Respecting others, diversity, peaceful coexistence' },
          { id: 'responsibility-accountability', name: 'Responsibility and Accountability', description: 'Personal responsibility, consequences of actions' },
          { id: 'compassion-empathy', name: 'Compassion and Empathy', description: 'Caring for others, helping those in need' }
        ]
      }
    ]
  },
  {
    id: 'religious-studies-primary',
    name: 'Religious Studies',
    code: 'RS',
    isCore: true,
    topics: [
      {
        id: 'religious-education',
        name: 'Religious Education',
        description: 'Spiritual and moral development through religious teachings',
        subtopics: [
          { id: 'christian-education', name: 'Christian Religious Education', description: 'Bible stories, Christian values, prayers' },
          { id: 'islamic-education', name: 'Islamic Religious Education', description: 'Quran teachings, Islamic values, prayers' },
          { id: 'moral-teachings', name: 'Universal Moral Teachings', description: 'Common values across religions, peace, love' }
        ]
      }
    ]
  },
  {
    id: 'vocational-skills-primary',
    name: 'Vocational Skills',
    code: 'VS',
    isCore: false,
    topics: [
      {
        id: 'practical-skills',
        name: 'Practical Life Skills',
        description: 'Hands-on skills for daily life and future careers (Standards V-VII)',
        subtopics: [
          { id: 'agriculture-gardening', name: 'Agriculture and Gardening', description: 'Growing crops, animal care, sustainable farming' },
          { id: 'handicrafts-arts', name: 'Handicrafts and Arts', description: 'Traditional crafts, pottery, weaving, woodwork' },
          { id: 'home-economics', name: 'Home Economics', description: 'Cooking, nutrition, household management' },
          { id: 'basic-entrepreneurship', name: 'Basic Entrepreneurship', description: 'Business ideas, saving, simple trade' },
          { id: 'technical-skills', name: 'Basic Technical Skills', description: 'Simple repairs, tool use, construction basics' }
        ]
      }
    ]
  },
  // Elective subjects for Standards III-VII
  {
    id: 'arabic-primary',
    name: 'Arabic Language',
    code: 'AR',
    isElective: true,
    topics: [
      {
        id: 'arabic-basics',
        name: 'Basic Arabic Language Skills',
        description: 'Introduction to Arabic language and script',
        subtopics: [
          { id: 'arabic-alphabet', name: 'Arabic Alphabet', description: 'Letter recognition, writing, pronunciation' },
          { id: 'basic-vocabulary', name: 'Basic Vocabulary', description: 'Common words, greetings, numbers' },
          { id: 'simple-sentences', name: 'Simple Sentences', description: 'Basic sentence construction, reading' }
        ]
      }
    ]
  },
  {
    id: 'french-primary',
    name: 'French Language',
    code: 'FR',
    isElective: true,
    topics: [
      {
        id: 'french-basics',
        name: 'Basic French Language Skills',
        description: 'Introduction to French language',
        subtopics: [
          { id: 'french-alphabet', name: 'French Alphabet and Pronunciation', description: 'Letter sounds, basic pronunciation rules' },
          { id: 'basic-french-vocabulary', name: 'Basic Vocabulary', description: 'Common words, greetings, classroom language' },
          { id: 'simple-french-sentences', name: 'Simple Sentences', description: 'Basic sentence patterns, questions' }
        ]
      }
    ]
  },
  {
    id: 'chinese-primary',
    name: 'Chinese Language',
    code: 'CH',
    isElective: true,
    topics: [
      {
        id: 'chinese-basics',
        name: 'Basic Chinese Language Skills',
        description: 'Introduction to Mandarin Chinese',
        subtopics: [
          { id: 'pinyin-tones', name: 'Pinyin and Tones', description: 'Pronunciation system, four tones' },
          { id: 'basic-characters', name: 'Basic Characters', description: 'Simple Chinese characters, stroke order' },
          { id: 'basic-chinese-vocabulary', name: 'Basic Vocabulary', description: 'Numbers, family, colors, greetings' }
        ]
      }
    ]
  }
];

// Ordinary Secondary Education Subjects (Forms I-IV) - 2025 Competence-Based Curriculum
const secondarySubjects: Subject[] = [
  {
    id: 'kiswahili-secondary',
    name: 'Kiswahili',
    code: 'KIS',
    isCore: true,
    topics: [
      {
        id: 'lugha-ya-kiswahili-sekondari',
        name: 'Lugha ya Kiswahili',
        description: 'Advanced Kiswahili language skills and grammar',
        subtopics: [
          { id: 'sarufi-ya-juu', name: 'Sarufi ya Juu', description: 'Advanced grammar, syntax, morphology' },
          { id: 'semantiki-na-pragmatiki', name: 'Semantiki na Pragmatiki', description: 'Meaning and language use in context' },
          { id: 'fonolojia-na-morfolojia', name: 'Fonolojia na Morfolojia', description: 'Sound systems and word formation' },
          { id: 'sintaksia', name: 'Sintaksia', description: 'Sentence structure and analysis' }
        ]
      },
      {
        id: 'fasihi-simulizi-sekondari',
        name: 'Fasihi Simulizi',
        description: 'Oral literature analysis and appreciation',
        subtopics: [
          { id: 'aina-za-fasihi-simulizi', name: 'Aina za Fasihi Simulizi', description: 'Types of oral literature: myths, legends, folktales' },
          { id: 'vipengele-vya-fasihi', name: 'Vipengele vya Fasihi Simulizi', description: 'Elements: plot, character, theme, style' },
          { id: 'utanzu-wa-fasihi', name: 'Utanzu wa Fasihi Simulizi', description: 'Classification and analysis of oral genres' },
          { id: 'uhakiki-wa-fasihi', name: 'Uhakiki wa Fasihi Simulizi', description: 'Critical analysis and interpretation' }
        ]
      },
      {
        id: 'fasihi-andishi-sekondari',
        name: 'Fasihi Andishi',
        description: 'Written literature study and analysis',
        subtopics: [
          { id: 'riwaya', name: 'Riwaya', description: 'Novel analysis: structure, themes, characters' },
          { id: 'tamthilia', name: 'Tamthilia', description: 'Drama analysis: dialogue, conflict, staging' },
          { id: 'ushairi', name: 'Ushairi', description: 'Poetry analysis: meter, rhyme, imagery, themes' },
          { id: 'hadithi-fupi', name: 'Hadithi Fupi', description: 'Short story analysis: plot, character development' }
        ]
      },
      {
        id: 'utungaji-na-ubunifu',
        name: 'Utungaji na Ubunifu',
        description: 'Creative writing and composition',
        subtopics: [
          { id: 'utungaji-mashairi', name: 'Utungaji wa Mashairi', description: 'Poetry composition: traditional and modern forms' },
          { id: 'uandishi-hadithi', name: 'Uandishi wa Hadithi', description: 'Story writing: plot development, characterization' },
          { id: 'uandishi-insha', name: 'Uandishi wa Insha', description: 'Essay writing: argumentative, descriptive, narrative' },
          { id: 'utungaji-tamthilia', name: 'Utungaji wa Tamthilia', description: 'Drama writing: dialogue, stage directions' }
        ]
      },
      {
        id: 'mazungumzo-na-mawasiliano',
        name: 'Mazungumzo na Mawasiliano',
        description: 'Communication and speaking skills',
        subtopics: [
          { id: 'mazungumzo-rasmi', name: 'Mazungumzo Rasmi', description: 'Formal conversations and presentations' },
          { id: 'hotuba', name: 'Hotuba', description: 'Public speaking and speech delivery' },
          { id: 'mjadala', name: 'Mjadala', description: 'Debates and argumentative discussions' },
          { id: 'mawasiliano-kijamii', name: 'Mawasiliano ya Kijamii', description: 'Social communication and media literacy' }
        ]
      },
      {
        id: 'ufasiri-na-utafsiri',
        name: 'Ufasiri na Utafsiri',
        description: 'Translation and interpretation skills',
        subtopics: [
          { id: 'ufasiri-kiingereza', name: 'Ufasiri Kiswahili-Kiingereza', description: 'Swahili-English translation techniques' },
          { id: 'utafsiri-mazungumzo', name: 'Utafsiri wa Mazungumzo', description: 'Oral interpretation skills' },
          { id: 'ufasiri-maandishi', name: 'Ufasiri wa Maandishi', description: 'Written translation methods' },
          { id: 'teknolojia-ufasiri', name: 'Teknolojia ya Ufasiri', description: 'Computer-assisted translation tools' }
        ]
      }
    ]
  },
  {
    id: 'english-secondary',
    name: 'English Language',
    code: 'ENG',
    isCore: true,
    topics: [
      {
        id: 'information-search-form1-3',
        name: 'Manage information search from different sources for lifelong learning',
        description: 'ICT tools and information organization skills',
        subtopics: [
          {
            id: 'ict-search-tools',
            name: 'Use ICT tools to search for information (Form I)',
            description: 'Search engines (Google, Google Scholar, Bing), ICT tools for information search'
          },
          {
            id: 'information-organization',
            name: 'Organise information obtained from different sources (Form III)',
            description: 'Strategies for organizing information, sorting and categorizing, compiling information'
          }
        ]
      },
      {
        id: 'english-language-mastery',
        name: 'Demonstrate mastery of English language skills',
        description: 'Core language competencies across all forms',
        subtopics: [
          {
            id: 'listening-skills',
            name: 'Develop listening skills',
            description: 'Answer questions from presentations, pronunciation practice, reproduce messages'
          },
          {
            id: 'oral-communication',
            name: 'Produce short and coherent oral messages',
            description: 'Pronunciation, word stress, minimal sound distinctions, intonation, cohesive devices'
          },
          {
            id: 'vocabulary-development',
            name: 'Develop vocabulary from conversations and texts',
            description: 'New vocabulary from topics, sentence construction, vocabulary games, synonyms/antonyms'
          },
          {
            id: 'grammar-usage',
            name: 'Use appropriate grammar and vocabulary',
            description: 'Tenses, articles, pronouns, coordinators, prepositions, adjectives, adverbs, debates'
          }
        ]
      },
      {
        id: 'comprehension-skills',
        name: 'Comprehend oral and written information',
        description: 'Reading and listening comprehension across forms',
        subtopics: [
          {
            id: 'text-comprehension',
            name: 'Read texts for comprehension',
            description: 'Sequence events, summarize stories, retell stories, main ideas, inferences'
          },
          {
            id: 'oral-comprehension',
            name: 'Comprehend oral messages with increasing difficulty',
            description: 'Paraphrase messages, respond to contexts, synthesize ideas from sources'
          },
          {
            id: 'communication-contexts',
            name: 'Respond appropriately in communication contexts',
            description: 'Express ideas/opinions, non-verbal cues, interpersonal communication, group settings'
          },
          {
            id: 'meaning-construction',
            name: 'Construct meaning from variety of texts',
            description: 'Compare ideas, generate meanings, infer unfamiliar words, paraphrase multiple sources'
          }
        ]
      },
      {
        id: 'effective-communication',
        name: 'Communicate effectively in different contexts',
        description: 'Advanced communication skills',
        subtopics: [
          {
            id: 'oral-communication-contexts',
            name: 'Use appropriate grammar for oral communication',
            description: 'Daily routines, ongoing activities, family relationships, directions, descriptions'
          },
          {
            id: 'text-creation',
            name: 'Create variety of texts for different purposes',
            description: 'Writing stages, friendly letters, dialogues, timetables, emails, stories, reports'
          },
          {
            id: 'functional-texts',
            name: 'Conduct socio-cultural analysis of functional texts',
            description: 'Analyze purpose/content/format, read functional texts, compose for various purposes'
          }
        ]
      },
      {
        id: 'language-services',
        name: 'Provide basic English language services to the community',
        description: 'Professional language skills (Forms III-IV)',
        subtopics: [
          {
            id: 'editing-proofreading',
            name: 'Apply principles of editing and proofreading',
            description: 'Basic principles, sentence construction, grammar, edit school and community texts'
          },
          {
            id: 'interpretation-services',
            name: 'Apply principles of interpretation',
            description: 'Interpretation concepts, English-Kiswahili interpretation in various contexts'
          },
          {
            id: 'translation-services',
            name: 'Apply principles of translation',
            description: 'Translation concepts, translate various texts, Computer-Assisted Translation Tools'
          }
        ]
      },
      {
        id: 'literary-appreciation',
        name: 'Appreciate and create literary works',
        description: 'Literature analysis and creative writing (Forms III-IV)',
        subtopics: [
          {
            id: 'aesthetics-literature',
            name: 'Appreciate aesthetics and value of literature',
            description: 'Language assessment in poems/plays/novellas, compare values and perspectives'
          },
          {
            id: 'literary-context',
            name: 'Evaluate context of literary texts',
            description: 'Socio-political and cultural contexts, relate to real life experiences'
          },
          {
            id: 'literary-analysis',
            name: 'Analyse genres and conventions',
            description: 'Different genres, critiquing techniques, analyze form and content'
          },
          {
            id: 'creative-writing',
            name: 'Create simple literary works',
            description: 'Compose poems, short stories, publish on various platforms'
          }
        ]
      }
    ]
  },
  {
    id: 'mathematics-secondary',
    name: 'Mathematics',
    code: 'MATH',
    isCore: true,
    topics: [
      {
        id: 'mathematical-language-form1',
        name: 'Demonstrate mastery of mathematical language (Form I)',
        description: 'Foundation mathematical concepts and numerical skills',
        subtopics: [
          {
            id: 'numerical-skills',
            name: 'Use numerical skills in different contexts',
            description: 'Explain the basic concepts of Mathematics (Meaning of mathematics, branches of mathematics, relationship between mathematics and other subjects, importance of mathematics); Explain the concept of rational, irrational, and real numbers; Convert repeating/recurring decimals into fractions and vice versa; Represent rational numbers on a number line; Explain the concept of inequalities and absolute values of real numbers; Describe the importance of numbers in real-life situations'
          },
          {
            id: 'ratios-proportions',
            name: 'Use ratios and proportions in daily life',
            description: 'Explain the concept of ratios and proportions; Solve ratio and proportion problems'
          }
        ]
      },
      {
        id: 'geometry-algebra-form1',
        name: 'Demonstrate mastery of basic concepts in geometry and algebra (Form I)',
        description: 'Foundational geometry and algebra skills',
        subtopics: [
          {
            id: 'approximations-geometry',
            name: 'Use geometry, approximations, relations and functions in various contexts',
            description: 'Explain the concept of approximations (rounding off, significant figures, and decimal places); Round off numbers and estimate values of expressions; Approximate numbers to the required significant figures and decimal places; Use approximations in computations and measurements of quantities in various contexts'
          },
          {
            id: 'algebra-matrices',
            name: 'Use algebra and matrices in problem solving',
            description: 'Explore the basic tenets of algebra (algebraic expressions and equations, linear simultaneous equations of two unknowns, inequalities in one unknown); Use algebraic expressions to model situations (word problems into algebraic expressions and equations); Solve simultaneous equations using substitution and elimination methods; Solve inequalities in one unknown'
          },
          {
            id: 'coordinate-geometry-basic',
            name: 'Use basic coordinate geometry, trigonometry and vectors skills in daily life',
            description: 'Explore the basic tenets of coordinate geometry (gradient and equations of a straight line, graphs of linear equations); Find the gradient/slope of a line; Determine the equation of a straight line and draw its graph; Solve linear simultaneous equations graphically; Use mathematical software to solve and draw graphs of simultaneous equations'
          }
        ]
      },
      {
        id: 'rates-variations-form2',
        name: 'Use rates and variations in different contexts (Form II)',
        description: 'Advanced numerical applications',
        subtopics: [
          {
            id: 'rates-variations',
            name: 'Use rates and variations in different contexts',
            description: 'Describe the concepts of rates and variations; Solve problems on rates and variations'
          }
        ]
      },
      {
        id: 'advanced-geometry-algebra-form2',
        name: 'Demonstrate mastery of basic concepts in geometry and algebra (Form II)',
        description: 'Building on Form I foundations',
        subtopics: [
          {
            id: 'similarities-congruence',
            name: 'Use geometry, approximations, relations and functions in various contexts',
            description: 'Describe the concepts of geometry (similarities and congruence); Recognize properties of similar triangles; Explain postulates, proofs, and theorems of congruent triangles'
          },
          {
            id: 'advanced-algebra',
            name: 'Use algebra and matrices in problem solving',
            description: 'Explore the basic tenets of algebra (binary operations, quadratic expressions and equations, radicals, exponents, and logarithms); Solve quadratic equations by using different methods (factorisation, Completing the square, and quadratic formula); Identify and use laws of exponents involving positive, negative, and zero exponents (multiplication law, division law, power law, and zero index); Write numbers in standard form; Use laws of logarithms to solve problems; Perform operations on radicals and rationalize the denominators'
          },
          {
            id: 'sets-sequences',
            name: 'Use sets, sequences and series in problem solving',
            description: 'Explore the basic tenets of sets (types of sets, subsets, operation with sets, and Venn diagrams of two sets); Distinguish among different types of sets (universal set, equal sets, empty/null set, finite and infinite sets, equivalent sets, and disjoint sets); Compare sets (subsets and universal sets); Perform operations with sets (union, intersection, and complement of a set); Represent two sets in a Venn diagram; Find the number of elements in a set'
          },
          {
            id: 'trigonometry-basics',
            name: 'Use basic coordinate geometry, trigonometry and vectors skills in daily life',
            description: 'Explore the basic tenets of trigonometry (trigonometric ratios, angles of elevation and depression); Determine trigonometric ratios of angles and special angles; Calculate angles of elevation and depression'
          }
        ]
      },
      {
        id: 'relations-functions-form3',
        name: 'Demonstrate mastery of basic concepts in geometry and algebra (Form III)',
        description: 'Advanced mathematical relationships',
        subtopics: [
          {
            id: 'relations-functions',
            name: 'Use geometry, approximations, relations and functions in various contexts',
            description: 'Describe the concepts of relations and functions (linear and quadratic) (types of relations, domain and range of relations, graphs of relations and functions, inverse of relations, and functions); Find the domain and range of relations and functions; Find the inverses of relations and functions; Draw graphs of relations and functions'
          },
          {
            id: 'linear-programming',
            name: 'Use algebra and matrices in problem solving',
            description: 'Explore the basic tenets of algebra (linear programming: constraints, objective functions, and optimal solution)'
          },
          {
            id: 'sequences-series-advanced',
            name: 'Use sets, sequences and series in problem solving',
            description: 'Explore the basic tenets of sequences and series (Arithmetic progression AP, Geometric progression GP); Find the general term for AP and GP and use them to derive formulae for the sums of APs and GPs; Calculate arithmetic mean, geometric mean, and compound interest'
          },
          {
            id: 'circle-properties',
            name: 'Use basic skills of circles in daily life',
            description: 'Explore the basic tenets of a circle (angle properties, theorems, tangents, chords and radians)'
          }
        ]
      },
      {
        id: 'matrices-advanced-topics-form4',
        name: 'Demonstrate mastery of basic concepts in geometry and algebra (Form IV)',
        description: 'Complex mathematical concepts',
        subtopics: [
          {
            id: 'matrices-operations',
            name: 'Use algebra and matrices in problem solving',
            description: "Explore the basic tenets of matrices (2×2 matrices: operations, determinant, inverse, and transformations); Apply matrices to solve simultaneous equations of two unknowns (matrix inversion method and Cramer's rule)"
          }
        ]
      },
      {
        id: 'coordinate-trigonometry-vectors-form4',
        name: 'Demonstrate mastery of basic concepts in coordinate geometry, trigonometry, circles, vectors, probability and statistics (Form IV)',
        description: 'Advanced mathematical concepts',
        subtopics: [
          {
            id: 'coordinate-geometry-advanced',
            name: 'Use basic coordinate geometry, trigonometry, and vectors skills in daily life',
            description: 'Explore the basic tenets of coordinate geometry (midpoint of a line segment, distance between two points on a line, parallel, and perpendicular lines); Apply sine and cosine rules to find distances or angles of elevation; Derive and use compound angles to solve problems; Explore the basic tenets of vectors (displacement and position vectors, magnitude and direction, sum and differences, multiplication of vectors by a scalar)'
          },
          {
            id: 'probability-statistics',
            name: 'Use probability and statistics in problem solving',
            description: "Explore the basic tenets of probability of two events (probability of an event, mutually exclusive events, dependent events, combined events using tree diagrams, tables and formulae); Explore the basic tenets of statistics (frequency distribution, measures of central tendency, histogram, frequency polygon, and cumulative frequency curve 'ogive')"
          }
        ]
      }
    ]
  },
  {
    id: 'physics-secondary',
    name: 'Physics',
    code: 'PHY',
    isElective: true,
    topics: [
      {
        id: 'physics-introduction-form1',
        name: 'Introduction to Physics and Laboratory Practice (Form I)',
        description: 'Foundation concepts and scientific methodology',
        subtopics: [
          { id: 'physics-concept', name: 'Concept of Physics', description: 'Definition, branches, relationship with other subjects, importance' },
          { id: 'physics-applications', name: 'Applications of Physics in Real Life', description: 'Practical applications in daily life' },
          { id: 'lab-safety', name: 'Laboratory Rules and Safety', description: 'Safety procedures, laboratory conduct' },
          { id: 'scientific-investigation', name: 'Basic Principles of Scientific Investigation', description: 'Scientific method, observation, hypothesis' }
        ]
      },
      {
        id: 'measurement-form1',
        name: 'Measurement (Form I)',
        description: 'Fundamental and derived quantities',
        subtopics: [
          { id: 'measurement-concepts', name: 'Concepts of Measurement', description: 'Importance of measurement, accuracy, precision' },
          { id: 'fundamental-quantities', name: 'Fundamental Quantities', description: 'Length, mass, time, temperature, current, luminous intensity' },
          { id: 'derived-quantities', name: 'Derived Quantities', description: 'Area, volume, velocity, acceleration, force' },
          { id: 'apparatus-equipment', name: 'Basic Apparatus/Equipment and their Uses', description: 'Measuring instruments, proper usage' },
          { id: 'density-relative-density', name: 'Density and Relative Density', description: 'Calculations, applications, measurements' }
        ]
      },
      {
        id: 'force-mechanics-form1',
        name: 'Force and Mechanics (Form I)',
        description: 'Basic force concepts and applications',
        subtopics: [
          { id: 'force-concept', name: 'Concept of Force', description: 'Definition, units, representation' },
          { id: 'force-types', name: 'Types of Forces', description: 'Contact and non-contact forces, examples' },
          { id: 'force-effects', name: 'Effects of Forces', description: 'Change in motion, deformation, direction' },
          { id: 'archimedes-principle', name: 'Archimedes Principle', description: 'Buoyancy, floating and sinking' },
          { id: 'flotation-law', name: 'Law of Flotation', description: 'Conditions for floating, applications' }
        ]
      },
      {
        id: 'matter-properties-form1',
        name: 'Structure and Properties of Matter (Form I)',
        description: 'Molecular theory and material properties',
        subtopics: [
          { id: 'matter-structure', name: 'Structure of Matter', description: 'Kinetic theory, states of matter, molecular motion' },
          { id: 'elasticity', name: 'Elasticity', description: 'Elastic and plastic deformation, Hooke\'s law' },
          { id: 'adhesion-cohesion', name: 'Adhesion and Cohesion', description: 'Intermolecular forces, applications' },
          { id: 'surface-tension', name: 'Surface Tension', description: 'Surface phenomena, applications' },
          { id: 'capillarity', name: 'Capillarity', description: 'Capillary action, practical examples' },
          { id: 'osmosis', name: 'Osmosis', description: 'Osmotic pressure, biological applications' }
        ]
      },
      {
        id: 'pressure-form1',
        name: 'Pressure (Form I)',
        description: 'Pressure in solids, liquids, and gases',
        subtopics: [
          { id: 'pressure-concept', name: 'Concept of Pressure', description: 'Definition, units, calculations' },
          { id: 'solid-pressure', name: 'Pressure due to Solids', description: 'Pressure in solids, applications' },
          { id: 'liquid-pressure', name: 'Pressure in Liquids', description: 'Hydrostatic pressure, Pascal\'s principle' },
          { id: 'atmospheric-pressure', name: 'Atmospheric Pressure', description: 'Barometric pressure, altitude effects' }
        ]
      },
      {
        id: 'energy-work-power-form1',
        name: 'Work, Energy and Power (Form I)',
        description: 'Energy concepts and transformations',
        subtopics: [
          { id: 'work-concept', name: 'Work', description: 'Definition, calculations, work-energy theorem' },
          { id: 'energy-types', name: 'Energy', description: 'Forms of energy, conservation, transformations' },
          { id: 'power-concept', name: 'Power', description: 'Definition, calculations, efficiency' }
        ]
      },
      {
        id: 'light-form1',
        name: 'Light (Form I)',
        description: 'Basic optics and light behavior',
        subtopics: [
          { id: 'light-sources', name: 'Sources of Light', description: 'Natural and artificial sources' },
          { id: 'light-propagation', name: 'Propagation and Transmission of Light', description: 'Straight line propagation, shadows' },
          { id: 'light-reflection', name: 'Reflection of Light', description: 'Laws of reflection, plane mirrors' }
        ]
      },
      {
        id: 'electricity-magnetism-form2',
        name: 'Electricity and Magnetism (Form II)',
        description: 'Electrical and magnetic phenomena',
        subtopics: [
          { id: 'static-electricity', name: 'Static Electricity', description: 'Charge detection, conductors/insulators, capacitors' },
          { id: 'current-electricity', name: 'Current Electricity', description: 'Electric circuits, current, voltage' },
          { id: 'magnetism-concepts', name: 'Magnetism', description: 'Magnetic fields, magnetization, Earth\'s magnetism' }
        ]
      },
      {
        id: 'advanced-mechanics-form2',
        name: 'Advanced Mechanics (Form II)',
        description: 'Forces, motion, and simple machines',
        subtopics: [
          { id: 'equilibrium-forces', name: 'Forces in Equilibrium', description: 'Moment of force, center of gravity, equilibrium types' },
          { id: 'simple-machines', name: 'Simple Machines', description: 'Levers, pulleys, inclined plane, mechanical advantage' },
          { id: 'motion-straight-line', name: 'Motion in Straight Line', description: 'Kinematics, equations of motion, graphs' },
          { id: 'newton-laws', name: 'Newton\'s Laws of Motion', description: 'Three laws, momentum conservation, applications' }
        ]
      },
      {
        id: 'temperature-energy-form2',
        name: 'Temperature and Sustainable Energy (Form II)',
        description: 'Thermal concepts and renewable energy',
        subtopics: [
          { id: 'temperature-concept', name: 'Concept of Temperature', description: 'Temperature scales, measurement' },
          { id: 'sustainable-energy', name: 'Sustainable Energy Sources', description: 'Solar, wind, water, geothermal, wave energy' }
        ]
      },
      {
        id: 'advanced-physics-form3',
        name: 'Advanced Physics Concepts (Form III)',
        description: 'Complex physics phenomena and applications',
        subtopics: [
          { id: 'vectors-applications', name: 'Applications of Vectors', description: 'Scalar vs vector, relative motion, vector resolution' },
          { id: 'friction-detailed', name: 'Friction', description: 'Types of friction, laws of friction, coefficient of friction' },
          { id: 'advanced-optics', name: 'Advanced Light Concepts', description: 'Curved mirrors, refraction, lenses, optical instruments' },
          { id: 'thermal-expansion', name: 'Thermal Expansion', description: 'Expansion of solids/liquids/gases, applications' },
          { id: 'heat-transfer', name: 'Transfer of Thermal Energy', description: 'Conduction, convection, radiation' },
          { id: 'thermal-measurement', name: 'Measurement of Thermal Energy', description: 'Heat capacity, specific heat, change of state' },
          { id: 'vapour-humidity', name: 'Vapour and Humidity', description: 'Evaporation, saturated vapour, relative humidity' },
          { id: 'advanced-electricity', name: 'Advanced Current Electricity', description: 'EMF, resistance, electrical power, installations' }
        ]
      },
      {
        id: 'waves-modern-physics-form4',
        name: 'Waves and Modern Physics (Form IV)',
        description: 'Wave phenomena and contemporary physics',
        subtopics: [
          { id: 'wave-introduction', name: 'Introduction to Waves', description: 'Wave properties, types, behavior' },
          { id: 'sound-waves', name: 'Sound Waves', description: 'Sound propagation, musical instruments, resonance' },
          { id: 'electromagnetic-spectrum', name: 'Electromagnetic Spectrum', description: 'EM waves, applications in daily life' },
          { id: 'electromagnetism', name: 'Electromagnetism', description: 'Magnetic fields from current, electromagnetic induction' },
          { id: 'radioactivity', name: 'Artificial Radioactivity', description: 'Nuclear reactions, radiation safety' },
          { id: 'electronics-basics', name: 'Electronics', description: 'Semiconductors, diodes, transistors, amplifiers' },
          { id: 'astronomy', name: 'Elementary Astronomy', description: 'Solar system, constellations, Earth and Moon' },
          { id: 'geophysics', name: 'Geophysics', description: 'Earth structure, earthquakes, atmosphere, greenhouse effect' }
        ]
      }
    ]
  },
  {
    id: 'chemistry-secondary',
    name: 'Chemistry',
    code: 'CHEM',
    isElective: true,
    topics: [
      {
        id: 'introduction-chemistry',
        name: 'Introduction to Chemistry',
        description: 'Basic chemical concepts and laboratory skills',
        subtopics: [
          { id: 'chemistry-concept', name: 'Concept of Chemistry', description: 'Definition, branches, importance, applications' },
          { id: 'lab-safety-chem', name: 'Laboratory Safety and Techniques', description: 'Safety rules, apparatus, measurements' },
          { id: 'scientific-method-chem', name: 'Scientific Method in Chemistry', description: 'Observation, hypothesis, experimentation' }
        ]
      },
      {
        id: 'atomic-structure-detailed',
        name: 'Atomic Structure',
        description: 'Structure of atoms and periodic trends',
        subtopics: [
          { id: 'atomic-theory', name: 'Atomic Theory', description: 'Historical development, modern atomic theory' },
          { id: 'subatomic-particles', name: 'Subatomic Particles', description: 'Protons, neutrons, electrons, isotopes' },
          { id: 'electronic-configuration', name: 'Electronic Configuration', description: 'Electron arrangement, orbitals, quantum numbers' },
          { id: 'periodic-table', name: 'Periodic Table', description: 'Periodic trends, groups, periods, properties' }
        ]
      },
      {
        id: 'chemical-bonding-detailed',
        name: 'Chemical Bonding',
        description: 'Types of chemical bonds and molecular structure',
        subtopics: [
          { id: 'ionic-bonding', name: 'Ionic Bonding', description: 'Formation, properties, ionic compounds' },
          { id: 'covalent-bonding', name: 'Covalent Bonding', description: 'Formation, properties, molecular compounds' },
          { id: 'metallic-bonding', name: 'Metallic Bonding', description: 'Properties of metals, alloys' },
          { id: 'intermolecular-forces', name: 'Intermolecular Forces', description: 'Van der Waals forces, hydrogen bonding' }
        ]
      },
      {
        id: 'chemical-reactions-detailed',
        name: 'Chemical Reactions',
        description: 'Types of reactions and reaction mechanisms',
        subtopics: [
          { id: 'reaction-types', name: 'Types of Chemical Reactions', description: 'Synthesis, decomposition, displacement, redox' },
          { id: 'reaction-rates', name: 'Reaction Rates', description: 'Factors affecting rates, catalysts, enzymes' },
          { id: 'chemical-equilibrium', name: 'Chemical Equilibrium', description: 'Equilibrium constants, Le Chatelier\'s principle' },
          { id: 'thermochemistry', name: 'Thermochemistry', description: 'Energy changes, enthalpy, calorimetry' }
        ]
      },
      {
        id: 'acids-bases-salts',
        name: 'Acids, Bases and Salts',
        description: 'Properties and reactions of acids, bases, and salts',
        subtopics: [
          { id: 'acid-base-theories', name: 'Acid-Base Theories', description: 'Arrhenius, Bronsted-Lowry, Lewis theories' },
          { id: 'ph-scale', name: 'pH Scale', description: 'pH calculations, indicators, buffer solutions' },
          { id: 'salt-preparation', name: 'Preparation of Salts', description: 'Methods of salt preparation, crystallization' },
          { id: 'acid-base-titrations', name: 'Acid-Base Titrations', description: 'Titration procedures, calculations' }
        ]
      },
      {
        id: 'organic-chemistry-basic',
        name: 'Organic Chemistry',
        description: 'Carbon compounds and their reactions',
        subtopics: [
          { id: 'hydrocarbons', name: 'Hydrocarbons', description: 'Alkanes, alkenes, alkynes, aromatic compounds' },
          { id: 'functional-groups', name: 'Functional Groups', description: 'Alcohols, aldehydes, ketones, carboxylic acids' },
          { id: 'organic-reactions', name: 'Organic Reactions', description: 'Substitution, addition, elimination reactions' },
          { id: 'polymers', name: 'Polymers', description: 'Natural and synthetic polymers, polymerization' }
        ]
      },
      {
        id: 'electrochemistry-basic',
        name: 'Electrochemistry',
        description: 'Chemical reactions involving electricity',
        subtopics: [
          { id: 'redox-reactions', name: 'Redox Reactions', description: 'Oxidation, reduction, balancing equations' },
          { id: 'electrochemical-cells', name: 'Electrochemical Cells', description: 'Galvanic cells, electrolytic cells' },
          { id: 'electrolysis', name: 'Electrolysis', description: 'Industrial applications, electroplating' },
          { id: 'corrosion', name: 'Corrosion', description: 'Rusting, prevention methods' }
        ]
      }
    ]
  },
  {
    id: 'biology-secondary',
    name: 'Biology',
    code: 'BIO',
    isCore: true,
    topics: [
      {
        id: 'introduction-biology',
        name: 'Introduction to Biology',
        description: 'Basic biological concepts and scientific method',
        subtopics: [
          { id: 'biology-concept', name: 'Concept of Biology', description: 'Definition, branches, importance, career opportunities' },
          { id: 'scientific-method-bio', name: 'Scientific Method in Biology', description: 'Observation, hypothesis, experimentation' },
          { id: 'laboratory-techniques', name: 'Laboratory Techniques', description: 'Microscopy, specimen preparation, safety' }
        ]
      },
      {
        id: 'cell-biology-detailed',
        name: 'Cell Biology',
        description: 'Cell structure, function, and processes',
        subtopics: [
          { id: 'cell-structure', name: 'Cell Structure and Organization', description: 'Prokaryotic vs eukaryotic, organelles, cell membrane' },
          { id: 'cell-processes', name: 'Cell Processes', description: 'Diffusion, osmosis, active transport, cell division' },
          { id: 'enzymes', name: 'Enzymes', description: 'Structure, function, factors affecting enzyme activity' },
          { id: 'photosynthesis-respiration', name: 'Photosynthesis and Respiration', description: 'Energy conversion processes in cells' }
        ]
      },
      {
        id: 'classification-diversity',
        name: 'Classification of Living Things',
        description: 'Taxonomy and biodiversity',
        subtopics: [
          { id: 'taxonomy-principles', name: 'Principles of Taxonomy', description: 'Classification systems, binomial nomenclature' },
          { id: 'five-kingdoms', name: 'Five Kingdom System', description: 'Monera, Protista, Fungi, Plantae, Animalia' },
          { id: 'biodiversity', name: 'Biodiversity', description: 'Species diversity, conservation, endangered species' },
          { id: 'evolution-classification', name: 'Evolution and Classification', description: 'Phylogenetic relationships, evolutionary evidence' }
        ]
      },
      {
        id: 'nutrition-biology',
        name: 'Nutrition',
        description: 'Feeding mechanisms and digestive processes',
        subtopics: [
          { id: 'types-nutrition', name: 'Types of Nutrition', description: 'Autotrophic vs heterotrophic nutrition' },
          { id: 'human-nutrition', name: 'Human Nutrition', description: 'Balanced diet, nutrients, digestive system' },
          { id: 'plant-nutrition', name: 'Plant Nutrition', description: 'Mineral requirements, deficiency symptoms' },
          { id: 'nutrition-disorders', name: 'Nutrition Disorders', description: 'Malnutrition, obesity, eating disorders' }
        ]
      },
      {
        id: 'transport-systems',
        name: 'Transport in Living Things',
        description: 'Circulatory and transport systems',
        subtopics: [
          { id: 'human-circulatory', name: 'Human Circulatory System', description: 'Heart, blood vessels, blood composition' },
          { id: 'plant-transport', name: 'Transport in Plants', description: 'Xylem, phloem, transpiration, translocation' },
          { id: 'blood-disorders', name: 'Blood and Circulatory Disorders', description: 'Anemia, hypertension, heart disease' }
        ]
      },
      {
        id: 'gaseous-exchange-systems',
        name: 'Gaseous Exchange',
        description: 'Respiratory systems and gas exchange',
        subtopics: [
          { id: 'human-respiratory', name: 'Human Respiratory System', description: 'Lungs, breathing mechanism, gas exchange' },
          { id: 'plant-gaseous-exchange', name: 'Gaseous Exchange in Plants', description: 'Stomata, lenticels, gas exchange' },
          { id: 'respiratory-disorders', name: 'Respiratory Disorders', description: 'Asthma, tuberculosis, lung cancer' }
        ]
      },
      {
        id: 'excretion-systems',
        name: 'Excretion',
        description: 'Waste removal and homeostasis',
        subtopics: [
          { id: 'human-excretory', name: 'Human Excretory System', description: 'Kidneys, liver, skin, lungs as excretory organs' },
          { id: 'plant-excretion', name: 'Excretion in Plants', description: 'Waste products, storage, elimination' },
          { id: 'homeostasis', name: 'Homeostasis', description: 'Temperature regulation, water balance, pH control' }
        ]
      },
      {
        id: 'coordination-systems',
        name: 'Coordination',
        description: 'Nervous and hormonal control',
        subtopics: [
          { id: 'nervous-system', name: 'Nervous System', description: 'Brain, spinal cord, nerves, reflexes' },
          { id: 'endocrine-system', name: 'Endocrine System', description: 'Hormones, glands, feedback mechanisms' },
          { id: 'plant-coordination', name: 'Coordination in Plants', description: 'Tropisms, plant hormones, responses' },
          { id: 'sense-organs', name: 'Sense Organs', description: 'Eye, ear, skin, taste, smell' }
        ]
      },
      {
        id: 'reproduction-biology',
        name: 'Reproduction',
        description: 'Reproductive processes and development',
        subtopics: [
          { id: 'human-reproduction', name: 'Human Reproduction', description: 'Male and female reproductive systems, pregnancy' },
          { id: 'plant-reproduction', name: 'Plant Reproduction', description: 'Sexual and asexual reproduction, flower structure' },
          { id: 'reproductive-health', name: 'Reproductive Health', description: 'Family planning, STDs, reproductive disorders' },
          { id: 'growth-development', name: 'Growth and Development', description: 'Embryonic development, growth patterns' }
        ]
      },
      {
        id: 'genetics-heredity',
        name: 'Genetics',
        description: 'Inheritance and genetic principles',
        subtopics: [
          { id: 'mendelian-genetics', name: 'Mendelian Genetics', description: 'Laws of inheritance, monohybrid and dihybrid crosses' },
          { id: 'chromosomes-genes', name: 'Chromosomes and Genes', description: 'DNA structure, gene expression, mutations' },
          { id: 'human-genetics', name: 'Human Genetics', description: 'Genetic disorders, pedigree analysis, genetic counseling' },
          { id: 'biotechnology', name: 'Biotechnology', description: 'Genetic engineering, cloning, applications' }
        ]
      },
      {
        id: 'evolution-biology',
        name: 'Evolution',
        description: 'Evolutionary theory and evidence',
        subtopics: [
          { id: 'evolution-theory', name: 'Theory of Evolution', description: 'Darwin\'s theory, natural selection, adaptation' },
          { id: 'evolution-evidence', name: 'Evidence for Evolution', description: 'Fossil records, comparative anatomy, molecular evidence' },
          { id: 'human-evolution', name: 'Human Evolution', description: 'Primate evolution, human ancestry, cultural evolution' },
          { id: 'speciation', name: 'Speciation', description: 'Formation of new species, reproductive isolation' }
        ]
      },
      {
        id: 'ecology-environment',
        name: 'Ecology',
        description: 'Ecosystems and environmental interactions',
        subtopics: [
          { id: 'ecosystem-concepts', name: 'Ecosystem Concepts', description: 'Biotic and abiotic factors, energy flow, nutrient cycles' },
          { id: 'population-ecology', name: 'Population Ecology', description: 'Population dynamics, growth patterns, limiting factors' },
          { id: 'community-ecology', name: 'Community Ecology', description: 'Species interactions, succession, biodiversity' },
          { id: 'environmental-conservation', name: 'Environmental Conservation', description: 'Pollution, conservation strategies, sustainable development' }
        ]
      }
    ]
  },
  {
    id: 'geography-secondary',
    name: 'Geography',
    code: 'GEO',
    isCore: true,
    topics: [
      { id: 'map-work', name: 'Map Work and Practical Geography', subtopics: [
        { id: 'map-reading', name: 'Map Reading and Interpretation' },
        { id: 'field-work', name: 'Field Work Techniques' },
        { id: 'gis-basics', name: 'Basic GIS and Remote Sensing' }
      ]},
      { id: 'physical-geography', name: 'Physical Geography', subtopics: [
        { id: 'weather-climate', name: 'Weather and Climate' },
        { id: 'rocks-minerals', name: 'Rocks and Minerals' },
        { id: 'landforms', name: 'Landforms and Their Formation' },
        { id: 'water-resources', name: 'Water Resources' }
      ]},
      { id: 'human-geography', name: 'Human Geography', subtopics: [
        { id: 'population-settlement', name: 'Population and Settlement' },
        { id: 'economic-activities', name: 'Economic Activities' },
        { id: 'transport-communication', name: 'Transport and Communication' },
        { id: 'urbanization', name: 'Urbanization' }
      ]},
      { id: 'environmental-geography', name: 'Environmental Geography', subtopics: [
        { id: 'environmental-management', name: 'Environmental Management' },
        { id: 'natural-hazards', name: 'Natural Hazards and Disasters' },
        { id: 'climate-change', name: 'Climate Change and Global Warming' }
      ]}
    ]
  },
  {
    id: 'history-secondary',
    name: 'History',
    code: 'HIST',
    isCore: true,
    topics: [
      { id: 'historical-skills', name: 'Historical Skills and Methods', subtopics: [
        { id: 'historical-sources', name: 'Historical Sources and Evidence' },
        { id: 'chronology', name: 'Chronology and Dating' },
        { id: 'historical-research', name: 'Historical Research Methods' }
      ]},
      { id: 'human-evolution', name: 'Evolution and Development of Man', subtopics: [
        { id: 'human-origins', name: 'Human Origins in Africa' },
        { id: 'stone-age', name: 'Stone Age Cultures' },
        { id: 'iron-age', name: 'Iron Age and Early Civilizations' }
      ]},
      { id: 'pre-colonial-africa', name: 'Pre-colonial African Societies', subtopics: [
        { id: 'african-kingdoms', name: 'African Kingdoms and States' },
        { id: 'trade-networks', name: 'Trade Networks and Commerce' },
        { id: 'social-organization', name: 'Social and Political Organization' }
      ]},
      { id: 'colonialism-africa', name: 'Colonialism in Africa', subtopics: [
        { id: 'scramble-partition', name: 'Scramble and Partition of Africa' },
        { id: 'colonial-administration', name: 'Colonial Administration' },
        { id: 'colonial-economy', name: 'Colonial Economy and Society' }
      ]},
      { id: 'nationalism-independence', name: 'Nationalism and Independence', subtopics: [
        { id: 'rise-nationalism', name: 'Rise of African Nationalism' },
        { id: 'independence-movements', name: 'Independence Movements' },
        { id: 'decolonization', name: 'Decolonization Process' }
      ]},
      { id: 'post-independence', name: 'Post-Independence Africa', subtopics: [
        { id: 'nation-building', name: 'Nation Building Challenges' },
        { id: 'african-unity', name: 'African Unity and Integration' },
        { id: 'contemporary-issues', name: 'Contemporary African Issues' }
      ]}
    ]
  },
  {
    id: 'civics-secondary',
    name: 'Civics',
    code: 'CIV',
    isCore: true,
    topics: [
      { id: 'citizenship-concepts', name: 'Citizenship', subtopics: [
        { id: 'citizenship-meaning', name: 'Meaning and Types of Citizenship' },
        { id: 'rights-duties', name: 'Rights and Duties of Citizens' },
        { id: 'civic-participation', name: 'Civic Participation' }
      ]},
      { id: 'human-rights', name: 'Human Rights', subtopics: [
        { id: 'human-rights-concepts', name: 'Concepts of Human Rights' },
        { id: 'rights-protection', name: 'Protection of Human Rights' },
        { id: 'children-women-rights', name: 'Rights of Children and Women' }
      ]},
      { id: 'democracy-governance', name: 'Democracy and Governance', subtopics: [
        { id: 'democratic-principles', name: 'Democratic Principles' },
        { id: 'forms-government', name: 'Forms of Government' },
        { id: 'rule-of-law', name: 'Rule of Law' }
      ]},
      { id: 'political-systems', name: 'Political Systems', subtopics: [
        { id: 'elections-voting', name: 'Elections and Voting' },
        { id: 'political-parties', name: 'Political Parties' },
        { id: 'local-government', name: 'Local Government' }
      ]}
    ]
  },
  // Elective Subjects
  {
    id: 'commerce-secondary',
    name: 'Commerce',
    code: 'COM',
    isElective: true,
    topics: [
      { id: 'business-fundamentals', name: 'Business Fundamentals', subtopics: [
        { id: 'business-concepts', name: 'Basic Business Concepts' },
        { id: 'business-environment', name: 'Business Environment' },
        { id: 'entrepreneurship', name: 'Entrepreneurship' }
      ]},
      { id: 'trade-commerce', name: 'Trade and Commerce', subtopics: [
        { id: 'domestic-trade', name: 'Domestic Trade' },
        { id: 'international-trade', name: 'International Trade' },
        { id: 'e-commerce', name: 'Electronic Commerce' }
      ]},
      { id: 'financial-services', name: 'Financial Services', subtopics: [
        { id: 'banking-finance', name: 'Banking and Finance' },
        { id: 'insurance', name: 'Insurance' },
        { id: 'capital-markets', name: 'Capital Markets' }
      ]}
    ]
  },
  {
    id: 'bookkeeping-secondary',
    name: 'Book-keeping',
    code: 'BK',
    isElective: true,
    topics: [
      { id: 'accounting-basics', name: 'Accounting Fundamentals', subtopics: [
        { id: 'accounting-principles', name: 'Accounting Principles and Concepts' },
        { id: 'double-entry', name: 'Double Entry Book-keeping' },
        { id: 'accounting-equation', name: 'Accounting Equation' }
      ]},
      { id: 'financial-records', name: 'Financial Records', subtopics: [
        { id: 'books-accounts', name: 'Books of Original Entry' },
        { id: 'ledger-accounts', name: 'Ledger Accounts' },
        { id: 'trial-balance', name: 'Trial Balance' }
      ]},
      { id: 'financial-statements', name: 'Financial Statements', subtopics: [
        { id: 'profit-loss', name: 'Profit and Loss Account' },
        { id: 'balance-sheet', name: 'Balance Sheet' },
        { id: 'cash-flow', name: 'Cash Flow Statement' }
      ]}
    ]
  },
  {
    id: 'agriculture-secondary',
    name: 'Agriculture',
    code: 'AGR',
    isElective: true,
    topics: [
      { id: 'crop-production', name: 'Crop Production', subtopics: [
        { id: 'crop-husbandry', name: 'Crop Husbandry Practices' },
        { id: 'soil-management', name: 'Soil Management' },
        { id: 'pest-disease-control', name: 'Pest and Disease Control' }
      ]},
      { id: 'livestock-production', name: 'Livestock Production', subtopics: [
        { id: 'animal-husbandry', name: 'Animal Husbandry' },
        { id: 'animal-health', name: 'Animal Health and Nutrition' },
        { id: 'breeding-genetics', name: 'Animal Breeding and Genetics' }
      ]},
      { id: 'agricultural-economics', name: 'Agricultural Economics', subtopics: [
        { id: 'farm-management', name: 'Farm Management' },
        { id: 'agricultural-marketing', name: 'Agricultural Marketing' },
        { id: 'agribusiness', name: 'Agribusiness' }
      ]}
    ]
  },
  {
    id: 'computer-studies-secondary',
    name: 'Information and Computer Studies',
    code: 'ICS',
    isElective: true,
    topics: [
      { id: 'computer-fundamentals', name: 'Computer Fundamentals', subtopics: [
        { id: 'computer-systems', name: 'Computer Systems and Components' },
        { id: 'operating-systems', name: 'Operating Systems' },
        { id: 'computer-networks', name: 'Computer Networks and Internet' }
      ]},
      { id: 'software-applications', name: 'Software Applications', subtopics: [
        { id: 'word-processing', name: 'Word Processing' },
        { id: 'spreadsheets', name: 'Spreadsheets' },
        { id: 'databases', name: 'Database Management' },
        { id: 'presentations', name: 'Presentation Software' }
      ]},
      { id: 'programming-basics', name: 'Programming Basics', subtopics: [
        { id: 'programming-concepts', name: 'Programming Concepts' },
        { id: 'algorithms', name: 'Algorithms and Flowcharts' },
        { id: 'basic-programming', name: 'Basic Programming Languages' }
      ]}
    ]
  }
];

// Advanced Secondary Education Subjects (Forms V-VI) - 2025 Competence-Based Curriculum
const advancedSubjects: Subject[] = [
  {
    id: 'literature-english-advanced',
    name: 'Literature in English',
    code: 'LIT',
    isElective: true,
    topics: [
      {
        id: 'literature-concepts-mastery-form5',
        name: 'Demonstrate mastery of the concepts and principles of literature (Form V)',
        description: 'Foundation concepts in literary studies',
        subtopics: [
          {
            id: 'literature-understanding',
            name: 'Demonstrate broad understanding of literature concepts',
            description: 'Society, artist, imagination, literary language, folklore, written literature genres, imagery'
          },
          {
            id: 'literature-theories',
            name: 'Evaluate theories of origin and development of literature',
            description: 'Mimetic, myth and ritual theories; contribution to folklore and written literature development'
          },
          {
            id: 'african-literature-development',
            name: 'Explain origin and development of African literature in English',
            description: 'Relationship between oral traditions, Western conventions; pre-colonial, colonial, post-colonial features'
          },
          {
            id: 'folklore-written-relationship',
            name: 'Analyse relationship between folklore and written literature',
            description: 'Material culture, social customs, performing arts; folklore in community and literary contexts'
          }
        ]
      },
      {
        id: 'literary-appreciation-form5',
        name: 'Appreciate literary works (Form V)',
        description: 'In-depth literary analysis and criticism',
        subtopics: [
          {
            id: 'literature-elements',
            name: 'Exhibit in-depth understanding of elements of literature',
            description: 'Setting, theme, message, language, plot, style, character; relationship between form and content'
          },
          {
            id: 'literary-criticism-theories',
            name: 'Analyse literary criticism theories',
            description: 'Traditional theories (mimetic, pragmatic, objective, expressive); modern theories (formalism, Marxism, post-colonial, feminism, eco-criticism, social learning)'
          },
          {
            id: 'critical-analysis-precolonial-colonial',
            name: 'Analyse critically pre-colonial, colonial, liberation, and post-colonial literatures',
            description: 'Apply formalism and modern theories; thematic representation; relate to real life; discern lessons'
          }
        ]
      },
      {
        id: 'argumentative-skills-form5',
        name: 'Demonstrate mastery of argumentative skills (Form V)',
        description: 'Building rational arguments through literature',
        subtopics: [
          {
            id: 'rational-arguments',
            name: 'Use literary works to build rational arguments and judgement',
            description: 'Principles for rational argument; discuss character actions; analyse themes'
          }
        ]
      },
      {
        id: 'literary-creation-form5',
        name: 'Create literary works (Form V)',
        description: 'Original literary composition',
        subtopics: [
          {
            id: 'composition-principles',
            name: 'Demonstrate mastery of principles of composing literary works',
            description: 'Writing for children vs adults; composition principles (point of view, characterisation, plot, conflict); writing steps'
          },
          {
            id: 'original-composition',
            name: 'Compose original literary works',
            description: 'Develop short story plan; apply creative writing skills; use ICT tools for writing and publishing'
          }
        ]
      },
      {
        id: 'literature-concepts-mastery-form6',
        name: 'Demonstrate mastery of concepts and principles (Form VI)',
        description: 'Advanced literary concepts and Tanzanian literature',
        subtopics: [
          {
            id: 'tanzanian-writers-contribution',
            name: 'Assess contribution of Tanzanian writers to Tanzanian literature in English',
            description: 'Indigenous socio-cultural setting, Ujamaa, Pan-Africanism influence; development survey; national heritage reflection; contemporary issues representation'
          }
        ]
      },
      {
        id: 'advanced-literary-appreciation-form6',
        name: 'Appreciate literary works (Form VI)',
        description: 'Advanced literary analysis and social connections',
        subtopics: [
          {
            id: 'advanced-critical-analysis',
            name: 'Analyse critically liberation and post-colonial literatures',
            description: 'Narrative techniques effectiveness; modern theories application; relate to real life; reflect on character experiences'
          },
          {
            id: 'literature-politics-aesthetics',
            name: 'Analyse nexus between literature and politics, aesthetics, social inequalities',
            description: 'Political issues representation; social inequalities depiction; stylistic features for aesthetics'
          }
        ]
      },
      {
        id: 'advanced-argumentative-skills-form6',
        name: 'Demonstrate mastery of argumentative skills (Form VI)',
        description: 'Complex literary analysis and communication',
        subtopics: [
          {
            id: 'form-elements-effectiveness',
            name: 'Evaluate effectiveness of various elements of form in shaping meaning',
            description: 'Author\'s choice of setting, plot and characterisation development, rhetorical devices usage'
          },
          {
            id: 'advanced-rational-arguments',
            name: 'Use literary works to build rational arguments and judgements',
            description: 'Assess moral dilemmas; discuss conflicts and resolutions; assess various interpretations'
          },
          {
            id: 'communicative-contexts',
            name: 'Use literature to adapt and manage new communicative contexts',
            description: 'Different communicative contexts; examine character communications in various contexts'
          }
        ]
      },
      {
        id: 'literary-opportunities-form6',
        name: 'Create literary works and identify opportunities (Form VI)',
        description: 'Professional literary skills and career opportunities',
        subtopics: [
          {
            id: 'literature-opportunities',
            name: 'Identify opportunities created by literary works',
            description: 'Survey opportunities (writing, editing, publishing, marketing); design and write scripts; adapt literary texts for stage'
          },
          {
            id: 'advanced-composition',
            name: 'Compose original literary works',
            description: 'Develop novel plan; apply creative writing skills; use ICT tools for novel writing and publishing'
          }
        ]
      }
    ]
  },
  {
    id: 'advanced-mathematics',
    name: 'Advanced Mathematics',
    code: 'AMATH',
    isElective: true,
    topics: [
      { id: 'pure-mathematics', name: 'Pure Mathematics', subtopics: [
        { id: 'calculus', name: 'Differential and Integral Calculus' },
        { id: 'algebra-advanced', name: 'Advanced Algebra' },
        { id: 'trigonometry-advanced', name: 'Advanced Trigonometry' },
        { id: 'coordinate-geometry-advanced', name: 'Advanced Coordinate Geometry' }
      ]},
      { id: 'applied-mathematics', name: 'Applied Mathematics', subtopics: [
        { id: 'mechanics-advanced', name: 'Advanced Mechanics' },
        { id: 'mathematical-modeling', name: 'Mathematical Modeling' },
        { id: 'numerical-methods', name: 'Numerical Methods' }
      ]},
      { id: 'statistics-advanced', name: 'Statistics', subtopics: [
        { id: 'probability-theory', name: 'Probability Theory' },
        { id: 'statistical-inference', name: 'Statistical Inference' },
        { id: 'regression-analysis', name: 'Regression Analysis' }
      ]}
    ]
  },
  {
    id: 'physics-advanced',
    name: 'Physics (Advanced)',
    code: 'PHYA',
    isElective: true,
    topics: [
      { id: 'advanced-mechanics', name: 'Advanced Mechanics', subtopics: [
        { id: 'dynamics-advanced', name: 'Advanced Dynamics' },
        { id: 'oscillations-waves', name: 'Oscillations and Waves' },
        { id: 'rotational-mechanics', name: 'Rotational Mechanics' }
      ]},
      { id: 'thermodynamics', name: 'Thermodynamics', subtopics: [
        { id: 'kinetic-theory', name: 'Kinetic Theory of Gases' },
        { id: 'laws-thermodynamics', name: 'Laws of Thermodynamics' },
        { id: 'heat-engines', name: 'Heat Engines and Refrigerators' }
      ]},
      { id: 'electromagnetism', name: 'Electromagnetism', subtopics: [
        { id: 'electromagnetic-fields', name: 'Electromagnetic Fields' },
        { id: 'electromagnetic-induction', name: 'Electromagnetic Induction' },
        { id: 'ac-circuits', name: 'AC Circuits and Power' }
      ]},
      { id: 'modern-physics', name: 'Modern Physics', subtopics: [
        { id: 'quantum-physics', name: 'Quantum Physics' },
        { id: 'atomic-nuclear', name: 'Atomic and Nuclear Physics' },
        { id: 'relativity', name: 'Special Relativity' }
      ]}
    ]
  },
  {
    id: 'chemistry-advanced',
    name: 'Chemistry (Advanced)',
    code: 'CHEMA',
    isElective: true,
    topics: [
      { id: 'physical-chemistry', name: 'Physical Chemistry', subtopics: [
        { id: 'chemical-kinetics', name: 'Chemical Kinetics' },
        { id: 'thermochemistry-advanced', name: 'Advanced Thermochemistry' },
        { id: 'electrochemistry-advanced', name: 'Advanced Electrochemistry' }
      ]},
      { id: 'inorganic-chemistry', name: 'Inorganic Chemistry', subtopics: [
        { id: 'transition-metals', name: 'Transition Metals' },
        { id: 'coordination-compounds', name: 'Coordination Compounds' },
        { id: 'industrial-chemistry', name: 'Industrial Chemistry' }
      ]},
      { id: 'organic-chemistry-advanced', name: 'Advanced Organic Chemistry', subtopics: [
        { id: 'organic-mechanisms', name: 'Organic Reaction Mechanisms' },
        { id: 'stereochemistry', name: 'Stereochemistry' },
        { id: 'natural-products', name: 'Natural Products Chemistry' }
      ]},
      { id: 'analytical-chemistry', name: 'Analytical Chemistry', subtopics: [
        { id: 'instrumental-analysis', name: 'Instrumental Analysis' },
        { id: 'spectroscopy', name: 'Spectroscopy' },
        { id: 'chromatography', name: 'Chromatography' }
      ]}
    ]
  },
  {
    id: 'biology-advanced',
    name: 'Biology (Advanced)',
    code: 'BIOA',
    isElective: true,
    topics: [
      { id: 'molecular-biology', name: 'Molecular Biology', subtopics: [
        { id: 'dna-rna-proteins', name: 'DNA, RNA and Protein Synthesis' },
        { id: 'gene-regulation', name: 'Gene Regulation' },
        { id: 'molecular-techniques', name: 'Molecular Biology Techniques' }
      ]},
      { id: 'biochemistry', name: 'Biochemistry', subtopics: [
        { id: 'enzyme-kinetics', name: 'Enzyme Kinetics' },
        { id: 'metabolic-pathways', name: 'Metabolic Pathways' },
        { id: 'bioenergetics', name: 'Bioenergetics' }
      ]},
      { id: 'biotechnology', name: 'Biotechnology', subtopics: [
        { id: 'genetic-engineering', name: 'Genetic Engineering' },
        { id: 'bioprocessing', name: 'Bioprocessing and Fermentation' },
        { id: 'medical-biotechnology', name: 'Medical Biotechnology' }
      ]},
      { id: 'ecology-advanced', name: 'Advanced Ecology', subtopics: [
        { id: 'ecosystem-dynamics', name: 'Ecosystem Dynamics' },
        { id: 'conservation-biology', name: 'Conservation Biology' },
        { id: 'environmental-biotechnology', name: 'Environmental Biotechnology' }
      ]}
    ]
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    code: 'CS',
    isElective: true,
    topics: [
      { id: 'programming-advanced', name: 'Advanced Programming', subtopics: [
        { id: 'object-oriented', name: 'Object-Oriented Programming' },
        { id: 'data-structures', name: 'Data Structures' },
        { id: 'algorithms-analysis', name: 'Algorithm Analysis' }
      ]},
      { id: 'software-engineering', name: 'Software Engineering', subtopics: [
        { id: 'software-development', name: 'Software Development Life Cycle' },
        { id: 'system-design', name: 'System Analysis and Design' },
        { id: 'project-management', name: 'Software Project Management' }
      ]},
      { id: 'computer-systems', name: 'Computer Systems', subtopics: [
        { id: 'computer-architecture', name: 'Computer Architecture' },
        { id: 'operating-systems-advanced', name: 'Advanced Operating Systems' },
        { id: 'computer-networks-advanced', name: 'Advanced Computer Networks' }
      ]},
      { id: 'databases-advanced', name: 'Advanced Database Systems', subtopics: [
        { id: 'database-design', name: 'Database Design and Normalization' },
        { id: 'sql-advanced', name: 'Advanced SQL' },
        { id: 'database-administration', name: 'Database Administration' }
      ]}
    ]
  },
  {
    id: 'economics-advanced',
    name: 'Economics',
    code: 'ECON',
    isElective: true,
    topics: [
      { id: 'microeconomics', name: 'Microeconomics', subtopics: [
        { id: 'consumer-theory', name: 'Consumer Theory' },
        { id: 'producer-theory', name: 'Producer Theory' },
        { id: 'market-structures', name: 'Market Structures' },
        { id: 'welfare-economics', name: 'Welfare Economics' }
      ]},
      { id: 'macroeconomics', name: 'Macroeconomics', subtopics: [
        { id: 'national-income', name: 'National Income Accounting' },
        { id: 'monetary-policy', name: 'Monetary Policy' },
        { id: 'fiscal-policy', name: 'Fiscal Policy' },
        { id: 'economic-growth', name: 'Economic Growth and Development' }
      ]},
      { id: 'development-economics', name: 'Development Economics', subtopics: [
        { id: 'development-theories', name: 'Development Theories' },
        { id: 'poverty-inequality', name: 'Poverty and Inequality' },
        { id: 'sustainable-development', name: 'Sustainable Development' }
      ]},
      { id: 'international-economics', name: 'International Economics', subtopics: [
        { id: 'international-trade-theory', name: 'International Trade Theory' },
        { id: 'exchange-rates', name: 'Exchange Rates and Balance of Payments' },
        { id: 'economic-integration', name: 'Economic Integration' }
      ]}
    ]
  },
  // Additional A-Level Subjects
  {
    id: 'history-advanced',
    name: 'History (Advanced)',
    code: 'HISTA',
    isElective: true,
    topics: [
      { id: 'african-history-advanced', name: 'Advanced African History', subtopics: [
        { id: 'precolonial-societies', name: 'Pre-colonial African Societies' },
        { id: 'colonial-experience', name: 'Colonial Experience and Resistance' },
        { id: 'independence-movements', name: 'Independence Movements' }
      ]},
      { id: 'world-history', name: 'World History', subtopics: [
        { id: 'world-wars', name: 'World Wars and Global Conflicts' },
        { id: 'cold-war', name: 'Cold War and Decolonization' },
        { id: 'globalization', name: 'Globalization and Contemporary Issues' }
      ]}
    ]
  },
  {
    id: 'geography-advanced',
    name: 'Geography (Advanced)',
    code: 'GEOA',
    isElective: true,
    topics: [
      { id: 'physical-geography-advanced', name: 'Advanced Physical Geography', subtopics: [
        { id: 'geomorphology', name: 'Geomorphology' },
        { id: 'climatology', name: 'Climatology' },
        { id: 'biogeography', name: 'Biogeography' }
      ]},
      { id: 'human-geography-advanced', name: 'Advanced Human Geography', subtopics: [
        { id: 'urban-geography', name: 'Urban Geography' },
        { id: 'economic-geography', name: 'Economic Geography' },
        { id: 'population-geography', name: 'Population Geography' }
      ]},
      { id: 'environmental-geography-advanced', name: 'Advanced Environmental Geography', subtopics: [
        { id: 'environmental-management-advanced', name: 'Advanced Environmental Management' },
        { id: 'gis-remote-sensing', name: 'GIS and Remote Sensing' },
        { id: 'sustainable-development-geography', name: 'Sustainable Development' }
      ]}
    ]
  },
  {
    id: 'general-studies',
    name: 'General Studies',
    code: 'GS',
    isCore: true,
    topics: [
      { id: 'critical-thinking', name: 'Critical Thinking and Problem Solving', subtopics: [
        { id: 'logical-reasoning', name: 'Logical Reasoning' },
        { id: 'analytical-skills', name: 'Analytical Skills' },
        { id: 'research-methods', name: 'Research Methods' }
      ]},
      { id: 'communication-skills', name: 'Communication Skills', subtopics: [
        { id: 'academic-writing', name: 'Academic Writing' },
        { id: 'presentation-skills', name: 'Presentation Skills' },
        { id: 'media-literacy', name: 'Media Literacy' }
      ]},
      { id: 'contemporary-issues', name: 'Contemporary Issues', subtopics: [
        { id: 'global-challenges', name: 'Global Challenges' },
        { id: 'science-society', name: 'Science and Society' },
        { id: 'ethics-values', name: 'Ethics and Values' }
      ]}
    ]
  }
];

export const tanzaniaEducationSystem: EducationLevel[] = [
  {
    id: 'primary',
    name: 'Primary Education',
    description: 'Standards I - VII (Ages 7-13) - Competence-Based Curriculum 2025',
    standards: ['Standard I', 'Standard II', 'Standard III', 'Standard IV', 'Standard V', 'Standard VI', 'Standard VII'],
    subjects: primarySubjects
  },
  {
    id: 'secondary-ordinary',
    name: 'Ordinary Level Secondary Education',
    description: 'Forms I - IV (Ages 14-17) - Competence-Based Curriculum 2025',
    standards: ['Form I', 'Form II', 'Form III', 'Form IV'],
    subjects: secondarySubjects
  },
  {
    id: 'secondary-advanced',
    name: 'Advanced Level Secondary Education',
    description: 'Forms V - VI (Ages 18-19) - Competence-Based Curriculum 2025',
    standards: ['Form V', 'Form VI'],
    subjects: advancedSubjects
  }
];

// Subject combinations for A-Level
export const advancedLevelCombinations = {
  'PCM': { name: 'Physics, Chemistry, Mathematics', subjects: ['physics-advanced', 'chemistry-advanced', 'advanced-mathematics'] },
  'PCB': { name: 'Physics, Chemistry, Biology', subjects: ['physics-advanced', 'chemistry-advanced', 'biology-advanced'] },
  'CBG': { name: 'Chemistry, Biology, Geography', subjects: ['chemistry-advanced', 'biology-advanced', 'geography-advanced'] },
  'HGL': { name: 'History, Geography, Literature', subjects: ['history-advanced', 'geography-advanced', 'literature-english-advanced'] },
  'HGE': { name: 'History, Geography, Economics', subjects: ['history-advanced', 'geography-advanced', 'economics-advanced'] },
  'EGL': { name: 'Economics, Geography, Literature', subjects: ['economics-advanced', 'geography-advanced', 'literature-english-advanced'] },
  'CSM': { name: 'Computer Science, Mathematics, Physics', subjects: ['computer-science', 'advanced-mathematics', 'physics-advanced'] }
};

// Custom topics storage (for teacher-added topics)
let customTopics: Record<string, Topic[]> = {};

// Helper functions
export const getSubjectsByLevel = (levelId: string): Subject[] => {
  const level = tanzaniaEducationSystem.find(l => l.id === levelId);
  return level?.subjects || [];
};

export const getSubjectById = (subjectId: string): Subject | undefined => {
  for (const level of tanzaniaEducationSystem) {
    const subject = level.subjects.find(s => s.id === subjectId);
    if (subject) return subject;
  }
  return undefined;
};

export const getTopicsBySubject = (subjectId: string): Topic[] => {
  const subject = getSubjectById(subjectId);
  const officialTopics = subject?.topics || [];
  const customSubjectTopics = customTopics[subjectId] || [];
  return [...officialTopics, ...customSubjectTopics];
};

export const getSubtopicsByTopic = (subjectId: string, topicId: string): Subtopic[] => {
  const topics = getTopicsBySubject(subjectId);
  const topic = topics.find(t => t.id === topicId);
  return topic?.subtopics || [];
};

// Custom topic management functions
export const addCustomTopic = (subjectId: string, topic: Omit<Topic, 'id' | 'isCustom'>): Topic => {
  const newTopic: Topic = {
    ...topic,
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    isCustom: true
  };
  
  if (!customTopics[subjectId]) {
    customTopics[subjectId] = [];
  }
  
  customTopics[subjectId].push(newTopic);
  
  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('customTopics', JSON.stringify(customTopics));
  }
  
  return newTopic;
};

export const removeCustomTopic = (subjectId: string, topicId: string): boolean => {
  if (!customTopics[subjectId]) return false;
  
  const initialLength = customTopics[subjectId].length;
  customTopics[subjectId] = customTopics[subjectId].filter(t => t.id !== topicId);
  
  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('customTopics', JSON.stringify(customTopics));
  }
  
  return customTopics[subjectId].length < initialLength;
};

export const updateCustomTopic = (subjectId: string, topicId: string, updates: Partial<Topic>): boolean => {
  if (!customTopics[subjectId]) return false;
  
  const topicIndex = customTopics[subjectId].findIndex(t => t.id === topicId);
  if (topicIndex === -1) return false;
  
  customTopics[subjectId][topicIndex] = {
    ...customTopics[subjectId][topicIndex],
    ...updates
  };
  
  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('customTopics', JSON.stringify(customTopics));
  }
  
  return true;
};

export const getCustomTopics = (subjectId?: string): Topic[] | Record<string, Topic[]> => {
  if (subjectId) {
    return customTopics[subjectId] || [];
  }
  return customTopics;
};

export const loadCustomTopics = (): void => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('customTopics');
    if (stored) {
      try {
        customTopics = JSON.parse(stored);
      } catch (error) {
        console.error('Error loading custom topics:', error);
        customTopics = {};
      }
    }
  }
};

export const exportCustomTopics = (): string => {
  return JSON.stringify(customTopics, null, 2);
};

export const importCustomTopics = (jsonData: string): boolean => {
  try {
    const imported = JSON.parse(jsonData);
    customTopics = { ...customTopics, ...imported };
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('customTopics', JSON.stringify(customTopics));
    }
    
    return true;
  } catch (error) {
    console.error('Error importing custom topics:', error);
    return false;
  }
};

// Search functions
export const searchTopics = (query: string, subjectId?: string): Array<{
  subject: Subject;
  topic: Topic;
  subtopics?: Subtopic[];
}> => {
  const results: Array<{
    subject: Subject;
    topic: Topic;
    subtopics?: Subtopic[];
  }> = [];
  
  const searchInSubject = (subject: Subject) => {
    const topics = getTopicsBySubject(subject.id);
    
    topics.forEach(topic => {
      const topicMatches = topic.name.toLowerCase().includes(query.toLowerCase()) ||
                          topic.description?.toLowerCase().includes(query.toLowerCase());
      
      const matchingSubtopics = topic.subtopics?.filter(subtopic =>
        subtopic.name.toLowerCase().includes(query.toLowerCase()) ||
        subtopic.description?.toLowerCase().includes(query.toLowerCase())
      );
      
      if (topicMatches || (matchingSubtopics && matchingSubtopics.length > 0)) {
        results.push({
          subject,
          topic,
          subtopics: matchingSubtopics
        });
      }
    });
  };
  
  if (subjectId) {
    const subject = getSubjectById(subjectId);
    if (subject) {
      searchInSubject(subject);
    }
  } else {
    // Search across all subjects
    tanzaniaEducationSystem.forEach(level => {
      level.subjects.forEach(searchInSubject);
    });
  }
  
  return results;
};

// Initialize custom topics on module load
if (typeof window !== 'undefined') {
  loadCustomTopics();
}

// Cross-cutting issues integration (as per 2025 curriculum)
export const crossCuttingIssues = [
  'Gender Equality',
  'Environmental Conservation',
  'Health and Nutrition',
  'HIV/AIDS Education',
  'Life Skills Education',
  'Human Rights Education',
  'Entrepreneurship Education',
  'Financial Literacy',
  'ICT Integration',
  'Inclusive Education',
  'Peace and Conflict Resolution',
  'Cultural Heritage',
  'Disaster Risk Reduction',
  'Climate Change Adaptation',
  'Sustainable Development'
];

// Competence areas (as per 2025 curriculum framework)
export const coreCompetences = [
  'Critical Thinking and Problem Solving',
  'Creativity and Innovation',
  'Communication and Collaboration',
  'Digital Literacy',
  'Learning to Learn',
  'Personal and Social Responsibility',
  'Cultural Identity and Global Citizenship'
];