export type ModuleStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface FormaModule {
  id: string;
  name: string;
  version: string;
  status: ModuleStatus;
  error?: string;
}

class ModuleRegistry {
  private modules = new Map<string, FormaModule>();

  register(mod: FormaModule) {
    this.modules.set(mod.id, mod);
  }

  get(id: string) {
    return this.modules.get(id);
  }

  list() {
    return Array.from(this.modules.values());
  }

  setStatus(id: string, status: ModuleStatus, error?: string) {
    const mod = this.modules.get(id);
    if (mod) {
      mod.status = status;
      mod.error = error;
    }
  }
}

export const moduleRegistry = new ModuleRegistry();
