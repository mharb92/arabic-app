/**
 * units.js - Static units for standard/heritage path
 * INTENTIONALLY MINIMAL - heritage speakers get dynamic units after placement
 * Only includes 1 starter unit for guests/testing
 */

export const UNITS = [
  {
    id: 'unit1',
    title: 'Essential Greetings',
    subtitle: 'Start with the basics',
    phrases: [
      { 
        ar: 'مرحبا', 
        rom: 'marhaba', 
        en: 'hello',
        context: 'General greeting, any time of day'
      },
      { 
        ar: 'أهلا وسهلا', 
        rom: 'ahlan wa sahlan', 
        en: 'welcome',
        context: 'Welcoming someone warmly'
      },
      { 
        ar: 'كيف حالك؟', 
        rom: 'kayf halak?', 
        en: 'how are you? (to a man)',
        context: 'Asking a man how he is'
      },
      { 
        ar: 'كيف حالِك؟', 
        rom: 'kayf halik?', 
        en: 'how are you? (to a woman)',
        context: 'Asking a woman how she is'
      },
      { 
        ar: 'الحمد لله', 
        rom: 'alhamdulillah', 
        en: 'praise God / I\'m fine',
        context: 'Response to "how are you"'
      },
      { 
        ar: 'تمام', 
        rom: 'tamam', 
        en: 'good / fine',
        context: 'Casual response meaning everything is good'
      },
      { 
        ar: 'شكراً', 
        rom: 'shukran', 
        en: 'thank you'
      },
      { 
        ar: 'عفواً', 
        rom: 'afwan', 
        en: 'you\'re welcome'
      },
      { 
        ar: 'مع السلامة', 
        rom: 'ma\'a as-salama', 
        en: 'goodbye',
        context: 'Said to person leaving'
      },
      { 
        ar: 'الله يسلمك', 
        rom: 'allah yisalmak', 
        en: 'goodbye (response)',
        context: 'Response to ma\'a as-salama'
      },
      { 
        ar: 'السلام عليكم', 
        rom: 'as-salamu alaykum', 
        en: 'peace be upon you',
        context: 'Formal/religious greeting'
      },
      { 
        ar: 'وعليكم السلام', 
        rom: 'wa alaykum as-salam', 
        en: 'and upon you peace',
        context: 'Response to as-salamu alaykum'
      }
    ]
  }
];

// Heritage speakers will receive dynamically generated units after placement test
// Units stored in dynamic_units table in Supabase
