import crypto from 'node:crypto';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function resolveConfiguredLevel(): LogLevel {
  const raw = String(process.env.LOG_LEVEL ?? 'info').toLowerCase().trim();
  if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') {
    return raw;
  }
  return 'info';
}

function shouldLog(level: LogLevel): boolean {
  const configured = resolveConfiguredLevel();
  return levelOrder[level] >= levelOrder[configured];
}

function serializePayload(payload?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!payload) return undefined;
  const cloned: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (value instanceof Error) {
      cloned[key] = {
        name: value.name,
        message: value.message,
        ...(value.stack ? { stack: value.stack } : {}),
      };
      continue;
    }

    cloned[key] = value;
  }

  return cloned;
}

export function createRequestId(incoming?: string | null): string {
  const normalizedIncoming = incoming?.trim();
  if (normalizedIncoming) {
    return normalizedIncoming.slice(0, 120);
  }

  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function logEvent(level: LogLevel, event: string, payload?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  const base = {
    level,
    event,
    timestamp: new Date().toISOString(),
    payload: serializePayload(payload),
  };

  const line = JSON.stringify(base);

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.log(line);
}
