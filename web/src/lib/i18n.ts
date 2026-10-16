import type { Lang } from './content';

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
export const num = (n: number | string, lang: Lang) =>
  lang === 'bn' ? String(n).replace(/\d/g, (d) => BN_DIGITS[+d]) : String(n);

export const UI = {
  bn: {
    app: 'সেতু', tag: 'যে আরবি আপনি আগেই জানেন, সেখান থেকে শুরু।', google: 'Google দিয়ে ঢুকুন',
    private: 'ব্যক্তিগত অ্যাপ। শুধু দুটি অ্যাকাউন্ট ঢুকতে পারে, অগ্রগতি দুই ফোন আর ওয়েবে মিলে থাকে।',
    denied: 'এই অ্যাকাউন্টের ঢোকার অনুমতি নেই।', failed: 'ঢোকা গেল না। আবার চেষ্টা করুন।', opening: 'ব্রাউজারে Google খুলছে…',
    greet: 'আসসালামু আলাইকুম', known: 'আপনি ইতিমধ্যে জানেন', unit: 'টি আরবি শব্দ',
    of: 'বাংলায় লুকিয়ে থাকা ১,০০০+ আরবি শব্দের মধ্যে', lessonEye: (n: string) => `আজকের পাঠ · ${n}`,
    lessonMeta: (w: string, hooks: string) => `১০ মিনিট · ${w}টি শব্দ · ${hooks}`, start: 'শুরু করুন', again: 'আবার করুন',
    allDone: 'তিনটা পাঠই শেষ। রিভিউ চালিয়ে যান।',
    review: 'রিভিউ বাকি', lessons: 'সব পাঠ', lessonsSub: 'শেষ করা পাঠ আবার করা যায়। প্রতিটা শব্দ রিভিউতে যোগ হয়।',
    hint: 'রঙিন অক্ষর মানে এই আওয়াজ বাংলায় নেই', credit: 'আওয়াজ: elevenlabs.io (Anas, Rafiq, Alice)',
    tToday: 'আজ', tLessons: 'পাঠ', tReview: 'রিভিউ', back: 'ফিরে যান', lesson: (n: string) => `পাঠ ${n}`,
    words: (n: string) => `${n}টি শব্দ`, done: 'শেষ', days: (n: string) => `${n} দিন`,
    rTitle: 'রিভিউ', recall: 'কতটা মনে ছিল?', show: 'অর্থ দেখুন', play: 'উচ্চারণ শুনুন',
    gAgain: 'আবার', gHard: 'কঠিন', gGood: 'পেরেছি', gEasy: 'সহজ', root: 'শিকড়',
    none: 'এখন কোনো রিভিউ বাকি নেই।', nextAt: (s: string) => `পরের রিভিউ ${s} পরে।`, noneYet: 'একটা পাঠ শেষ করলে শব্দগুলো এখানে আসবে।',
    finished: (n: string) => `${n}টি রিভিউ শেষ।`, home: 'হোমে ফিরুন',
    min: (n: string) => `${n} মিনিট`, hour: (n: string) => `${n} ঘণ্টা`, day: (n: string) => `${n} দিন`, month: (n: string) => `${n} মাস`,
    signOut: 'বের হন', offline: 'অফলাইন। পরে মিলিয়ে নেওয়া হবে।', langLabel: 'অ্যাপের ভাষা',
  },
  en: {
    app: 'Setu', tag: 'Start from the Arabic you already know.', google: 'Continue with Google',
    private: 'A private app. Only two accounts can sign in, and progress stays in step across both phones and the web.',
    denied: 'This account is not allowed in.', failed: 'Sign in did not work. Try again.', opening: 'Opening Google in the browser…',
    greet: 'Assalamu alaikum', known: 'You already know', unit: 'Arabic words',
    of: 'of the 1,000+ Arabic words hiding in Bangla', lessonEye: (n: string) => `Today’s lesson · ${n}`,
    lessonMeta: (w: string, hooks: string) => `10 min · ${w} words · ${hooks}`, start: 'Start', again: 'Do it again',
    allDone: 'All three lessons done. Keep up the reviews.',
    review: 'Reviews due', lessons: 'All lessons', lessonsSub: 'You can redo a finished lesson. Every word joins your reviews.',
    hint: 'Coloured letters are sounds English does not have', credit: 'Voices: elevenlabs.io (Anas, Rafiq, Alice)',
    tToday: 'Today', tLessons: 'Lessons', tReview: 'Review', back: 'Back', lesson: (n: string) => `Lesson ${n}`,
    words: (n: string) => `${n} words`, done: 'Done', days: (n: string) => `${n} ${n === '1' ? 'day' : 'days'}`,
    rTitle: 'Review', recall: 'How well did you remember?', show: 'Show the meaning', play: 'Play the pronunciation',
    gAgain: 'Again', gHard: 'Hard', gGood: 'Got it', gEasy: 'Easy', root: 'Root',
    none: 'Nothing to review right now.', nextAt: (s: string) => `Next review in ${s}.`, noneYet: 'Finish a lesson and its words come here.',
    finished: (n: string) => `${n} reviews done.`, home: 'Back home',
    min: (n: string) => `${n} min`, hour: (n: string) => `${n} h`, day: (n: string) => `${n} ${n === '1' ? 'day' : 'days'}`, month: (n: string) => `${n} mo`,
    signOut: 'Sign out', offline: 'Offline. It will sync later.', langLabel: 'App language',
  },
};
export type Strings = (typeof UI)['bn'];

export function span(ms: number, lang: Lang) {
  const t = UI[lang];
  const m = Math.max(1, Math.round(ms / 60000));
  if (m < 60) return t.min(num(m, lang));
  const h = Math.round(m / 60);
  if (h < 24) return t.hour(num(h, lang));
  const d = Math.round(h / 24);
  if (d < 45) return t.day(num(d, lang));
  return t.month(num(Math.round(d / 30), lang));
}
