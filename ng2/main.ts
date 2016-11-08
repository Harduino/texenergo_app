declare var angular: any;

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './modules/app.module';
import { upgradeAdapter } from './modules/upgrade-adapter.module';

import { CatalogListComponent } from './components/catalog-list/catalog-list.component';

angular.module('app').directive('catalogList', upgradeAdapter.downgradeNg2Component(CatalogListComponent));
upgradeAdapter.bootstrap(document.body, ['app']);
platformBrowserDynamic().bootstrapModule(AppModule);
