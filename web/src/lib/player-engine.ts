// @ts-nocheck
// The approved lesson player (player/body.html), ported as-is. Hooks report answers and the finished lesson to the store.
import data from '@/content/lessons.json';

const LESSONS = data;
const ALL = LESSONS.flatMap(l => l.words);
const BY = Object.fromEntries(ALL.map(w => [w.id, w]));
const UI = {
  bn: { app:'সেতু', home:'আরবি, বাংলা থেকে', homeBody:'যে আরবি আপনি আগেই জানেন, সেখান থেকে শুরু।', lesson:n=>`পাঠ ${n}`, words:n=>`${n}টি শব্দ`, done:'শেষ',
    start:'শুরু করুন', back:'পাঠের তালিকায় ফিরুন', youSay:'আপনি রোজ বলেন', isArabic:'এটা আসলে আরবি শব্দ।', seeArabic:'আরবিতে দেখুন',
    kMean:'অর্থ', kNote:'খেয়াল', kShift:'বদল', kEx:'বাক্য', playAr:'আরবি উচ্চারণ শুনুন', playMean:'বাংলায় অর্থ শুনুন', meanBtn:'বাংলা', nextWord:'পরের শব্দ',
    which:'আরবিতে কোনটা?', again:'আরেকবার', right:'ঠিক', wrong:'এটা নয়', means:(b,m)=>`${b} মানে ${m}`, picked:b=>`। আপনি বেছেছিলেন ${b}।`, later:'।', cont:'চালিয়ে যান', replay:'আবার শুনুন',
    match:'জোড়া মেলান', matchBody:'বাংলা শব্দ আর তার আরবি। আরবিতে চাপ দিলে শুনতে পাবেন।', left:n=>`${n}টা জোড়া বাকি`,
    listen:'শুনে চিনুন', listenBody:'কোন শব্দটা বলা হলো?', playWord:'আরবি শব্দটা শুনুন',
    finished:n=>`পাঠ ${n} শেষ`, yours:f=>`টা আরবি শব্দ এখন আপনার। প্রথম চেষ্টায় ঠিক ${f}টা।`, redo:'আবার করুন', nextLesson:'পরের পাঠ', allLessons:'সব পাঠ', listenTo:b=>`${b} শুনুন`,
    hint:'<b>রঙিন</b> অক্ষর মানে এই আওয়াজ বাংলায় নেই', noSound:'এই ব্রাউজারে আওয়াজ চলছে না।', langLabel:'অ্যাপের ভাষা', sayMean:'অর্থ', credit:'আওয়াজ: elevenlabs.io (Anas, Rafiq, Alice)' },
  en: { app:'Setu', home:'Arabic, from Bangla', homeBody:'Start from the Arabic you already know.', lesson:n=>`Lesson ${n}`, words:n=>`${n} words`, done:'Done',
    start:'Start', back:'Back to lessons', youSay:'You say this every day', isArabic:'It is really an Arabic word.', seeArabic:'See it in Arabic',
    kMean:'Meaning', kNote:'Note', kShift:'Shift', kEx:'Sentence', playAr:'Play the Arabic', playMean:'Play the meaning in English', meanBtn:'English', nextWord:'Next word',
    which:'Which one is the Arabic?', again:'Once more', right:'Correct', wrong:'Not this one', means:(b,m)=>`${b} means ${m}`, picked:b=>`. You picked ${b}.`, later:'.', cont:'Continue', replay:'Play again',
    match:'Match the pairs', matchBody:'Each Bangla word and its Arabic. Tap the Arabic to hear it.', left:n=>`${n} ${n>1?'pairs':'pair'} left`,
    listen:'Listen and pick', listenBody:'Which word did you hear?', playWord:'Play the Arabic word',
    finished:n=>`Lesson ${n} done`, yours:f=>`Arabic words are now yours. Right first time: ${f}.`, redo:'Do it again', nextLesson:'Next lesson', allLessons:'All lessons', listenTo:b=>`Play ${b}`,
    hint:'<b>Coloured</b> letters are sounds English does not have', noSound:'Sound is not working in this browser.', langLabel:'App language', sayMean:'meaning', credit:'Voices: elevenlabs.io (Anas, Rafiq, Alice)' }
};

let LANG = 'bn', H = null, IV = null;
const t = () => UI[LANG];
/* ---------- helpers ---------- */
const $ = id => document.getElementById(id);
const num = n => LANG === 'bn' ? String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]) : String(n);
const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];} return a; };
const tap = p => { try{ navigator.vibrate && navigator.vibrate(p); }catch(e){} };
const M = (w,k) => w[k] ? w[k][LANG] : '';
const syl = w => { const o=[]; w.pr[LANG].forEach(([x,s])=>x.split('-').forEach(y=>y&&o.push([y,s]))); return o; };
const pron = (w,id) => `<div class="pron" id="${id}">${syl(w).map(([x,s],k)=>(k?'<span class="sep">·</span>':'')+`<span class="syl${s?' sp':''}">${x}</span>`).join('')}</div>`;
const pronPlain = w => syl(w).map(([x,s])=> s?`<span class="s">${x}</span>`:x).join('·');
const I = {
  play:'<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9.5v5c0 .6.4 1 1 1h3l4.3 3.7c.6.5 1.7.1 1.7-.8V5.6c0-.9-1.1-1.3-1.7-.8L7 8.5H4c-.6 0-1 .4-1 1z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.8 5.8a9 9 0 0 1 0 12.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  big:'<svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9.5v5c0 .6.4 1 1 1h3l4.3 3.7c.6.5 1.7.1 1.7-.8V5.6c0-.9-1.1-1.3-1.7-.8L7 8.5H4c-.6 0-1 .4-1 1z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.8 5.8a9 9 0 0 1 0 12.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  ok:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  no:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg>',
  down:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
  chev:'<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  check:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
};

/* ---------- audio: ElevenLabs clips (Arabic: Anas, Bangla: Rafiq, English: Alice); device voice as fallback ---------- */
let voices={ar:null,bn:null,en:null}, cur=null;
function loadVoices(){ try{ const v=speechSynthesis.getVoices();
  voices.ar=v.find(x=>/^ar[-_]SA/i.test(x.lang))||v.find(x=>/^ar/i.test(x.lang))||null;
  voices.bn=v.find(x=>/^bn[-_]BD/i.test(x.lang))||v.find(x=>/^bn/i.test(x.lang))||null;
  voices.en=v.find(x=>/^en[-_]GB/i.test(x.lang))||v.find(x=>/^en/i.test(x.lang))||null; }catch(e){} }
try{ loadVoices(); speechSynthesis.onvoiceschanged=loadVoices; }catch(e){}
const cache={};
async function clip(path){ if(path in cache) return cache[path];
  try{ const r=await fetch(path); if(!r.ok) throw 0; cache[path]=URL.createObjectURL(await r.blob()); }catch(e){ cache[path]=null; } return cache[path]; }
function stop(){ try{cur&&cur.pause();}catch(e){} try{speechSynthesis.cancel();}catch(e){} }
// kind: 'ar' (the Arabic word) or 'mean' (meaning line in the app language)
async function play(w,kind,tick){
  stop(); $('toast').textContent='';
  const lang = kind==='ar' ? 'ar' : LANG;
  const src = await clip(`/audio/${lang}-${w.id}.mp3`);
  if(src){ const a=new Audio(src); cur=a;
    a.ontimeupdate=()=>tick&&a.duration&&tick(a.currentTime/a.duration); a.onended=()=>tick&&tick(1);
    try{ await a.play(); return; }catch(e){} }
  try{ const text = lang==='ar' ? w.ar : lang==='bn' ? `${w.bn}। অর্থ, ${w.mean.bn}।` : `${w.rom}. ${w.mean.en}.`;
    const u=new SpeechSynthesisUtterance(text);
    u.lang={ar:'ar-SA',bn:'bn-BD',en:'en-GB'}[lang]; u.rate=lang==='ar'?.75:.95; if(voices[lang]) u.voice=voices[lang];
    let t0, raf, est=Math.max(700, syl(w).length*420);
    u.onstart=()=>{ t0=performance.now(); const f=()=>{ const p=(performance.now()-t0)/est; tick&&tick(Math.min(p,.99)); if(p<1) raf=requestAnimationFrame(f); }; f(); };
    u.onend=()=>{ cancelAnimationFrame(raf); tick&&tick(1); };
    speechSynthesis.speak(u);
  }catch(e){ $('toast').textContent=t().noSound; }
}
const karaoke = id => p => { const el=$(id); if(!el) return; const s=el.querySelectorAll('.syl'); const k=p>=1?-1:Math.floor(p*s.length); s.forEach((x,i)=>x.classList.toggle('on',i===k)); };

/* ---------- flow ---------- */
let L, WORDS, S;
function build(){ const s=[];
  for(let g=0;g<WORDS.length/4;g++){ const ids=WORDS.slice(g*4,g*4+4).map(w=>w.id);
    ids.forEach(id=>s.push({t:'intro',id})); shuffle(ids).forEach(id=>s.push({t:'pick',id}));
    s.push({t:'match',ids}); s.push({t:'listen',id:shuffle(ids)[0],ids}); }
  s.push({t:'end'}); return s; }
function open(i, intro){ L=LESSONS[i]; WORDS=L.words; S={steps:(intro?[{t:'start'}]:[]).concat(build()), i:0, first:new Set(WORDS.map(w=>w.id)), started:new Date().toISOString()}; render(); }
function prog(){ const real=S.steps.filter(x=>x.t!=='start'&&x.t!=='end').length, done=S.steps.slice(0,S.i).filter(x=>x.t!=='start').length, k=S.steps[S.i].t;
  $('bar').style.width=(k==='end'?100:done/real*100)+'%'; $('num').textContent=(k==='start'||k==='end')?'':num(done+1)+'/'+num(real); }
function next(){ stop(); sheet(false); if(!S) return; S.i++; render(); }
function render(){ $('navbar').style.display=''; $('restart').setAttribute('aria-label', t().back); prog(); $('toast').textContent=''; $('stage').style.justifyContent='';
  const st=S.steps[S.i]; ({start,intro,pick,match,listen,end})[st.t](st); $('stage').scrollTop=0; }
const dock = h => { $('dock').innerHTML=h; };
function sheet(on, html){ const el=$('sheet'); if(html!==undefined) el.innerHTML=html; el.classList.toggle('up',on); }

function start(){
  $('stage').innerHTML=`
    <p class="eyebrow in">${t().lesson(num(L.n))}</p>
    <h1 class="title in" style="animation-delay:.05s">${L.title[LANG]}</h1>
    <p class="body in" style="animation-delay:.1s">${L.body[LANG]}</p>
    <div class="chips in" style="animation-delay:.15s">${WORDS.slice(0,6).map(w=>`<span class="chip"><span class="ar" lang="ar">${w.ar}</span>${w.bn}</span>`).join('')}</div>
    <p class="hint in" style="animation-delay:.2s">${t().hint}</p>`;
  dock(`<button class="btn" id="go">${t().start}</button>`); $('go').onclick=next;
}

function intro(st){
  const w=BY[st.id];
  $('stage').innerHTML=`<p class="eyebrow in">${t().youSay}</p><div class="hero-bn in">${w.bn}</div><p class="body in" style="animation-delay:.08s">${t().isArabic}</p>`;
  dock(`<button class="btn" id="rv">${t().seeArabic}</button>`);
  $('rv').onclick=()=>{ tap(8);
    $('stage').innerHTML=`
      <div class="hero-bn small">${w.bn}</div>
      <div class="arrow in" style="animation-delay:.05s">${I.down}</div>
      <div class="hero-ar write" lang="ar">${w.ar}</div>
      <div class="in" style="animation-delay:1.1s">${pron(w,'pr')}</div>
      <div class="group in" style="animation-delay:1.25s">
        <div class="row"><span class="k">${t().kMean}</span><span class="v">${M(w,'mean')}</span></div>
        <div class="row"><span class="k">${t().kNote}</span><span class="v">${M(w,'note')}</span></div>
        ${M(w,'shift')?`<div class="row"><span class="k">${t().kShift}</span><span class="v">${M(w,'shift')}</span></div>`:''}
        ${w.ex?`<div class="row"><span class="k">${t().kEx}</span><span class="v"><span class="ar" lang="ar">${w.ex.ar}</span><br>${w.ex[LANG]}</span></div>`:''}
      </div>`;
    dock(`<button class="round" id="sa" aria-label="${t().playAr}">${I.play}</button>
          <button class="round text" id="sb" aria-label="${t().playMean}">${t().meanBtn}</button>
          <button class="btn" id="nx">${t().nextWord}</button>`);
    $('sa').onclick=()=>play(w,'ar',karaoke('pr')); $('sb').onclick=()=>play(w,'mean'); $('nx').onclick=next;
    setTimeout(()=>{ if(S&&S.steps[S.i]===st) play(w,'ar',karaoke('pr')); },1150);
  };
}

function opts(w){ const p=new Set(w.near.filter(a=>a!==w.ar)); shuffle(WORDS).forEach(x=>{ if(p.size<3&&x.ar!==w.ar) p.add(x.ar); }); return shuffle([w.ar,...[...p].slice(0,3)]); }
function verdict(w, ok, picked){
  const o = picked && !ok ? ALL.find(x=>x.ar===picked) : null;
  sheet(true, `
    <div class="verdict ${ok?'ok':'no'}">${ok?I.ok+t().right:I.no+t().wrong}</div>
    <div class="line">${pron(w,'fp')}<span class="ar" lang="ar">${w.ar}</span></div>
    <div class="say">${t().means(w.bn, M(w,'mean'))}${o?t().picked(o.bn):t().later}</div>
    <div class="dock"><button class="round" id="sa" aria-label="${t().replay}">${I.play}</button><button class="btn" id="nx">${t().cont}</button></div>`);
  $('sa').onclick=()=>play(w,'ar',karaoke('fp')); $('nx').onclick=next;
  play(w,'ar',karaoke('fp'));
}
function retry(id){ const k=S.steps.findIndex((s,j)=>j>S.i&&(s.t==='match'||s.t==='end')); S.steps.splice(k+1,0,{t:'pick',id,retry:true}); S.first.delete(id); }

function pick(st){
  const w=BY[st.id];
  $('stage').innerHTML=`<p class="eyebrow in">${st.retry?t().again:t().which}</p><div class="hero-bn in">${w.bn}</div>
    <div class="grid in" style="animation-delay:.06s" id="opts">${opts(w).map(a=>`<button class="opt" data-a="${a}" lang="ar">${a}</button>`).join('')}</div>`;
  dock(''); let done=false;
  document.querySelectorAll('#opts .opt').forEach(b=>b.onclick=()=>{ if(done) return; done=true;
    const ok=b.dataset.a===w.ar;
    document.querySelectorAll('#opts .opt').forEach(x=>{ if(x.dataset.a===w.ar) x.classList.add('right'); else if(x!==b) x.classList.add('dim'); });
    if(ok) tap(12); else { b.classList.add('wrong'); tap([25,40,25]); retry(w.id); }
    H.answer(w.id,ok); verdict(w,ok,b.dataset.a); });
}

function match(st){
  const ws=st.ids.map(id=>BY[id]), Lw=shuffle(ws), R=shuffle(ws);
  $('stage').innerHTML=`<p class="eyebrow in">${t().match}</p><p class="body in">${t().matchBody}</p>
    <div class="grid in" style="animation-delay:.06s" id="m">${Lw.map((w,k)=>`<button class="opt bn" data-s="L" data-id="${w.id}">${w.bn}</button><button class="opt" data-s="R" data-id="${R[k].id}" lang="ar">${R[k].ar}</button>`).join('')}</div>`;
  dock(`<button class="btn" id="nx" disabled>${t().left(num(ws.length))}</button>`);
  let sel={L:null,R:null}, left=ws.length;
  document.querySelectorAll('#m .opt').forEach(b=>b.onclick=()=>{ if(b.classList.contains('gone')) return;
    const s=b.dataset.s; if(s==='R') play(BY[b.dataset.id],'ar');
    if(sel[s]) sel[s].classList.remove('sel'); sel[s]=b; b.classList.add('sel');
    if(sel.L&&sel.R){ const a=sel.L,c=sel.R; sel={L:null,R:null};
      if(a.dataset.id===c.dataset.id){ [a,c].forEach(x=>{x.classList.remove('sel');x.classList.add('right');}); tap(10);
        setTimeout(()=>[a,c].forEach(x=>x.classList.add('gone')),380); left--; H.answer(a.dataset.id,true);
        const nx=$('nx'); if(left) nx.textContent=t().left(num(left)); else { nx.disabled=false; nx.textContent=t().cont; nx.onclick=next; }
      } else { [a,c].forEach(x=>{x.classList.remove('sel');x.classList.add('wrong');setTimeout(()=>x.classList.remove('wrong'),360);}); tap([25,40,25]); S.first.delete(a.dataset.id); H.answer(a.dataset.id,false); } } });
}

function listen(st){
  const w=BY[st.id];
  $('stage').innerHTML=`<p class="eyebrow in">${t().listen}</p><button class="orb in" id="orb" aria-label="${t().playWord}">${I.big}</button>
    <p class="body in">${t().listenBody}</p>
    <div class="grid in" style="animation-delay:.06s" id="opts">${shuffle(st.ids).map(id=>`<button class="opt bn" data-id="${id}">${BY[id].bn}</button>`).join('')}</div>`;
  dock('');
  const orb=$('orb'), say=()=>{ orb.classList.add('playing'); play(w,'ar',p=>{ if(p>=1) orb.classList.remove('playing'); }); setTimeout(()=>orb.classList.remove('playing'),2500); };
  orb.onclick=say; setTimeout(()=>{ if(S&&S.steps[S.i]===st) say(); },450);
  let done=false;
  document.querySelectorAll('#opts .opt').forEach(b=>b.onclick=()=>{ if(done) return; done=true; const ok=b.dataset.id===w.id;
    document.querySelectorAll('#opts .opt').forEach(x=>{ if(x.dataset.id===w.id) x.classList.add('right'); else if(x!==b) x.classList.add('dim'); });
    if(ok) tap(12); else { b.classList.add('wrong'); tap([25,40,25]); S.first.delete(w.id); }
    H.answer(w.id,ok); verdict(w,ok,null); });
}

function end(){
  H.finish(L.id,[...S.first],S.started);
  const i=LESSONS.indexOf(L), nx=LESSONS[i+1];
  $('stage').style.justifyContent='flex-start';
  $('stage').innerHTML=`<p class="eyebrow in" style="margin-top:12px">${t().finished(num(L.n))}</p><div class="big in" id="cnt">${num(0)}</div>
    <p class="body in">${t().yours(num(S.first.size))}</p>
    <div class="group list in" style="animation-delay:.1s">${WORDS.map(w=>`<div class="row">
      <span class="v"><strong>${w.bn}</strong><small>${pronPlain(w)} · ${M(w,'mean')}</small></span>
      <span class="ar" lang="ar">${w.ar}</span><button class="mini" data-id="${w.id}" aria-label="${t().listenTo(w.bn)}">${I.play}</button></div>`).join('')}</div>`;
  document.querySelectorAll('.list .mini').forEach(b=>b.onclick=()=>play(BY[b.dataset.id],'ar'));
  dock(`<button class="round text" id="again">${t().redo}</button><button class="btn" id="fwd">${nx?t().nextLesson:t().allLessons}</button>`);
  $('again').onclick=()=>open(i,false); $('fwd').onclick=()=> nx ? H.go(nx.id) : H.exit();
  let n=0; const el=$('cnt'); IV=setInterval(()=>{ el.textContent=num(++n); if(n>=WORDS.length){ clearInterval(IV); tap([15,30,15]); } },70);
}


export function mountPlayer(lessonId, lang, hooks){
  LANG = lang; H = hooks;
  const i = LESSONS.findIndex(l => l.id === lessonId);
  $('restart').onclick = () => H.exit();
  open(i < 0 ? 0 : i, true);
  return () => { stop(); clearInterval(IV); S = null; H = { answer(){}, finish(){}, go(){}, exit(){} }; };
}
