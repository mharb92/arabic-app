/**
 * data/focused-contexts.js
 * Focused study contexts for Stage B
 * Situational phrase banks for real-world scenarios
 * Pure data - NO logic
 * NO dependencies
 */

export const FOCUSED_CONTEXTS = [
  {
    id: 'travel',
    title: 'Travel & Airport',
    icon: '✈️',
    description: 'Essential phrases for airports, taxis, and getting around',
    phrases: [
      { en: 'Where is the bathroom?', ar: 'وَيْن الحَمَّام؟', ro: 'wayn el-hammaam?' },
      { en: 'How much does this cost?', ar: 'قَدَّيْش هَادَا؟', ro: 'addeish haada?' },
      { en: 'I need a taxi', ar: 'بِدِّي تَكْسِي', ro: 'biddi taksi' },
      { en: 'Take me to...', ar: 'وَدِّينِي عَلى...', ro: 'waddeeni \'ala...' },
      { en: 'Stop here please', ar: 'وَقِّف هُون مِن فَضْلَك', ro: 'wa\'if hoon min fadlak' },
      { en: 'I don\'t speak Arabic well', ar: 'مَا بْحْكِي عَرَبِي مْنِيح', ro: 'ma bhki \'arabi mneeh' },
      { en: 'Can you help me?', ar: 'بْتِقْدَر تْسَاعِدْنِي؟', ro: 'bti\'dar tsa\'idni?' },
      { en: 'I\'m lost', ar: 'أَنا تَايْهَة', ro: 'ana taayhe' },
      { en: 'Where is the hotel?', ar: 'وَيْن الفُنْدُق؟', ro: 'wayn el-fundo?' },
      { en: 'Can I have the bill?', ar: 'مُمْكِن الحِسَاب؟', ro: 'mumkin el-hisaab?' },
      { en: 'This is expensive', ar: 'هَادَا غَالِي', ro: 'haada ghaali' },
      { en: 'Do you have something cheaper?', ar: 'فِي شِي أَرْخَص؟', ro: 'fee shi arkhas?' }
    ]
  },
  
  {
    id: 'family-visit',
    title: 'Family Visit',
    icon: '🏡',
    description: 'Meeting family, showing respect, building connections',
    phrases: [
      { en: 'It\'s an honor to meet you', ar: 'تْشَرَّفْنَا', ro: 'tsharrafna' },
      { en: 'Your home is beautiful', ar: 'بَيْتْكُو حِلْو', ro: 'baytkoo hilw' },
      { en: 'Thank you for having me', ar: 'شُكْرَاً لِلضِّيَافَة', ro: 'shukran lil-diyaafe' },
      { en: 'May God bless your family', ar: 'الله يْبَارِك فِيكُو', ro: 'allah ybaarik feekoo' },
      { en: 'The food was delicious', ar: 'الأَكِل كَان طَيِّب كْتِير', ro: 'el-akil kaan tayyib kteer' },
      { en: 'God bless your hands (to cook)', ar: 'يِسْلَمو إِيدَيْكِي', ro: 'yislamo edeyki' },
      { en: 'I\'m so happy to be here', ar: 'أَنا مَبْسُوطَة كْتِير هُون', ro: 'ana mabsoota kteer hoon' },
      { en: 'You\'re very kind', ar: 'إِنْتُو كْتِير لَطِيفِين', ro: 'intoo kteer lateefeen' },
      { en: 'I feel like family', ar: 'حَاسَّة حَالِي مِن العَائِلَة', ro: 'haasse haali min el-\'aa\'ile' },
      { en: 'Can I help with anything?', ar: 'بْقِدَر سَاعِد بْشِي؟', ro: 'b\'idar saa\'id b\'shi?' },
      { en: 'This reminds me of home', ar: 'هَادَا بْذَكِّرْنِي بِالبَيْت', ro: 'haada bdhakkirni bil-bayt' },
      { en: 'I hope to visit again soon', ar: 'إِن شَاء الله زُورْكُو قَرِيب', ro: 'inshallah zorkoo areeb' }
    ]
  },
  
  {
    id: 'restaurant',
    title: 'Restaurant & Café',
    icon: '🍴',
    description: 'Ordering food, asking questions, enjoying meals',
    phrases: [
      { en: 'Table for two please', ar: 'طَاوْلَة لِشَخْصَيْن مِن فَضْلَك', ro: 'taawle li-shakhsayn min fadlak' },
      { en: 'Can I see the menu?', ar: 'مُمْكِن شُوف القَائِمَة؟', ro: 'mumkin shoof el-aa\'ime?' },
      { en: 'What do you recommend?', ar: 'شُو بْتَنْصَح؟', ro: 'shu btansah?' },
      { en: 'I\'ll have this', ar: 'بِدِّي هَادَا', ro: 'biddi haada' },
      { en: 'Is this spicy?', ar: 'هَادَا حَار؟', ro: 'haada haar?' },
      { en: 'Without meat please', ar: 'بِدُون لَحْمَة مِن فَضْلَك', ro: 'bidoon lahme min fadlak' },
      { en: 'Can I have water?', ar: 'مُمْكِن مَيّ؟', ro: 'mumkin mayy?' },
      { en: 'The food is delicious', ar: 'الأَكِل طَيِّب كْتِير', ro: 'el-akil tayyib kteer' },
      { en: 'Check please', ar: 'الحِسَاب مِن فَضْلَك', ro: 'el-hisaab min fadlak' },
      { en: 'How much is it?', ar: 'قَدَّيْش؟', ro: 'addeish?' },
      { en: 'Keep the change', ar: 'خَلِّي البَاقِي', ro: 'khalli el-baa\'i' },
      { en: 'Where\'s the bathroom?', ar: 'وَيْن الحَمَّام؟', ro: 'wayn el-hammaam?' }
    ]
  },
  
  {
    id: 'shopping',
    title: 'Shopping & Market',
    icon: '🛍️',
    description: 'Bargaining, asking prices, making purchases',
    phrases: [
      { en: 'How much is this?', ar: 'قَدَّيْش هَادَا؟', ro: 'addeish haada?' },
      { en: 'That\'s too expensive', ar: 'هَادَا غَالِي كْتِير', ro: 'haada ghaali kteer' },
      { en: 'Can you lower the price?', ar: 'بْتِقْدَر تْنَزِّل السِّعْر؟', ro: 'bti\'dar tnazzil es-si\'r?' },
      { en: 'I\'ll give you...', ar: 'بِدِّي عْطِيك...', ro: 'biddi \'teek...' },
      { en: 'Do you have another color?', ar: 'فِي لَوْن تَانِي؟', ro: 'fee loon taani?' },
      { en: 'Do you have a bigger size?', ar: 'فِي مَقَاس أَكْبَر؟', ro: 'fee maas akbar?' },
      { en: 'Can I try this?', ar: 'بْقِدَر جَرِّب هَادَا؟', ro: 'b\'idar jarrib haada?' },
      { en: 'I\'m just looking', ar: 'أَنا بَسّ بْتْفَرَّج', ro: 'ana bass batfarraj' },
      { en: 'I\'ll take it', ar: 'رَح خُدْهُ', ro: 'rah khudhu' },
      { en: 'Do you accept credit cards?', ar: 'بْتَقْبَلُو فِيزَا؟', ro: 'bta\'baloo visa?' },
      { en: 'Can I get a bag?', ar: 'مُمْكِن كِيس؟', ro: 'mumkin kees?' },
      { en: 'Thank you, goodbye', ar: 'شُكْرَاً، مَع السَّلَامَة', ro: 'shukran, ma\' es-salaame' }
    ]
  },
  
  {
    id: 'medical',
    title: 'Medical & Health',
    icon: '⚕️',
    description: 'Describing symptoms, asking for help, pharmacy visits',
    phrases: [
      { en: 'I don\'t feel well', ar: 'مَا حَاسَّة حَالِي مْنِيح', ro: 'ma haasse haali mneeh' },
      { en: 'I have a headache', ar: 'عِنْدِي وَجَع رَاس', ro: '\'indi waja\' raas' },
      { en: 'I have a stomachache', ar: 'عِنْدِي وَجَع بَطْن', ro: '\'indi waja\' baTn' },
      { en: 'I have a fever', ar: 'عِنْدِي حَرَارَة', ro: '\'indi haraare' },
      { en: 'I need a doctor', ar: 'بِدِّي دُكْتُور', ro: 'biddi duktoor' },
      { en: 'Where is the pharmacy?', ar: 'وَيْن الصَّيْدَلِيَّة؟', ro: 'wayn es-saydaliyye?' },
      { en: 'Do you have medicine for...?', ar: 'فِي دَوَا لِ...؟', ro: 'fee dawa li...?' },
      { en: 'I\'m allergic to...', ar: 'عِنْدِي حَسَاسِيَّة مِن...', ro: '\'indi hasaasiyye min...' },
      { en: 'Can you call an ambulance?', ar: 'بْتِقْدَر تْتَصِّل بِالإِسْعَاف؟', ro: 'bti\'dar ttassil bil-is\'aaf?' },
      { en: 'I need to go to the hospital', ar: 'لَازِم رُوح عَلى المُسْتَشْفَى', ro: 'laazim rooh \'ala el-mustashfa' },
      { en: 'It hurts here', ar: 'بْوَجِّعْنِي هُون', ro: 'bwajji\'ni hoon' },
      { en: 'Thank you for your help', ar: 'شُكْرَاً عَلى مُسَاعَدْتَك', ro: 'shukran \'ala musaa\'adtak' }
    ]
  },
  
  {
    id: 'workplace',
    title: 'Work & Business',
    icon: '💼',
    description: 'Professional phrases, meetings, collaborations',
    phrases: [
      { en: 'Nice to meet you', ar: 'تْشَرَّفْنَا', ro: 'tsharrafna' },
      { en: 'Let\'s schedule a meeting', ar: 'يَلَّا نْحَدِّد مَوْعِد', ro: 'yalla nhaddid maw\'id' },
      { en: 'When are you available?', ar: 'إِيمْتَى فَاضِي؟', ro: 'eymta faadi?' },
      { en: 'I understand', ar: 'فَهِمْت', ro: 'fahimt' },
      { en: 'Can you explain again?', ar: 'بْتِقْدَر تْشَرَح مَرَّة تَانْيَة؟', ro: 'bti\'dar tshrah marre tanye?' },
      { en: 'I agree', ar: 'مُوَافِق', ro: 'muwafi\'' },
      { en: 'I need to think about it', ar: 'لَازِم فَكِّر فِيهَا', ro: 'laazim fakkir feeha' },
      { en: 'Let me check', ar: 'خَلِّينِي شُوف', ro: 'khalleeni shoof' },
      { en: 'That sounds good', ar: 'هَادَا مْنِيح', ro: 'haada mneeh' },
      { en: 'When is the deadline?', ar: 'إِيمْتَى آخِر مَوْعِد؟', ro: 'eymta aakhir maw\'id?' },
      { en: 'I\'ll send you the details', ar: 'رَح بْعَتْلَك التَّفَاصِيل', ro: 'rah b\'atlak et-tafaaSeel' },
      { en: 'Thank you for your time', ar: 'شُكْرَاً عَلى وَقْتَك', ro: 'shukran \'ala wa\'tak' }
    ]
  }
];
