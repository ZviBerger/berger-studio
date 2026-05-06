export type FormOption = {
  value: string;
  label: string;
};

export type StepBase = {
  id: string;
  title: string;
  required?: boolean;
  description?: string;
  showWhen?: {
    fieldId: string;
    equals?: string;
    includes?: string;
  };
};

export type SingleChoiceStep = StepBase & {
  type: 'single';
  options: FormOption[];
};

export type MultiChoiceStep = StepBase & {
  type: 'multi';
  options: FormOption[];
};

export type TextStep = StepBase & {
  type: 'text';
  placeholder?: string;
};

export type LongTextStep = StepBase & {
  type: 'longText';
  placeholder?: string;
};

export type NumberStep = StepBase & {
  type: 'number';
  placeholder?: string;
};

export type FormStep = SingleChoiceStep | MultiChoiceStep | TextStep | LongTextStep | NumberStep;

export type FormDefinition = {
  slug: string;
  title: string;
  intro: string;
  submitLabel: string;
  successTitle: string;
  successMessage: string;
  steps: FormStep[];
};
