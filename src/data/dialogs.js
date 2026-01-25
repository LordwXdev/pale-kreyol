// src/data/dialogs.js

export const dialogs = [
  {
    id: 1,
    title: "Meeting on the Way to Nasyon",
    category: "beginner",
    icon: "👋",
    lessonId: 1,
    description: "Lwi meets Mari on the way to Nasyonvil",
    characters: [
      { name: "LWI", avatar: "👨" },
      { name: "MARI", avatar: "👩" }
    ],
    conversation: [
      {
        speaker: "LWI",
        creole: "Bonjou, ti dam. Ki jan ou ye?",
        english: "Hello, ma'am. How are you?",
        pronunciation: "bon-JOO, tee dahm. kee-JAN oo YEH"
      },
      {
        speaker: "MARI",
        creole: "M' byen, wi.",
        english: "I'm fine, yes.",
        pronunciation: "m bee-YEN, wee"
      },
      {
        speaker: "LWI",
        creole: "Se pitit-ou?",
        english: "Is that your child?",
        pronunciation: "seh pee-TEET oo"
      },
      {
        speaker: "MARI",
        creole: "Wi se pitit-mwen.",
        english: "Yes, it's my child.",
        pronunciation: "wee seh pee-TEET mwen"
      },
      {
        speaker: "LWI",
        creole: "Ki jan li rele?",
        english: "What's his name?",
        pronunciation: "kee-JAN lee reh-LEH"
      },
      {
        speaker: "MARI",
        creole: "Li rele Sadrak.",
        english: "His name is Sadrak.",
        pronunciation: "lee reh-LEH sah-DRAK"
      },
      {
        speaker: "LWI",
        creole: "M' rele Lwi. E ou-menm, ki jan ou rele?",
        english: "My name is Lwi. And you? What's your name?",
        pronunciation: "m reh-LEH loo-WEE. eh oo-MENM, kee-JAN oo reh-LEH"
      },
      {
        speaker: "MARI",
        creole: "M' rele Mari.",
        english: "My name is Mari.",
        pronunciation: "m reh-LEH mah-REE"
      }
    ],
    grammar: [
      {
        title: "1. Personal Pronouns",
        explanation: "In Creole, personal pronouns have only one form. For example, yo is used for they, them, or their.",
        table: {
          headers: ["Creole", "English (Subject)", "English (Object)", "English (Possessive)"],
          rows: [
            ["mwen", "I", "me", "my"],
            ["ou", "you", "you", "your"],
            ["li", "he/she/it", "him/her/it", "his/her/its"],
            ["nou", "we/you (plural)", "us/you", "our/your"],
            ["yo", "they", "them", "their"]
          ]
        },
        examples: [
          {
            creole: "Li rele Sadrak.",
            english: "He/She is called Sadrak.",
            explanation: "Li can mean he, she, or it"
          },
          {
            creole: "Yo byen.",
            english: "They are fine.",
            explanation: "Yo is used for they/them/their"
          }
        ]
      },
      {
        title: "2. Uses of Pronouns",
        explanation: "When a pronoun precedes a predicate (verb, adjective, or adverb), it functions as the subject.",
        examples: [
          {
            creole: "Li rele Mari.",
            english: "She is called Mari.",
            explanation: "Li is the subject before the verb 'rele'"
          },
          {
            creole: "Ki jan ou ye?",
            english: "How are you?",
            explanation: "Ou is the subject before 'ye'"
          }
        ]
      },
      {
        title: "3. Identification with 'se'",
        explanation: "To identify or point to someone, use the construction 'se...' (It's...).",
        examples: [
          {
            creole: "Se mwen.",
            english: "It's me.",
            explanation: "Se + pronoun for identification"
          },
          {
            creole: "Se pitit-mwen.",
            english: "It's my child.",
            explanation: "Se + noun for identification"
          }
        ]
      }
    ],
    comprehensionQuestions: [
      {
        question: "Ki moun k'ap pale ak Mari?",
        translation: "Who is speaking with Mari?",
        options: ["Lwi", "Sadrak", "Papa", "Grann"],
        correct: "Lwi"
      },
      {
        question: "Ki jan madam-nan rele?",
        translation: "What's the woman's name?",
        options: ["Lwi", "Mari", "Sadrak", "Ann"],
        correct: "Mari"
      },
      {
        question: "Ki jan msye-a rele?",
        translation: "What's the man's name?",
        options: ["Sadrak", "Papa", "Lwi", "Jan"],
        correct: "Lwi"
      },
      {
        question: "Ki jan pitit-la rele?",
        translation: "What's the child's name?",
        options: ["Lwi", "Mari", "Sadrak", "Jan"],
        correct: "Sadrak"
      }
    ],
    exercises: [
      {
        type: "fill-blank",
        instruction: "Complete the sentences using pronouns",
        questions: [
          {
            creole: "Bonjou, ki jan ___ ye?",
            answer: "ou",
            translation: "Hello, how are you?"
          },
          {
            creole: "M' byen, wi. E ___-menm?",
            answer: "ou",
            translation: "I'm fine, yes. And you?"
          },
          {
            creole: "Ki jan ___ rele?",
            answer: "li",
            translation: "What's his/her name?"
          },
          {
            creole: "Se pitit-___.",
            answer: "mwen",
            translation: "It's my child."
          }
        ]
      },
      {
        type: "match-pairs",
        instruction: "Match Creole with English",
        pairs: [
          { creole: "mwen", english: "I/me/my" },
          { creole: "ou", english: "you/your" },
          { creole: "li", english: "he/she/it/him/her/his/her" },
          { creole: "nou", english: "we/us/our" },
          { creole: "yo", english: "they/them/their" }
        ]
      }
    ],
    vocabulary: [
      { creole: "Bonjou", english: "Good morning/Hello", pronunciation: "bon-JOO" },
      { creole: "Ti dam", english: "Ma'am/Little lady", pronunciation: "tee dahm" },
      { creole: "Ki jan ou ye?", english: "How are you?", pronunciation: "kee-JAN oo YEH" },
      { creole: "M' byen", english: "I'm fine", pronunciation: "m bee-YEN" },
      { creole: "Wi", english: "Yes", pronunciation: "WEE" },
      { creole: "Pitit", english: "Child", pronunciation: "pee-TEET" },
      { creole: "Se", english: "It's/is", pronunciation: "seh" },
      { creole: "Ki jan li rele?", english: "What's his/her name?", pronunciation: "kee-JAN lee reh-LEH" },
      { creole: "M' rele", english: "My name is", pronunciation: "m reh-LEH" },
      { creole: "E ou-menm", english: "And you", pronunciation: "eh oo-MENM" }
    ],
    pronunciationPractice: [
      { phrase: "Bonjou, ti dam", translation: "Hello, ma'am" },
      { phrase: "Ki jan ou ye?", translation: "How are you?" },
      { phrase: "M' byen, wi", translation: "I'm fine, yes" },
      { phrase: "Se pitit-ou?", translation: "Is that your child?" },
      { phrase: "Ki jan li rele?", translation: "What's his/her name?" },
      { phrase: "M' rele Lwi", translation: "My name is Lwi" }
    ]
  },
  {
    id: 2,
    title: "Give Me Your News",
    category: "beginner",
    icon: "💬",
    lessonId: 2,
    description: "Lwi and Mari meet several days after their first encounter",
    characters: [
      { name: "LWI", avatar: "👨" },
      { name: "MARI", avatar: "👩" }
    ],
    conversation: [
      {
        speaker: "LWI",
        creole: "Bonjou, Mari. Ki jan ou ye jodi-a?",
        english: "Hello, Mari. How are you today?",
        pronunciation: "bon-JOO, mah-REE. kee-JAN oo yeh joh-DEE-ah"
      },
      {
        speaker: "MARI",
        creole: "M' byen, wi. E ou-menm? Ban m nouvel-ou, non.",
        english: "I'm fine. How about you? Give me your news.",
        pronunciation: "m bee-YEN, wee. eh oo-MENM? ban m noo-VEL-oo, non"
      },
      {
        speaker: "LWI",
        creole: "M' pa pi mal. M'ap kenbe. E Sadrak?",
        english: "I'm not bad at all. I'm getting along. How about Sadrak?",
        pronunciation: "m pah pee MAHL. m-ap KEN-beh. eh sah-DRAK"
      },
      {
        speaker: "MARI",
        creole: "Sadrak la, wi. L'ap boule.",
        english: "Sadrak is all right. He's managing.",
        pronunciation: "sah-DRAK lah, wee. l-ap boo-LEH"
      },
      {
        speaker: "LWI",
        creole: "E lot timoun-yo? Yo byen tou?",
        english: "And the other children? Are they fine too?",
        pronunciation: "eh lot tee-MOON-yo? yo bee-YEN too"
      },
      {
        speaker: "MARI",
        creole: "Wi, monchè. Y'al lekòl.",
        english: "Yes, dear. They're going to school.",
        pronunciation: "wee, mon-SHEH. y-al leh-KOHL"
      },
      {
        speaker: "LWI",
        creole: "Bon, mache, m'ale. N'a wè, tande?",
        english: "Okay, dear. I'm going. See you, okay?",
        pronunciation: "bon, mah-SHEH, m-ah-LEH. n-ah WEH, tan-DEH"
      },
      {
        speaker: "MARI",
        creole: "Men wi, n'a wè lot semènn, si Dye vle.",
        english: "Of course, see you next week, God willing.",
        pronunciation: "men wee, n-ah WEH lot seh-MEN, see djeh VLEH"
      }
    ],
    grammar: [
      {
        title: "1. Short Forms of Pronouns",
        explanation: "When pronouns occur in subject position (before the predicate), they can show short forms.",
        table: {
          headers: ["Full Form", "Short Form", "Example"],
          rows: [
            ["mwen", "m'", "M' byen (I'm fine)"],
            ["ou", "(w)", "Ou ap kenbe (You're getting along)"],
            ["li", "l'", "L'ap boule (He's/She's managing)"],
            ["nou", "n'", "N'a wè (We'll see)"],
            ["yo", "y'", "Y'al lekòl (They're going to school)"]
          ]
        },
        examples: [
          {
            creole: "M' byen / Mwen byen",
            english: "I'm fine",
            explanation: "Both forms are correct"
          },
          {
            crecreole: "L'ap boule",
            english: "He's/She's managing",
            explanation: "L' is used before 'ap'"
          },
          {
            creole: "N'a wè",
            english: "We'll see",
            explanation: "N' is used before 'a'"
          }
        ]
      },
      {
        title: "2. Expressing 'I'm fine' - Variations",
        explanation: "Creole has many expressions for saying you're okay or getting along.",
        examples: [
          {
            creole: "M' byen.",
            english: "I'm fine.",
            explanation: "Most common"
          },
          {
            creole: "M' pa pi mal.",
            english: "I'm not bad. / I'm no worse.",
            explanation: "Literally: I'm not worse"
          },
          {
            creole: "M'ap boule.",
            english: "I'm managing.",
            explanation: "Informal expression"
          },
          {
            creole: "M'ap kenbe.",
            english: "I'm getting along.",
            explanation: "Literally: I'm holding on"
          },
          {
            creole: "M' la.",
            english: "I'm here. / I'm okay.",
            explanation: "Very casual"
          }
        ]
      },
      {
        title: "3. Emphatics (menm, wi, non)",
        explanation: "Creole doesn't have word stress like English. Instead, emphatic words are used.",
        examples: [
          {
            creole: "E ou-menm, ki jan ou ye?",
            english: "And YOU, how are you?",
            explanation: "'-menm' adds emphasis: 'yourself'"
          },
          {
            creole: "M' byen, wi.",
            english: "I'm fine, YES.",
            explanation: "'wi' emphasizes positive statements"
          },
          {
            creole: "M' pa mal, non.",
            english: "I'm not bad, NO.",
            explanation: "'non' emphasizes negative statements"
          }
        ]
      }
    ],
    comprehensionQuestions: [
      {
        question: "Ki jan Mari ye?",
        translation: "How is Mari?",
        options: ["Li byen", "Li malad", "Li fatige", "Li fache"],
        correct: "Li byen"
      },
      {
        question: "Ki jan Lwi ye?",
        translation: "How is Lwi?",
        options: ["Li pa pi mal", "Li malad", "Li fatige", "Li kontan"],
        correct: "Li pa pi mal"
      },
      {
        question: "Kote lot timoun-yo ale?",
        translation: "Where are the other children going?",
        options: ["Lekòl", "Mache", "Legliz", "Kay"],
        correct: "Lekòl"
      },
      {
        question: "Ki lè yo pral wè ankò?",
        translation: "When will they see each other again?",
        options: ["Lot semènn", "Demen", "Jodi-a", "Yè"],
        correct: "Lot semènn"
      }
    ],
    exercises: [
      {
        type: "fill-blank",
        instruction: "Complete using short pronoun forms",
        questions: [
          {
            creole: "___' byen, wi.",
            answer: "M",
            translation: "I'm fine, yes."
          },
          {
            creole: "___'ap boule.",
            answer: "L",
            translation: "He's/She's managing."
          },
          {
            creole: "___'a wè.",
            answer: "N",
            translation: "We'll see."
          },
          {
            creole: "___'al lekòl.",
            answer: "Y",
            translation: "They're going to school."
          }
        ]
      },
      {
        type: "match-pairs",
        instruction: "Match expressions with meanings",
        pairs: [
          { creole: "M' byen", english: "I'm fine" },
          { creole: "M' pa pi mal", english: "I'm not bad" },
          { creole: "M'ap kenbe", english: "I'm getting along" },
          { creole: "M'ap boule", english: "I'm managing" },
          { creole: "M' la", english: "I'm here/okay" }
        ]
      }
    ],
    vocabulary: [
      { creole: "Jodi-a", english: "Today", pronunciation: "joh-DEE-ah" },
      { creole: "Ban m nouvel-ou", english: "Give me your news", pronunciation: "ban m noo-VEL-oo" },
      { creole: "M' pa pi mal", english: "I'm not bad", pronunciation: "m pah pee MAHL" },
      { creole: "M'ap kenbe", english: "I'm getting along", pronunciation: "m-ap KEN-beh" },
      { creole: "M'ap boule", english: "I'm managing", pronunciation: "m-ap boo-LEH" },
      { creole: "M' la", english: "I'm here/okay", pronunciation: "m lah" },
      { creole: "Lot timoun-yo", english: "The other children", pronunciation: "lot tee-MOON-yo" },
      { creole: "Monchè", english: "Dear", pronunciation: "mon-SHEH" },
      { creole: "Lekòl", english: "School", pronunciation: "leh-KOHL" },
      { creole: "N'a wè", english: "We'll see / See you", pronunciation: "n-ah WEH" },
      { creole: "Lot semènn", english: "Next week", pronunciation: "lot seh-MEN" },
      { creole: "Si Dye vle", english: "God willing", pronunciation: "see djeh VLEH" }
    ],
    pronunciationPractice: [
      { phrase: "Ki jan ou ye jodi-a?", translation: "How are you today?" },
      { phrase: "M' pa pi mal", translation: "I'm not bad" },
      { phrase: "M'ap kenbe", translation: "I'm getting along" },
      { phrase: "L'ap boule", translation: "He's/She's managing" },
      { phrase: "Y'al lekòl", translation: "They're going to school" },
      { phrase: "N'a wè lot semènn", translation: "See you next week" }
    ]
  },
  {
    id: 3,
    title: "In the Classroom",
    category: "beginner",
    icon: "🏫",
    lessonId: 1,
    description: "Learning about classroom objects and commands",
    characters: [
      { name: "LWI", avatar: "👨" },
      { name: "MARI", avatar: "👩" }
    ],
    conversation: [
      {
        speaker: "LWI",
        creole: "Ki sa sa-a ye?",
        english: "What is that?",
        pronunciation: "kee sah sah-AH yeh"
      },
      {
        speaker: "MARI",
        creole: "Se yon klas. Klas-la nan yon lekòl.",
        english: "It's a classroom. The classroom is in a school.",
        pronunciation: "seh yohn klahs. klahs-lah nan yohn leh-KOHL"
      },
      {
        speaker: "LWI",
        creole: "Ki sa k' genyen nan klas-la?",
        english: "What is in the classroom?",
        pronunciation: "kee sah k gen-YEN nan klahs-lah"
      },
      {
        speaker: "MARI",
        creole: "Gen tablo, gen ban, gen yon pòt, gen fenet, gen yon drapo.",
        english: "There's a blackboard, benches, a door, windows, and a flag.",
        pronunciation: "gen tah-BLO, gen ban, gen yohn poht, gen feh-NET, gen yohn drah-PO"
      },
      {
        speaker: "LWI",
        creole: "Ki sa madmwazel-la ap fè?",
        english: "What is the teacher doing?",
        pronunciation: "kee sah mahd-mwah-ZEL-lah ap feh"
      },
      {
        speaker: "MARI",
        creole: "Li kanpe devan tablo-a. L'ap ekri sou tablo-a.",
        english: "She's standing in front of the blackboard. She's writing on the blackboard.",
        pronunciation: "lee kan-PEH deh-VAN tah-BLO-ah. l-ap eh-KREE soo tah-BLO-ah"
      },
      {
        speaker: "LWI",
        creole: "E elèv-yo? Sa y'ap fè?",
        english: "And the students? What are they doing?",
        pronunciation: "eh eh-LEV-yo? sah y-ap feh"
      },
      {
        speaker: "MARI",
        creole: "Yo chita sou ban-yo. Gen liv, gen kaye, gen kreyon.",
        english: "They're sitting on their benches. There are books, notebooks, and pencils.",
        pronunciation: "yo shee-TAH soo ban-yo. gen leev, gen kah-YEH, gen kreh-YON"
      }
    ],
    grammar: [
      {
        title: "1. The Definite Article (-la / -a)",
        explanation: "The definite article comes AFTER the noun. Its form depends on the last sound of the noun.",
        table: {
          headers: ["After Consonant", "After Vowel", "Example"],
          rows: [
            ["-la", "", "tab-la (the table)"],
            ["", "-a", "tablo-a (the blackboard)"],
            ["-la", "", "liv-la (the book)"],
            ["", "-a", "kaye-a (the notebook)"]
          ]
        },
        examples: [
          {
            creole: "Kote tab-la?",
            english: "Where is the table?",
            explanation: "tab ends in consonant → tab-la"
          },
          {
            creole: "Li rele pitit-la.",
            english: "He/she calls the child.",
            explanation: "pitit ends in consonant → pitit-la"
          },
          {
            creole: "Kote tablo-a?",
            english: "Where is the blackboard?",
            explanation: "tablo ends in vowel → tablo-a"
          },
          {
            creole: "Li rele msye-a.",
            english: "He/she calls the man.",
            explanation: "msye ends in vowel → msye-a"
          }
        ]
      },
      {
        title: "2. The Indefinite Article (yon)",
        explanation: "The indefinite article 'yon' (a/an) comes BEFORE the noun. Usually pronounced as 'on'.",
        examples: [
          {
            creole: "Se yon liv.",
            english: "It's a book.",
            explanation: "yon before noun"
          },
          {
            creole: "Li kenbe yon kreyon.",
            english: "He/she is holding a pencil.",
            explanation: "Usually pronounced 'on kreyon'"
          },
          {
            creole: "Gen yon pòt.",
            english: "There is a door.",
            explanation: "yon = a/an"
          }
        ]
      },
      {
        title: "3. Plural of Nouns (-yo)",
        explanation: "Plural is marked ONLY for specific/known nouns (those with definite article). Add -yo after the noun.",
        table: {
          headers: ["Singular", "Plural", "English"],
          rows: [
            ["liv-la", "liv-yo", "the book → the books"],
            ["kaye-a", "kaye-yo", "the notebook → the notebooks"],
            ["elèv-la", "elèv-yo", "the student → the students"],
            ["pitit-la", "pitit-yo", "the child → the children"]
          ]
        },
        examples: [
          {
            creole: "Pran liv-la.",
            english: "Take the book.",
            explanation: "Singular - one specific book"
          },
          {
            creole: "Pran liv-yo.",
            english: "Take the books.",
            explanation: "Plural - specific books"
          },
          {
            creole: "Gen liv.",
            english: "There are books.",
            explanation: "No plural marker - not specific"
          }
        ]
      },
      {
        title: "4. Commands and Verbs",
        explanation: "Common classroom commands using base verb forms.",
        examples: [
          {
            creole: "Pran liv-la.",
            english: "Take the book.",
            explanation: "pran = take"
          },
          {
            creole: "Louvri kaye-ou.",
            english: "Open your notebook.",
            explanation: "louvri = open"
          },
          {
            creole: "Fèmen liv-nou.",
            english: "Close our book.",
            explanation: "fèmen = close"
          },
          {
            creole: "Ekri non-ou.",
            english: "Write your name.",
            explanation: "ekri = write"
          },
          {
            creole: "Kanpe.",
            english: "Stand up.",
            explanation: "kanpe = stand"
          },
          {
            creole: "Chita.",
            english: "Sit down.",
            explanation: "chita = sit"
          }
        ]
      }
    ],
    comprehensionQuestions: [
      {
        question: "Ki sa k' genyen nan klas-la?",
        translation: "What is in the classroom?",
        options: ["Tablo, ban, pòt", "Rad, soulye", "Manje, dlo", "Kay, mache"],
        correct: "Tablo, ban, pòt"
      },
      {
        question: "Ki sa madmwazel-la ap fè?",
        translation: "What is the teacher doing?",
        options: ["L'ap ekri", "L'ap dòmi", "L'ap manje", "L'ap danse"],
        correct: "L'ap ekri"
      },
      {
        question: "Kote elèv-yo chita?",
        translation: "Where are the students sitting?",
        options: ["Sou ban-yo", "Sou tab", "Sou tè", "Sou chèz"],
        correct: "Sou ban-yo"
      }
    ],
    exercises: [
      {
        type: "fill-blank",
        instruction: "Add the correct article (-la, -a, yon, or -yo)",
        questions: [
          {
            creole: "Kote tab___?",
            answer: "-la",
            translation: "Where is the table?"
          },
          {
            creole: "Pran ___ liv.",
            answer: "yon",
            translation: "Take a book."
          },
          {
            creole: "Fèmen liv___ .",
            answer: "-yo",
            translation: "Close the books."
          },
          {
            creole: "Kote tablo___?",
            answer: "-a",
            translation: "Where is the blackboard?"
          }
        ]
      },
      {
        type: "match-pairs",
        instruction: "Match classroom objects",
        pairs: [
          { creole: "Tablo", english: "Blackboard" },
          { creole: "Ban", english: "Bench" },
          { creole: "Liv", english: "Book" },
          { creole: "Kaye", english: "Notebook" },
          { creole: "Kreyon", english: "Pencil" }
        ]
      }
    ],
    vocabulary: [
      { creole: "Klas", english: "Classroom", pronunciation: "klahs" },
      { creole: "Lekòl", english: "School", pronunciation: "leh-KOHL" },
      { creole: "Tablo", english: "Blackboard", pronunciation: "tah-BLO" },
      { creole: "Ban", english: "Bench", pronunciation: "ban" },
      { creole: "Pòt", english: "Door", pronunciation: "poht" },
      { creole: "Fenet", english: "Window", pronunciation: "feh-NET" },
      { creole: "Drapo", english: "Flag", pronunciation: "drah-PO" },
      { creole: "Biwo", english: "Desk", pronunciation: "bee-WO" },
      { creole: "Liv", english: "Book", pronunciation: "leev" },
      { creole: "Kaye", english: "Notebook", pronunciation: "kah-YEH" },
      { creole: "Kreyon", english: "Pencil", pronunciation: "kreh-YON" },
      { creole: "Plim", english: "Pen", pronunciation: "pleem" },
      { creole: "Règ", english: "Ruler", pronunciation: "rehg" },
      { creole: "Chifon", english: "Eraser", pronunciation: "shee-FON" },
      { creole: "Madmwazel", english: "Teacher (female)", pronunciation: "mahd-mwah-ZEL" },
      { creole: "Elèv", english: "Student", pronunciation: "eh-LEV" },
      { creole: "Kanpe", english: "Stand", pronunciation: "kan-PEH" },
      { creole: "Chita", english: "Sit", pronunciation: "shee-TAH" },
      { creole: "Ekri", english: "Write", pronunciation: "eh-KREE" },
      { creole: "Louvri", english: "Open", pronunciation: "loo-VREE" },
      { creole: "Fèmen", english: "Close", pronunciation: "feh-MEN" },
      { creole: "Pran", english: "Take", pronunciation: "pran" }
    ],
    pronunciationPractice: [
      { phrase: "Ki sa sa-a ye?", translation: "What is that?" },
      { phrase: "Se yon klas", translation: "It's a classroom" },
      { phrase: "Gen tablo", translation: "There is a blackboard" },
      { phrase: "L'ap ekri sou tablo-a", translation: "She's writing on the blackboard" },
      { phrase: "Yo chita sou ban-yo", translation: "They're sitting on their benches" },
      { phrase: "Pran liv-la", translation: "Take the book" }
    ]
  }
];