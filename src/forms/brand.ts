import type { FormStep } from './types';

export const QUESTIONNAIRE_WELCOME_STEP_ID = 'alma_chai_intro';

export type QuestionnaireHostProfile = {
  name: string;
  role: string;
  imageSrc: string;
  imageAlt: string;
  bio: string;
};

export const questionnaireHostProfileByLocale: Record<'he' | 'en', QuestionnaireHostProfile> = {
  he: {
    name: 'חני ברגר',
    role: 'הנדסאית אדריכלות',
    imageSrc: '/Chani.jpg',
    imageAlt:
      'דיוקן של חני ברגר, אדריכלית ומעצבת פנים, עומדת בחלל בהיר עם תאורה טבעית.',
    bio:
      'בסטודיו עלמא אני מאמינה שאדריכלות ועיצוב פנים הם דרך לברוא מקום שיש בו שייכות, נוכחות ושקט. אני דוגלת באדריכלות שורשית - מחוברת לחומר, לזמן ולאדם - ומלווה תהליך מדויק ורגיש כדי שהבית ירגיש נכון באמת.',
  },
  en: {
    name: 'Chani Berger',
    role: 'Architectural technologist',
    imageSrc: '/Chani.jpg',
    imageAlt:
      'Portrait of Chani Berger, architect and interior designer, standing in a bright space with natural light.',
    bio:
      'At Alma Studio I believe architecture and interior design are about more than a beautiful space - they shape a sense of belonging, presence, and calm. The process is grounded in honest listening and material truth, so your home feels right in daily life.',
  },
};

const brandIntroSteps: FormStep[] = [
  {
    id: QUESTIONNAIRE_WELCOME_STEP_ID,
    type: 'single',
    title: 'ברוכים הבאים לעלמא',
    description: 'השאלון יעזור לי להכיר אתכם טוב יותר ולהכין פגישה מדויקת.',
    required: true,
    options: [{ value: 'continue', label: 'התחלה' }],
  },
];

export const withBrandIntro = (steps: FormStep[]): FormStep[] => [...brandIntroSteps, ...steps];
