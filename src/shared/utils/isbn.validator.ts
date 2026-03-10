export const validateIsbn = (isbn: string): boolean => {
  const cleaned = isbn.replace(/[-\s]/g, '');

  if (cleaned.length === 10) return isValidIsbn10(cleaned);
  if (cleaned.length === 13) return isValidIsbn13(cleaned);

  return false;
};

const isValidIsbn10 = (isbn: string): boolean => {
  if (!/^\d{9}[\dX]$/.test(isbn)) return false;

  const sum = isbn.split('').reduce((acc, char, i) => {
    const digit = char === 'X' ? 10 : parseInt(char, 10);
    return acc + digit * (10 - i);
  }, 0);

  return sum % 11 === 0;
};

const isValidIsbn13 = (isbn: string): boolean => {
  if (!/^\d{13}$/.test(isbn)) return false;

  const sum = isbn.split('').reduce((acc, char, i) => {
    return acc + parseInt(char, 10) * (i % 2 === 0 ? 1 : 3);
  }, 0);

  return sum % 10 === 0;
};
