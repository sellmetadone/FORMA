type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const MIN_LEVEL: Level = 'debug';

function shouldLog(level: Level) {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[MIN_LEVEL];
}

function emit(level: Level, scope: string, message: string, extra?: unknown) {
  if (!shouldLog(level)) return;
  const prefix = `[FORMA:${scope}]`;
  const args = extra !== undefined ? [prefix, message, extra] : [prefix, message];
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  fn(...args);
}

export const logger = {
  debug: (scope: string, message: string, extra?: unknown) => emit('debug', scope, message, extra),
  info: (scope: string, message: string, extra?: unknown) => emit('info', scope, message, extra),
  warn: (scope: string, message: string, extra?: unknown) => emit('warn', scope, message, extra),
  error: (scope: string, message: string, extra?: unknown) => emit('error', scope, message, extra),
};
