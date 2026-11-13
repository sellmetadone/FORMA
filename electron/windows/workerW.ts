/**
 * WorkerW attachment for Windows 10/11 desktop wallpaper host.
 * Pure JS orchestration + PowerShell P/Invoke (no native addon).
 * FORMA MIT — original implementation (not derived from Lively GPL sources).
 */
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const execFileAsync = promisify(execFile);

export type WorkerWAttachResult = {
  ok: boolean;
  method?: string;
  error?: string;
};

export async function attachToWorkerW(hwndDecimal: string): Promise<boolean> {
  const r = await attachToWorkerWDetailed(hwndDecimal);
  return r.ok;
}

export async function attachToWorkerWDetailed(hwndDecimal: string): Promise<WorkerWAttachResult> {
  if (process.platform !== 'win32') {
    return { ok: false, error: 'not-windows' };
  }
  if (!/^\d+$/.test(String(hwndDecimal))) {
    return { ok: false, error: 'invalid-hwnd' };
  }

  const ps = `
$ErrorActionPreference = 'Stop'
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class FormaWorkerW2 {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern IntPtr FindWindow(string c, string w);
  [DllImport("user32.dll")] public static extern IntPtr FindWindowEx(IntPtr p, IntPtr c, string cls, string win);
  [DllImport("user32.dll")] public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, UIntPtr wParam, IntPtr lParam, uint flags, uint timeout, out UIntPtr result);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
  [DllImport("user32.dll")] public static extern IntPtr SetParent(IntPtr child, IntPtr parent);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
  [DllImport("user32.dll")] public static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);
  [DllImport("user32.dll")] public static extern int GetWindowLong(IntPtr hWnd, int nIndex);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

  const int GWL_EXSTYLE = -20;
  const int WS_EX_TOOLWINDOW = 0x00000080;
  const int WS_EX_NOACTIVATE = 0x08000000;
  const uint SWP_NOZORDER = 0x0004;
  const uint SWP_NOACTIVATE = 0x0010;
  const uint SWP_SHOWWINDOW = 0x0040;

  public static void SpawnWorkerLayer() {
    IntPtr progman = FindWindow("Progman", null);
    if (progman == IntPtr.Zero) return;
    UIntPtr result;
    SendMessageTimeout(progman, 0x052C, (UIntPtr)0xD, IntPtr.Zero, 0, 1000, out result);
    SendMessageTimeout(progman, 0x052C, UIntPtr.Zero, IntPtr.Zero, 0, 1000, out result);
  }

  public static IntPtr FindWorkerW_A() {
    SpawnWorkerLayer();
    IntPtr workerw = IntPtr.Zero;
    EnumWindows((top, param) => {
      IntPtr shell = FindWindowEx(top, IntPtr.Zero, "SHELLDLL_DefView", null);
      if (shell != IntPtr.Zero) {
        workerw = FindWindowEx(IntPtr.Zero, top, "WorkerW", null);
      }
      return true;
    }, IntPtr.Zero);
    return workerw;
  }

  public static IntPtr FindWorkerW_B() {
    SpawnWorkerLayer();
    IntPtr found = IntPtr.Zero;
    IntPtr progman = FindWindow("Progman", null);
    IntPtr w = IntPtr.Zero;
    for (int i = 0; i < 32; i++) {
      w = FindWindowEx(IntPtr.Zero, w, "WorkerW", null);
      if (w == IntPtr.Zero) break;
      IntPtr shell = FindWindowEx(w, IntPtr.Zero, "SHELLDLL_DefView", null);
      if (shell == IntPtr.Zero) found = w;
    }
    if (found == IntPtr.Zero) {
      found = FindWindowEx(progman, IntPtr.Zero, "WorkerW", null);
    }
    return found;
  }

  public static IntPtr FindWorkerW_C() {
    SpawnWorkerLayer();
    return FindWindow("Progman", null);
  }

  public static string Attach(IntPtr hwnd) {
    IntPtr[] strategies = new IntPtr[] { FindWorkerW_A(), FindWorkerW_B(), FindWorkerW_C() };
    string[] names = new string[] { "A", "B", "C" };
    for (int i = 0; i < strategies.Length; i++) {
      IntPtr target = strategies[i];
      if (target == IntPtr.Zero) continue;
      SetParent(hwnd, target);
      int ex = GetWindowLong(hwnd, GWL_EXSTYLE);
      SetWindowLong(hwnd, GWL_EXSTYLE, ex | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE);
      ShowWindow(hwnd, 5);
      SetWindowPos(hwnd, IntPtr.Zero, 0, 0, 0, 0, SWP_NOZORDER | SWP_NOACTIVATE | SWP_SHOWWINDOW);
      return "OK:" + names[i];
    }
    return "NO_WORKER";
  }
}
"@
$hwnd = [IntPtr]::new([int64]${hwndDecimal})
$out = [FormaWorkerW2]::Attach($hwnd)
Write-Output $out
`;

  const tmp = path.join(os.tmpdir(), `forma-workerw-${Date.now()}-${process.pid}.ps1`);
  fs.writeFileSync(tmp, ps, 'utf8');
  try {
    const { stdout, stderr } = await execFileAsync(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tmp],
      { timeout: 12000, windowsHide: true }
    );
    const text = `${stdout || ''}${stderr || ''}`;
    const m = text.match(/OK:([ABC])/i);
    if (m) return { ok: true, method: m[1] };
    if (text.includes('OK')) return { ok: true, method: 'legacy' };
    return { ok: false, error: text.trim().slice(0, 200) || 'NO_WORKER' };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}
