// src/views/HomeView.jsx
import React, { useState } from 'react';
import LessonCard from '../components/LessonCard.jsx';
import { Star, Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { lessons } from '../data/lessons.js';
import { quizTypes } from '../data/quizzes.js';

// ── Haitian Creole Alphabet ───────────────────────────────────────────
// speakLetter: what gets spoken when user taps the main button
// speakExample: what gets spoken for the word example button
const ALPHABET = [
  { letter: "A a",   speakLetter: "ah",         sound: "ah",                    example: "anana",    meaning: "pineapple" },
  { letter: "AN an", speakLetter: "ahn",         sound: "ahn (nasal)",           example: "anpil",    meaning: "many" },
  { letter: "B b",   speakLetter: "beh",         sound: "b",                     example: "bonjou",   meaning: "hello" },
  { letter: "CH ch", speakLetter: "sheh",        sound: "sh (like 'shoe')",      example: "chèz",     meaning: "chair" },
  { letter: "D d",   speakLetter: "deh",         sound: "d",                     example: "dlo",      meaning: "water" },
  { letter: "E e",   speakLetter: "eh",          sound: "eh (like 'bed')",       example: "elèv",     meaning: "student" },
  { letter: "È è",   speakLetter: "air",         sound: "air (open e)",          example: "frè",      meaning: "brother" },
  { letter: "EN en", speakLetter: "ehn",         sound: "ehn (nasal)",           example: "enpòtan",  meaning: "important" },
  { letter: "F f",   speakLetter: "ef",          sound: "f",                     example: "fanmi",    meaning: "family" },
  { letter: "G g",   speakLetter: "geh",         sound: "g (always hard)",       example: "gato",     meaning: "cake" },
  { letter: "H h",   speakLetter: "ash",         sound: "silent or soft h",      example: "Ayiti",    meaning: "Haiti" },
  { letter: "I i",   speakLetter: "ee",          sound: "ee (like 'feet')",      example: "ile",      meaning: "island" },
  { letter: "J j",   speakLetter: "zhe",         sound: "zh (like 'measure')",   example: "jou",      meaning: "day" },
  { letter: "K k",   speakLetter: "keh",         sound: "k",                     example: "kay",      meaning: "house" },
  { letter: "L l",   speakLetter: "el",          sound: "l",                     example: "liv",      meaning: "book" },
  { letter: "M m",   speakLetter: "em",          sound: "m",                     example: "manman",   meaning: "mother" },
  { letter: "N n",   speakLetter: "en",          sound: "n",                     example: "non",      meaning: "no/name" },
  { letter: "NG ng", speakLetter: "eng",         sound: "ng (like 'sing')",      example: "mango",    meaning: "mango" },
  { letter: "O o",   speakLetter: "oh",          sound: "oh (like 'go')",        example: "orevwa",   meaning: "goodbye" },
  { letter: "Ò ò",   speakLetter: "aw",          sound: "aw (open o)",           example: "dòmi",     meaning: "to sleep" },
  { letter: "ON on", speakLetter: "ohn",         sound: "ohn (nasal)",           example: "bonton",   meaning: "good manners" },
  { letter: "OU ou", speakLetter: "oo",          sound: "oo (like 'food')",      example: "ou",       meaning: "you" },
  { letter: "OUN oun",speakLetter:"oon",         sound: "oon (nasal)",           example: "woung",    meaning: "ring" },
  { letter: "P p",   speakLetter: "peh",         sound: "p",                     example: "papa",     meaning: "father" },
  { letter: "R r",   speakLetter: "er",          sound: "r (soft, back of throat)", example: "rele",  meaning: "to call" },
  { letter: "S s",   speakLetter: "es",          sound: "s",                     example: "sè",       meaning: "sister" },
  { letter: "T t",   speakLetter: "teh",         sound: "t",                     example: "tanpri",   meaning: "please" },
  { letter: "UI ui", speakLetter: "wee",         sound: "wee",                   example: "nuit",     meaning: "night" },
  { letter: "V v",   speakLetter: "veh",         sound: "v",                     example: "vini",     meaning: "to come" },
  { letter: "W w",   speakLetter: "weh",         sound: "w",                     example: "wi",       meaning: "yes" },
  { letter: "Y y",   speakLetter: "yeh",         sound: "y",                     example: "yo",       meaning: "they" },
  { letter: "Z z",   speakLetter: "zeh",         sound: "z",                     example: "zanmi",    meaning: "friend" },
];

// ── Numbers ───────────────────────────────────────────────────────────
const NUMBERS_BASIC = [
  { creole: "Yon / Youn", english: "1",  pronunciation: "yohn / yoon" },
  { creole: "De",         english: "2",  pronunciation: "deh" },
  { creole: "Twa",        english: "3",  pronunciation: "twah" },
  { creole: "Kat",        english: "4",  pronunciation: "kaht" },
  { creole: "Senk",       english: "5",  pronunciation: "sank" },
  { creole: "Sis",        english: "6",  pronunciation: "sees" },
  { creole: "Sèt",        english: "7",  pronunciation: "set" },
  { creole: "Uit",        english: "8",  pronunciation: "weet" },
  { creole: "Nèf",        english: "9",  pronunciation: "nef" },
  { creole: "Dis",        english: "10", pronunciation: "dees" },
  { creole: "Onz",        english: "11", pronunciation: "onz" },
  { creole: "Douz",       english: "12", pronunciation: "dooz" },
  { creole: "Trèz",       english: "13", pronunciation: "trez" },
  { creole: "Katòz",      english: "14", pronunciation: "kah-torz" },
  { creole: "Kenz",       english: "15", pronunciation: "kenz" },
  { creole: "Sèz",        english: "16", pronunciation: "sez" },
  { creole: "Disèt",      english: "17", pronunciation: "dee-set" },
  { creole: "Dizuit",     english: "18", pronunciation: "dee-zweet" },
  { creole: "Diznèf",     english: "19", pronunciation: "deez-nef" },
  { creole: "Ven",        english: "20", pronunciation: "ven" },
];

const NUMBERS_BIG = [
  { creole: "Trant",              english: "30",             pronunciation: "trant" },
  { creole: "Karant",             english: "40",             pronunciation: "kah-rant" },
  { creole: "Senkant",            english: "50",             pronunciation: "san-kant" },
  { creole: "Swasant",            english: "60",             pronunciation: "swah-sant" },
  { creole: "Swasant-dis",        english: "70",             pronunciation: "swah-sant-dees" },
  { creole: "Katrevan",           english: "80",             pronunciation: "katr-eh-van" },
  { creole: "Katrevan-dis",       english: "90",             pronunciation: "katr-eh-van-dees" },
  { creole: "San",                english: "100",            pronunciation: "san" },
  { creole: "De san",             english: "200",            pronunciation: "deh san" },
  { creole: "Twa san",            english: "300",            pronunciation: "twah san" },
  { creole: "Mil",                english: "1,000",          pronunciation: "meel" },
  { creole: "De mil",             english: "2,000",          pronunciation: "deh meel" },
  { creole: "Dis mil",            english: "10,000",         pronunciation: "dees meel" },
  { creole: "San mil",            english: "100,000",        pronunciation: "san meel" },
  { creole: "Yon milyon",         english: "1,000,000",      pronunciation: "yohn meel-yon" },
  { creole: "De milyon",          english: "2,000,000",      pronunciation: "deh meel-yon" },
  { creole: "Dis milyon",         english: "10,000,000",     pronunciation: "dees meel-yon" },
  { creole: "Yon milya",          english: "1,000,000,000",  pronunciation: "yohn meel-yah" },
  { creole: "De milya",           english: "2,000,000,000",  pronunciation: "deh meel-yah" },
  { creole: "Yon trilyon",        english: "1,000,000,000,000", pronunciation: "yohn tree-yon" },
];

const NUMBER_TIPS = [
  { tip: "21 = Ven-et-yon",                      note: "Use 'et' to connect 20+1 through 20+9" },
  { tip: "35 = Trant-senk",                       note: "30s and above: combine tens + digit directly" },
  { tip: "150 = San senkant",                     note: "Hundreds + tens, no connector needed" },
  { tip: "1,500 = Mil senk san",                  note: "Thousands + hundreds" },
  { tip: "2,500,000 = De milyon senk san mil",    note: "Build from largest to smallest unit" },
];

// ── Helpers ───────────────────────────────────────────────────────────
function speak(text, lang = "fr-FR") {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.75;
    window.speechSynthesis.speak(u);
  }
}

function Section({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition"
      >
        <span className="font-bold text-gray-900 flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          {title}
        </span>
        {open
          ? <ChevronUp size={18} className="text-gray-400" />
          : <ChevronDown size={18} className="text-gray-400" />
        }
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────
export default function HomeView({
  completedLessons,
  totalPoints,
  streak,
  setSelectedLesson,
  setCurrentView,
  startQuiz,
}) {
  const [numberTab, setNumberTab] = useState("basic");

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Hero stats (unchanged) */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to Pale Kreyòl!</h2>
        <p className="opacity-90 mb-4">Start your journey learning Haitian Creole</p>
        <div className="flex items-center gap-4">
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-2xl font-bold">{completedLessons.size}</div>
            <div className="text-xs opacity-80">Lessons</div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-2xl font-bold">{totalPoints}</div>
            <div className="text-xs opacity-80">Points</div>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2">
            <div className="text-2xl font-bold">{streak}</div>
            <div className="text-xs opacity-80">Streak 🔥</div>
          </div>
        </div>
      </div>

      {/* Continue Learning (unchanged) */}
      <div>
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Star className="text-yellow-500" size={20} />
          Continue Learning
        </h3>
        <div className="space-y-3">
          {lessons.slice(0, 3).map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              completed={completedLessons.has(lesson.id)}
              onClick={() => { setSelectedLesson(lesson); setCurrentView("lesson"); }}
            />
          ))}
        </div>
      </div>

      {/* Quick Practice (unchanged) */}
      <div>
        <h3 className="text-lg font-bold mb-3">Quick Practice</h3>
        <div className="grid grid-cols-2 gap-3">
          {quizTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                const randomLesson = lessons[Math.floor(Math.random() * lessons.length)];
                setSelectedLesson(randomLesson);
                startQuiz(type.id);
              }}
              className={`bg-gradient-to-br ${type.color} text-white p-4 rounded-xl hover:opacity-90 transition-opacity`}
            >
              <type.icon size={32} className="mb-2 mx-auto" />
              <div className="font-semibold text-sm">{type.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── ALPHABET SECTION ─────────────────────────────────────────── */}
      <Section title="Alphabet & Pronunciation" icon="🔤">
        <p className="text-xs text-gray-500 mb-1">
          Tap <span className="font-bold text-blue-600">🔊</span> to hear the letter sound.
          Tap <span className="font-bold text-purple-500">word</span> to hear the example word.
        </p>

        {/* Column headers */}
        <div className="flex items-center gap-2 px-1 py-2 mb-1 border-b border-gray-100">
          <span className="w-20 text-xs font-bold text-gray-400 uppercase tracking-wide">Letter</span>
          <span className="flex-1 text-xs font-bold text-gray-400 uppercase tracking-wide">Sound</span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide mr-8">Example</span>
          <span className="w-6"></span>
        </div>

        <div className="space-y-1">
          {ALPHABET.map((item) => (
            <div
              key={item.letter}
              className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0"
            >
              {/* Letter + PRIMARY speak button */}
              <div className="w-20 flex-shrink-0 flex items-center gap-1.5">
                <span className="font-bold text-blue-700 text-sm leading-tight">
                  {item.letter}
                </span>
                {/* Main button — speaks the LETTER SOUND */}
                <button
                  onClick={() => speak(item.speakLetter)}
                  className="text-blue-500 hover:text-blue-700 transition p-0.5 rounded hover:bg-blue-50"
                  title={`Hear letter sound: /${item.sound}/`}
                >
                  <Volume2 size={14} />
                </button>
              </div>

              {/* Sound description */}
              <div className="flex-1 min-w-0">
                <span className="text-xs text-purple-600 italic">/{item.sound}/</span>
              </div>

              {/* Example word + SECONDARY speak button */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-700">{item.example}</span>
                  <span className="text-xs text-gray-400 ml-1">= {item.meaning}</span>
                </div>
                {/* Secondary button — speaks the EXAMPLE WORD */}
                <button
                  onClick={() => speak(item.example)}
                  className="text-gray-300 hover:text-purple-500 transition p-0.5 rounded hover:bg-purple-50 ml-1"
                  title={`Hear example: "${item.example}"`}
                >
                  <Volume2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Key rules */}
        <div className="mt-4 bg-blue-50 rounded-xl p-4 space-y-1.5">
          <p className="text-xs font-bold text-blue-800 mb-2">📌 Key Rules</p>
          {[
            "Every letter always makes the same sound — fully phonetic, no exceptions.",
            "Nasal vowels (AN, EN, ON, OUN) are pronounced through the nose.",
            "OU is always 'oo' as in 'food', never 'ow'.",
            "J sounds like the 's' in 'measure', not English 'j'.",
            "R is soft — pronounced at the back of the throat, like French.",
            "Accents (è, ò) mean open vowels — mouth wider open than e, o.",
          ].map((rule) => (
            <p key={rule} className="text-xs text-blue-700">• {rule}</p>
          ))}
        </div>
      </Section>

      {/* ── NUMBERS SECTION ──────────────────────────────────────────── */}
      <Section title="Numbers — Chif" icon="🔢">
        {/* Tabs */}
        <div className="flex gap-1.5 mb-4">
          {[
            { id: "basic", label: "1–20" },
            { id: "big",   label: "30–Trilyon" },
            { id: "tips",  label: "💡 Build numbers" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setNumberTab(t.id)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition ${
                numberTab === t.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 1–20 */}
        {numberTab === "basic" && (
          <div className="grid grid-cols-2 gap-2">
            {NUMBERS_BASIC.map((n) => (
              <button
                key={n.english}
                onClick={() => speak(n.creole)}
                className="flex items-center justify-between bg-gray-50 hover:bg-blue-50 rounded-xl px-3 py-2.5 text-left transition group border border-transparent hover:border-blue-200"
              >
                <div>
                  <p className="font-bold text-gray-900 text-sm">{n.creole}</p>
                  <p className="text-xs text-gray-400 italic">/{n.pronunciation}/</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600 text-lg">{n.english}</p>
                  <Volume2 size={12} className="text-gray-300 group-hover:text-blue-400 ml-auto transition" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 30–Trilyon */}
        {numberTab === "big" && (
          <div className="space-y-2">
            {NUMBERS_BIG.map((n) => (
              <button
                key={n.english}
                onClick={() => speak(n.creole)}
                className="w-full flex items-center justify-between bg-gray-50 hover:bg-purple-50 rounded-xl px-4 py-3 text-left transition group border border-transparent hover:border-purple-200"
              >
                <div>
                  <p className="font-bold text-gray-900 text-sm">{n.creole}</p>
                  <p className="text-xs text-gray-400 italic">/{n.pronunciation}/</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600 text-sm tabular-nums">{n.english}</p>
                  <Volume2 size={12} className="text-gray-300 group-hover:text-purple-400 ml-auto transition" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Build numbers tips */}
        {numberTab === "tips" && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Haitian Creole builds numbers left to right, largest unit first — just like English.
            </p>
            {NUMBER_TIPS.map((item) => (
              <div key={item.tip} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100">
                <button
                  onClick={() => speak(item.tip)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <Volume2 size={14} className="text-blue-400 flex-shrink-0" />
                  <p className="font-bold text-blue-800 text-sm">{item.tip}</p>
                </button>
                <p className="text-xs text-gray-500 mt-1 ml-6">{item.note}</p>
              </div>
            ))}

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-700 mb-3">Examples — tap to hear:</p>
              <div className="space-y-2">
                {[
                  { n: "47",              c: "Karant-sèt" },
                  { n: "125",             c: "San ven-senk" },
                  { n: "1,999",           c: "Mil nèf san katrevan-disnèf" },
                  { n: "3,500,000",       c: "Twa milyon senk san mil" },
                  { n: "1,000,000,000",   c: "Yon milya" },
                ].map((ex) => (
                  <button
                    key={ex.n}
                    onClick={() => speak(ex.c)}
                    className="w-full flex items-center justify-between hover:bg-white rounded-lg px-2 py-1.5 transition group"
                  >
                    <span className="font-bold text-purple-700 text-sm tabular-nums w-28 text-left">{ex.n}</span>
                    <span className="text-gray-600 text-xs flex-1 text-left">{ex.c}</span>
                    <Volume2 size={12} className="text-gray-300 group-hover:text-purple-400 flex-shrink-0 transition" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Section>

    </div>
  );
}