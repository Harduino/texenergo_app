import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';

import { AppComponent }         from '../components/app/app.component';
import { BigBreadcrumbsComponent } from '../components/big-breadcrumbs/big-breadcrumbs';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    AppComponent,
    BigBreadcrumbsComponent
  ],
  bootstrap: [ AppComponent ]
})

export class AppModule {}
