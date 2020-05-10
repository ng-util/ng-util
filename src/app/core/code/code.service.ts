import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import sdk from '@stackblitz/sdk';
import { getParameters } from 'codesandbox/lib/api/define';
import angularJSON from './files/angular.json';
import appModuleTS from './files/app.module';
import dotAngularCliJSON from './files/dot_angular-cli.json';
import environmentTS from './files/environment';
import mainTS from './files/main';
import polyfillTS from './files/polyfill';

@Injectable({ providedIn: 'root' })
export class CodeService {
  private document: Document;

  private get dependencies() {
    return {
      '@angular/animations': '^9.0.0',
      '@angular/cdk': '9.2.1',
      '@angular/common': '^9.0.0',
      '@angular/compiler': '^9.0.0',
      '@angular/core': '^9.0.0',
      '@angular/forms': '^9.0.0',
      '@angular/platform-browser': '^9.0.0',
      '@angular/platform-browser-dynamic': '^9.0.0',
      '@angular/router': '^9.0.0',
      '@ant-design/icons-angular': '9.0.1',
      'core-js': '3.6.4',
      rxjs: '6.5.4',
      tslib: '1.11.1',
      'zone.js': '0.10.2',
      'file-saver': '^1.3.3',
    };
  }

  constructor(@Inject(DOCUMENT) document: any) {
    this.document = document;
  }

  private parseCode(code: string) {
    let selector = '';
    let componentName = '';
    const selectorRe = /selector:[ ]?(['|"|`])([^'"`]+)/g.exec(code);
    if (selectorRe) {
      selector = selectorRe[2];
    }
    const componentNameRe = /export class ([^ {]+)/g.exec(code);
    if (componentNameRe) {
      componentName = componentNameRe[1];
    }
    return {
      selector,
      componentName,
      html: [`<base href="/">`, `<${selector}>loading</${selector}>`].join('\n'),
    };
  }

  openOnStackBlitz(appComponentCode: string) {
    const res = this.parseCode(appComponentCode);
    console.log(this.dependencies);
    sdk.openProject(
      {
        title: 'NG-UTIL',
        description: 'NG-UTIL',
        tags: ['ng-util', 'Angular', 'ng'],
        dependencies: this.dependencies,
        files: {
          'angular.json': `${JSON.stringify(angularJSON, null, 2)}`,
          'src/environments/environment.ts': environmentTS,
          'src/index.html': res.html,
          'src/main.ts': mainTS,
          'src/polyfills.ts': polyfillTS,
          'src/app/app.component.ts': appComponentCode,
          'src/app/app.module.ts': appModuleTS(res.componentName),
          'src/styles.css': ``,
        },
        template: 'angular-cli',
      },
      {
        openFile: `src/app/app.component.ts`,
      },
    );
  }

  openOnCodeSandbox(appComponentCode: string) {
    const res = this.parseCode(appComponentCode);
    const parameters = getParameters({
      files: {
        'package.json': {
          content: JSON.stringify(
            {
              dependencies: this.dependencies,
            },
            null,
            2,
          ),
          isBinary: false,
        },
        '.angular-cli.json': {
          content: dotAngularCliJSON,
          isBinary: false,
        },
        'src/environments/environment.ts': {
          content: environmentTS,
          isBinary: false,
        },
        'src/index.html': {
          content: res.html,
          isBinary: false,
        },
        'src/main.ts': {
          content: mainTS,
          isBinary: false,
        },
        'src/polyfills.ts': {
          content: polyfillTS,
          isBinary: false,
        },
        'src/app/app.module.ts': {
          content: appModuleTS(res.componentName),
          isBinary: false,
        },
        'src/app/app.component.ts': {
          content: appComponentCode,
          isBinary: false,
        },
        'src/styles.css': {
          content: ``,
          isBinary: false,
        },
      },
    });

    const form = this.document.createElement('form');
    const parametersInput = this.document.createElement('input');
    form.method = 'POST';
    form.action = 'https://codesandbox.io/api/v1/sandboxes/define';
    form.target = '_blank';
    parametersInput.name = 'parameters';
    parametersInput.value = parameters;
    form.appendChild(parametersInput);
    this.document.body.append(form);
    form.submit();
    this.document.body.removeChild(form);
  }
}
