import type { State } from '../simulation';
export type Tutorial = {
  version: 1;
  status: 'active' | 'paused' | 'skipped' | 'completed';
  done: number[];
  baseline: { month: number; cash: number; income: number; expense: number } | null;
  ledgerMonth: number;
};
export const newTutorial = (): Tutorial => ({version:1,status:'active',done:[],baseline:null,ledgerMonth:-1});
export function validTutorial(t: unknown): t is Tutorial {
  if (!t || typeof t !== 'object') return false;
  const v = t as Tutorial;
  return v.version === 1 && ['active','paused','skipped','completed'].includes(v.status) && Array.isArray(v.done)
    && v.done.length <= 5 && v.done.every((n,i)=>n === i+1)
    && Number.isInteger(v.ledgerMonth) && v.ledgerMonth >= -1
    && (v.baseline === null || typeof v.baseline === 'object' && ['month','cash','income','expense'].every(k=>Number.isFinite(v.baseline![k as keyof NonNullable<Tutorial['baseline']>])) && Number.isInteger(v.baseline.month) && v.baseline.month >= 0);
}
/** Only reads gameplay evidence; never grants salary, time, relationships or care. */
export function reconcileTutorial(input: State): State {
  if (!input.story || !input.world || !input.tutorial || input.tutorial.status !== 'active' || input.dead) return input;
  const t = structuredClone(input.tutorial), st = input.story, w = input.world;
  while (t.done.length < 5) {
    const step = t.done.length + 1;
    if (step === 4 && !t.baseline) t.baseline = {month:input.month,cash:input.cash,income:input.income,expense:input.expense};
    const met = step === 1 ? w.visits.includes(5)
      : step === 2 ? w.paid > 0
      : step === 3 ? st.contacts.some(id => id === 10 || id === 11)
      : step === 4 ? !!t.baseline && input.month > t.baseline.month && t.ledgerMonth > t.baseline.month
      : !!st.episode?.plan && ['active','completed'].includes(st.episode.status) || st.completedEpisodes.length > 0;
    if (!met) break;
    t.done.push(step);
  }
  if (t.done.length === 5) t.status = 'completed';
  return JSON.stringify(t) === JSON.stringify(input.tutorial) ? input : {...input,tutorial:t};
}
