declare var angular: any;

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './modules/app.module';
import { upgradeAdapter } from './modules/upgrade-adapter.module';

import { BigBreadcrumbsComponent } from './components/layout/big-breadcrumbs/big-breadcrumbs';
import { FullScreenComponent } from './components/layout/full-screen/full-screen';

angular.module('app').directive('bigBreadcrumbs', upgradeAdapter.downgradeNg2Component(BigBreadcrumbsComponent));
angular.module('app').directive('fullScreen', upgradeAdapter.downgradeNg2Component(FullScreenComponent));

upgradeAdapter.bootstrap(document.body, ['app']);
platformBrowserDynamic().bootstrapModule(AppModule);
