export type SearchParamValue = string | string[] | undefined;

const AUTH_ENTRYPOINTS = ['/auth/signin', '/auth/signin/google'];

export function firstParamValue(value: SearchParamValue): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

export function getSafeCallbackUrl(rawCallbackUrl: string | null | undefined): string {
  const callbackUrl = (rawCallbackUrl ?? '').trim();
  if (!callbackUrl) {
    return '/';
  }

  if (callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
    return callbackUrl;
  }

  return '/';
}

export function resolveSignedInRedirect(rawCallbackUrl: string | null | undefined): string {
  const callbackUrl = getSafeCallbackUrl(rawCallbackUrl);

  const pointsToAuthEntrypoint = AUTH_ENTRYPOINTS.some(
    (entrypoint) => callbackUrl === entrypoint || callbackUrl.startsWith(`${entrypoint}?`),
  );

  if (pointsToAuthEntrypoint) {
    return '/';
  }

  return callbackUrl;
}

export function buildSignInPath(rawCallbackUrl: string | null | undefined): string {
  const callbackUrl = getSafeCallbackUrl(rawCallbackUrl);
  return `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}
