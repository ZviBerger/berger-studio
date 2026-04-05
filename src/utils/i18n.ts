export type Locale = 'he' | 'en';

export function getLocaleFromPath(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'he';
}

export function stripLocalePrefix(pathname: string): string {
  if (pathname === '/en') {
    return '/';
  }

  if (pathname.startsWith('/en/')) {
    return pathname.slice(3);
  }

  return pathname || '/';
}

export function withLocale(pathname: string, locale: Locale): string {
  const strippedPath = stripLocalePrefix(pathname);

  if (locale === 'en') {
    return strippedPath === '/' ? '/en' : `/en${strippedPath}`;
  }

  return strippedPath;
}
