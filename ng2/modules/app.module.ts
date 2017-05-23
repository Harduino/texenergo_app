import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';

import { AppComponent }         from '../components/app/app.component';
import { BigBreadcrumbsComponent } from '../components/layout/big-breadcrumbs/big-breadcrumbs';
import { FullScreenComponent } from '../components/layout/full-screen/full-screen';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    AppComponent,
    BigBreadcrumbsComponent,
    FullScreenComponent
  ],
  bootstrap: [ AppComponent ]
})

export class AppModule {}
