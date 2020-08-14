import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { FormsModule } from '@angular/forms';
import { HttpFormComponent } from './http-form/http-form.component';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FragmentListComponent } from './fragment-list/fragment-list.component';
import { ExamplesComponent } from './examples/examples.component';
import { RealtimeComponent } from './realtime/realtime.component';
import { RealtimeDialogComponent } from './realtime-dialog/realtime-dialog.component';
import { PlaygroundComponent } from './playground/playground.component';
import { WizardComponent } from './wizard/wizard.component';

@NgModule({
  declarations: [
    AppComponent,
    HttpFormComponent,
    FragmentListComponent,
    ExamplesComponent,
    RealtimeComponent,
    RealtimeDialogComponent,
    PlaygroundComponent,
    WizardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatExpansionModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatBadgeModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    FormsModule,
    HttpClientModule,
    MatTabsModule,
    MatCardModule,
    MatRadioModule,
    MatGridListModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
    FlexLayoutModule,
    MonacoEditorModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
