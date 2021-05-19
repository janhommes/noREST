import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlaygroundComponent } from './playground/playground.component';
import { WizardComponent } from './wizard/wizard.component';


const routes: Routes = [{
  path: ':key',
  component: PlaygroundComponent
}, {
  path: '',
  component: WizardComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
