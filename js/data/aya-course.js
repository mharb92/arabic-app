/**
 * aya-course.js - Aya's Complete Bespoke Course
 * Hand-crafted for meeting Marwan's family in Palestine (June 5, 2026)
 * 5 units, 60 phrases (12 per unit), phonics, cultural cards, Marwan's personal notes
 */

export const AYA_UNITS = [
  {
    id: 'aya_unit1',
    title: 'Meeting the Family',
    subtitle: 'First impressions with warmth',
    phrases: [
      { ar: 'أهلا وسهلا', rom: 'ahlan wa sahlan', en: 'welcome', context: 'They will say this to you - respond with a smile' },
      { ar: 'مرحبا', rom: 'marhaba', en: 'hello', context: 'Your go-to greeting' },
      { ar: 'تشرفنا', rom: 'tasharrafna', en: 'honored to meet you', context: 'Shows respect when meeting elders' },
      { ar: 'اسمي آية', rom: 'ismi Aya', en: 'my name is Aya', context: 'They will ask - be ready!' },
      { ar: 'انا من اليابان', rom: 'ana min al-yaban', en: 'I\'m from Japan', context: 'They will be curious' },
      { ar: 'كيف حالك؟', rom: 'kayf halik?', en: 'how are you? (to a woman)', context: 'Use with mama Mona' },
      { ar: 'كيف حالك؟', rom: 'kayf halak?', en: 'how are you? (to a man)', context: 'Use with baba Basem' },
      { ar: 'الحمد لله', rom: 'alhamdulillah', en: 'praise God / I\'m fine', context: 'The standard response - always appropriate' },
      { ar: 'تمام', rom: 'tamam', en: 'good/fine', context: 'Casual response' },
      { ar: 'شكراً', rom: 'shukran', en: 'thank you', context: 'You will use this constantly' },
      { ar: 'شكراً كتير', rom: 'shukran kteer', en: 'thank you very much', context: 'Extra gratitude' },
      { ar: 'عفواً', rom: 'afwan', en: 'you\'re welcome', context: 'Response to thank you' }
      // Trimmed: بخير, لا شكر على واجب, تسلم, تسلمي (less essential for first impressions)
    ]
  },
  
  {
    id: 'aya_unit2',
    title: 'Family Names & Relationships',
    subtitle: 'The people who matter',
    phrases: [
      { ar: 'هذا بابا باسم', rom: 'hatha baba Basem', en: 'this is dad Basem', context: 'Marwan will introduce him' },
      { ar: 'هذي ماما منى', rom: 'hathi mama Mona', en: 'this is mama Mona', context: 'The heart of the family' },
      { ar: 'هذا عمر', rom: 'hatha Omar', en: 'this is Omar', context: 'Marwan\'s brother' },
      { ar: 'هذي سيرين', rom: 'hathi Serene', en: 'this is Serene', context: 'Marwan\'s sister' },
      { ar: 'أخو مروان', rom: 'akhu Marwan', en: 'Marwan\'s brother' },
      { ar: 'أخت مروان', rom: 'ukht Marwan', en: 'Marwan\'s sister' },
      { ar: 'كيف العائلة؟', rom: 'kayf al-\'a\'ila?', en: 'how is the family?', context: 'Asking about everyone' },
      { ar: 'انتو عائلة حلوة كتير', rom: 'intu \'a\'ila helwa kteer', en: 'you\'re a very nice family', context: 'A compliment they will love' },
      { ar: 'مروان حكالي عنكم', rom: 'Marwan hakali \'ankum', en: 'Marwan told me about you', context: 'Shows you care' },
      { ar: 'انا مبسوطة كتير إني هون', rom: 'ana mabsoota kteer inni hawn', en: 'I\'m very happy to be here', context: 'From your heart' },
      { ar: 'بيتكم حلو', rom: 'baytkum helo', en: 'your house is beautiful', context: 'A kind compliment' },
      { ar: 'فلسطين حلوة كتير', rom: 'Falasteen helwa kteer', en: 'Palestine is very beautiful', context: 'They will be touched' }
    ]
  },
  
  {
    id: 'aya_unit3',
    title: 'At the Table',
    subtitle: 'Food is love in Palestinian culture',
    phrases: [
      { ar: 'صحة', rom: 'sahha', en: 'bon appétit', context: 'Say this when eating starts' },
      { ar: 'صحتين', rom: 'sahtayn', en: 'double health', context: 'Response to sahha' },
      { ar: 'يسلمو إيديكي', rom: 'yislamu idayki', en: 'bless your hands', context: 'To mama after she cooks - she will beam' },
      { ar: 'الأكل طيب كتير', rom: 'al-akl tayyib kteer', en: 'the food is very good', context: 'They will keep feeding you' },
      { ar: 'بدي أتعلم', rom: 'biddi ata\'allam', en: 'I want to learn', context: 'If you want to help in kitchen' },
      { ar: 'شو هاد؟', rom: 'shu had?', en: 'what is this?', context: 'Asking about dishes' },
      { ar: 'تفضلي', rom: 'tafaddali', en: 'please, go ahead', context: 'They will say this - means eat!' },
      { ar: 'انا شبعت', rom: 'ana shaba\'t', en: 'I\'m full', context: 'Hard to say but sometimes necessary' },
      { ar: 'كمان شوي', rom: 'kaman shway', en: 'a little more', context: 'They will offer - this means yes' },
      { ar: 'بس هيك', rom: 'bass hayk', en: 'just this much', context: 'Trying to say no more' },
      { ar: 'زيتون فلسطيني', rom: 'zaytoon Falasteen', en: 'Palestinian olives', context: 'Pride of the table' },
      { ar: 'زعتر', rom: 'za\'tar', en: 'thyme mix', context: 'The breakfast staple' }
      // Trimmed: المسخن, المقلوبة (can learn dish names naturally at the table)
    ]
  },
  
  {
    id: 'aya_unit4',
    title: 'Expressing Love & Gratitude',
    subtitle: 'Opening your heart',
    phrases: [
      { ar: 'بحبكم', rom: 'bahibbkom', en: 'I love you all', context: 'To the whole family' },
      { ar: 'انتو طيبين كتير', rom: 'intu tayyibeen kteer', en: 'you\'re very kind', context: 'Sincere appreciation' },
      { ar: 'ما شاء الله', rom: 'ma sha allah', en: 'God has willed it', context: 'Compliment without evil eye' },
      { ar: 'الله يخليلي ياكم', rom: 'allah ykhalli-li yakum', en: 'may God keep you for me', context: 'Deep blessing' },
      { ar: 'الله يحفظكم', rom: 'allah yihfazkom', en: 'may God protect you', context: 'Blessing the family' },
      { ar: 'يعطيكم العافية', rom: 'ya\'teekom al-\'afye', en: 'may you be given strength', context: 'Thanks for effort' },
      { ar: 'مروان محظوظ فيكم', rom: 'Marwan mahzuz feekom', en: 'Marwan is lucky to have you', context: 'About his family' },
      { ar: 'انتي زي أمي', rom: 'inti zayy ummi', en: 'you\'re like my mother', context: 'To mama Mona - highest compliment' },
      { ar: 'حسيت حالي بالبيت', rom: 'hassayt hali bil-bayt', en: 'I felt at home', context: 'They will love this' },
      { ar: 'شكراً من قلبي', rom: 'shukran min albi', en: 'thank you from my heart', context: 'Deep gratitude' },
      { ar: 'ما بنسى هاد', rom: 'ma bansa had', en: 'I won\'t forget this', context: 'Memorable moment' },
      { ar: 'انتو أحلى ناس', rom: 'intu ahla nas', en: 'you\'re the sweetest people', context: 'Warm compliment' }
    ]
  },
  
  {
    id: 'aya_unit5',
    title: 'Staying Connected',
    subtitle: 'For the journey ahead',
    phrases: [
      { ar: 'رح أرجع', rom: 'rah arja\'', en: 'I will come back', context: 'Promise to return' },
      { ar: 'ان شاء الله نتشوف قريب', rom: 'in sha allah nitshawwaf \'areeb', en: 'God willing we\'ll see each other soon' },
      { ar: 'اشتقتلكم', rom: 'ishta\'tilkom', en: 'I miss you all', context: 'After you leave' },
      { ar: 'رح أحكي معكم', rom: 'rah ahki ma\'kom', en: 'I will talk with you', context: 'Stay in touch' },
      { ar: 'رح أبعتلكم صور', rom: 'rah ab\'atlkom suwar', en: 'I will send you photos' },
      { ar: 'انتو دايماً بقلبي', rom: 'intu dayman bi-albi', en: 'you\'re always in my heart', context: 'Touching farewell' },
      { ar: 'فلسطين ببالي', rom: 'Falasteen bi-bali', en: 'Palestine is on my mind', context: 'Showing connection' },
      { ar: 'مع السلامة', rom: 'ma\'a as-salama', en: 'goodbye (with peace)', context: 'Formal goodbye' },
      { ar: 'الله معكم', rom: 'allah ma\'kom', en: 'God be with you', context: 'Parting blessing' },
      { ar: 'رح أشتاقلكم', rom: 'rah ashta\'ilkom', en: 'I will miss you', context: 'Before parting' },
      { ar: 'تعلمت كتير منكم', rom: 'ta\'alamt kteer minkom', en: 'I learned a lot from you', context: 'Gratitude for teaching' },
      { ar: 'حبيت فلسطين', rom: 'habbayt Falasteen', en: 'I loved Palestine', context: 'From the heart' }
      // Trimmed: سلامات, نشوفكم قريب ان شاء الله (redundant with other goodbyes)
    ]
  }
];

// Phonics for Aya - 5 key sounds
export const PHONICS_DATA = [
  {
    sound: 'ع (ayn)',
    description: 'The deep throat sound',
    example: { arabic: 'عين', romanization: '\'ayn', meaning: 'eye' },
    tip: 'Like a gentle throat compression'
  },
  {
    sound: 'ح (haa)',
    description: 'The breathy h',
    example: { arabic: 'حب', romanization: 'hubb', meaning: 'love' },
    tip: 'Breathe from deep in throat'
  },
  {
    sound: 'خ (kha)',
    description: 'Like Spanish j or German ch',
    example: { arabic: 'خبز', romanization: 'khubz', meaning: 'bread' },
    tip: 'Think of clearing your throat gently'
  },
  {
    sound: 'ق (qaf)',
    description: 'The deep k sound',
    example: { arabic: 'قلب', romanization: 'qalb', meaning: 'heart' },
    tip: 'K from the back of throat'
  },
  {
    sound: 'ر (ra)',
    description: 'The rolling r',
    example: { arabic: 'مروان', romanization: 'Marwan', meaning: 'Marwan' },
    tip: 'Roll your tongue - like Spanish rr'
  }
];

// Cultural cards - insights into Palestinian culture
export const CULTURAL_CARDS = [
  {
    title: 'Palestinian Hospitality',
    content: 'In Palestinian culture, refusing food or drink can be seen as impolite. The family will offer multiple times - this is generosity, not pressure. Accept at least something small, and compliment the host warmly. Food is how love is shown.',
    tip: 'Say "يسلمو إيديكي" (yislamu idayki) - bless your hands - to the cook. This phrase will make mama Mona so happy.'
  },
  {
    title: 'Family is Everything',
    content: 'Palestinian families are close-knit and multi-generational. Respect for elders is paramount. Address older family members first, ask about their health and family, and listen to their stories. This shows beautiful manners (أدب - adab).',
    tip: 'If you meet extended family, greet the eldest first. A small gesture that shows deep respect.'
  },
  {
    title: 'Language & Connection',
    content: 'Even basic Arabic will touch hearts. Palestinians are proud of their language and dialect. Don\'t worry about mistakes - the effort matters more than perfection. Every word you speak in Arabic is a bridge to deeper connection.',
    tip: 'If you forget a word, just smile and try. They will help you, and everyone will appreciate your effort.'
  }
];

// Marwan's personal notes at milestones
export const MARWAN_NOTES = [
  {
    milestone: 'after_unit_1',
    title: 'You\'re Already Family',
    content: 'Aya, you just learned the phrases that will make my parents smile. When you say "تشرفنا" (honored to meet you), you\'re showing them the respect that means everything in our culture. I\'m so proud of you. - M 💚'
  },
  {
    milestone: 'after_unit_2',
    title: 'The Names That Matter',
    content: 'Now you know the names of the people I love most. Baba Basem, Mama Mona, Omar, Serene - these are the hearts of my world. When you say their names in Arabic, you\'re already part of our family story. - M 💚'
  },
  {
    milestone: 'after_unit_3',
    title: 'Food is Love',
    content: 'Mama will cook for days before we arrive. Every dish is made with love, every offer of food is an offer of belonging. When you say "يسلمو إيديكي", you\'re telling her you see that love. This will mean the world to her. - M 💚'
  },
  {
    milestone: 'course_complete',
    title: 'نور عيوني',
    content: 'Aya, you did it. You learned 74 phrases, navigated new sounds, embraced a new culture - all to connect with my family in their language. This is love in action. They will see your effort, and they will love you for it. I already do. نور عيوني - light of my eyes. - Marwan 💚'
  }
];
