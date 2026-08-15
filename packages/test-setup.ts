/**
 * 测试全局 setup（由 @angular/build:unit-test 的 setupFiles 加载）。
 *
 * 为 localStorage / sessionStorage 提供内存版实现，避免依赖运行环境
 * （Node 实验性 WebStorage 或 jsdom）的行为差异，保证各测试文件的确定性。
 */
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

for (const name of ['localStorage', 'sessionStorage'] as const) {
  try {
    // 直接 defineProperty，避免触发环境的实验性 getter
    Object.defineProperty(globalThis, name, {
      value: new MemoryStorage(),
      configurable: true,
      writable: true
    });
  } catch {
    // 若属性不可配置，退化为直接赋值
    globalThis[name] = new MemoryStorage();
  }
}
