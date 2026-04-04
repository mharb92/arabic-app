const ARABIC_REGEX = /[\u0600-\u06FF]/;
export function handleInputDirection(element) {
  if (!element) return;
  element.addEventListener('input', () => {
    const value = element.value;
    if (value.length > 0 && ARABIC_REGEX.test(value[0])) {
      element.setAttribute('dir', 'rtl');
    } else {
      element.setAttribute('dir', 'ltr');
    }
  });
}
export function isArabic(text) {
  return ARABIC_REGEX.test(text);
}
