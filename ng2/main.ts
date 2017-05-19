declare var angular: any;

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './modules/app.module';
import { upgradeAdapter } from './modules/upgrade-adapter.module';

import { BigBreadcrumbsComponent } from './components/big-breadcrumbs/big-breadcrumbs';

angular.module('app').directive('bigBreadcrumbs', upgradeAdapter.downgradeNg2Component(BigBreadcrumbsComponent));

upgradeAdapter.bootstrap(document.body, ['app']);
platformBrowserDynamic().bootstrapModule(AppModule);
