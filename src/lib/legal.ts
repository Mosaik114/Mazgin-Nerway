function readEnvValue(key: string, fallback: string): string {
  const value = process.env[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : fallback;
}

function hasEnvValue(key: string): boolean {
  const value = process.env[key];
  return typeof value === 'string' && value.trim().length > 0;
}

export const LEGAL_CONTACT = {
  name: readEnvValue('LEGAL_NAME', 'Mizgin Nerway'),
  street: readEnvValue('LEGAL_STREET', '[Straße und Hausnummer]'),
  postalCode: readEnvValue('LEGAL_POSTAL_CODE', '[PLZ]'),
  city: readEnvValue('LEGAL_CITY', '[Stadt]'),
  country: readEnvValue('LEGAL_COUNTRY', 'Deutschland'),
  email: readEnvValue('LEGAL_EMAIL', 'kontakt@nerway.de'),
};

export const HAS_COMPLETE_LEGAL_ADDRESS =
  hasEnvValue('LEGAL_STREET') &&
  hasEnvValue('LEGAL_POSTAL_CODE') &&
  hasEnvValue('LEGAL_CITY');

export const USES_UMAMI_ANALYTICS = Boolean(
  process.env.NEXT_PUBLIC_UMAMI_URL &&
  process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
);
