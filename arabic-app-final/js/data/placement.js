/**
 * placement.js - 5-level placement test for heritage speakers
 * 32 questions per level, 50% threshold to advance
 */

export const PLACEMENT_LEVELS = [
  {
    name: 'Level 1: Basic Recognition',
    level: 0,
    questions: [
      // Greetings (8)
      { prompt: 'مرحبا', answer: 'hello', type: 'translate' },
      { prompt: 'أهلا', answer: 'hello/welcome', type: 'translate' },
      { prompt: 'صباح الخير', answer: 'good morning', type: 'translate' },
      { prompt: 'مساء الخير', answer: 'good evening', type: 'translate' },
      { prompt: 'كيف حالك؟', answer: 'how are you', type: 'translate' },
      { prompt: 'الحمد لله', answer: 'praise god/fine', type: 'translate' },
      { prompt: 'شكراً', answer: 'thank you', type: 'translate' },
      { prompt: 'عفواً', answer: 'you\'re welcome', type: 'translate' },
      
      // Family (8)
      { prompt: 'أب', answer: 'father', type: 'translate' },
      { prompt: 'أم', answer: 'mother', type: 'translate' },
      { prompt: 'أخ', answer: 'brother', type: 'translate' },
      { prompt: 'أخت', answer: 'sister', type: 'translate' },
      { prompt: 'ابن', answer: 'son', type: 'translate' },
      { prompt: 'بنت', answer: 'daughter', type: 'translate' },
      { prompt: 'جد', answer: 'grandfather', type: 'translate' },
      { prompt: 'جدة', answer: 'grandmother', type: 'translate' },
      
      // Numbers 1-10 (8)
      { prompt: 'واحد', answer: 'one', type: 'translate' },
      { prompt: 'اثنين', answer: 'two', type: 'translate' },
      { prompt: 'ثلاثة', answer: 'three', type: 'translate' },
      { prompt: 'أربعة', answer: 'four', type: 'translate' },
      { prompt: 'خمسة', answer: 'five', type: 'translate' },
      { prompt: 'ستة', answer: 'six', type: 'translate' },
      { prompt: 'سبعة', answer: 'seven', type: 'translate' },
      { prompt: 'ثمانية', answer: 'eight', type: 'translate' },
      
      // Basic words (8)
      { prompt: 'بيت', answer: 'house', type: 'translate' },
      { prompt: 'ماء', answer: 'water', type: 'translate' },
      { prompt: 'طعام', answer: 'food', type: 'translate' },
      { prompt: 'كتاب', answer: 'book', type: 'translate' },
      { prompt: 'مدرسة', answer: 'school', type: 'translate' },
      { prompt: 'سيارة', answer: 'car', type: 'translate' },
      { prompt: 'باب', answer: 'door', type: 'translate' },
      { prompt: 'شباك', answer: 'window', type: 'translate' }
    ]
  },
  
  {
    name: 'Level 2: Common Phrases',
    level: 1,
    questions: [
      // Daily expressions (8)
      { prompt: 'إن شاء الله', answer: 'god willing', type: 'translate' },
      { prompt: 'ما شاء الله', answer: 'god has willed it', type: 'translate' },
      { prompt: 'بإذن الله', answer: 'with god\'s permission', type: 'translate' },
      { prompt: 'يعطيك العافية', answer: 'may god give you strength', type: 'translate' },
      { prompt: 'صحة', answer: 'health/cheers', type: 'translate' },
      { prompt: 'تفضل', answer: 'please/go ahead (to man)', type: 'translate' },
      { prompt: 'تفضلي', answer: 'please/go ahead (to woman)', type: 'translate' },
      { prompt: 'مبروك', answer: 'congratulations', type: 'translate' },
      
      // Questions (8)
      { prompt: 'شو هاد؟', answer: 'what is this', type: 'translate' },
      { prompt: 'وين؟', answer: 'where', type: 'translate' },
      { prompt: 'متى؟', answer: 'when', type: 'translate' },
      { prompt: 'ليش؟', answer: 'why', type: 'translate' },
      { prompt: 'كم؟', answer: 'how much/many', type: 'translate' },
      { prompt: 'مين؟', answer: 'who', type: 'translate' },
      { prompt: 'كيف؟', answer: 'how', type: 'translate' },
      { prompt: 'أيمتى؟', answer: 'when', type: 'translate' },
      
      // Needs/wants (8)
      { prompt: 'بدي', answer: 'I want', type: 'translate' },
      { prompt: 'بدي ماي', answer: 'I want water', type: 'translate' },
      { prompt: 'بدي أكل', answer: 'I want to eat', type: 'translate' },
      { prompt: 'بدي أنام', answer: 'I want to sleep', type: 'translate' },
      { prompt: 'بدي أروح', answer: 'I want to go', type: 'translate' },
      { prompt: 'بدي أشرب', answer: 'I want to drink', type: 'translate' },
      { prompt: 'بدي أقعد', answer: 'I want to sit', type: 'translate' },
      { prompt: 'بدي أحكي', answer: 'I want to talk', type: 'translate' },
      
      // Descriptions (8)
      { prompt: 'كبير', answer: 'big', type: 'translate' },
      { prompt: 'صغير', answer: 'small', type: 'translate' },
      { prompt: 'حلو', answer: 'sweet/nice', type: 'translate' },
      { prompt: 'مش حلو', answer: 'not nice', type: 'translate' },
      { prompt: 'كويس', answer: 'good', type: 'translate' },
      { prompt: 'زين', answer: 'good/beautiful', type: 'translate' },
      { prompt: 'سخن', answer: 'hot', type: 'translate' },
      { prompt: 'بارد', answer: 'cold', type: 'translate' }
    ]
  },
  
  {
    name: 'Level 3: Conversational',
    level: 2,
    questions: [
      // Complex phrases (8)
      { prompt: 'شو بدك تعمل اليوم؟', answer: 'what do you want to do today', type: 'translate' },
      { prompt: 'وين رايح؟', answer: 'where are you going', type: 'translate' },
      { prompt: 'من وين إنت؟', answer: 'where are you from', type: 'translate' },
      { prompt: 'شو اسمك؟', answer: 'what is your name', type: 'translate' },
      { prompt: 'كيف بدنا نروح؟', answer: 'how should we go', type: 'translate' },
      { prompt: 'يلا نروح', answer: 'let\'s go', type: 'translate' },
      { prompt: 'تعال هون', answer: 'come here', type: 'translate' },
      { prompt: 'خليك معي', answer: 'stay with me', type: 'translate' },
      
      // Past tense (8)
      { prompt: 'أكلت', answer: 'I ate', type: 'translate' },
      { prompt: 'شربت', answer: 'I drank', type: 'translate' },
      { prompt: 'رحت', answer: 'I went', type: 'translate' },
      { prompt: 'جيت', answer: 'I came', type: 'translate' },
      { prompt: 'نمت', answer: 'I slept', type: 'translate' },
      { prompt: 'قعدت', answer: 'I sat', type: 'translate' },
      { prompt: 'حكيت', answer: 'I talked', type: 'translate' },
      { prompt: 'شفت', answer: 'I saw', type: 'translate' },
      
      // Future (8)
      { prompt: 'رح أروح', answer: 'I will go', type: 'translate' },
      { prompt: 'رح آكل', answer: 'I will eat', type: 'translate' },
      { prompt: 'رح أشرب', answer: 'I will drink', type: 'translate' },
      { prompt: 'رح أنام', answer: 'I will sleep', type: 'translate' },
      { prompt: 'رح أحكي', answer: 'I will talk', type: 'translate' },
      { prompt: 'رح أشوف', answer: 'I will see', type: 'translate' },
      { prompt: 'رح أقعد', answer: 'I will sit', type: 'translate' },
      { prompt: 'رح أجي', answer: 'I will come', type: 'translate' },
      
      // Negation (8)
      { prompt: 'ما بدي', answer: 'I don\'t want', type: 'translate' },
      { prompt: 'ما بعرف', answer: 'I don\'t know', type: 'translate' },
      { prompt: 'ما في', answer: 'there isn\'t', type: 'translate' },
      { prompt: 'ما بحكي عربي', answer: 'I don\'t speak Arabic', type: 'translate' },
      { prompt: 'ما بفهم', answer: 'I don\'t understand', type: 'translate' },
      { prompt: 'ما رح أروح', answer: 'I won\'t go', type: 'translate' },
      { prompt: 'ما أكلت', answer: 'I didn\'t eat', type: 'translate' },
      { prompt: 'مش هيك', answer: 'not like this', type: 'translate' }
    ]
  },
  
  {
    name: 'Level 4: Fluent Expression',
    level: 3,
    questions: [
      // Idiomatic (8)
      { prompt: 'على راسي', answer: 'on my head (gladly)', type: 'translate' },
      { prompt: 'بعيوني', answer: 'in my eyes (with pleasure)', type: 'translate' },
      { prompt: 'يسلمو', answer: 'thanks (may god keep you safe)', type: 'translate' },
      { prompt: 'الله يخليك', answer: 'may god keep you', type: 'translate' },
      { prompt: 'الله يعطيك العافية', answer: 'may god give you health', type: 'translate' },
      { prompt: 'حرام', answer: 'forbidden/what a shame', type: 'translate' },
      { prompt: 'خلص', answer: 'finished/enough', type: 'translate' },
      { prompt: 'طب', answer: 'okay/well then', type: 'translate' },
      
      // Complex sentences (8)
      { prompt: 'Translate: I used to visit my grandmother every week', answer: 'كنت أزور جدتي كل أسبوع', type: 'translate_to_arabic' },
      { prompt: 'Translate: We should eat together', answer: 'لازم ناكل مع بعض', type: 'translate_to_arabic' },
      { prompt: 'Translate: Can you help me?', answer: 'ممكن تساعدني؟', type: 'translate_to_arabic' },
      { prompt: 'Translate: I miss my family', answer: 'أهلي واحشيني', type: 'translate_to_arabic' },
      { prompt: 'Translate: This food is delicious', answer: 'هاد الأكل طيب كتير', type: 'translate_to_arabic' },
      { prompt: 'Translate: I want to learn Arabic', answer: 'بدي أتعلم عربي', type: 'translate_to_arabic' },
      { prompt: 'Translate: Where did you grow up?', answer: 'وين كبرت؟', type: 'translate_to_arabic' },
      { prompt: 'Translate: I don\'t remember', answer: 'ما بتذكر', type: 'translate_to_arabic' },
      
      // Nuanced expressions (8)
      { prompt: 'شو عم تعمل؟', answer: 'what are you doing (now)', type: 'translate' },
      { prompt: 'كان لازم', answer: 'it was necessary', type: 'translate' },
      { prompt: 'بكرة إن شاء الله', answer: 'tomorrow god willing', type: 'translate' },
      { prompt: 'خلينا نشوف', answer: 'let\'s see', type: 'translate' },
      { prompt: 'صار شي؟', answer: 'did something happen', type: 'translate' },
      { prompt: 'شو بيصير', answer: 'what\'s happening', type: 'translate' },
      { prompt: 'ليش هيك؟', answer: 'why like this', type: 'translate' },
      { prompt: 'مش معقول', answer: 'unbelievable', type: 'translate' },
      
      // Subjunctive/conditional (8)
      { prompt: 'لو كان', answer: 'if it were', type: 'translate' },
      { prompt: 'لو بعرف', answer: 'if I knew', type: 'translate' },
      { prompt: 'يمكن', answer: 'maybe', type: 'translate' },
      { prompt: 'ممكن يكون', answer: 'it might be', type: 'translate' },
      { prompt: 'بدي إياك تروح', answer: 'I want you to go', type: 'translate' },
      { prompt: 'لازم تروح', answer: 'you must go', type: 'translate' },
      { prompt: 'ممكن ترجع', answer: 'you can come back', type: 'translate' },
      { prompt: 'بتمنى', answer: 'I wish/hope', type: 'translate' }
    ]
  },
  
  {
    name: 'Level 5: Advanced Heritage',
    level: 4,
    questions: [
      // Cultural/contextual (8)
      { prompt: 'عيب', answer: 'shameful/inappropriate', type: 'translate' },
      { prompt: 'يا حرام', answer: 'oh what a pity', type: 'translate' },
      { prompt: 'تكرم عينك', answer: 'may your eye be honored', type: 'translate' },
      { prompt: 'الله يرضى عليك', answer: 'may god be pleased with you', type: 'translate' },
      { prompt: 'يا ريت', answer: 'if only', type: 'translate' },
      { prompt: 'خير إن شاء الله؟', answer: 'is everything okay (god willing)', type: 'translate' },
      { prompt: 'الله يسهل', answer: 'may god make it easy', type: 'translate' },
      { prompt: 'يا عمري', answer: 'oh my life (term of endearment)', type: 'translate' },
      
      // Proverbs/sayings (8)
      { prompt: 'إن غديت فد وروني', answer: 'if you go tomorrow, come back to me (Palestinian saying)', type: 'translate' },
      { prompt: 'الدم ما بصير ماي', answer: 'blood doesn\'t become water (family bonds)', type: 'translate' },
      { prompt: 'العين بصيرة واليد قصيرة', answer: 'the eye sees but the hand is short (can\'t reach)', type: 'translate' },
      { prompt: 'من جدو بعرف جدو', answer: 'from his grandfather you know him (heritage)', type: 'translate' },
      { prompt: 'كل واحد وطبعو', answer: 'each to his own nature', type: 'translate' },
      { prompt: 'يلي ما عندو عمو ما لو لزوم', answer: 'one without an uncle has no worth (family)', type: 'translate' },
      { prompt: 'الغايب عذرو معاه', answer: 'the absent one\'s excuse is with him', type: 'translate' },
      { prompt: 'باب النجار مخلع', answer: 'the carpenter\'s door is broken', type: 'translate' },
      
      // Complex grammar (8)
      { prompt: 'Translate: I wish I had known earlier', answer: 'يا ريتني عرفت قبل', type: 'translate_to_arabic' },
      { prompt: 'Translate: If only I could visit more often', answer: 'يا ريت بقدر أزور أكتر', type: 'translate_to_arabic' },
      { prompt: 'Translate: They would have helped if they could', answer: 'كانو ساعدو لو قدرو', type: 'translate_to_arabic' },
      { prompt: 'Translate: I haven\'t seen them in years', answer: 'ما شفتهم من سنين', type: 'translate_to_arabic' },
      { prompt: 'Translate: We used to gather every Friday', answer: 'كنا ننجمع كل جمعة', type: 'translate_to_arabic' },
      { prompt: 'Translate: She reminds me of my grandmother', answer: 'هي بتذكرني بجدتي', type: 'translate_to_arabic' },
      { prompt: 'Translate: No matter what happens', answer: 'مهما صار', type: 'translate_to_arabic' },
      { prompt: 'Translate: As long as we\'re together', answer: 'طول ما إحنا مع بعض', type: 'translate_to_arabic' },
      
      // Nuanced vocabulary (8)
      { prompt: 'فش منو', answer: 'there\'s no avoiding it', type: 'translate' },
      { prompt: 'شو هالحكي', answer: 'what is this talk (disbelief)', type: 'translate' },
      { prompt: 'بلاش', answer: 'enough/don\'t', type: 'translate' },
      { prompt: 'خليني بحالي', answer: 'leave me alone', type: 'translate' },
      { prompt: 'مش قصة', answer: 'it\'s not a story (not a big deal)', type: 'translate' },
      { prompt: 'والله العظيم', answer: 'I swear by almighty God', type: 'translate' },
      { prompt: 'أكيد', answer: 'definitely', type: 'translate' },
      { prompt: 'مستحيل', answer: 'impossible', type: 'translate' }
    ]
  }
];
