import data from '@/content/lessons.json';

export type Lang = 'bn' | 'en';
export type Seg = [string, boolean];
export type Word = {
  id: string; bn: string; ar: string; rom: string; root: string; pattern: string;
  pr: Record<Lang, Seg[]>;
  mean: Record<Lang, string>;
  note: Record<Lang, string>;
  shift: Record<Lang, string> | null;
  ex: { ar: string; bn: string; en: string } | null;
  near: string[];
};
export type Lesson = { id: string; n: number; title: Record<Lang, string>; body: Record<Lang, string>; words: Word[] };

export const LESSONS = data as unknown as Lesson[];
export const WORDS: Word[] = LESSONS.flatMap((l) => l.words);
export const BY_ID: Record<string, Word> = Object.fromEntries(WORDS.map((w) => [w.id, w]));
export const lessonOf = (id: string) => LESSONS.find((l) => l.id === id);

// SPEC 4: the bar runs against the full loanword list (target 1,000+).
export const LOANWORD_TARGET = 1000;

// Root letters with their sound, coloured where the language lacks it (SPEC 5b table).
const LETTERS: Record<string, [string, string, boolean, boolean]> = {
  'ا': ['আ', 'a', false, false], 'ب': ['ব', 'b', false, false], 'ت': ['ত', 't', false, false], 'ث': ['ছ', 'th', true, false],
  'ج': ['জ', 'j', false, false], 'ح': ['হ', 'ḥ', true, true], 'خ': ['খ', 'kh', true, true], 'د': ['দ', 'd', false, false],
  'ذ': ['য', 'dh', true, false], 'ر': ['র', 'r', false, false], 'ز': ['য', 'z', false, false], 'س': ['স', 's', false, false],
  'ش': ['শ', 'sh', false, false], 'ص': ['স', 'ṣ', true, true], 'ض': ['দ্ব', 'ḍ', true, true], 'ط': ['ত্ব', 'ṭ', true, true],
  'ظ': ['য', 'ẓ', true, true], 'ع': ['‘', '‘', true, true], 'غ': ['গ়', 'gh', true, true], 'ف': ['ফ', 'f', false, false],
  'ق': ['ক্ব', 'q', true, true], 'ك': ['ক', 'k', false, false], 'ل': ['ল', 'l', false, false], 'م': ['ম', 'm', false, false],
  'ن': ['ন', 'n', false, false], 'ه': ['হ', 'h', false, false], 'و': ['ও', 'w', false, false], 'ي': ['ই', 'y', false, false],
  'ء': ['’', '’', true, true], 'أ': ['’', '’', true, true], 'إ': ['’', '’', true, true],
};
export function rootPron(root: string, lang: Lang): Seg[] {
  return root.split(' ').filter(Boolean).map((c) => {
    const l = LETTERS[c];
    if (!l) return [c, false] as Seg;
    return (lang === 'bn' ? [l[0], l[2]] : [l[1], l[3]]) as Seg;
  });
}
