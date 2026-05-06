import { intakeHeForm } from './intake-he';
import type { FormDefinition } from './types';

const forms: FormDefinition[] = [intakeHeForm];

export const formSlugs = forms.map((form) => form.slug);

export const getFormBySlug = (slug: string): FormDefinition | undefined =>
  forms.find((form) => form.slug === slug);
