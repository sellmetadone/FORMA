export type ModuleStatus = 'active' | 'idle' | 'error' | 'disabled';

export type FormaModule = {
  id: string;
  name: string;
  status: ModuleStatus;
};

class ModuleRegistry {
  private modules = new Map<string, FormaModule>();

  register(mod: FormaModule) {
    this.modules.set(mod.id, mod);
  }

  list(): FormaModule[] {
    return Array.from(this.modules.values());
  }

  get(id: string) {
    return this.modules.get(id);
  }

  setStatus(id: string, status: ModuleStatus) {
    const m = this.modules.get(id);
    if (m) m.status = status;
  }
}

export const moduleRegistry = new ModuleRegistry();

// Core modules registered at startup
[
  { id: 'workspace', name: 'Workspace Studio', status: 'active' as const },
  { id: 'themes', name: 'Theme Engine', status: 'active' as const },
  { id: 'wallpapers', name: 'Wallpaper Manager', status: 'active' as const },
  { id: 'widgets', name: 'Widget Engine', status: 'active' as const },
  { id: 'profiles', name: 'Profile Manager', status: 'active' as const },
  { id: 'live-desktop', name: 'Live Desktop', status: 'active' as const },
].forEach((m) => moduleRegistry.register(m));
