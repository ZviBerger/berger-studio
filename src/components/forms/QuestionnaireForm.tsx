import { useEffect, useMemo, useRef, useState } from 'react';
import {
  questionnaireHostProfileByLocale,
  QUESTIONNAIRE_WELCOME_STEP_ID,
} from '../../forms/brand';
import { FORMSPREE_QUESTIONNAIRE_ACTION } from '../../forms/formspree';
import { buildHebrewQuestionnaireText } from '../../forms/questionnaireSubmissionText';
import type { FormDefinition, FormStep } from '../../forms/types';

const FADE_MS = 200;

type FormProps = {
  form: FormDefinition;
  locale?: 'he' | 'en';
};

type FormAnswer = string | string[];
type AnswersMap = Record<string, FormAnswer | undefined>;

const isVisible = (step: FormStep, answers: AnswersMap): boolean => {
  if (!step.showWhen) {
    return true;
  }

  const current = answers[step.showWhen.fieldId];
  if (!current) {
    return false;
  }

  if (step.showWhen.equals) {
    return current === step.showWhen.equals;
  }

  if (step.showWhen.includes) {
    return Array.isArray(current) && current.includes(step.showWhen.includes);
  }

  return true;
};

const isAnswered = (step: FormStep, value: FormAnswer | undefined): boolean => {
  if (!step.required) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return typeof value === 'string' && value.trim().length > 0;
};

const QuestionnaireForm = ({ form, locale = 'he' }: FormProps) => {
  const hostProfile = questionnaireHostProfileByLocale[locale];
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [index, setIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [transitioningStepId, setTransitioningStepId] = useState('');
  const [displayedStep, setDisplayedStep] = useState<FormStep | null>(null);
  const [contentOpacity, setContentOpacity] = useState(1);
  const displayedIdRef = useRef<string | null>(null);

  const visibleSteps = useMemo(
    () => form.steps.filter((step) => isVisible(step, answers)),
    [answers, form.steps],
  );

  const safeIndex = Math.min(index, Math.max(visibleSteps.length - 1, 0));
  const currentStep = visibleSteps[safeIndex];
  const currentAnswer = currentStep ? answers[currentStep.id] : undefined;
  const shownStep = displayedStep ?? currentStep;
  const shownAnswer = shownStep ? answers[shownStep.id] : undefined;
  const progress = visibleSteps.length > 0 ? Math.round(((safeIndex + 1) / visibleSteps.length) * 100) : 0;
  const navLocked =
    !!currentStep && !!displayedStep && displayedStep.id !== currentStep.id;

  useEffect(() => {
    if (!currentStep) {
      return;
    }

    if (displayedIdRef.current === null) {
      displayedIdRef.current = currentStep.id;
      setDisplayedStep(currentStep);
      return;
    }

    if (displayedIdRef.current === currentStep.id) {
      return;
    }

    const instant =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (instant) {
      displayedIdRef.current = currentStep.id;
      setDisplayedStep(currentStep);
      setContentOpacity(1);
      return;
    }

    setContentOpacity(0);
    const t = window.setTimeout(() => {
      displayedIdRef.current = currentStep.id;
      setDisplayedStep(currentStep);
    }, FADE_MS);
    return () => window.clearTimeout(t);
  }, [currentStep]);

  useEffect(() => {
    if (!currentStep || !displayedStep || displayedStep.id !== currentStep.id) {
      return;
    }
    const id = requestAnimationFrame(() => setContentOpacity(1));
    return () => cancelAnimationFrame(id);
  }, [currentStep, displayedStep]);

  const setTextValue = (stepId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [stepId]: value }));
    setError('');
  };

  const toggleMulti = (stepId: string, value: string) => {
    setAnswers((prev) => {
      const current = prev[stepId];
      const nextValues = Array.isArray(current) ? current : [];
      const exists = nextValues.includes(value);
      const updated = exists ? nextValues.filter((item) => item !== value) : [...nextValues, value];
      return { ...prev, [stepId]: updated };
    });
    setError('');
  };

  const goNext = () => {
    if (!currentStep) {
      return;
    }

    if (!isAnswered(currentStep, currentAnswer)) {
      setError('השדה הזה חובה כדי להמשיך');
      return;
    }

    setError('');
    setIndex((prev) => Math.min(prev + 1, visibleSteps.length - 1));
  };

  const goBack = () => {
    setError('');
    setIndex((prev) => Math.max(prev - 1, 0));
  };

  const submitAnswers = async (answersToSubmit: AnswersMap = answers) => {
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(FORMSPREE_QUESTIONNAIRE_ACTION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `שאלון עלמא: ${form.title} (${form.slug})`,
          form_slug: form.slug,
          submitted_at: new Date().toISOString(),
          questionnaire_hebrew: buildHebrewQuestionnaireText(form, answersToSubmit),
        }),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      setIsSubmitted(true);
    } catch {
      setError('השליחה נכשלה, נסו שוב בעוד רגע.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectSingleAndAdvance = (stepId: string, value: string) => {
    if (isSubmitting || transitioningStepId === stepId) {
      return;
    }

    const isLastStep = safeIndex === visibleSteps.length - 1;
    const nextAnswers = { ...answers, [stepId]: value };

    setAnswers(nextAnswers);
    setError('');
    setTransitioningStepId(stepId);

    window.setTimeout(() => {
      if (isLastStep) {
        void submitAnswers(nextAnswers);
      } else {
        setIndex((prev) => Math.min(prev + 1, visibleSteps.length - 1));
      }
      setTransitioningStepId('');
    }, 160);
  };

  const submit = async () => {
    if (!currentStep) {
      return;
    }

    if (!isAnswered(currentStep, currentAnswer)) {
      setError('השדה הזה חובה כדי להמשיך');
      return;
    }

    await submitAnswers();
  };

  if (isSubmitted) {
    return (
      <div className="mx-auto max-w-3xl border border-black/10 bg-white p-8 text-center md:p-12">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-stone-500">Alma</p>
        <h1 className="mb-4 text-3xl font-light text-black md:text-4xl">{form.successTitle}</h1>
        <p className="text-lg text-stone-600">{form.successMessage}</p>
      </div>
    );
  }

  if (!currentStep || !shownStep) {
    return null;
  }

  const isLastStep = safeIndex === visibleSteps.length - 1;

  return (
    <section className="mx-auto max-w-3xl">
      <article className="border border-black/10 bg-white p-6 md:p-10">
        <div className="mb-10 space-y-3 md:mb-12">
          <div
            className="flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.22em] text-stone-500"
            dir="rtl"
          >
            <p className="m-0">
              שאלה {safeIndex + 1} מתוך {visibleSteps.length}
            </p>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-200" dir="rtl">
            <div
              className="h-full rounded-full bg-black transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div
          className={`transition-opacity duration-200 ease-out motion-reduce:transition-none ${
            contentOpacity === 1 ? 'opacity-100' : 'opacity-0'
          } ${navLocked ? 'pointer-events-none' : ''}`}
        >
          <h2
            className={`text-2xl font-light text-black md:text-4xl ${shownStep.description ? 'mb-3' : ''}`}
          >
            {shownStep.title}
          </h2>
          {shownStep.description ? (
            <p className="text-lg text-stone-600">{shownStep.description}</p>
          ) : null}

          {shownStep.id === QUESTIONNAIRE_WELCOME_STEP_ID ? (
            <div
              className={`mt-8 flex flex-col gap-6 border-t border-black/10 pt-8 md:mt-10 md:flex-row md:items-start md:gap-10 md:pt-10 ${locale === 'en' ? 'text-left' : 'text-right'}`}
              dir={locale === 'en' ? 'ltr' : 'rtl'}
            >
              <div
                className={`aspect-[4/5] w-full max-w-[220px] shrink-0 overflow-hidden bg-stone-100 ${locale === 'en' ? 'ms-auto md:ms-0' : 'me-auto md:me-0'}`}
              >
                <img
                  src={hostProfile.imageSrc}
                  alt={hostProfile.imageAlt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">
                  {hostProfile.role}
                </p>
                <p className="text-xl font-medium text-black md:text-2xl">{hostProfile.name}</p>
                <p className="text-base leading-relaxed text-stone-700 md:text-lg">{hostProfile.bio}</p>
              </div>
            </div>
          ) : null}

          {shownStep.type === 'single' ? (
            <div className="mt-10 space-y-3 md:mt-12">
              {shownStep.options.map((option) => {
                const selected = shownAnswer === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => selectSingleAndAdvance(shownStep.id, option.value)}
                    disabled={navLocked || isSubmitting || transitioningStepId === shownStep.id}
                    className={`w-full rounded-2xl border px-5 py-4 text-right text-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      selected
                        ? 'border-black bg-black text-white'
                        : 'border-black/15 bg-white text-black hover:border-black/30'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          {shownStep.type === 'multi' ? (
            <div className="mt-10 space-y-3 md:mt-12">
              {shownStep.options.map((option) => {
                const selected = Array.isArray(shownAnswer) && shownAnswer.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleMulti(shownStep.id, option.value)}
                    disabled={navLocked || isSubmitting}
                    className={`w-full rounded-2xl border px-5 py-4 text-right text-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      selected
                        ? 'border-black bg-black text-white'
                        : 'border-black/15 bg-white text-black hover:border-black/30'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          {shownStep.type === 'text' || shownStep.type === 'number' ? (
            <input
              type={shownStep.type === 'number' ? 'number' : 'text'}
              value={typeof shownAnswer === 'string' ? shownAnswer : ''}
              onChange={(event) => setTextValue(shownStep.id, event.target.value)}
              placeholder={shownStep.placeholder}
              disabled={navLocked || isSubmitting}
              className="mt-10 w-full rounded-2xl border border-black/15 px-5 py-4 text-lg focus:border-black focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:mt-12"
            />
          ) : null}

          {shownStep.type === 'longText' ? (
            <textarea
              value={typeof shownAnswer === 'string' ? shownAnswer : ''}
              onChange={(event) => setTextValue(shownStep.id, event.target.value)}
              placeholder={shownStep.placeholder}
              rows={5}
              disabled={navLocked || isSubmitting}
              className="mt-10 w-full rounded-2xl border border-black/15 px-5 py-4 text-lg focus:border-black focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:mt-12"
            />
          ) : null}

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={safeIndex === 0 || isSubmitting || navLocked}
              className="rounded-full border border-black/20 px-6 py-3 text-sm uppercase tracking-[0.18em] text-black disabled:cursor-not-allowed disabled:opacity-30"
            >
              חזרה
            </button>
            {shownStep.type !== 'single' ? (
              <button
                type="button"
                onClick={isLastStep ? submit : goNext}
                disabled={isSubmitting || navLocked}
                className="rounded-full bg-black px-7 py-3 text-sm uppercase tracking-[0.18em] text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'שולח...' : isLastStep ? form.submitLabel : 'המשך'}
              </button>
            ) : null}
          </div>
        </div>
      </article>
    </section>
  );
};

export default QuestionnaireForm;
