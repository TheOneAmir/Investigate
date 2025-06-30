import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http'; // <-- Import HttpClientModule
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <-- Import FormsModule for ngModel
import { GoogleChartsModule } from 'angular-google-charts';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // For native date adapter
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav'; // For sidenav support

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    HttpClientModule, // Add this to your imports array
    GoogleChartsModule, // Add this for Google Charts
    FormsModule, // Add this for two-way data binding with ngModel
    ReactiveFormsModule,
    MatDatepickerModule, // Angular Material Datepicker
    MatInputModule,       // For input fields
    MatNativeDateModule,  // For native date adapter (required for MatDatepickerModule)
    MatFormFieldModule,    // For mat-form-field wrapper
    MatToolbarModule,
    MatSidenavModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
