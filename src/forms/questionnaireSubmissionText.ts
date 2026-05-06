import type { FormDefinition, FormStep } from './types';

type FormAnswer = string | string[];
type AnswersMap = Record<string, FormAnswer | undefined>;

const isEmpty = (value: FormAnswer | undefined): boolean => {
  if (value === undefined || value === null) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  return false;
};

const answerLabelsForStep = (step: FormStep, raw: FormAnswer): string => {
  switch (step.type) {
    case 'single': {
      const opt = step.options.find((o) => o.value === raw);
      return opt?.label ?? String(raw);
    }
    case 'multi': {
      const vals = Array.isArray(raw) ? raw : [];
      return vals.map((v) => step.options.find((o) => o.value === v)?.label ?? v).join(', ');
    }
    default:
      return String(raw);
  }
};

export const buildHebrewQuestionnaireText = (form: FormDefinition, answers: AnswersMap): string => {
  const blocks: string[] = [`שאלון: ${form.title}`];

  for (const step of form.steps) {
    const raw = answers[step.id];
    if (isEmpty(raw)) {
      continue;
    }

    const answerText = answerLabelsForStep(step, raw as FormAnswer);
    const desc = step.description?.trim();
    const questionBlock = desc
      ? `שאלה: ${step.title}\n${desc}\nתשובה: ${answerText}`
      : `שאלה: ${step.title}\nתשובה: ${answerText}`;
    blocks.push(questionBlock);
  }

  return blocks.join('\n\n');
};
