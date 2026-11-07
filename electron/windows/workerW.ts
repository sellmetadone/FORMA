import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const execFileAsync = promisify(execFile);

/** Parent HWND under desktop WorkerW (Windows). FORMA MIT — original code. */
export async function attachToWorkerW(hwndDecimal: string): Promise<boolean> {
  if (process.platform !== 'win32') return false;
  const ps = `
$ErrorActionPreference = 'Stop'
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class FormaWorkerW {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
  [DllImport("user32.dll")] public static extern IntPtr FindWindow(string c, string w);
  [DllImport("user32.dll")] public static extern IntPtr FindWindowEx(IntPtr p, IntPtr c, string cls, string win);
  [DllImport("user32.dll")] public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, UIntPtr wParam, IntPtr lParam, uint flags, uint timeout, out UIntPtr result);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
  [DllImport("user32.dll")] public static extern IntPtr SetParent(IntPtr child, IntPtr parent);
  public static IntPtr FindWorkerW() {
    IntPtr progman = FindWindow("Progman", null);
    UIntPtr result;
    SendMessageTimeout(progman, 0x052C, UIntPtr.Zero, IntPtr.Zero, 0, 1000, out result);
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
}
"@
$hwnd = [IntPtr]::new([int64]${hwndDecimal})
$worker = [FormaWorkerW]::FindWorkerW()
if ($worker -eq [IntPtr]::Zero) { Write-Output "NO_WORKER"; exit 2 }
[FormaWorkerW]::SetParent($hwnd, $worker) | Out-Null
Write-Output "OK"
`;
  const tmp = path.join(os.tmpdir(), `forma-workerw-${Date.now()}.ps1`);
  fs.writeFileSync(tmp, ps, 'utf8');
  try {
    const { stdout } = await execFileAsync(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', tmp],
      { timeout: 8000, windowsHide: true }
    );
    return String(stdout).includes('OK');
  } catch {
    return false;
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}
