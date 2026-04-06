/**
 * alphabet.js - Complete Arabic alphabet with letter forms
 */

export const ALPHABET_DATA = [
  { letter: 'ا', name: 'Alif', transliteration: 'a', forms: { isolated: 'ا', initial: 'ا', medial: 'ـا', final: 'ـا' }, example: { arabic: 'أب', meaning: 'father' } },
  { letter: 'ب', name: 'Ba', transliteration: 'b', forms: { isolated: 'ب', initial: 'بـ', medial: 'ـبـ', final: 'ـب' }, example: { arabic: 'بيت', meaning: 'house' } },
  { letter: 'ت', name: 'Ta', transliteration: 't', forms: { isolated: 'ت', initial: 'تـ', medial: 'ـتـ', final: 'ـت' }, example: { arabic: 'تين', meaning: 'fig' } },
  { letter: 'ث', name: 'Tha', transliteration: 'th', forms: { isolated: 'ث', initial: 'ثـ', medial: 'ـثـ', final: 'ـث' }, example: { arabic: 'ثوم', meaning: 'garlic' } },
  { letter: 'ج', name: 'Jeem', transliteration: 'j', forms: { isolated: 'ج', initial: 'جـ', medial: 'ـجـ', final: 'ـج' }, example: { arabic: 'جبل', meaning: 'mountain' } },
  { letter: 'ح', name: 'Haa', transliteration: 'ḥ', forms: { isolated: 'ح', initial: 'حـ', medial: 'ـحـ', final: 'ـح' }, example: { arabic: 'حب', meaning: 'love' } },
  { letter: 'خ', name: 'Kha', transliteration: 'kh', forms: { isolated: 'خ', initial: 'خـ', medial: 'ـخـ', final: 'ـخ' }, example: { arabic: 'خبز', meaning: 'bread' } },
  { letter: 'د', name: 'Dal', transliteration: 'd', forms: { isolated: 'د', initial: 'د', medial: 'ـد', final: 'ـد' }, example: { arabic: 'دار', meaning: 'house' } },
  { letter: 'ذ', name: 'Dhal', transliteration: 'dh', forms: { isolated: 'ذ', initial: 'ذ', medial: 'ـذ', final: 'ـذ' }, example: { arabic: 'ذهب', meaning: 'gold' } },
  { letter: 'ر', name: 'Ra', transliteration: 'r', forms: { isolated: 'ر', initial: 'ر', medial: 'ـر', final: 'ـر' }, example: { arabic: 'رز', meaning: 'rice' } },
  { letter: 'ز', name: 'Zay', transliteration: 'z', forms: { isolated: 'ز', initial: 'ز', medial: 'ـز', final: 'ـز' }, example: { arabic: 'زيت', meaning: 'oil' } },
  { letter: 'س', name: 'Seen', transliteration: 's', forms: { isolated: 'س', initial: 'سـ', medial: 'ـسـ', final: 'ـس' }, example: { arabic: 'سمك', meaning: 'fish' } },
  { letter: 'ش', name: 'Sheen', transliteration: 'sh', forms: { isolated: 'ش', initial: 'شـ', medial: 'ـشـ', final: 'ـش' }, example: { arabic: 'شمس', meaning: 'sun' } },
  { letter: 'ص', name: 'Sad', transliteration: 'ṣ', forms: { isolated: 'ص', initial: 'صـ', medial: 'ـصـ', final: 'ـص' }, example: { arabic: 'صحن', meaning: 'plate' } },
  { letter: 'ض', name: 'Dad', transliteration: 'ḍ', forms: { isolated: 'ض', initial: 'ضـ', medial: 'ـضـ', final: 'ـض' }, example: { arabic: 'ضوء', meaning: 'light' } },
  { letter: 'ط', name: 'Taa', transliteration: 'ṭ', forms: { isolated: 'ط', initial: 'طـ', medial: 'ـطـ', final: 'ـط' }, example: { arabic: 'طير', meaning: 'bird' } },
  { letter: 'ظ', name: 'Dhaa', transliteration: 'ẓ', forms: { isolated: 'ظ', initial: 'ظـ', medial: 'ـظـ', final: 'ـظ' }, example: { arabic: 'ظل', meaning: 'shade' } },
  { letter: 'ع', name: 'Ayn', transliteration: 'ʿ', forms: { isolated: 'ع', initial: 'عـ', medial: 'ـعـ', final: 'ـع' }, example: { arabic: 'عين', meaning: 'eye' } },
  { letter: 'غ', name: 'Ghayn', transliteration: 'gh', forms: { isolated: 'غ', initial: 'غـ', medial: 'ـغـ', final: 'ـغ' }, example: { arabic: 'غنم', meaning: 'sheep' } },
  { letter: 'ف', name: 'Fa', transliteration: 'f', forms: { isolated: 'ف', initial: 'فـ', medial: 'ـفـ', final: 'ـف' }, example: { arabic: 'فول', meaning: 'beans' } },
  { letter: 'ق', name: 'Qaf', transliteration: 'q', forms: { isolated: 'ق', initial: 'قـ', medial: 'ـقـ', final: 'ـق' }, example: { arabic: 'قمر', meaning: 'moon' } },
  { letter: 'ك', name: 'Kaf', transliteration: 'k', forms: { isolated: 'ك', initial: 'كـ', medial: 'ـكـ', final: 'ـك' }, example: { arabic: 'كتاب', meaning: 'book' } },
  { letter: 'ل', name: 'Lam', transliteration: 'l', forms: { isolated: 'ل', initial: 'لـ', medial: 'ـلـ', final: 'ـل' }, example: { arabic: 'لبن', meaning: 'milk' } },
  { letter: 'م', name: 'Meem', transliteration: 'm', forms: { isolated: 'م', initial: 'مـ', medial: 'ـمـ', final: 'ـم' }, example: { arabic: 'ماء', meaning: 'water' } },
  { letter: 'ن', name: 'Noon', transliteration: 'n', forms: { isolated: 'ن', initial: 'نـ', medial: 'ـنـ', final: 'ـن' }, example: { arabic: 'نار', meaning: 'fire' } },
  { letter: 'ه', name: 'Ha', transliteration: 'h', forms: { isolated: 'ه', initial: 'هـ', medial: 'ـهـ', final: 'ـه' }, example: { arabic: 'هدية', meaning: 'gift' } },
  { letter: 'و', name: 'Waw', transliteration: 'w', forms: { isolated: 'و', initial: 'و', medial: 'ـو', final: 'ـو' }, example: { arabic: 'ورد', meaning: 'rose' } },
  { letter: 'ي', name: 'Ya', transliteration: 'y', forms: { isolated: 'ي', initial: 'يـ', medial: 'ـيـ', final: 'ـي' }, example: { arabic: 'يد', meaning: 'hand' } }
];
