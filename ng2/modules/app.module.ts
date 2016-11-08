import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';

import { AppComponent }         from '../components/app/app.component';
import { CatalogListComponent } from '../components/catalog-list/catalog-list.component';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    AppComponent,
    CatalogListComponent
  ],
  bootstrap: [ AppComponent ]
})

export class AppModule {}
