/**
 * Windows admin elevation helpers.
 * WorkerW attachment and some desktop wallpaper operations are more reliable elevated.
 */
import { execFileSync, spawn } from 'child_process';

export function isProcessElevated(): boolean {
  if (process.platform !== 'win32') return true;
  try {
    execFileSync('net', ['session'], { stdio: 'ignore', windowsHide: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * If not elevated, re-launch the same process with RunAs and exit current.
 * Returns true if this process should continue (already elevated or non-Windows).
 */
export function ensureElevatedOrRelaunch(): boolean {
  if (process.platform !== 'win32') return true;
  if (process.env.FORMA_SKIP_ELEVATION === '1') return true;
  if (isProcessElevated()) {
    process.env.FORMA_ELEVATED = '1';
    return true;
  }
  if (process.env.FORMA_ELEVATION_ATTEMPTED === '1') {
    console.warn('[FORMA] Running without administrator rights — live desktop may be limited');
    return true;
  }

  try {
    const execPath = process.execPath;
    const args = process.argv.slice(1).filter((a) => a !== '--');
    const allArgs = args.map((a) => `'${String(a).replace(/'/g, "''")}'`).join(',');
    const ps = [
      `$env:FORMA_ELEVATION_ATTEMPTED='1';`,
      `Start-Process -FilePath '${execPath.replace(/'/g, "''")}' -ArgumentList @(${allArgs}) -Verb RunAs -WorkingDirectory '${process.cwd().replace(/'/g, "''")}'`,
    ].join(' ');

    spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    }).unref();

    return false;
  } catch (err) {
    console.warn('[FORMA] Elevation relaunch failed:', err);
    return true;
  }
}

export function elevationStatus(): { elevated: boolean; platform: string } {
  return { elevated: isProcessElevated(), platform: process.platform };
}
