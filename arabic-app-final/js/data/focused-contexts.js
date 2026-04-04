/**
 * focused-contexts.js - Stage B: Focused contextual study
 * Situational phrase banks for targeted practice
 */

export const FOCUSED_CONTEXTS = [
  {
    id: 'greetings',
    name: 'Greetings & Farewells',
    icon: '👋',
    phrases: [
      { ar: 'مرحبا', rom: 'marhaba', en: 'hello', context: 'General greeting' },
      { ar: 'صباح الخير', rom: 'sabah al-khayr', en: 'good morning', context: 'Morning greeting' },
      { ar: 'مساء الخير', rom: 'masa al-khayr', en: 'good evening', context: 'Evening greeting' },
      { ar: 'أهلا وسهلا', rom: 'ahlan wa sahlan', en: 'welcome', context: 'Welcoming someone' },
      { ar: 'مع السلامة', rom: 'ma\'a as-salama', en: 'goodbye', context: 'Saying goodbye' },
      { ar: 'يلا باي', rom: 'yalla bye', en: 'bye (casual)', context: 'Casual goodbye' }
    ]
  },
  
  {
    id: 'family_visit',
    name: 'Family Visit',
    icon: '👪',
    phrases: [
      { ar: 'شو أخبارك؟', rom: 'shu akhbarak?', en: 'what\'s your news?', context: 'Asking family for updates' },
      { ar: 'كل شي تمام؟', rom: 'kul shi tamam?', en: 'is everything good?', context: 'Checking on family' },
      { ar: 'اشتقتلك كتير', rom: 'ishta\'tilak kteer', en: 'I missed you so much', context: 'Expressing missing someone' },
      { ar: 'كيف العيلة؟', rom: 'kayf al-\'eyle?', en: 'how\'s the family?', context: 'Asking about family' },
      { ar: 'سلم علي عليهم', rom: 'sallim \'alayya \'alayhum', en: 'send them my regards', context: 'Sending greetings' },
      { ar: 'الله يخليلك ياهم', rom: 'allah ykhalli-lak yaahum', en: 'may God keep them for you', context: 'Blessing someone\'s family' }
    ]
  },
  
  {
    id: 'food_dining',
    name: 'Food & Dining',
    icon: '🍽️',
    phrases: [
      { ar: 'صحة', rom: 'sahha', en: 'bon appétit', context: 'Wishing good health while eating' },
      { ar: 'الأكل طيب كتير', rom: 'al-akl tayyib kteer', en: 'the food is very good', context: 'Complimenting food' },
      { ar: 'شو بدك تاكل؟', rom: 'shu biddak takul?', en: 'what do you want to eat?', context: 'Asking what someone wants' },
      { ar: 'انا شبعت', rom: 'ana shaba\'t', en: 'I\'m full', context: 'Saying you\'re full' },
      { ar: 'يسلمو إيديكي', rom: 'yislamو idayki', en: 'bless your hands', context: 'Thanking cook (to a woman)' },
      { ar: 'تفضل', rom: 'tafaddal', en: 'please, go ahead', context: 'Offering food (to a man)' },
      { ar: 'تفضلي', rom: 'tafaddali', en: 'please, go ahead', context: 'Offering food (to a woman)' }
    ]
  },
  
  {
    id: 'expressing_feelings',
    name: 'Expressing Feelings',
    icon: '💚',
    phrases: [
      { ar: 'انا مبسوط كتير', rom: 'ana mabsoot kteer', en: 'I\'m very happy', context: 'Expressing happiness (man)' },
      { ar: 'انا مبسوطة كتير', rom: 'ana mabsoota kteer', en: 'I\'m very happy', context: 'Expressing happiness (woman)' },
      { ar: 'بحبك', rom: 'bahibbak', en: 'I love you', context: 'Expressing love' },
      { ar: 'انت/انتي غالي/ة علي', rom: 'inta/inti ghali/ye \'alayya', en: 'you\'re precious to me', context: 'Showing affection' },
      { ar: 'ما بصدق', rom: 'ma basaddi\'', en: 'I can\'t believe it', context: 'Expressing disbelief' },
      { ar: 'يا عيني عليك', rom: 'ya \'ayni \'alayk', en: 'oh my eye on you', context: 'Endearment expression' }
    ]
  },
  
  {
    id: 'asking_help',
    name: 'Asking for Help',
    icon: '🤝',
    phrases: [
      { ar: 'ممكن تساعدني؟', rom: 'mumkin tsa\'idni?', en: 'can you help me?', context: 'Requesting help' },
      { ar: 'مش فاهم', rom: 'mish fahim', en: 'I don\'t understand', context: 'Expressing confusion (man)' },
      { ar: 'مش فاهمة', rom: 'mish fahme', en: 'I don\'t understand', context: 'Expressing confusion (woman)' },
      { ar: 'شو يعني؟', rom: 'shu ya\'ni?', en: 'what does it mean?', context: 'Asking for meaning' },
      { ar: 'ممكن تعيد؟', rom: 'mumkin tu\'eed?', en: 'can you repeat?', context: 'Asking for repetition' },
      { ar: 'شوية شوية', rom: 'shwayye shwayye', en: 'slowly slowly', context: 'Asking someone to slow down' }
    ]
  },
  
  {
    id: 'compliments_gratitude',
    name: 'Compliments & Gratitude',
    icon: '🙏',
    phrases: [
      { ar: 'يعطيك العافية', rom: 'ya\'teek al-\'afye', en: 'may you be given strength', context: 'Thanking someone for effort' },
      { ar: 'الله يحفظك', rom: 'allah yihfazak', en: 'may God protect you', context: 'Blessing someone' },
      { ar: 'ما شاء الله', rom: 'ma sha allah', en: 'God has willed it', context: 'Complimenting/admiring' },
      { ar: 'بارك الله فيك', rom: 'barak allah feek', en: 'may God bless you', context: 'Thanking/blessing' },
      { ar: 'كتير منيح', rom: 'kteer mneeh', en: 'very good', context: 'Complimenting' },
      { ar: 'شكراً من قلبي', rom: 'shukran min albi', en: 'thank you from my heart', context: 'Deep gratitude' }
    ]
  }
];
