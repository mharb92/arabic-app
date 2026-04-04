/**
 * data/placement.js
 * Placement test questions - 5 levels × 32 questions = 160 total
 * Pure data - NO logic
 * NO dependencies
 */

export const PLACEMENT_LEVELS = [
  {
    level: 1,
    name: 'Complete Beginner',
    description: 'Basic greetings and simple phrases',
    threshold: 0.5, // Need 50% to advance
    questions: [
      // Set 1: Recognition (8 questions)
      { type: 'listening', question: 'Listen: مَرْحَبَا', options: ['Hello', 'Goodbye', 'Thank you', 'Please'], correct: 'Hello' },
      { type: 'listening', question: 'Listen: شُكْرَاً', options: ['Yes', 'No', 'Thank you', 'Sorry'], correct: 'Thank you' },
      { type: 'reading', question: 'What does كِيفَك mean?', options: ['How are you?', 'What\'s your name?', 'Where are you?', 'Goodbye'], correct: 'How are you?' },
      { type: 'reading', question: 'What does أَيْوَه mean?', options: ['No', 'Yes', 'Maybe', 'Never'], correct: 'Yes' },
      { type: 'listening', question: 'Listen: لَأ', options: ['Yes', 'No', 'Hello', 'Thanks'], correct: 'No' },
      { type: 'reading', question: 'What does بَابَا mean?', options: ['Father', 'Mother', 'Brother', 'Sister'], correct: 'Father' },
      { type: 'reading', question: 'What does مَامَا mean?', options: ['Father', 'Mother', 'Grandmother', 'Aunt'], correct: 'Mother' },
      { type: 'listening', question: 'Listen: مَع السَّلَامَة', options: ['Hello', 'Goodbye', 'Good morning', 'Good night'], correct: 'Goodbye' },
      
      // Set 2: Simple Translation (8 questions)
      { type: 'translation', question: 'How do you say "Hello" in Arabic?', correct: 'مَرْحَبَا', hint: 'marhaba' },
      { type: 'translation', question: 'How do you say "Thank you"?', correct: 'شُكْرَاً', hint: 'shukran' },
      { type: 'translation', question: 'How do you say "Yes"?', correct: 'أَيْوَه', hint: 'aywa' },
      { type: 'translation', question: 'How do you say "No"?', correct: 'لَأ', hint: 'la\'' },
      { type: 'translation', question: 'How do you say "Please" (to a woman)?', correct: 'مِن فَضْلِك', hint: 'min fadlik' },
      { type: 'translation', question: 'How do you say "Water"?', correct: 'مَيّ', hint: 'mayy' },
      { type: 'translation', question: 'How do you say "Bread"?', correct: 'خُبْز', hint: 'khubz' },
      { type: 'translation', question: 'How do you say "I want"?', correct: 'بِدِّي', hint: 'biddi' },
      
      // Set 3: Context (8 questions)
      { type: 'context', question: 'Someone says "كِيفَك؟" to you. What do you say?', options: ['مَرْحَبَا', 'مْنِيح الحَمْدُ لِلّه', 'شُكْرَاً', 'مَع السَّلَامَة'], correct: 'مْنِيح الحَمْدُ لِلّه' },
      { type: 'context', question: 'You want water. What do you say?', options: ['بِدِّي مَيّ', 'شُكْرَاً', 'أَيْوَه', 'لَأ'], correct: 'بِدِّي مَيّ' },
      { type: 'context', question: 'Someone gives you food. What do you say?', options: ['مَرْحَبَا', 'شُكْرَاً', 'لَأ', 'كِيفَك'], correct: 'شُكْرَاً' },
      { type: 'context', question: 'You\'re leaving. What do you say?', options: ['مَرْحَبَا', 'صَبَاح الخَيْر', 'مَع السَّلَامَة', 'شُكْرَاً'], correct: 'مَع السَّلَامَة' },
      { type: 'context', question: 'It\'s morning. What greeting do you use?', options: ['مَرْحَبَا', 'صَبَاح الخَيْر', 'مَسَا الخَيْر', 'مَع السَّلَامَة'], correct: 'صَبَاح الخَيْر' },
      { type: 'context', question: 'You\'re asked "شُو اسْمِك؟" What are they asking?', options: ['How are you?', 'What\'s your name?', 'Where are you from?', 'Do you speak Arabic?'], correct: 'What\'s your name?' },
      { type: 'context', question: 'Someone says "صَحْتَيْن" before a meal. What does it mean?', options: ['Goodbye', 'Thank you', 'Bon appetit', 'Hello'], correct: 'Bon appetit' },
      { type: 'context', question: 'The food is delicious. What do you say?', options: ['طَيِّب', 'لَأ', 'مَرْحَبَا', 'مَع السَّلَامَة'], correct: 'طَيِّب' },
      
      // Set 4: Output (8 questions)
      { type: 'output', question: 'Introduce yourself in Arabic (say your name)', prompt: 'اِسْمِي...', correct: 'اِسْمِي' },
      { type: 'output', question: 'Ask someone "How are you?" in Arabic', prompt: 'كِيف...', correct: 'كِيفَك' },
      { type: 'output', question: 'Say "I\'m fine, thank God"', prompt: 'مْنِيح...', correct: 'الحَمْدُ لِلّه' },
      { type: 'output', question: 'Ask for water in Arabic', prompt: 'بِدِّي...', correct: 'مَيّ' },
      { type: 'output', question: 'Say "Goodbye" in Arabic', prompt: 'مَع...', correct: 'السَّلَامَة' },
      { type: 'output', question: 'Thank someone in Arabic', prompt: 'شُكْ...', correct: 'شُكْرَاً' },
      { type: 'output', question: 'Say "Yes" in Palestinian Arabic', prompt: 'أَيْ...', correct: 'أَيْوَه' },
      { type: 'output', question: 'Say "No" in Arabic', prompt: 'لَ...', correct: 'لَأ' }
    ]
  },
  
  {
    level: 2,
    name: 'Basic Conversationalist',
    description: 'Family terms, daily phrases, simple conversations',
    threshold: 0.5,
    questions: [
      // Set 1: Family & Relationships (8 questions)
      { type: 'reading', question: 'What does جِدّو mean?', options: ['Father', 'Grandfather', 'Uncle', 'Brother'], correct: 'Grandfather' },
      { type: 'reading', question: 'What does تِيتة mean?', options: ['Mother', 'Sister', 'Grandmother', 'Aunt'], correct: 'Grandmother' },
      { type: 'reading', question: 'What\'s the difference between عَم and خَال?', options: ['Father\'s brother vs Mother\'s brother', 'Grandfather vs Uncle', 'Brother vs Cousin', 'No difference'], correct: 'Father\'s brother vs Mother\'s brother' },
      { type: 'translation', question: 'How do you say "Brother"?', correct: 'أَخ', hint: 'akh' },
      { type: 'translation', question: 'How do you say "Sister"?', correct: 'أُخْت', hint: 'ukht' },
      { type: 'context', question: 'You meet Marwan\'s father. What do you call him?', options: ['جِدّو', 'بَابَا', 'عَم', 'خَال'], correct: 'بَابَا' },
      { type: 'context', question: 'You\'re introduced to someone\'s mother\'s brother. What is he?', options: ['عَم', 'خَال', 'جِدّو', 'أَخ'], correct: 'خَال' },
      { type: 'output', question: 'Introduce your brother in Arabic', prompt: 'هَادَا...', correct: 'أَخِي' },
      
      // Set 2: Food & Hospitality (8 questions)
      { type: 'reading', question: 'What does صَحْتَيْن mean literally?', options: ['Good morning', 'Two healths', 'Thank you', 'Delicious'], correct: 'Two healths' },
      { type: 'reading', question: 'When do you say "يِسْلَمو إِيدَيْكِي"?', options: ['When leaving', 'To thank the cook', 'When arriving', 'When eating'], correct: 'To thank the cook' },
      { type: 'translation', question: 'How do you say "Coffee"?', correct: 'قَهْوَة', hint: 'ahwe' },
      { type: 'translation', question: 'How do you say "Delicious"?', correct: 'طَيِّب', hint: 'tayyib' },
      { type: 'context', question: 'You\'re offered more food but you\'re full. What do you say?', options: ['بَسّ شَبْعانَة', 'بِدِّي كْمَان', 'طَيِّب كْتِير', 'شُكْرَاً'], correct: 'بَسّ شَبْعانَة' },
      { type: 'context', question: 'Someone says "صَحْتَيْن" before you eat. You respond:', options: ['عَلى قَلْبَك', 'مَرْحَبَا', 'مَع السَّلَامَة', 'لَأ شُكْرَاً'], correct: 'عَلى قَلْبَك' },
      { type: 'output', question: 'Compliment the food (say it\'s very delicious)', prompt: 'طَيِّب...', correct: 'كْتِير' },
      { type: 'output', question: 'Ask for tea', prompt: 'بِدِّي...', correct: 'شَاي' },
      
      // Set 3: Directions & Places (8 questions)
      { type: 'reading', question: 'What does وَيْن mean?', options: ['When?', 'Where?', 'Who?', 'Why?'], correct: 'Where?' },
      { type: 'reading', question: 'What does دُغْرِي mean?', options: ['Right', 'Left', 'Straight', 'Back'], correct: 'Straight' },
      { type: 'translation', question: 'How do you say "Here"?', correct: 'هُون', hint: 'hoon' },
      { type: 'translation', question: 'How do you say "Far"?', correct: 'بَعِيد', hint: 'ba\'eed' },
      { type: 'context', question: 'Someone asks "وَيْن البَيْت؟" What are they asking?', options: ['When is the house?', 'Where is the house?', 'Who is home?', 'Why the house?'], correct: 'Where is the house?' },
      { type: 'context', question: 'You need directions. The person says "دُغْرِي". What do you do?', options: ['Turn right', 'Turn left', 'Go straight', 'Go back'], correct: 'Go straight' },
      { type: 'output', question: 'Ask "Where is...?" in Arabic', prompt: 'وَيْن...', correct: 'وَيْن' },
      { type: 'output', question: 'Tell someone to go right', prompt: 'رُوح...', correct: 'يَمِين' },
      
      // Set 4: Small Talk (8 questions)
      { type: 'reading', question: 'What does شْوَيّة mean?', options: ['A lot', 'A little', 'Nothing', 'Everything'], correct: 'A little' },
      { type: 'reading', question: 'What does مَا بِفْهَم mean?', options: ['I understand', 'I don\'t understand', 'I don\'t know', 'I don\'t want'], correct: 'I don\'t understand' },
      { type: 'translation', question: 'How do you say "Slowly please"?', correct: 'شْوَيّ شْوَيّ', hint: 'shwayy shwayy' },
      { type: 'translation', question: 'How do you say "God willing"?', correct: 'إِن شَاء الله', hint: 'inshallah' },
      { type: 'context', question: 'Someone asks if you speak Arabic. You speak a little. What do you say?', options: ['أَيْوَه كْتِير', 'شْوَيّة', 'لَأ', 'مَا بِعْرِف'], correct: 'شْوَيّة' },
      { type: 'context', question: 'You didn\'t understand what was said. What do you say?', options: ['شُكْرَاً', 'مَا بِفْهَم', 'أَيْوَه', 'طَيِّب'], correct: 'مَا بِفْهَم' },
      { type: 'output', question: 'Say "I\'m learning Arabic"', prompt: 'أَنا بْتَعَلَّم...', correct: 'عَرَبِي' },
      { type: 'output', question: 'Ask "What does this mean?"', prompt: 'شُو يَعْنِي...', correct: 'هَادَا' }
    ]
  },
  
  {
    level: 3,
    name: 'Comfortable Speaker',
    description: 'Express emotions, understand blessings, navigate conversations',
    threshold: 0.5,
    questions: [
      // Set 1: Emotions & States (8 questions)
      { type: 'reading', question: 'What does مَبْسُوطَة mean?', options: ['Sad', 'Happy', 'Tired', 'Angry'], correct: 'Happy' },
      { type: 'reading', question: 'What does تْعَبَانَة mean?', options: ['Happy', 'Hungry', 'Tired', 'Scared'], correct: 'Tired' },
      { type: 'translation', question: 'How do you say "Beautiful"?', correct: 'حِلْو', hint: 'hilw' },
      { type: 'translation', question: 'How do you say "I miss you" (to a woman)?', correct: 'وَحْشْتِينِي', hint: 'wahashteeni' },
      { type: 'context', question: 'Someone asks how you are and you\'re happy. What do you say?', options: ['أَنا تْعَبَانَة', 'أَنا مَبْسُوطَة', 'أَنا زَعْلَانَة', 'مَا بِعْرِف'], correct: 'أَنا مَبْسُوطَة' },
      { type: 'context', question: 'You see something beautiful. What do you say?', options: ['حِلْو', 'وَحِش', 'تْعَبَان', 'زَعْلَان'], correct: 'حِلْو' },
      { type: 'output', question: 'Say "I\'m very happy"', prompt: 'أَنا مَبْسُوطَة...', correct: 'كْتِير' },
      { type: 'output', question: 'Tell someone you miss them', prompt: 'وَحْشْ...', correct: 'تِينِي' },
      
      // Set 2: Blessings & Expressions (8 questions)
      { type: 'reading', question: 'What does الحَمْدُ لِلّه mean?', options: ['God willing', 'Praise be to God', 'God bless you', 'God is great'], correct: 'Praise be to God' },
      { type: 'reading', question: 'When do you say "الله يْخَلِّيكِي"?', options: ['When angry', 'As a blessing/protection', 'When hungry', 'When leaving'], correct: 'As a blessing/protection' },
      { type: 'translation', question: 'How do you say "God willing"?', correct: 'إِن شَاء الله', hint: 'inshallah' },
      { type: 'translation', question: 'How do you say "May God protect you"?', correct: 'الله يْحْفَظِك', hint: 'allah yihfathik' },
      { type: 'context', question: 'Someone says they\'ll see you tomorrow. You respond:', options: ['لَأ', 'إِن شَاء الله', 'مَا بِفْهَم', 'وَحْشْتِينِي'], correct: 'إِن شَاء الله' },
      { type: 'context', question: 'Someone does you a favor. You want to bless them. You say:', options: ['الله يْخَلِّيكِي', 'مَا بِدِّي', 'لَأ شُكْرَاً', 'وَيْن؟'], correct: 'الله يْخَلِّيكِي' },
      { type: 'output', question: 'Express gratitude with "Praise be to God"', prompt: 'الحَمْدُ...', correct: 'لِلّه' },
      { type: 'output', question: 'Bless someone\'s family', prompt: 'الله يْبَارِك...', correct: 'فِيكُو' },
      
      // Set 3: Affection & Endearments (8 questions)
      { type: 'reading', question: 'What does حَبِيبِي literally mean?', options: ['My friend', 'My brother', 'My beloved', 'My family'], correct: 'My beloved' },
      { type: 'reading', question: 'What does يَا رُوحِي mean?', options: ['My heart', 'My soul', 'My eyes', 'My love'], correct: 'My soul' },
      { type: 'translation', question: 'How do you say "My dear" (to a woman)?', correct: 'حَبِيبْتِي', hint: 'habibti' },
      { type: 'translation', question: 'How do you say "I love you"?', correct: 'بْحِبِّك', hint: 'bhibbik' },
      { type: 'context', question: 'Someone calls you "يَا عَسَل". What are they saying?', options: ['You\'re annoying', 'You\'re sweet (sweetheart)', 'You\'re tired', 'You\'re late'], correct: 'You\'re sweet (sweetheart)' },
      { type: 'context', question: 'You want to express deep affection. Which is most intense?', options: ['شُكْرَاً', 'حَبِيبِي', 'يَا عُيُونِي', 'مَرْحَبَا'], correct: 'يَا عُيُونِي' },
      { type: 'output', question: 'Call someone "my soul"', prompt: 'يَا...', correct: 'رُوحِي' },
      { type: 'output', question: 'Say "You\'re in my heart" (to a woman)', prompt: 'إِنْتِي بْ...', correct: 'قَلْبِي' },
      
      // Set 4: Advanced Conversation (8 questions)
      { type: 'reading', question: 'What does مَاشِي mean in conversation?', options: ['I\'m walking', 'Okay/Alright', 'No way', 'I\'m tired'], correct: 'Okay/Alright' },
      { type: 'reading', question: 'What does شُو يَعْنِي هَادَا mean?', options: ['What does this mean?', 'Where is this?', 'Who is this?', 'When is this?'], correct: 'What does this mean?' },
      { type: 'translation', question: 'How do you ask "Where are you from?"', correct: 'مِن وَيْن إِنْتِي', hint: 'min wayn inti' },
      { type: 'translation', question: 'How do you say "I\'m from Japan"?', correct: 'أَنا مِن اليَابَان', hint: 'ana min el-yabaan' },
      { type: 'context', question: 'Someone suggests a plan and you agree. What do you say?', options: ['لَأ', 'مَاشِي', 'مَا بِفْهَم', 'وَحْشْتِينِي'], correct: 'مَاشِي' },
      { type: 'context', question: 'You hear a new word. You want to know what it means. You say:', options: ['وَيْن هَادَا؟', 'شُو يَعْنِي هَادَا؟', 'مِين هَادَا؟', 'كِيف هَادَا؟'], correct: 'شُو يَعْنِي هَادَا؟' },
      { type: 'output', question: 'Introduce yourself: "My name is Aya"', prompt: 'اِسْمِي...', correct: 'آيا' },
      { type: 'output', question: 'Say you\'re learning Arabic', prompt: 'أَنا بْتَعَلَّم...', correct: 'عَرَبِي' }
    ]
  },
  
  {
    level: 4,
    name: 'Proficient Speaker',
    description: 'Navigate complex situations, cultural nuances, idioms',
    threshold: 0.5,
    questions: [
      // Set 1: Cultural Expressions (8 questions)
      { type: 'reading', question: 'What\'s the literal meaning of "يِسْلَمو إِيدَيْكِي"?', options: ['Thank your hands', 'May your hands be safe', 'Wash your hands', 'Give me your hands'], correct: 'May your hands be safe' },
      { type: 'reading', question: 'When do you say "الله يِعْطِيكِي العَافْيَة"?', options: ['When someone is sick', 'After someone works hard', 'When someone is eating', 'When someone is sleeping'], correct: 'After someone works hard' },
      { type: 'translation', question: 'How do you respond to "الله يِعْطِيكِي العَافْيَة"?', correct: 'الله يِقَوِّيكِي', hint: 'allah yi\'awweeki' },
      { type: 'translation', question: 'How do you say "God bless your hands" (to a woman)?', correct: 'يِسْلَمو إِيدَيْكِي', hint: 'yislamo edeiki' },
      { type: 'context', question: 'Someone cooked a meal. What\'s the most appropriate compliment?', options: ['حِلْو', 'يِسْلَمو إِيدَيْكِي', 'شُكْرَاً', 'طَيِّب'], correct: 'يِسْلَمو إِيدَيْكِي' },
      { type: 'context', question: 'Your host cleaned the house for you. You say:', options: ['بَسّ شَبْعانَة', 'الله يِعْطِيكِي العَافْيَة', 'مَا بِفْهَم', 'وَيْن البَيْت'], correct: 'الله يِعْطِيكِي العَافْيَة' },
      { type: 'output', question: 'Thank someone for their hard work', prompt: 'الله يِعْطِيكِي...', correct: 'العَافْيَة' },
      { type: 'output', question: 'Respond to "يِعْطِيكِي العَافْيَة"', prompt: 'الله...', correct: 'يِقَوِّيكِي' },
      
      // Set 2: Goodbyes & Partings (8 questions)
      { type: 'reading', question: 'What does تْصَبَّحِي عَلى خَيْر literally mean?', options: ['Good night', 'Wake up to goodness', 'Sleep well', 'Sweet dreams'], correct: 'Wake up to goodness' },
      { type: 'reading', question: 'What does سَلَامْتَك mean when parting?', options: ['Hello', 'Thank you', 'Safe travels', 'Come back'], correct: 'Safe travels' },
      { type: 'translation', question: 'How do you say "Until we meet again"?', correct: 'لِحَدّ مَا نِتْشُوف', hint: 'lihad ma nitshouf' },
      { type: 'translation', question: 'How do you say "I won\'t forget you" (to a woman)?', correct: 'مَا رَح أَنْسَاكِي', hint: 'ma rah ansaaki' },
      { type: 'context', question: 'It\'s nighttime and you\'re saying goodbye. You say:', options: ['صَبَاح الخَيْر', 'تْصَبَّحِي عَلى خَيْر', 'مَسَا الخَيْر', 'يِسْلَمو إِيدَيْكِي'], correct: 'تْصَبَّحِي عَلى خَيْر' },
      { type: 'context', question: 'Someone is traveling. You wish them well. You say:', options: ['مَرْحَبَا', 'سَلَامْتَك', 'كِيفَك', 'بِدِّي مَيّ'], correct: 'سَلَامْتَك' },
      { type: 'output', question: 'Say "God be with you" (to a woman)', prompt: 'الله...', correct: 'مَعَكِي' },
      { type: 'output', question: 'Promise you\'ll always remember them', prompt: 'رَح تِظَلِّي بْ...', correct: 'قَلْبِي' },
      
      // Set 3: Nuanced Expressions (8 questions)
      { type: 'reading', question: 'What\'s the difference between asking كِيفَك vs شُو أَخْبَارَك?', options: ['No difference', 'How are you vs What\'s your news', 'Formal vs Informal', 'Morning vs Evening'], correct: 'How are you vs What\'s your news' },
      { type: 'reading', question: 'When would you use أَنا مُشَرَّفَة?', options: ['When happy', 'When honored/privileged', 'When tired', 'When hungry'], correct: 'When honored/privileged' },
      { type: 'translation', question: 'How do you say "Take care of yourself"?', correct: 'خُلِّي بَالِك', hint: 'khulli baalik' },
      { type: 'translation', question: 'How do you say "God bless this family"?', correct: 'الله يْبَارِك فِيكُو', hint: 'allah ybaarik feeku' },
      { type: 'context', question: 'You feel truly honored to meet someone. You say:', options: ['أَنا تْعَبَانَة', 'أَنا مُشَرَّفَة', 'أَنا مَبْسُوطَة', 'أَنا جُوعَانَة'], correct: 'أَنا مُشَرَّفَة' },
      { type: 'context', question: 'You want to bless an entire family. Which is most appropriate?', options: ['الله يْخَلِّيكِي', 'الله يْبَارِك فِيكُو', 'شُكْرَاً', 'مَع السَّلَامَة'], correct: 'الله يْبَارِك فِيكُو' },
      { type: 'output', question: 'Ask someone about their news/updates', prompt: 'شُو...', correct: 'أَخْبَارَك' },
      { type: 'output', question: 'Say you\'re thinking of someone', prompt: 'بْفَكِّر...', correct: 'فِيكِي' },
      
      // Set 4: Complex Situations (8 questions)
      { type: 'reading', question: 'If someone says "الله يْسَهِّل", what are they expressing?', options: ['May God make it easy', 'God is great', 'God willing', 'Thank God'], correct: 'May God make it easy' },
      { type: 'reading', question: 'What does خَلَص mean in conversation?', options: ['Begin', 'Finished/That\'s it', 'Maybe', 'Continue'], correct: 'Finished/That\'s it' },
      { type: 'translation', question: 'How do you say "It doesn\'t matter" or "Never mind"?', correct: 'مَا فِي مُشْكِلَة', hint: 'ma fee mushkile' },
      { type: 'translation', question: 'How do you say "God make it easy" (general)?', correct: 'الله يْسَهِّل', hint: 'allah ysahhil' },
      { type: 'context', question: 'Someone is stressed about a difficult task. You encourage them:', options: ['خَلَص', 'الله يْسَهِّل', 'مَا فِي مُشْكِلَة', 'بَسّ'], correct: 'الله يْسَهِّل' },
      { type: 'context', question: 'Someone apologizes for a small mistake. You say it\'s okay:', options: ['لَأ', 'خَلَص', 'مَا فِي مُشْكِلَة', 'بِدِّي'], correct: 'مَا فِي مُشْكِلَة' },
      { type: 'output', question: 'Say "That\'s it, we\'re done"', prompt: 'خَ...', correct: 'خَلَص' },
      { type: 'output', question: 'Tell someone not to worry, it\'s fine', prompt: 'مَا فِي...', correct: 'مُشْكِلَة' }
    ]
  },
  
  {
    level: 5,
    name: 'Advanced Speaker',
    description: 'Dialect-specific phrases, complex grammar, natural flow',
    threshold: 0.5,
    questions: [
      // Set 1: Palestinian Dialect Specifics (8 questions)
      { type: 'reading', question: 'In Palestinian dialect, how do you say "I want" instead of MSA أُرِيد?', options: ['بِدِّي', 'عَايِز', 'أُرِيد', 'بْغَيْت'], correct: 'بِدِّي' },
      { type: 'reading', question: 'What\'s the Palestinian pronunciation of "water"?', options: ['مَاء', 'مَيّ', 'مُويَة', 'مِي'], correct: 'مَيّ' },
      { type: 'translation', question: 'How do Palestinians say "not" (negation)?', correct: 'مَا/مُش', hint: 'ma/mush' },
      { type: 'translation', question: 'How do you say "I don\'t know" in Palestinian?', correct: 'مَا بِعْرِف', hint: 'ma ba\'rif' },
      { type: 'context', question: 'Which is more Palestinian: "وَيْن" or "أَيْن"?', options: ['وَيْن', 'أَيْن', 'Both equal', 'Neither'], correct: 'وَيْن' },
      { type: 'context', question: 'Which is distinctly Palestinian vs MSA?', options: ['هُون (here)', 'هُنَا (here)', 'Both', 'Neither'], correct: 'هُون (here)' },
      { type: 'output', question: 'Say "I don\'t want" in Palestinian dialect', prompt: 'مَا...', correct: 'بِدِّي' },
      { type: 'output', question: 'Negate "I know" in Palestinian', prompt: 'مَا بِ...', correct: 'عْرِف' },
      
      // Set 2: Gender Agreement (8 questions)
      { type: 'reading', question: 'How does كِيفَك change when addressing a woman?', options: ['كِيفِك', 'كِيفَك', 'كِيفُك', 'No change'], correct: 'كِيفِك' },
      { type: 'reading', question: 'What\'s the feminine form of مَبْسُوط (happy)?', options: ['مَبْسُوطَة', 'مَبْسُوطِي', 'مَبْسُوط', 'مَبْسُوطَتَيْن'], correct: 'مَبْسُوطَة' },
      { type: 'translation', question: 'How do you say "I\'m sorry" as a woman?', correct: 'آسْفَة', hint: 'aasfe' },
      { type: 'translation', question: 'How do you say "I\'m full" (eaten enough) as a woman?', correct: 'شَبْعَانَة', hint: 'shab\'aane' },
      { type: 'context', question: 'You\'re a woman saying you\'re tired. You say:', options: ['أَنا تْعَبَان', 'أَنا تْعَبَانَة', 'أَنا تْعَبَانِين', 'No gender change'], correct: 'أَنا تْعَبَانَة' },
      { type: 'context', question: 'Addressing a group (mixed gender), كِيفْكُو changes to:', options: ['كِيفْكُو (same)', 'كِيفَك', 'كِيفِك', 'كِيفْهُو'], correct: 'كِيفْكُو (same)' },
      { type: 'output', question: 'Say "pleased to meet you" as a woman', prompt: 'مُتْشَرِّ...', correct: 'فَة' },
      { type: 'output', question: 'Ask "How are you?" to a group', prompt: 'كِيفْ...', correct: 'كُو' },
      
      // Set 3: Advanced Grammar (8 questions)
      { type: 'reading', question: 'What does the "بْ" prefix in بْحِبِّك indicate?', options: ['Past tense', 'Present continuous', 'Future', 'Question'], correct: 'Present continuous' },
      { type: 'reading', question: 'What does "رَح" mean before a verb?', options: ['Past', 'Present', 'Future/will', 'Question'], correct: 'Future/will' },
      { type: 'translation', question: 'How do you say "I will go" in Palestinian?', correct: 'رَح رُوح', hint: 'rah rooh' },
      { type: 'translation', question: 'How do you say "I\'m going" (present continuous)?', correct: 'بْرُوح', hint: 'brooh' },
      { type: 'context', question: 'Someone says "رَح شُوفِك بُكْرَة". When will they see you?', options: ['Now', 'Yesterday', 'Tomorrow', 'Never'], correct: 'Tomorrow' },
      { type: 'context', question: 'بْتَعَلَّم عَرَبِي means:', options: ['I learned Arabic', 'I\'m learning Arabic', 'I will learn Arabic', 'Learn Arabic!'], correct: 'I\'m learning Arabic' },
      { type: 'output', question: 'Say "I will call you" (to a woman)', prompt: 'رَح...', correct: 'تِصِّلِك' },
      { type: 'output', question: 'Say "I\'m thinking of you" (to a woman)', prompt: 'بْ...', correct: 'فَكِّر فِيكِي' },
      
      // Set 4: Idiomatic Expressions (8 questions)
      { type: 'reading', question: 'What does يَا عَيْنِي عَلَيْك express?', options: ['Anger', 'Pity/sympathy', 'Joy', 'Confusion'], correct: 'Pity/sympathy' },
      { type: 'reading', question: 'If someone says عُقْبَال عِنْدَك, what are they saying?', options: ['Congratulations', 'May it be your turn next', 'Good luck', 'Thank you'], correct: 'May it be your turn next' },
      { type: 'translation', question: 'How do you say "slowly slowly" (take your time)?', correct: 'شْوَيّ شْوَيّ', hint: 'shwayy shwayy' },
      { type: 'translation', question: 'How do you express "wow, poor thing" sympathetically?', correct: 'يَا حَرَام', hint: 'ya haraam' },
      { type: 'context', question: 'Your friend just got engaged. You say:', options: ['يَا حَرَام', 'عُقْبَال عِنْدَك', 'مَا فِي مُشْكِلَة', 'خَلَص'], correct: 'عُقْبَال عِنْدَك' },
      { type: 'context', question: 'Someone is rushing you. You want them to slow down:', options: ['يَلَّا', 'شْوَيّ شْوَيّ', 'خَلَص', 'دُغْرِي'], correct: 'شْوَيّ شْوَيّ' },
      { type: 'output', question: 'Express sympathy for someone\'s situation', prompt: 'يَا...', correct: 'حَرَام' },
      { type: 'output', question: 'Congratulate someone and wish them the same', prompt: 'عُقْبَال...', correct: 'عِنْدَك' }
    ]
  }
];
