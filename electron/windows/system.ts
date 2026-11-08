import { app, screen, shell } from 'electron';
import { execFile } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export type SystemStats = {
  cpuPercent: number;
  memUsedMb: number;
  memTotalMb: number;
  memPercent: number;
  platform: string;
  uptimeSec: number;
  cpuCount: number;
  loadAvg: number[];
};

let lastCpu: { idle: number; total: number } | null = null;

function readCpuSnapshot() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const c of cpus) {
    idle += c.times.idle;
    total += c.times.user + c.times.nice + c.times.sys + c.times.irq + c.times.idle;
  }
  return { idle, total };
}

export function getSystemStats(): SystemStats {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const used = totalMem - freeMem;
  const memPercent = Math.round((used / totalMem) * 100);
  const snap = readCpuSnapshot();
  let cpuPercent = 0;
  if (lastCpu) {
    const idleDelta = snap.idle - lastCpu.idle;
    const totalDelta = snap.total - lastCpu.total;
    cpuPercent = totalDelta > 0 ? Math.round((1 - idleDelta / totalDelta) * 100) : 0;
  }
  lastCpu = snap;
  return {
    cpuPercent: Math.max(0, Math.min(100, cpuPercent)),
    memUsedMb: Math.round(used / 1024 / 1024),
    memTotalMb: Math.round(totalMem / 1024 / 1024),
    memPercent,
    platform: `${os.platform()} ${os.release()}`,
    uptimeSec: Math.round(os.uptime()),
    cpuCount: os.cpus().length,
    loadAvg: os.loadavg(),
  };
}

export function getDisplays() {
  const primary = screen.getPrimaryDisplay();
  return screen.getAllDisplays().map((d, i) => ({
    id: d.id,
    label: d.label || `Display ${i + 1}`,
    bounds: d.bounds,
    scaleFactor: d.scaleFactor,
    primary: d.id === primary.id,
  }));
}

function assertSafeImagePath(imagePath: string): string {
  const resolved = path.resolve(imagePath);
  if (!fs.existsSync(resolved)) throw new Error('File not found');
  const ext = path.extname(resolved).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.bmp'].includes(ext)) throw new Error('Unsupported image type');
  if (/[`$;"']/.test(resolved)) throw new Error('Invalid path characters');
  return resolved;
}

export async function setWallpaper(imagePath: string): Promise<{ ok: boolean; error?: string }> {
  if (process.platform !== 'win32') {
    return { ok: false, error: 'Wallpaper apply is only supported on Windows' };
  }
  try {
    const resolved = assertSafeImagePath(imagePath);
    const escaped = resolved.replace(/\\/g, '\\\\');
    const script = `
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Wallpaper {
  [DllImport("user32.dll", SetLastError=true)]
  public static extern bool SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@
[Wallpaper]::SystemParametersInfo(20, 0, '${escaped}', 3)
`;
    await execFileAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
      timeout: 15000,
      windowsHide: true,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function setWallpaperOnMonitor(
  monitorIndex: number,
  imagePath: string
): Promise<{ ok: boolean; error?: string }> {
  if (process.platform !== 'win32') {
    return { ok: false, error: 'Per-monitor wallpaper requires Windows' };
  }
  try {
    const resolved = assertSafeImagePath(imagePath);
    const idx = Math.max(0, Math.floor(Number(monitorIndex)));
    const escaped = resolved.replace(/\\/g, '\\\\');
    const script = `
$ErrorActionPreference = 'Stop'
$dw = New-Object -ComObject DesktopWallpaper
$count = $dw.GetMonitorDevicePathCount()
if (${idx} -ge $count) { throw "Monitor index ${idx} out of range (count=$count)" }
$mon = $dw.GetMonitorDevicePathAt(${idx})
$dw.SetWallpaper($mon, '${escaped}')
`;
    await execFileAsync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
      timeout: 20000,
      windowsHide: true,
    });
    return { ok: true };
  } catch (err) {
    const fallback = await setWallpaper(imagePath);
    if (fallback.ok) return { ok: true, error: 'COM failed; applied via primary desktop API' };
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function getAutostartEnabled(): boolean {
  return app.getLoginItemSettings().openAtLogin;
}

export function setAutostart(enabled: boolean): void {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    openAsHidden: true,
    path: process.execPath,
    args: enabled ? ['--hidden'] : [],
  });
}

const ALLOWED_APP_PATTERN = /^(notepad\.exe|explorer\.exe|calc\.exe|mspaint\.exe|cmd\.exe|wt\.exe)$/i;

export async function launchApp(appPath: string): Promise<{ ok: boolean; error?: string }> {
  const base = path.basename(appPath);
  if (!ALLOWED_APP_PATTERN.test(base) && !path.isAbsolute(appPath)) {
    return { ok: false, error: 'App not in allowlist. Use absolute path for custom apps.' };
  }
  if (path.isAbsolute(appPath)) {
    if (!fs.existsSync(appPath)) return { ok: false, error: 'Path not found' };
    if (appPath.includes('..')) return { ok: false, error: 'Invalid path' };
  }
  try {
    if (path.isAbsolute(appPath)) {
      await shell.openPath(appPath);
    } else if (process.platform === 'win32') {
      await execFileAsync('cmd.exe', ['/c', 'start', '', base], { windowsHide: true });
    } else {
      await shell.openPath(base);
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function openExternal(url: string): Promise<void> {
  if (!/^https?:\/\//i.test(url)) {
    return Promise.reject(new Error('Only http(s) URLs allowed'));
  }
  return shell.openExternal(url);
}

function assetsDir(kind: string) {
  const dir = path.join(app.getPath('userData'), 'assets', kind);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function importAssetFile(
  sourcePath: string,
  kind: 'icon' | 'cursor' | 'wallpaper'
): { ok: boolean; dest?: string; name?: string; error?: string } {
  try {
    const resolved = path.resolve(sourcePath);
    if (!fs.existsSync(resolved)) return { ok: false, error: 'Source not found' };
    if (resolved.includes('..')) return { ok: false, error: 'Invalid path' };
    const name = path.basename(resolved);
    const dest = path.join(assetsDir(kind), name);
    fs.copyFileSync(resolved, dest);
    return { ok: true, dest, name };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function listImportedAssets(kind: 'icon' | 'cursor' | 'wallpaper') {
  const dir = assetsDir(kind);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).map((name) => ({
    name,
    path: path.join(dir, name),
  }));
}

const CURSOR_REG_VALUES = [
  'Arrow',
  'Help',
  'AppStarting',
  'Wait',
  'Crosshair',
  'IBeam',
  'NWPen',
  'No',
  'SizeNS',
  'SizeWE',
  'SizeNWSE',
  'SizeNESW',
  'SizeAll',
  'UpArrow',
  'Hand',
];

export async function backupCursors(): Promise<{ ok: boolean; error?: string; path?: string }> {
  if (process.platform !== 'win32') return { ok: false, error: 'Windows only' };
  try {
    const backupPath = path.join(app.getPath('userData'), 'cursor-backup.reg');
    const script = `reg export "HKCU\\Control Panel\\Cursors" "${backupPath.replace(/\\/g, '\\\\')}" /y`;
    await execFileAsync('powershell.exe', ['-NoProfile', '-Command', script], {
      timeout: 10000,
      windowsHide: true,
    });
    return { ok: true, path: backupPath };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function applyCursorArrow(
  filePath: string
): Promise<{ ok: boolean; error?: string }> {
  if (process.platform !== 'win32') return { ok: false, error: 'Windows only' };
  try {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) return { ok: false, error: 'Cursor file not found' };
    const escaped = resolved.replace(/\\/g, '\\\\');
    const script = `Set-ItemProperty -Path 'HKCU:\\Control Panel\\Cursors' -Name 'Arrow' -Value '${escaped}'; rundll32 user32.dll,UpdatePerUserSystemParameters`;
    await execFileAsync('powershell.exe', ['-NoProfile', '-Command', script], {
      timeout: 10000,
      windowsHide: true,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function restoreCursors(): Promise<{ ok: boolean; error?: string }> {
  if (process.platform !== 'win32') return { ok: false, error: 'Windows only' };
  try {
    const backupPath = path.join(app.getPath('userData'), 'cursor-backup.reg');
    if (!fs.existsSync(backupPath)) return { ok: false, error: 'No backup found' };
    const escaped = backupPath.replace(/\\/g, '\\\\');
    await execFileAsync('reg.exe', ['import', backupPath], { timeout: 10000, windowsHide: true });
    await execFileAsync(
      'powershell.exe',
      ['-NoProfile', '-Command', 'rundll32 user32.dll,UpdatePerUserSystemParameters'],
      { timeout: 5000, windowsHide: true }
    );
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export { CURSOR_REG_VALUES };
