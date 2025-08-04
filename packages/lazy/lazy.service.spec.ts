import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs';

import { NuLazyResources, NuLazyService } from './lazy.service';
import { provideZonelessChangeDetection } from '@angular/core';

let isIE = false;
let testStatus = 'ok';
class MockDocument {
  querySelectorAll = () => {
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
  getElementsByTagName = () => {
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
  createElement = () => {
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
    it('should be load a js resource', done => {
      isIE = true;
      srv
        .monitor()
        .pipe(take(1))
        .subscribe(res => {
          expect(res[0].status).toBe('ok');
          done();
        });
      srv.load(['/1.js']);
    });
    it('should be load a js resource unit stauts is complete', (done: () => void) => {
      isIE = true;
      const mockGetElementsByTagName = () => {
        const mockObj = new MockDocument().getElementsByTagName();
        mockObj[0].appendChild = node => {
          node.readyState = 'mock-status';
          node.onreadystatechange();
          node.readyState = 'complete';
          node.onreadystatechange();
        };
        return mockObj;
      };
      spyOn(doc, 'getElementsByTagName').and.callFake(mockGetElementsByTagName as any);
      srv
        .monitor()
        .pipe(take(1))
        .subscribe(res => {
          expect(res[0].status).toBe('ok');
          done();
        });
      srv.load(['/1.js']);
    });
  });

  describe('Scripts', () => {
    it('should be load a js resource', done => {
      srv
        .monitor()
        .pipe(take(1))
        .subscribe(res => {
          expect(res[0].status).toBe('ok');
          done();
        });
      srv.load('/1.js');
    });
    it('should be custom content', () => {
      const res: any = {};
      const content = 'var a = 1;';
      spyOn(doc, 'createElement').and.callFake(() => res);
      srv.loadScript('/1.js', { innerContent: content });
      expect(res.innerHTML).toBe(content);
    });
    it('should be callback', done => {
      srv
        .monitor()
        .pipe(take(1))
        .subscribe(res => {
          expect(res[0].status).toBe('ok');
          done();
        });
      srv.load([{ path: '/1.js', type: 'script', callback: 'A' }] as NuLazyResources[]);
      (window as any).A();
    });
  });

  describe('Styles', () => {
    it('should be load a css resource', done => {
      srv
        .monitor()
        .pipe(take(1))
        .subscribe(res => {
          expect(res[0].status).toBe('ok');
          done();
        });
      srv.load('/1.css');
    });
    it('should be load a less resource', done => {
      srv.loadStyle('/1.less', { rel: 'stylesheet/less' }).then(res => {
        expect(res.status).toBe('ok');
        done();
      });
    });
    it('should be custom content', () => {
      const res: any = {
        onerror() {}
      };
      const content = 'var a = 1;';
      spyOn(doc, 'createElement').and.callFake(() => res);
      srv.loadStyle('/1.js', { rel: 'stylesheet/less', innerContent: content });
      expect(res.innerHTML).toBe(content);
    });
  });

  it('should be immediately when loaded a js resource', () => {
    let count = 0;
    spyOn(doc, 'createElement').and.callFake(() => {
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
    spyOn(doc, 'createElement').and.callFake(() => {
      ++count;
      return new MockDocument().createElement();
    });
    srv.load('/2.css');
    expect(count).toBe(1);
    srv.load('/2.css');
    expect(count).toBe(1);
  });

  it('should be bad resource', done => {
    testStatus = 'bad';
    srv
      .monitor()
      .pipe(take(1))
      .subscribe(res => {
        expect(res[0].status).toBe('error');
        done();
      });
    srv.load('/3.js');
  });

  it('should be monitor to some resources', done => {
    const libs = ['/1.js', '/2.js'];
    srv.monitor(libs).subscribe(res => {
      expect(res.length).toBe(libs.length);
      expect(res[0].status).toBe('ok');
      expect(res[1].status).toBe('ok');
      done();
    });
    srv.load(libs);
  });

  it('should be NuLazyResources type', done => {
    const data = ['/1.js', { path: '/2.js', type: 'style' }] as any;
    srv.monitor(data).subscribe(res => {
      expect(res[0].status).toBe('ok');
      expect(res[1].type).toBe('style');
      done();
    });
    srv.load(data);
  });
});
