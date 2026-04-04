/**
 * data/aya-course.js
 * Aya's bespoke course content - 74 phrases across 5 units
 * Includes phonics data, cultural cards, and Marwan's personal notes
 * Pure data - NO logic
 * NO dependencies
 */

export const PHONICS_DATA = [
  { letter: 'ح', name: 'Haa', sound: 'breathy h', example: 'حَبِيبِي', exampleEn: 'Habibi (my love)', note: 'Like breathing on cold glass' },
  { letter: 'خ', name: 'Khaa', sound: 'kh (gurgle)', example: 'خَال', exampleEn: 'Khaal (uncle)', note: 'Like gargling - from the back of throat' },
  { letter: 'ص', name: 'Saad', sound: 'S (heavy)', example: 'صَبَاح', exampleEn: 'Sabah (morning)', note: 'Regular S but with your tongue lower' },
  { letter: 'ض', name: 'Daad', sound: 'D (heavy)', example: 'ضَوْء', exampleEn: 'Daw\' (light)', note: 'Heavy D - unique to Arabic!' },
  { letter: 'ط', name: 'Taa', sound: 'T (heavy)', example: 'طَيِّب', exampleEn: 'Tayyib (good)', note: 'Heavier T sound' },
  { letter: 'ظ', name: 'Thaa', sound: 'emphatic th', example: 'ظُهْر', exampleEn: 'Thuhr (noon)', note: 'Heavy "th" sound' },
  { letter: 'ع', name: 'Ayn', sound: 'throat squeeze', example: 'عَيْن', exampleEn: '\'Ayn (eye)', note: 'Squeeze your throat gently' },
  { letter: 'غ', name: 'Ghayn', sound: 'gh (French r)', example: 'غُرْفَة', exampleEn: 'Ghurfa (room)', note: 'Like the French "r" in "Paris"' },
  { letter: 'ق', name: 'Qaaf', sound: 'q (deep k)', example: 'قَلَم', exampleEn: 'Qalam (pen)', note: 'K from deep in your throat' }
];

export const AYA_UNITS = [
  {
    id: 'aya-unit-1',
    title: 'Meeting the Family',
    icon: '🫂',
    description: 'First impressions with Marwan\'s family',
    phrases: [
      { en: 'Hello', ar: 'مَرْحَبَا', ro: 'marhaba', note: 'Your first word - use it with everyone!', gender: 'neutral' },
      { en: 'How are you? (to woman)', ar: 'كِيفِك؟', ro: 'keefik?', note: 'Use this with Mama (Mona), Serene, Teeta', gender: 'f' },
      { en: 'How are you? (to man)', ar: 'كِيفَك؟', ro: 'keefak?', note: 'Use this with Baba (Basem), Omar, Jiddo', gender: 'm' },
      { en: 'I\'m fine, thank God', ar: 'مْنِيحَة، الحَمْدُ لِلّه', ro: 'mneeha, alhamdulillah', note: 'Classic response - shows you\'re grateful', gender: 'f' },
      { en: 'Thank you', ar: 'شُكْرَاً', ro: 'shukran', note: 'Essential for every situation', gender: 'neutral' },
      { en: 'You\'re welcome', ar: 'عَفْوَاً', ro: '\'afwan', note: 'Literally means "pardon" or "it\'s nothing"', gender: 'neutral' },
      { en: 'Father (Dad)', ar: 'بَابَا', ro: 'baba', note: 'This is what you call Basem!', gender: 'm' },
      { en: 'Mother (Mom)', ar: 'مَامَا', ro: 'mama', note: 'This is what you call Mona!', gender: 'f' },
      { en: 'Grandpa', ar: 'جِدّو', ro: 'jiddo', note: 'Warm and affectionate - Marwan\'s grandpa', gender: 'm' },
      { en: 'Grandma', ar: 'تِيتة', ro: 'teeta', note: 'Classic Levantine - Marwan\'s grandma', gender: 'f' },
      { en: 'Brother', ar: 'أَخ', ro: 'akh', note: 'Omar is Marwan\'s brother (akh)', gender: 'm' },
      { en: 'Sister', ar: 'أُخْت', ro: 'ukht', note: 'Serene is Marwan\'s sister (ukht)', gender: 'f' },
      { en: 'Nice to meet you', ar: 'تْشَرَّفْنَا', ro: 'tsharrafna', note: 'Literally "we are honored" - very polite', gender: 'neutral' },
      { en: 'God bless you', ar: 'الله يْخَلِّيكِي', ro: 'allah ykhalliki', note: 'Beautiful blessing - shows warmth', gender: 'f' },
      { en: 'I love you', ar: 'بْحِبِّك', ro: 'bhibbik', note: 'For Marwan 💚', gender: 'neutral' }
    ]
  },
  
  {
    id: 'aya-unit-2',
    title: 'At the Table',
    icon: '🍽️',
    description: 'Food, hospitality, and mealtime conversation',
    phrases: [
      { en: 'Bon appetit', ar: 'صَحْتَيْن', ro: 'sahtein', note: 'Literally "two healths" - said before eating', gender: 'neutral' },
      { en: 'May you always be well', ar: 'عَلى قَلْبَك', ro: '\'ala albak', note: 'Response to sahtein - "on your heart"', gender: 'neutral' },
      { en: 'Delicious!', ar: 'طَيِّب كْتِير!', ro: 'tayyib kteer!', note: 'Huge compliment to the cook!', gender: 'neutral' },
      { en: 'I want', ar: 'بِدِّي', ro: 'biddi', note: 'Super useful - "I want water" = biddi mayy', gender: 'neutral' },
      { en: 'Water', ar: 'مَيّ', ro: 'mayy', note: 'Palestinian pronunciation of water', gender: 'neutral' },
      { en: 'Coffee', ar: 'قَهْوَة', ro: 'ahwe', note: 'Arabic coffee - often with cardamom', gender: 'neutral' },
      { en: 'Tea', ar: 'شَاي', ro: 'shay', note: 'Usually sweet with fresh mint', gender: 'neutral' },
      { en: 'Bread', ar: 'خُبْز', ro: 'khubz', note: 'Staple of every meal - fresh pita', gender: 'neutral' },
      { en: 'Please (to woman)', ar: 'مِن فَضْلِك', ro: 'min fadlik', note: 'Polite request to women', gender: 'f' },
      { en: 'Please (to man)', ar: 'مِن فَضْلَك', ro: 'min fadlak', note: 'Polite request to men', gender: 'm' },
      { en: 'Enough, I\'m full', ar: 'بَسّ، شَبْعانَة', ro: 'bass, shab\'aane', note: 'Politely declining more food', gender: 'f' },
      { en: 'God bless your hands', ar: 'يِسْلَمو إِيدَيْكِي', ro: 'yislamo edeiki', note: 'Thank the cook - "may your hands be safe"', gender: 'f' },
      { en: 'God bless you', ar: 'الله يِسْلَمِك', ro: 'allah yislamik', note: 'General blessing', gender: 'neutral' },
      { en: 'May God give you health', ar: 'الله يِعْطِيكِي العَافْيَة', ro: 'allah yi\'teeki el-\'aafye', note: 'After someone works hard (especially cooking!)', gender: 'f' },
      { en: 'God give you strength', ar: 'الله يِقَوِّيكِي', ro: 'allah yi\'awweeki', note: 'Response to the above blessing', gender: 'f' }
    ]
  },
  
  {
    id: 'aya-unit-3',
    title: 'Small Talk & Connection',
    icon: '💬',
    description: 'Building rapport and showing interest',
    phrases: [
      { en: 'What\'s your name?', ar: 'شُو اسْمِك؟', ro: 'shu ismik?', note: 'Asking someone their name', gender: 'f' },
      { en: 'My name is Aya', ar: 'اِسْمِي آيا', ro: 'ismi Aya', note: 'Introducing yourself', gender: 'neutral' },
      { en: 'Where are you from?', ar: 'مِن وَيْن إِنْتِي؟', ro: 'min wayn inti?', note: 'Asking where someone is from', gender: 'f' },
      { en: 'I\'m from Japan', ar: 'أَنا مِن اليَابَان', ro: 'ana min el-yabaan', note: 'Your introduction!', gender: 'neutral' },
      { en: 'I\'m learning Arabic', ar: 'أَنا بْتَعَلَّم عَرَبِي', ro: 'ana bta\'allam \'arabi', note: 'People will LOVE hearing this', gender: 'neutral' },
      { en: 'A little', ar: 'شْوَيّة', ro: 'shwayy', note: 'When they ask "do you speak Arabic?"', gender: 'neutral' },
      { en: 'I don\'t understand', ar: 'مَا بِفْهَم', ro: 'ma bafham', note: 'Essential when you\'re lost in conversation', gender: 'neutral' },
      { en: 'Slowly please', ar: 'شْوَيّ شْوَيّ', ro: 'shwayy shwayy', note: 'Literally "little little" - asking them to slow down', gender: 'neutral' },
      { en: 'What does this mean?', ar: 'شُو يَعْنِي هَادَا؟', ro: 'shu ya\'ni haada?', note: 'When you hear a word you don\'t know', gender: 'neutral' },
      { en: 'Yes', ar: 'أَيْوَه', ro: 'aywa', note: 'Casual Palestinian yes', gender: 'neutral' },
      { en: 'No', ar: 'لَأ', ro: 'la\'', note: 'Simple no', gender: 'neutral' },
      { en: 'Okay / Alright', ar: 'مَاشِي', ro: 'maashi', note: 'Literally "walking" - means okay/fine', gender: 'neutral' },
      { en: 'God willing', ar: 'إِن شَاء الله', ro: 'inshallah', note: 'Used for future plans - "see you tomorrow, inshallah"', gender: 'neutral' },
      { en: 'Praise be to God', ar: 'الحَمْدُ لِلّه', ro: 'alhamdulillah', note: 'Gratitude expression - use it often!', gender: 'neutral' },
      { en: 'I\'m sorry', ar: 'آسْفَة', ro: 'aasfe', note: 'Apologizing as a woman', gender: 'f' }
    ]
  },
  
  {
    id: 'aya-unit-4',
    title: 'Expressing Yourself',
    icon: '❤️',
    description: 'Emotions, compliments, and heart phrases',
    phrases: [
      { en: 'I\'m happy', ar: 'أَنا مَبْسُوطَة', ro: 'ana mabsoota', note: 'Expressing happiness', gender: 'f' },
      { en: 'I\'m tired', ar: 'أَنا تْعَبَانَة', ro: 'ana ta\'baane', note: 'When you need rest', gender: 'f' },
      { en: 'Beautiful', ar: 'حِلْو', ro: 'hilw', note: 'Can describe things, places, or moments', gender: 'neutral' },
      { en: 'Very beautiful', ar: 'حِلْو كْتِير', ro: 'hilw kteer', note: 'Stronger compliment', gender: 'neutral' },
      { en: 'Excellent!', ar: 'مُمْتَاز!', ro: 'mumtaaz!', note: 'Great work! Well done!', gender: 'neutral' },
      { en: 'Wonderful', ar: 'رَائِع', ro: 'raa\'i\'', note: 'Amazing, wonderful', gender: 'neutral' },
      { en: 'My love', ar: 'حَبِيبِي', ro: 'habibi', note: 'Term of endearment - literally "my beloved"', gender: 'm' },
      { en: 'My dear (f)', ar: 'حَبِيبْتِي', ro: 'habibti', note: 'Affectionate term for women', gender: 'f' },
      { en: 'Sweetheart', ar: 'يَا عَسَل', ro: 'ya \'asal', note: 'Literally "oh honey" - super sweet', gender: 'neutral' },
      { en: 'My soul', ar: 'يَا رُوحِي', ro: 'ya roohi', note: 'Deep affection - "you are my soul"', gender: 'neutral' },
      { en: 'My eyes', ar: 'يَا عُيُونِي', ro: 'ya \'oyooni', note: 'Intense affection - "you are my eyes"', gender: 'neutral' },
      { en: 'I miss you', ar: 'وَحْشْتِينِي', ro: 'wahashteeni', note: 'Missing someone deeply', gender: 'f' },
      { en: 'I\'m thinking of you', ar: 'بْفَكِّر فِيكِي', ro: 'bfakkir feeki', note: 'You\'re on my mind', gender: 'f' },
      { en: 'You\'re in my heart', ar: 'إِنْتِي بْقَلْبِي', ro: 'inti b\'albi', note: 'Deep love expression', gender: 'f' },
      { en: 'May God protect you', ar: 'الله يْحْفَظِك', ro: 'allah yihfathik', note: 'Protective blessing', gender: 'neutral' }
    ]
  },
  
  {
    id: 'aya-unit-5',
    title: 'Goodbyes & Blessings',
    icon: '👋',
    description: 'Parting words and heartfelt blessings',
    phrases: [
      { en: 'Goodbye', ar: 'مَع السَّلَامَة', ro: 'ma\' as-salaame', note: 'Literally "go with peace"', gender: 'neutral' },
      { en: 'See you later', ar: 'بْشُوفِك بُكْرَة', ro: 'bshoofik bukra', note: 'Literally "see you tomorrow"', gender: 'neutral' },
      { en: 'Safe travels', ar: 'سَلَامْتَك', ro: 'salaamtak', note: 'Wishing someone safe journey', gender: 'neutral' },
      { en: 'God keep you', ar: 'الله يْخَلِّيكِي', ro: 'allah ykhalliki', note: 'Beautiful parting blessing', gender: 'f' },
      { en: 'God be with you', ar: 'الله مَعَكِي', ro: 'allah ma\'aki', note: 'May God be with you', gender: 'f' },
      { en: 'Take care', ar: 'خُلِّي بَالِك', ro: 'khulli baalik', note: 'Take care of yourself', gender: 'neutral' },
      { en: 'Good night', ar: 'تْصَبَّحِي عَلى خَيْر', ro: 'tsabbahi \'ala kheir', note: 'Literally "wake up to goodness"', gender: 'f' },
      { en: 'Sweet dreams', ar: 'أَحْلَام سَعِيدَة', ro: 'ahlaam sa\'eeda', note: 'Happy dreams', gender: 'neutral' },
      { en: 'Until we meet again', ar: 'لِحَدّ مَا نِتْشُوف', ro: 'lihad ma nitshouf', note: 'Until we see each other', gender: 'neutral' },
      { en: 'I won\'t forget you', ar: 'مَا رَح أَنْسَاكِي', ro: 'ma rah ansaaki', note: 'I won\'t forget you', gender: 'f' },
      { en: 'You\'ll always be in my heart', ar: 'رَح تِظَلِّي بْقَلْبِي', ro: 'rah tidhalli b\'albi', note: 'You\'ll stay in my heart', gender: 'f' },
      { en: 'Thank you for everything', ar: 'شُكْرَاً عَلى كُلّ شِي', ro: 'shukran \'ala kull shi', note: 'Gratitude for everything', gender: 'neutral' },
      { en: 'God bless this family', ar: 'الله يْبَارِك فِيكُو', ro: 'allah ybaarik feeku', note: 'Blessing the whole family', gender: 'neutral' },
      { en: 'I\'m honored to know you', ar: 'أَنا مُشَرَّفَة', ro: 'ana msharrafe', note: 'Feeling honored/privileged', gender: 'f' }
    ]
  }
];

export const CULTURAL_CARDS = [
  {
    afterUnit: 1,
    title: 'Family Titles Matter',
    icon: '👨‍👩‍👧‍👦',
    content: `In Palestinian culture, family relationships are very specific. Using the right term shows respect:

• عَم (\'amm) = father's brother
• خَال (khaal) = mother's brother  
• عَمّة (\'amme) = father's sister
• خَالة (khaale) = mother's sister

These aren't interchangeable! Using the correct term shows you understand the family structure.`
  },
  {
    afterUnit: 2,
    title: 'Hospitality is Sacred',
    icon: '🫖',
    content: `Palestinian hospitality is legendary. When visiting:

• You'll be offered coffee/tea multiple times - accept at least once
• Saying "صَحْتَيْن" (sahtein) before eating shows respect
• "يِسْلَمو إِيدَيْكِي" (yislamo edeiki) to the cook is a huge compliment
• If you're full, say "بَسّ شَبْعانَة" (bass shab'aane) politely

Never refuse food aggressively - it can seem rude. A gentle "bass, shukran" works!`
  },
  {
    afterUnit: 3,
    title: 'Blessings are Everywhere',
    icon: '🤲',
    content: `Arabic is full of blessings woven into everyday speech:

• "إِن شَاء الله" (inshallah) - for any future event
• "الحَمْدُ لِلّه" (alhamdulillah) - expressing gratitude
• "الله يْخَلِّيكِي" (allah ykhalliki) - "may God keep you"
• "يِعْطِيكِي العَافْيَة" (yi'teeki el-'aafye) - after someone works

These aren't just religious - they're cultural expressions of goodwill everyone uses!`
  }
];

export const MARWAN_NOTES = [
  {
    afterUnit: 1,
    message: `يَا حَبِيبْتِي Aya,

You just learned to greet my family! I'm so proud of you. 

When you meet Mama (مَامَا Mona) and Baba (بَابَا Basem), they're going to light up when they hear you speak Arabic. Even just "مَرْحَبَا" (marhaba) and "كِيفِك؟" (keefik) will mean the world to them.

Remember: Teeta (تِيتة) might cry happy tears. It's normal - she's just overjoyed.

You've got this. I love you.
— Marwan 💚`
  },
  {
    afterUnit: 2,
    message: `يَا رُوحِي,

Unit 2 done! Now you can navigate the dinner table like a pro.

Important tip: When Mama offers you more food (and she will, many times), "بَسّ شَبْعانَة" (bass shab'aane) is your friend. But always say "يِسْلَمو إِيدَيْكِي" (yislamo edeiki) after the meal - it'll make her day.

Also, "طَيِّب كْتِير" (tayyib kteer) after tasting her food? She'll adopt you on the spot.

Keep going habibti 💚
— M`
  },
  {
    afterUnit: 3,
    message: `Aya يَا عُيُونِي,

You're more than halfway there. Look at you!

The phrases in Unit 3 are going to save you when conversations get fast. "مَا بِفْهَم" (ma bafham) is not embarrassing - everyone will slow down and help you.

And "أَنا بْتَعَلَّم عَرَبِي" (ana bta'allam 'arabi)? That's going to get you SO much love and encouragement.

Two more units. You're almost ready for June 5.
— Your Marwan 💚`
  },
  {
    afterCourse: true,
    message: `حَبِيبْتِي Aya,

You did it. All 74 phrases. نور عيوني.

I know June 5 feels big, but you're ready. More than ready.

You've learned my family's language, you've learned the blessings, you've learned how to show respect and warmth. That's all they want - to feel your heart.

And trust me, they already love you because I love you.

See you soon يَا رُوحِي 💚
— Marwan

P.S. You're incredible. Don't forget that.`
  }
];
