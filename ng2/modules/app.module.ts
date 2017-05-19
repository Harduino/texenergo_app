import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';

import { upgradeAdapter } from './upgrade-adapter.module';

import { AppComponent }         from '../components/app/app.component';
import { BigBreadcrumbsComponent } from '../components/big-breadcrumbs/big-breadcrumbs';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    AppComponent,
    BigBreadcrumbsComponent,
    upgradeAdapter.upgradeNg1Component('catalogues')
  ],
  bootstrap: [ AppComponent ]
})

export class AppModule {}
