#!/usr/bin/env python3
"""Build player/index.html from content/lesson*.json + content/en.json.

Pronunciation rules (Miraz, 2026-10-16): long i/u written with plain ি/ু (no ী/ূ),
and a final ة is written -াহ (হিক-মাহ, মাদ-রা-সাহ).
Run: python3 player/build.py
"""
import json, os, re, random

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = os.path.join(ROOT, 'content')
EN = json.load(open(os.path.join(C, 'en.json')))
HARAKAT = re.compile('[ً-ْٰـ]')

# Lesson 1 distractors chosen by look-alike shape (kept from the first lesson 1 build)
NEAR1 = {'kitab': ['كَاتِب', 'قَلَم'], 'qalam': ['كَلْب', 'قَبْر'], 'khabar': ['قَبْر', 'حِبْر'], 'qabr': ['خَبَر', 'كَبِير'],
         'hisab': ['حَسَن', 'كِتَاب'], 'dunya': ['دِين', 'دُعَاء'], 'insaf': ['إِنْسَان', 'صَبْر'], 'masjid': ['مَجْلِس', 'مَدْرَسَة'],
         'madrasa': ['مَسْجِد', 'مَكْتَب'], 'ilm': ['عَالِم', 'أَلَم'], 'sabr': ['سَفَر', 'قَبْر'], 'dua': ['دُنْيَا', 'دَعْوَة']}

META = {
    'lesson1': {'title_en': 'The Arabic you already know',
                'body_bn': 'রোজ যে বারোটা শব্দ বলেন, সেগুলো আসলে আরবি। আজ সেগুলো আরবিতে পড়বেন আর ঠিকভাবে বলবেন।',
                'body_en': 'Twelve words you say every day are really Arabic. Today you read them in Arabic and say them properly.'},
    'lesson2': {'title_en': 'Knowledge, rule and work: three roots',
                'body_bn': 'আলেম, হাকিম, আমল: তিনটা শিকড় থেকে বারোটা শব্দ। প্রতিটা শিকড় একটা অর্থের পরিবার।',
                'body_en': 'Alem, hakim, amal: twelve words from three roots. Each root is a family of meaning.'},
    'lesson3': {'title_en': 'Places, gatherings and peace',
                'body_bn': 'মসজিদের মতো জায়গার ছাঁচ, জুমার মতো জমায়েতের শিকড়, আর সালামের শান্তি।',
                'body_en': 'Place words built like masjid, the gathering root behind juma, and the peace inside salam.'},
}


def bn_pron(w):
    segs = [[t.replace('ী', 'ি').replace('ূ', 'ু'), bool(s)] for t, s in w['bn_pron']]
    if HARAKAT.sub('', w['ar']).endswith('ة') and not segs[-1][0].endswith('হ'):
        segs[-1][0] += 'হ'
    return segs


def lesson(n):
    d = json.load(open(os.path.join(C, f'lesson{n}.json')))
    words = []
    for w in d['words']:
        e = EN[w['id']]
        if n == 1:
            near = NEAR1[w['id']]
        else:  # same-root words first: reading the root is the point of lessons 2 and 3
            near = [x['ar'] for x in d['words'] if x['root'] == w['root'] and x['id'] != w['id']]
            random.Random(w['id']).shuffle(near)
            near = near[:2]
        words.append({
            'id': w['id'], 'bn': w['bn'], 'ar': w['ar'], 'rom': e['rom'], 'root': w['root'],
            'pr': {'bn': bn_pron(w), 'en': e['en_pron']},
            'mean': {'bn': w['mean_bn'], 'en': e['mean_en']},
            'note': {'bn': w['note_bn'], 'en': e['note_en']},
            'shift': {'bn': w['meaning_shift'], 'en': e['shift_en']} if w['meaning_shift'] else None,
            'ex': {'ar': w['example_ar'], 'bn': w['example_bn'], 'en': e['ex_en']} if w.get('example_ar') else None,
            'near': near,
        })
    m = META[d['id']]
    return {'id': f'l{n}', 'n': n, 'title': {'bn': d['title_bn'], 'en': m['title_en']},
            'body': {'bn': m['body_bn'], 'en': m['body_en']}, 'words': words}


def main():
    lessons = [lesson(n) for n in (1, 2, 3)]
    style = open(os.path.join(ROOT, 'player', 'style.html')).read()
    body = open(os.path.join(ROOT, 'player', 'body.html')).read()
    data = json.dumps(lessons, ensure_ascii=False, separators=(',', ':'))
    html = style + body.replace('/*DATA*/', data)
    for bad in ('—', '–'):
        assert bad not in html, 'dash found'
    open(os.path.join(ROOT, 'player', 'index.html'), 'w').write(html)
    # audio job list for make-audio
    jobs = []
    src = {n: json.load(open(os.path.join(C, f'lesson{n}.json'))) for n in (1, 2, 3)}
    for n in (1, 2, 3):
        for w in src[n]['words']:
            jobs.append({'id': w['id'], 'n': n, 'ar': w['audio_ar_text'], 'bn': w['audio_bn_text'], 'en': EN[w['id']]['audio_en_text']})
    json.dump(jobs, open(os.path.join(ROOT, 'player', 'audio-jobs.json'), 'w'), ensure_ascii=False, indent=1)
    print('built', len(html), 'bytes;', sum(len(l['words']) for l in lessons), 'words')


main()
