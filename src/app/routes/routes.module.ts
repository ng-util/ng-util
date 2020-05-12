import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';
import { environment } from '../../environments/environment';
import { LayoutComponent } from '../layout/layout.component';
import { SharedModule } from '../shared/shared.module';
import { NotFoundComponent } from './404/404.component';
import { DemoComponent } from './demo.component';
import { HomeComponent } from './home/home.component';

const MODULES = [
  NuMonacoEditorModule.forRoot({
    defaultOptions: { scrollBeyondLastLine: false },
    monacoLoad: () => {
      const uri = monaco.Uri.parse('a://b/foo.json');
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: 'http://myserver/foo-schema.json',
            fileMatch: [uri.toString()],
            schema: {
              type: 'object',
              properties: {
                p1: {
                  enum: ['v1', 'v2'],
                },
                p2: {
                  $ref: 'http://myserver/bar-schema.json',
                },
              },
            },
          },
          {
            uri: 'http://myserver/bar-schema.json',
            fileMatch: [uri.toString()],
            schema: {
              type: 'object',
              properties: {
                q1: {
                  enum: ['x1', 'x2'],
                },
              },
            },
          },
        ],
      });
    },
  }),
];
const COMPONENTS = [HomeComponent, NotFoundComponent, DemoComponent];

const routes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      // #endregion
    ],
  },
  { path: 'demo', component: DemoComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [SharedModule, ...MODULES, RouterModule.forRoot(routes, environment.production ? {} : { useHash: true })],
  declarations: [...COMPONENTS],
})
export class RoutesModule {}
