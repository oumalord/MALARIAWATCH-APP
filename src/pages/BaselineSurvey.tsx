import { useState, type FormEvent } from 'react';
import { Check, ChevronLeft, ChevronRight, LogOut, ShieldCheck } from 'lucide-react';
import type { SessionUser } from '../App';
import { useLiveData } from '../lib/liveData';
import { createFieldSubmission } from '../lib/api';

type Question = {
  id: string;
  text: string;
  type?: 'text' | 'number' | 'textarea' | 'choice' | 'multi' | 'scale';
  options?: string[];
  hint?: string;
};

type Section = { id: string; title: string; description: string; questions: Question[] };

const SUBCOUNTIES = ['Nyando', 'Seme', 'Muhoroni', 'Nyakach'];
const SECTIONS: Section[] = [
  {
    id: 'A', title: 'Household Identification & Demographics', description: 'Record the household and respondent details exactly as provided.', questions: [
      { id: 'A1', text: 'What is the household ID?', hint: 'Examples: Nyando1, Seme1, Muhoroni1', type: 'text' },
      { id: 'A2', text: 'Which subcounty is this household in?', type: 'choice', options: SUBCOUNTIES },
      { id: 'A3', text: "What is the respondent's sex?", type: 'choice', options: ['Male', 'Female', 'Other'] },
      { id: 'A4', text: "What is the respondent's age?", type: 'number' },
      { id: 'A5', text: "What is the respondent's role in the household?", type: 'choice', options: ['Head', 'Spouse', 'Other adult member'] },
      { id: 'A6', text: 'How many people live in this household?', type: 'number' },
      { id: 'A7', text: 'How many children under 5 live in this household?', type: 'number' },
      { id: 'A8', text: 'Are there any pregnant women currently in this household?', type: 'choice', options: ['Yes', 'No'], hint: 'If yes, record how many in the notes.' },
      { id: 'A9', text: "What is the household's primary livelihood?", type: 'choice', options: ['Smallholder farming', 'Casual labor', 'Trading', 'Other'] },
      { id: 'A10', text: 'Is this household expected to participate directly in MalariaWatch training?', type: 'choice', options: ['Yes', 'No', 'Not yet decided'] },
      { id: 'A11', text: 'How long does it take to reach the nearest health facility?', hint: 'Record minutes/hours and mode of transport.', type: 'text' },
    ],
  },
  {
    id: 'B', title: 'Malaria Knowledge, Attitudes & Practices', description: 'Ask each question exactly as written. Do not read the indicator being measured.', questions: [
      { id: 'B1', text: 'Can you tell me one way malaria is spread from person to person?', type: 'textarea' },
      { id: 'B2', text: 'Do you think weather conditions like rainfall or flooding affect the risk of malaria in your area?', type: 'choice', options: ['Yes', 'No', 'Not sure'] },
      { id: 'B3', text: 'In the past 12 months, has anyone in this household had malaria? If yes, how many episodes?', type: 'text' },
      { id: 'B4', text: 'In the past 12 months, has any child under 5 or pregnant woman here had malaria?', type: 'choice', options: ['Yes', 'No', 'Not applicable'] },
      { id: 'B5', text: 'The last time someone in the household was sick with malaria, where did they first seek treatment?', type: 'choice', options: ['Health facility', 'Home remedies only', 'Traditional healer', 'Did not seek treatment'] },
      { id: 'B6', text: 'On a scale of 1 (no control) to 5 (full control), how much control do you feel your household has over preventing malaria?', type: 'scale', options: ['1', '2', '3', '4', '5'] },
      { id: 'B7', text: 'Do you see malaria mainly as a health issue, a climate/environmental issue, or both?', type: 'choice', options: ['Health only', 'Climate only', 'Both', 'Not sure'] },
    ],
  },
  {
    id: 'C', title: 'Vector Control & Prevention Practices', description: 'For select-all questions, read the full list before recording answers.', questions: [
      { id: 'C1', text: 'Does everyone in this household sleep under an insecticide-treated bed net?', type: 'choice', options: ['All', 'Some', 'No one'] },
      { id: 'C2', text: 'Which of the following practices does this household currently use?', type: 'multi', options: ['Clearing stagnant water', 'Growing mosquito-repellent plants', 'Eco-friendly larvicides', 'Community clean-up campaigns', 'Screening doors and windows', 'None'] },
      { id: 'C3', text: 'Are any mosquito-repellent plants (e.g., Lippia javanica, Tagetes minuta, Ocimum kilimandscharicum, basil) currently growing on this land?', type: 'choice', options: ['Yes', 'No'], hint: 'If yes, record which species in the notes.' },
      { id: 'C4', text: 'If growing these plants, did you learn this from family/tradition, or from an outside program or training?', type: 'choice', options: ['Traditional knowledge', 'Recently learned', 'Both', 'Not applicable'] },
      { id: 'C5', text: 'Enumerator: Count Yes answers in C2. How many distinct ecological mosquito-control practices does the household currently use?', type: 'number' },
    ],
  },
  {
    id: 'D', title: 'Climate-Smart Agriculture Adoption', description: 'Ask about current practices, not practices the household plans to adopt.', questions: [
      { id: 'D1', text: 'Which of the following farming practices does this household currently use?', type: 'multi', options: ['Reduced tillage', 'Cover cropping', 'Agroforestry or tree planting', 'Water harvesting or infiltration measures', 'Crop diversification', 'None'] },
      { id: 'D2', text: 'Has this household experienced flooding or crop loss from extreme weather in the past 2 years?', type: 'choice', options: ['Yes', 'No'], hint: 'If yes, record the estimated loss in the notes.' },
      { id: 'D3', text: 'Does the household currently receive any weather or climate information to guide farming or health decisions?', type: 'choice', options: ['Yes', 'No'], hint: 'If yes, record the source in the notes.' },
      { id: 'D4', text: 'If yes, how is this information received?', type: 'multi', options: ['Radio', 'SMS', 'Community forum', 'Word of mouth', 'Other'] },
      { id: 'D5', text: 'How much do you trust the accuracy of the weather information you currently receive?', type: 'scale', options: ['1 - Not at all', '2', '3', '4', '5 - Fully trust'] },
    ],
  },
  {
    id: 'E', title: 'Early Warning & Response', description: 'Record the respondent’s own experience with warnings and response.', questions: [
      { id: 'E1', text: 'Has this household ever received an alert or warning about flood or malaria outbreak risk?', type: 'choice', options: ['Yes', 'No'] },
      { id: 'E2', text: 'If yes, what action did the household take in response?', type: 'textarea' },
      { id: 'E3', text: 'How long after receiving the warning did the household act?', type: 'choice', options: ['Same day', '1–2 days', '3+ days', 'Did not act', 'Not applicable'] },
      { id: 'E4', text: 'Do you know anyone in your community who monitors weather or health data (e.g., a Climate Health Monitor or CHV)?', type: 'choice', options: ['Yes', 'No', "Don't know"] },
    ],
  },
  {
    id: 'F', title: "Youth & Women's Engagement", description: 'Ask the question when the condition applies; otherwise select Not applicable.', questions: [
      { id: 'F1', text: 'If respondent is 18–29: Are you currently involved in any income-generating activity related to farming, plants, or health monitoring?', type: 'choice', options: ['Yes', 'No', 'Not applicable'], hint: 'If yes, describe the activity in the notes.' },
      { id: 'F2', text: 'If respondent is female: Has malaria or climate-related stress increased your caregiving workload in the past year?', type: 'choice', options: ['Yes', 'No', 'Somewhat', 'Not applicable'] },
      { id: 'F3', text: 'Are you aware of any local group or committee where community members can raise concerns about health or climate issues?', type: 'choice', options: ['Yes', 'No'] },
      { id: 'F4', text: 'Have you personally attended a community forum (baraza) or similar meeting on health, climate, or agriculture in the past year?', type: 'text', hint: 'Record Yes and number of times, or No.' },
    ],
  },
  {
    id: 'G', title: 'Governance & Data Feedback', description: 'Ask about influence and awareness of community-informed decisions.', questions: [
      { id: 'G1', text: 'On a scale of 1 (no influence) to 5 (strong influence), how much influence do you feel community members like you have over local decisions on health or agriculture?', type: 'scale', options: ['1', '2', '3', '4', '5'] },
      { id: 'G2', text: 'Are you aware of any recent local policy, bylaw, or plan that reflects community input on health or climate issues?', type: 'choice', options: ['Yes', 'No', 'Not sure'], hint: 'If yes, describe it in the notes.' },
    ],
  },
  {
    id: 'H', title: 'Economic Indicators', description: 'Record the household’s best estimate and the unit used.', questions: [
      { id: 'H1', text: "What is the household's estimated monthly income from farming activities?", type: 'choice', options: ['Below KES 5,000', 'KES 5,000–9,999', 'KES 10,000–19,999', 'KES 20,000–49,999', 'KES 50,000 or more', 'Prefer not to say'] },
      { id: 'H2', text: 'Has any household member earned income from selling plant-based products (oils, teas, repellents) in the past year?', type: 'text', hint: 'Record Yes and amount, or No.' },
      { id: 'H3', text: 'What was the household’s yield for its primary crop last season?', type: 'text', hint: 'Record quantity and unit, for example 8 bags or 450 kg.' },
    ],
  },
  {
    id: 'I', title: 'Health Facility Cross-Check', description: 'This section is administered separately to facility staff, not households.', questions: [
      { id: 'I1', text: 'How many confirmed malaria cases were recorded at this facility in the past 12 months, broken down by under-5, pregnant women, and general population?', type: 'textarea' },
      { id: 'I2', text: 'How does this compare to the previous year, and is there any known explanation for the trend?', type: 'textarea', hint: 'Record Increase, Decrease, or Stable plus the open explanation.' },
    ],
  },
];

export default function BaselineSurvey({ user, onSignOut }: { user: SessionUser; onSignOut: () => void }) {
  const { counties } = useLiveData();
  const [started, setStarted] = useState(false);
  const [consent, setConsent] = useState('');
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const section = SECTIONS[sectionIndex];

  function updateAnswer(id: string, value: string | string[]) {
    setAnswers((current) => ({ ...current, [id]: value }));
  }

  function toggleMulti(id: string, option: string) {
    const current = Array.isArray(answers[id]) ? answers[id] as string[] : [];
    const next = current.includes(option) ? current.filter((item) => item !== option) : [...current, option];
    updateAnswer(id, next);
  }

  function nextSection(event?: FormEvent) {
    event?.preventDefault();
    if (sectionIndex < SECTIONS.length - 1) {
      setSectionIndex((current) => current + 1);
      return;
    }
    const county = counties.find((c) => c.name === user.county) ?? counties[0];
    if (county) {
      void createFieldSubmission({
        id: `SUB-${Date.now()}`,
        formType: 'Baseline Survey',
        enumeratorName: user.name,
        countyId: county.id,
        payload: { subcounty: answers.A2 ?? null, answers, notes },
      }).catch(() => undefined);
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#F6F7F4] px-4 py-8 text-[#14201A] sm:px-8">
        <SurveyHeader user={user} onSignOut={onSignOut} />
        <section className="mx-auto mt-8 max-w-2xl rounded-2xl border border-[#D7E8DC] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E3F3EB] text-[#0E7C5A]"><Check size={28} /></div>
          <h1 className="mt-5 font-display text-2xl font-bold">Baseline survey saved</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#55665C]">Thank you very much for your time and honesty. This information will help us design activities that are useful for your household and community.</p>
          <p className="mt-5 text-xs text-[#55665C]">The record is ready to sync when a connection is available. Contact info.pivotyouthcircle@gmail.com with questions.</p>
          <button type="button" onClick={() => { setSubmitted(false); setStarted(false); setConsent(''); setSectionIndex(0); setAnswers({}); setNotes(''); }} className="mt-7 rounded-lg bg-[#0E7C5A] px-5 py-3 text-sm font-bold text-white hover:bg-[#0A684B]">Start another baseline</button>
        </section>
      </main>
    );
  }

  if (!started) {
    return (
      <main className="min-h-screen bg-[#F6F7F4] px-4 py-5 text-[#14201A] sm:px-8">
        <SurveyHeader user={user} onSignOut={onSignOut} />
        <section className="mx-auto mt-6 max-w-3xl rounded-2xl border border-[#E2E6DE] bg-white p-4 shadow-sm sm:p-8">
          <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3F3EB] text-[#0E7C5A]"><ShieldCheck size={21} /></div><div><p className="text-xs font-bold uppercase tracking-[0.08em] text-[#0A5A41]">Before you begin</p><h1 className="mt-1 font-display text-2xl font-bold">Baseline household survey</h1></div></div>
          <div className="mt-5 space-y-4 text-[13px] leading-6 text-[#3D4D44] sm:text-sm">
            <p><strong>Purpose:</strong> Establish pre-intervention values for every indicator in the project’s Outcomes framework, so the same questions at endline can isolate project change.</p>
            <p><strong>Sample:</strong> Random and representative households across Nyando, Seme, Muhoroni, and Nyakach, with youth and women-headed households proportionally represented.</p>
            <div className="rounded-xl border border-[#F0DFC0] bg-[#FFF9ED] p-4"><strong>Enumerator rule:</strong> Ask every question exactly as written, in the same order, at both baseline and endline. Do not paraphrase or lead the respondent.</div>
            <div><h2 className="font-display text-base font-bold">How to start the interview</h2><ol className="mt-2 list-decimal space-y-1 pl-5"><li>Approach the household head or most senior adult and greet them in Dholuo or Kiswahili.</li><li>Confirm the household ID and GPS point before beginning.</li><li>Read the consent script below word-for-word.</li><li>Wait for a clear verbal “yes”. If consent is declined, record Declined and move to the replacement household.</li><li>Do not read the Indicator Measured column to respondents.</li></ol></div>
            <div className="rounded-xl border border-[#DCE8DF] bg-[#F5FAF6] p-4"><h2 className="font-display text-base font-bold">Consent script</h2><p className="mt-2 italic">“Good morning/afternoon. My name is ___ and I am part of the MalariaWatch team working in [subcounty name]. We are carrying out a short survey to understand how malaria, weather, and farming affect households here, before we begin project activities in your community. The interview will take about 20–30 minutes. There are no right or wrong answers; we want to know your household’s actual situation. Your answers will be kept confidential and only used to help design and later evaluate the project. Sharing this information will not affect your eligibility for any project activities, and you may skip any question or stop the interview at any time without any consequence. We would like to speak with you again in a similar interview after the project activities, using the same questions, so we can see what has changed. Do you agree to take part in this interview?”</p></div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><label className="flex items-start gap-2 text-sm font-semibold"><input type="checkbox" checked={consent === 'yes'} onChange={(event) => setConsent(event.target.checked ? 'yes' : '')} className="mt-0.5 h-4 w-4 shrink-0 accent-[#0E7C5A]" /> <span>Respondent gave clear verbal consent</span></label><button type="button" disabled={consent !== 'yes'} onClick={() => setStarted(true)} className="w-full rounded-lg bg-[#0E7C5A] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">BEGIN Section A <ChevronRight size={16} className="ml-1 inline" /></button></div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F7F4] px-4 py-5 text-[#14201A] sm:px-8">
      <SurveyHeader user={user} onSignOut={onSignOut} />
      <div className="mx-auto mt-5 max-w-5xl"><div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#0A5A41]">Baseline · Section {section.id}/{SECTIONS.length}</p><h1 className="mt-1 font-display text-xl font-bold sm:text-2xl">{section.title}</h1><p className="mt-1 text-[13px] text-[#55665C]">{section.description}</p></div><span className="hidden rounded-full bg-[#E3F3EB] px-3 py-1.5 text-xs font-bold text-[#0A5A41] sm:block">{Math.round(((sectionIndex + 1) / SECTIONS.length) * 100)}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#DCE8DF]"><div className="h-full rounded-full bg-[#0E7C5A] transition-all" style={{ width: `${((sectionIndex + 1) / SECTIONS.length) * 100}%` }} /></div>
        <form onSubmit={nextSection} className="mt-4 rounded-2xl border border-[#E2E6DE] bg-white p-3 shadow-sm sm:mt-5 sm:p-7"><div className="grid gap-3 sm:gap-6 md:grid-cols-2">{section.questions.map((question) => <QuestionField key={question.id} question={question} value={answers[question.id]} onChange={updateAnswer} onToggle={toggleMulti} />)}</div><label className="mt-5 block border-t border-[#E2E6DE] pt-4 text-sm font-semibold text-[#3D4D44] sm:mt-7 sm:pt-5">Enumerator notes / follow-up details<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Record conditional details, amounts, species, explanations, or other observations..." className="mt-2 w-full rounded-lg border border-[#DCE2DB] p-3 text-sm font-normal outline-none focus:border-[#0E7C5A]" /></label><div className="mt-5 flex items-center justify-between gap-2 border-t border-[#E2E6DE] pt-4 sm:mt-7 sm:pt-5"><button type="button" disabled={sectionIndex === 0} onClick={() => setSectionIndex((current) => current - 1)} className="inline-flex items-center gap-1 rounded-lg border border-[#DCE2DB] px-3 py-2.5 text-xs font-bold text-[#55665C] disabled:invisible sm:px-4 sm:text-sm"><ChevronLeft size={16} /> Back</button><button type="submit" className="inline-flex items-center gap-1 rounded-lg bg-[#0E7C5A] px-3 py-2.5 text-xs font-bold text-white hover:bg-[#0A684B] sm:px-5 sm:text-sm">{sectionIndex === SECTIONS.length - 1 ? 'Save survey' : `Next: Section ${SECTIONS[sectionIndex + 1].id}`} <ChevronRight size={16} /></button></div></form>
      </div>
    </main>
  );
}

function SurveyHeader({ user, onSignOut }: { user: SessionUser; onSignOut: () => void }) {
  return <header className="mx-auto flex max-w-5xl items-center justify-between border-b border-[#E2E6DE] pb-4"><div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E7C5A] text-sm font-bold text-white">M</div><div><p className="font-display text-[15px] font-bold leading-tight">MalariaWatch</p><p className="text-[11px] text-[#55665C]">{user.organisation} · Field Enumerator</p></div></div><button type="button" onClick={onSignOut} className="inline-flex items-center gap-2 rounded-lg border border-[#DCE2DB] px-3 py-2 text-xs font-bold text-[#55665C] hover:bg-white"><LogOut size={14} /> Log out</button></header>;
}

function QuestionField({ question, value, onChange, onToggle }: { question: Question; value?: string | string[]; onChange: (id: string, value: string) => void; onToggle: (id: string, option: string) => void }) {
  const selected = Array.isArray(value) ? value : [];
  return <div className="rounded-xl border border-[#E2E6DE] p-4"><label className="block text-sm font-bold text-[#14201A]"><span className="text-[#0E7C5A]">{question.id}</span> {question.text}</label>{question.hint && <p className="mt-1 text-xs leading-5 text-[#7A877F]">{question.hint}</p>}{question.type === 'choice' || question.type === 'scale' ? <div className="mt-3 flex flex-wrap gap-2">{question.options?.map((option) => <button key={option} type="button" onClick={() => onChange(question.id, option)} className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${value === option ? 'border-[#0E7C5A] bg-[#E3F3EB] text-[#0A5A41]' : 'border-[#DCE2DB] text-[#55665C] hover:border-[#9BC9AE]'}`}>{option}</button>)}</div> : question.type === 'multi' ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{question.options?.map((option) => <label key={option} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${selected.includes(option) ? 'border-[#0E7C5A] bg-[#E3F3EB] text-[#0A5A41]' : 'border-[#DCE2DB] text-[#55665C]'}`}><input type="checkbox" checked={selected.includes(option)} onChange={() => onToggle(question.id, option)} className="accent-[#0E7C5A]" />{option}</label>)}</div> : question.type === 'textarea' ? <textarea value={typeof value === 'string' ? value : ''} onChange={(event) => onChange(question.id, event.target.value)} rows={3} className="mt-3 w-full rounded-lg border border-[#DCE2DB] p-3 text-sm font-normal outline-none focus:border-[#0E7C5A]" /> : <input type={question.type === 'number' ? 'number' : 'text'} value={typeof value === 'string' ? value : ''} onChange={(event) => onChange(question.id, event.target.value)} className="mt-3 w-full rounded-lg border border-[#DCE2DB] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#0E7C5A]" />}</div>;
}