# Content review, lessons 1 to 3 (2026-10-16)

Sources used: English Wiktionary (Bengali and Arabic entries), Platts Urdu/Hindi dictionary and Samsad Bengali-English dictionary (both on DSAL, uchicago.edu), Bengali Wiktionary. Hans Wehr itself was not opened (no searchable text online); Arabic glosses come from Wiktionary Arabic entries, which follow Hans Wehr and Lane. Bangla Academy dictionary was not reachable online; one secondary page quoting it was seen (see হাকিম below).

## Corrections to current lesson 1 (lesson1/index.html)

| Word | Current | Problem | Fix in lesson1.json |
|---|---|---|---|
| মসজিদ note | "سُجُود (সিজদা)" | سُجُود is sujud. Bangla সিজদা/সেজদা comes from سَجْدَة | note now says سَجْدَة (সিজদা) |
| মসজিদ mean | "সিজদার জায়গা" | That is the Arabic literal meaning, not the Bangla meaning | mean_bn = মসজিদ, নামাজের ঘর; literal meaning moved to ar_mean_en and audio |
| মাদ্রাসা mean | "পড়ার জায়গা, স্কুল" | In Bangla মাদ্রাসা is only an Islamic school; in Arabic مَدْرَسَة is any school. This is a meaning shift the lesson should teach, not blur | mean_bn = ইসলামি শিক্ষাপ্রতিষ্ঠান, meaning_shift filled, example uses ordinary school |
| কলম | no origin note | Arabic قَلَم is itself a loan from Greek kalamos (Wiktionary). Root ق ل م ("to trim") exists, but the word is not natively derived from it | note adds the Greek origin |
| কিতাব | mean "বই" only | Bangladeshi কিতাব mostly means a religious book | meaning_shift notes this (mild) |

No pronunciation (pr) in lesson 1 was wrong against SPEC 5b. Harakat on all 12 were correct.

## Uncertain items (please check)

1. **ইলম**: no Bangla dictionary entry found (Wiktionary and Samsad both lack it). Wiktionary lists the colloquial form **এলেম** as the Bengali descendant of عِلْم. ইলম is real religious-register Bangla, but unverified in a dictionary. Option: show both.
2. **via_persian = false means "not confirmed"**, not "proven direct". Sources say direct from Arabic or are silent for: মাদ্রাসা, ইলম, সবর, আলেম, ওলামা, মামলা, মক্তব, মাহফিল, জামে. Historically most of these probably came through Persian too.
3. **হাকিম**: Samsad has two entries (হাকিম = magistrate/judge, and হাকিম = popular variant of হকিম, physician). A secondary page quoting Bangla Academy gives all senses under [আ. হকীম]. Platts gives حاكم for the judge sense. I used حَاكِم for হাকিম and حَكِيم for হেকিম. Bangla Academy may disagree.
4. **হেকমত**: the colloquial BD sense "কৌশল, বুদ্ধি" is supported only indirectly (Hindi हिकमत lists "cleverness"; Samsad gives হিকমত = power, ability). The Arabic meaning (wisdom) is certain.
5. **জমা, জামাত, জুমা, মালুম, আমলা, মামুলি, সালামত**: Arabic origin confirmed in Platts (Urdu/Hindustani) and Samsad meanings, not in a Bangla etymological dictionary. **সালামত** meaning confirmed on Bengali Wiktionary only.
6. **আমলা ← عَمَلَة** (plural of عَامِل): from Platts. In modern Arabic the same letters عملة are read عُمْلَة = currency. The example sentence is a grammar statement, since عَمَلَة is not used in modern speech.
7. **মামুলি ← مَعْمُول**: Platts says the final -ī is an Indic suffix. The audio reads مَعْمُول.
8. **মুসলমান**: Persian formation (Platts: probably from muslimīn). The Arabic word taught and voiced is مُسْلِم.
9. **মহল্লা**: مَحَلَّة is used in Egyptian/Iraqi Arabic; modern Gulf/Hijazi prefers حَيّ. Worth a note in the Madinah track.

## Pronunciation conventions I added (confirm)

- Long ī and ū written ী and ূ (তা‘-লীম, মা‘-লূম, হা-কীম), so learners hear the length. Lesson 1 has no long i/u, so nothing there changed.
- When ع closes a syllable (no vowel after it), ‘ goes after the vowel before it: তা‘-লীম, জাম‘, জা-মি‘. SPEC 5b only covers ع before a vowel.
- A hamza at the start of a word (إِنْصَاف, إِسْلَام) is not marked, matching lesson 1's ইন-সা-ফ.
- ة at the end of a word is read in pause as -া (মাদ-রা-সা, হিক-মা, সা-লা-মা), with no final হ.
- All SPEC 5b letters (including ذ, ث, غ, ء) are flagged special. Lesson 2/3 only needed ع, ء, ح.

## Not used yet (for later lessons)

ঈমান, আমানত, ফকির, কসম, মালিক, শুকরিয়া (Urdu/Persian form; Arabic says شُكْرًا), আদালত (عَدَالَة, justice to court: meaning shift), আক্কেল (عَقْل), কবুল/কিবলা/মকবুল (ق ب ل), মজমা (مَجْمَع, confirmed in Platts, no Bangla dictionary entry found), তামিল (تَعْمِيل, confirmed in Samsad, but rare in Arabic, so dropped), মহকুমা (مَحْكَمَة, court to subdivision, confirmed in Samsad and Platts).
