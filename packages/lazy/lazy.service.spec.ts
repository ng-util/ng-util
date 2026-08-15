import { DOCUMENT } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs';

import { NuLazyResources, NuLazyService } from './lazy.service';

let isIE = false;
let testStatus = 'ok';
class MockDocument {
  querySelectorAll = (): any[] => {
    return [
      {
        appendChild: (node: any) => {
          if (node.testStatus === 'ok') {
            if (node.readyState) {
              node.readyState = 'complete';
              node.onreadystatechange();
            } else {
              node.onload();
            }
            return;
          }
          node.onerror();
        },
        remove: () => {}
      }
    ];
  };
  getElementsByTagName = (): any[] => {
    return [
      {
        appendChild: (node: any) => {
          if (node.testStatus === 'ok') {
            if (node.readyState) {
              node.readyState = 'complete';
              node.onreadystatechange();
            } else {
              node.onload();
            }
            return;
          }
          node.onerror();
        }
      }
    ];
  };
  createElement = (): any => {
    const ret: any = {
      testStatus,
      onload: () => {}
    };
    if (isIE) ret.readyState = 'loading';
    return ret;
  };
}

describe('ng-util: lazy', () => {
  let srv: NuLazyService;
  let doc: Document;
  beforeEach(() => {
    isIE = false;
    testStatus = 'ok';
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: DOCUMENT, useClass: MockDocument }]
    });
    srv = TestBed.inject(NuLazyService);
    srv.clear();
    doc = TestBed.inject(DOCUMENT);
  });

  describe('#IE', () => {
    it('should be load a js resource', () => {
      isIE = true;
      return new Promise<void>(resolve => {
        srv
          .monitor()
          .pipe(take(1))
          .subscribe(res => {
            expect(res[0].status).toBe('ok');
            resolve();
          });
        srv.load(['/1.js']);
      });
    });
    it('should be load a js resource unit stauts is complete', () => {
      isIE = true;
      const mockGetElementsByTagName = (): any[] => {
        const mockObj = new MockDocument().getElementsByTagName();
        mockObj[0].appendChild = (node: any) => {
          node.readyState = 'mock-status';
          node.onreadystatechange();
          node.readyState = 'complete';
          node.onreadystatechange();
        };
        return mockObj;
      };
      vi.spyOn(doc, 'getElementsByTagName').mockImplementation(mockGetElementsByTagName as any);
      return new Promise<void>(resolve => {
        srv
          .monitor()
          .pipe(take(1))
          .subscribe(res => {
            expect(res[0].status).toBe('ok');
            resolve();
          });
        srv.load(['/1.js']);
      });
    });
  });

  describe('Scripts', () => {
    it('should be load a js resource', () => {
      return new Promise<void>(resolve => {
        srv
          .monitor()
          .pipe(take(1))
          .subscribe(res => {
            expect(res[0].status).toBe('ok');
            resolve();
          });
        srv.load('/1.js');
      });
    });
    it('should be custom content', () => {
      const res: any = {};
      const content = 'var a = 1;';
      vi.spyOn(doc, 'createElement').mockImplementation(() => res);
      srv.loadScript('/1.js', { innerContent: content });
      expect(res.innerHTML).toBe(content);
    });
    it('should be callback', () => {
      return new Promise<void>(resolve => {
        srv
          .monitor()
          .pipe(take(1))
          .subscribe(res => {
            expect(res[0].status).toBe('ok');
            resolve();
          });
        srv.load([{ path: '/1.js', type: 'script', callback: 'A' }] as NuLazyResources[]);
        (window as any).A();
      });
    });
  });

  describe('Styles', () => {
    it('should be load a css resource', () => {
      return new Promise<void>(resolve => {
        srv
          .monitor()
          .pipe(take(1))
          .subscribe(res => {
            expect(res[0].status).toBe('ok');
            resolve();
          });
        srv.load('/1.css');
      });
    });
    it('should be load a less resource', () => {
      return srv.loadStyle('/1.less', { rel: 'stylesheet/less' }).then(res => {
        expect(res.status).toBe('ok');
      });
    });
    it('should be custom content', () => {
      const res: any = {
        onerror() {}
      };
      const content = 'var a = 1;';
      vi.spyOn(doc, 'createElement').mockImplementation(() => res);
      srv.loadStyle('/1.js', { rel: 'stylesheet/less', innerContent: content });
      expect(res.innerHTML).toBe(content);
    });
  });

  it('should be immediately when loaded a js resource', () => {
    let count = 0;
    vi.spyOn(doc, 'createElement').mockImplementation(() => {
      ++count;
      return new MockDocument().createElement();
    });
    srv.load('/2.js');
    expect(count).toBe(1);
    srv.load('/2.js');
    expect(count).toBe(1);
  });

  it('should be immediately when loaded a css resource', () => {
    let count = 0;
    vi.spyOn(doc, 'createElement').mockImplementation(() => {
      ++count;
      return new MockDocument().createElement();
    });
    srv.load('/2.css');
    expect(count).toBe(1);
    srv.load('/2.css');
    expect(count).toBe(1);
  });

  it('should be bad resource', () => {
    testStatus = 'bad';
    return new Promise<void>(resolve => {
      srv
        .monitor()
        .pipe(take(1))
        .subscribe(res => {
          expect(res[0].status).toBe('error');
          resolve();
        });
      srv.load('/3.js');
    });
  });

  it('should be monitor to some resources', () => {
    const libs = ['/1.js', '/2.js'];
    return new Promise<void>(resolve => {
      srv.monitor(libs).subscribe(res => {
        expect(res.length).toBe(libs.length);
        expect(res[0].status).toBe('ok');
        expect(res[1].status).toBe('ok');
        resolve();
      });
      srv.load(libs);
    });
  });

  it('should be NuLazyResources type', () => {
    const data = ['/1.js', { path: '/2.js', type: 'style' }] as any;
    return new Promise<void>(resolve => {
      srv.monitor(data).subscribe(res => {
        expect(res[0].status).toBe('ok');
        expect(res[1].type).toBe('style');
        resolve();
      });
      srv.load(data);
    });
  });
});
