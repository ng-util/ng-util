## @ng-util/lazy

Lazy load javascript, css resources for Angular.

## Demo

- [Live Demo](https://cipchk.github.io/nu-lazy/)
- [Stackblitz](https://stackblitz.com/edit/nu-lazy)

## Usage

```typescript
import { NuLazyService } from '@ng-util/lazy';

export class AppComponent {
  constructor(private srv: NuLazyService) { }

  async loadBS() {
    const res = await this.srv.load(`https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css`);
    console.log(`bootstrap`, res);
  }
```

## How to use it with:

+ `Stackblitz` sample available [here](https://stackblitz.com/edit/nu-lazy).

## API

| name | type | description |
| ---- | -- | ----------- |
| `events` | `Observable<NuLazyResult[]>` | Events change callback |
| `clear()` | `void` | Clean all cached items |
| `load(paths: string ｜ string[])` | `Promise<NuLazyResult[]>` | Load the specified resources, includes `.js`, `.css` |
| `loadScript(path: string, options?: { innerContent?: string })` | `Promise<NuLazyResult>` | Load a script resources |
| `loadStyle(path: string, options?: { ref?: string, innerContent?: string })` | `Promise<NuLazyResult>` | Load a style resources |
