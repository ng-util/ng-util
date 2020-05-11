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
    monacoLoad: m => {
      console.log(m); // (window as any).monaco
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
