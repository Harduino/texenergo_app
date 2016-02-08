/**
 * Created by Egor Lobanov on 17.01.16.
 */
(function(){
    /**
     * Build notification service for module
     */
    angular.module('services.notifications', [])
        .service('notificationServiceBuilder', ['CableApi', 'funcFactory', function(CableApi, funcFactory){

            this.build = function(serviceModule, name, actions, mixins){

                return new function(){

                    this.subscribe = function(params, scopeObject){

                        var s = scopeObject;// property of controller scope, that waiting for changes

                        var m = {
                            rejected: function(){
                                funcFactory.showNotification('Канал получения уведомлений', 'Не удалось установить соединение!');
                            },
                            received: function(data) {
                                window.gon.user.id !== data.user_id && syncChanges(data, s);
                            }
                        };
                        if(typeof mixins === 'object' && mixins) m = angular.extend(m, mixins);

                        CableApi.subscribe(params, m);
                    };

                    function syncChanges(data, scopeObject){
                        actions[data.action] && actions[data.action](scopeObject, data);
                    }

                };
            };

            this.getIndexByProperty = function(list, item, prop){
                var ind = -1;
                for(var i=list.length; i--;){
                    if(list[i][prop] === item[prop]){
                        ind = i;
                        break;
                    }
                }
                return ind;
            };
        }]);
}());
/**
 * Created by Mikhail Arzhaev on 24.12.15.
 */

(function () {

    "use strict";
    var module = angular.module('app.articles', ['ui.router']);

    module.config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state('app.articles', {
            url: '/articles?q',
            data:{
                title: 'Статья',
                access:{
                    action:'index',
                    params:'Article'
                }
            },
            params:{
              q:''
            },
            views:{
                "content@app": {
                    controller: 'ArticlesCtrl',
                    templateUrl: '/app/articles/views/articles.html'
                }
            }
        });
    }]);
}());
/**
 * Created by Egor Lobanov on 29.01.16.
 * Module for login page.
 */
(function(){

    'use strict';

    var module = angular.module('login', ['ui.router']);

    module.config(['$stateProvider', function($stateProvider){
        $stateProvider.state('login', {
            url: '/sign_in',
            views: {
                root: {
                    controller: 'loginCtrl',
                    templateUrl: '/app/auth/views/login.html'
                }
            }
        });
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 20.11.15.
 * Модуль страницы категорий товаров для каталога
 */

(function () {

    "use strict";
    var module = angular.module('app.catalogues', ['ui.router']);

    module.config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state('app.catalogues', {
            url: '/catalogues?q',
            data:{
                title: 'Категории товаров',
                access:{
                    action:'index',
                    params:'Catalogue'
                }
            },
            params:{
              q:''
            },
            views:{
                "content@app": {
                    controller: 'CataloguesCtrl',
                    templateUrl: '/app/catalogues/views/catalogues.html'
                }
            }
        }).state('app.catalogues.view', {
            url: '/:id',
            data:{
                access:{
                    action:'read',
                    params:'Catalogue'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewCatalogueCtrl',
                    templateUrl: '/app/catalogues/views/viewCatalogue.html'
                }
            }
        }).state('app.catalogues.view.edit', {
            url: '/edit',
            data:{
                title:'Редактирование категории',
                access:{
                    action:'edit',
                    params:'Catalogue'
                }
            },
            views:{
                "content@app":{
                    controller: 'EditCatalogueCtrl',
                    templateUrl: '/app/catalogues/views/editCatalogue.html'
                }
            }
        });
    }]);
}());
/**
 * Created by Egor Lobanov on 07.11.15.
 * Модуль страницы контакты
 */
(function () {

    "use strict";

    var module = angular.module('app.contacts', ['ui.router']);

    module.config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state('app.contacts', {
            url: '/contacts?q',
            data:{
                title: 'Контакты',
                access:{
                    action:'index',
                    params:'Contact'
                }
            },
            views:{
                "content@app": {
                    controller: 'ContactsCtrl',
                    templateUrl: '/app/contacts/views/contacts.html'
                }
            }
        }).state('app.contacts.view', {
            url: '/:id',
            data:{
                title: 'Просмотр контакта',
                access:{
                    action:'read',
                    params:'Contact'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewContactCtrl',
                    templateUrl: '/app/contacts/views/viewContact.html'
                }
            }
        }).state('app.contacts.view.edit', {
            url: '/edit',
            data:{
                title: 'Редактирования контакта',
                access:{
                    action:'edit',
                    params:'Contact'
                }
            },
            views:{
                "content@app":{
                    controller: 'EditContactCtrl',
                    templateUrl: '/app/contacts/views/editContact.html'
                }
            }
        });
    }]);
}());
/**
 * Created by Egor Lobanov on 07.11.15.
 * Модуль страницы заказов
 */
(function () {

    "use strict";

    var module = angular.module('app.customer_orders', ['ui.router', 'easypiechart', 'services.notifications']);

    module.config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state('app.customer_orders', {
            url: '/customer_orders?q',
            data:{
                title: 'Заказы',
                access:{
                    action:'index',
                    params:'CustomerOrder'
                }
            },
            params:{
                q:'',
                id:''
            },
            views:{
                "content@app": {
                    controller: 'CustomerOrdersCtrl',
                    templateUrl: '/app/customer_orders/views/customerOrders.html'
                }
            }
        }).state('app.customer_orders.view', {
            url: '/:id',
            data:{
                title: 'Просмотр заказа',
                access:{
                    action:'read',
                    params:'CustomerOrder'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewCustomerOrderCtrl',
                    templateUrl: '/app/customer_orders/views/viewCustomerOrder.html'
                }
            }
        }).state('app.customer_orders.view.edit', {
            url: '/edit',
            data:{
                title:'Редактирование заказа',
                access:{
                    action:'edit',
                    params:'CustomerOrder'
                }
            },
            views:{
                "content@app":{
                    controller: 'EditCustomerOrder',
                    templateUrl: '/app/customer_orders/views/editCustomerOrder.html'
                }
            }
        }).state('app.customer_orders.view.logs', {
            url: '/logs',
            data:{
                title:'История заказа',
                access:{
                    action:'logs',
                    params:'CustomerOrder'
                }
            },
            views:{
                "content@app":{
                    controller: 'LogsCustomerOrderCtrl',
                    templateUrl: '/app/customer_orders/views/logsCustomerOrder.html'
                }
            }
        });
    }]);

    module.factory('customerOrdersNotifications', ['notificationServiceBuilder', 'funcFactory', function(nsb, funcFactory){
        var actions = {
            create: function(productsList, row){
                var data = row.data;
                productsList.push(data);
                funcFactory.showNotification("Добавлен продукт", data.product.name+' добавлен другим пользователем.',true);
            },
            update: function(productsList, row){
                var data = row.data;
                var ind = nsb.getIndexByProperty(productsList, data, 'id');
                if(ind>-1) productsList[ind] = data;
                funcFactory.showNotification("Обновлена инофрмация по продукту", data.product.name+' обновлен другим пользователем.',true);
            },
            destroy: function(productsList, row){
                var data = row.data;
                var ind = nsb.getIndexByProperty(productsList, data, 'id');
                if(ind>-1) productsList.splice(ind, 1);
                funcFactory.showNotification("Удален продукт", 'Продукт удален другим пользователем.');
            }
        };

        return nsb.build(module, 'customerOrdersNotifications', actions);
    }]);
}());
(function () {
    'use strict';

    var module = angular.module('app.dashboard', ['ui.router']);

    module.config(["$stateProvider", function ($stateProvider) {
        $stateProvider
            .state('app.dashboard', {
                url: '/dashboard',
                views: {
                    "content@app": {
                        controller: 'DashboardCtrl',
                        templateUrl: '/app/dashboard/views/dashboard.html'
                    }
                },
                data:{
                    title: 'Рабочий стол'
                }
            });
    }]);
}());
/**
 * Created by Egor Lobanov on 07.11.15.
 * Модуль страницы движения
 */
(function () {

    "use strict";

    var module = angular.module('app.dispatch_orders', ['ui.router']);

    module.config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state('app.dispatch_orders', {
            url: '/dispatch_orders?q',
            data:{
                title: 'Списания',
                access:{
                    action:'index',
                    params:'DispatchOrder'
                }
            },
            params:{
                q:''
            },
            views:{
                "content@app": {
                    controller: 'DispatchOrdersCtrl',
                    templateUrl: '/app/dispatch_orders/views/dispatch_orders.html'
                }
            }
        }).state('app.dispatch_orders.view', {
            url: '/:id',
            data:{
                title: 'Просмотр списания',
                access:{
                    action:'read',
                    params:'DispatchOrder'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewDispatchOrderCtrl',
                    templateUrl: '/app/dispatch_orders/views/viewDispatchOrder.html'
                }
            }
        });
    }]);
}());
/**
 * Created by Egor Lobanov on 07.11.15.
 * Модуль страницы заказов
 */
(function () {

    "use strict";

    var module = angular.module('app.incoming_transfers', ['ui.router']);

    module.config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state('app.incoming_transfers', {
            url: '/incoming_transfers?q',
            data:{
                title: 'Входящие платежи',
                access:{
                    action:'index',
                    params:'IncomingTransfer'
                }
            },
            params:{
                q:'',
                id:''
            },
            views:{
                "content@app": {
                    controller: 'IncomingTransfersCtrl',
                    templateUrl: '/app/incoming_transfers/views/transfers.html'
                }
            }
        }).state('app.incoming_transfers.view', {
            url: '/:id',
            data:{
                title: 'Просмотр входящего платежа',
                access:{
                    action:'read',
                    params:'IncomingTransfer'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewIncomingTransferCtrl',
                    templateUrl: '/app/incoming_transfers/views/viewIncomingTransfer.html'
                }
            }
        }).state('app.incoming_transfers.view.edit', {
            url: '/edit',
            data:{
                title:'Редактирование входящего платежа',
                access:{
                    action:'edit',
                    params:'IncomingTransfer'
                }
            },
            views:{
                "content@app":{
                    controller: 'EditIncomingTransferCtrl',
                    templateUrl: '/app/incoming_transfers/views/editIncomingTransfer.html'
                }
            }
        });
    }]);
}());
(function () {

    "use strict";

    var module = angular.module('app.layout', ['ui.router', 'app.templates']);

    module.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('app', {
                abstract: true,
                views: {
                    root: {
                        templateUrl: '/app/layout/layout.tpl.html'
                    }
                }
            });
        $urlRouterProvider.otherwise(function () {
            return !window.authorized ? '' : '/dashboard';
        });

    }]);

    module.controller('LayoutCtrl', ['$scope', '$state', 'serverApi', function($scope, $state, serverApi){
        var sc = $scope;
        sc.searchText = '';
        //выполняем поиск по клику на кнопку в топ меню
        sc.executeSearch = function(){
            $state.go('app.search', {searchString: sc.searchText, page:0});
        };

        sc.signOut = serverApi.signOut;
    }]);

    module.controller('LayoutNavigationCtrl', ['$scope', function(sc){
        sc.index = window.gon.index;
    }]);

    return module;
}());
/**
 * Created by Mikhail Arzhaev on 20.11.15.
 * Модуль страницы категорий товаров для каталога
 */

(function () {

    "use strict";
    var module = angular.module('app.manufacturers', ['ui.router']);

    module.config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state('app.manufacturers', {
            url: '/manufacturers?q',
            data:{
                title: 'Производители',
                access:{
                    action:'index',
                    params:'Manufacturers'
                }
            },
            params:{
              q:''
            },
            views:{
                "content@app": {
                    controller: 'ManufacturersCtrl',
                    templateUrl: '/app/manufacturers/views/manufacturers.html'
                }
            }
        }).state('app.manufacturers.view', {
            url: '/:id',
            data:{
                title: 'Просмотр производителя',
                access:{
                    action:'read',
                    params:'Manufacturers'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewManufacturerCtrl',
                    templateUrl: '/app/manufacturers/views/viewManufacturer.html'
                }
            }
        }).state('app.manufacturers.view.edit', {
            url: '/edit',
            data:{
                title:'Редактирование производителя',
                access:{
                    action:'edit',
                    params:'Manufacturer'
                }
            },
            views:{
                "content@app":{
                    controller: 'EditManufacturerCtrl',
                    templateUrl: '/app/manufacturers/views/editManufacturer.html'
                }
            }
        });
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 24.12.15.
 */

(function () {

    "use strict";
    var module = angular.module('app.news', ['ui.router']);

    module.config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state('app.news', {
            url: '/news?q',
            data:{
                title: 'Новости',
                access:{
                    action:'index',
                    params:'News'
                }
            },
            params:{
              q:''
            },
            views:{
                "content@app": {
                    controller: 'NewsCtrl',
                    templateUrl: '/app/news/views/news.html'
                }
            }
        });
    }]);
}());
/**
 * Created by Egor Lobanov on 07.11.15.
 * Модуль страницы заказов
 */
(function () {

    "use strict";

    var module = angular.module('app.outgoing_transfers', ['ui.router']);

    module.config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state('app.outgoing_transfers', {
            url: '/outgoing_transfers?q',
            data:{
                title: 'Исходящие платежи',
                access:{
                    action:'index',
                    params:'OutgoingTransfer'
                }
            },
            params:{
                q:''
            },
            views:{
                "content@app": {
                    controller: 'OutgoingTransfersCtrl',
                    templateUrl: '/app/outgoing_transfers/views/transfers.html'
                }
            }
        }).state('app.outgoing_transfers.view', {
            url: '/:id',
            data:{
                title: 'Просмотр исходящего платежа',
                access:{
                    action:'read',
                    params:'OutgoingTransfer'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewOutgoingTransferCtrl',
                    templateUrl: '/app/outgoing_transfers/views/viewOutgoingTransfer.html'
                }
            }
        }).state('app.outgoing_transfers.view.edit', {
            url: '/edit',
            data:{
                title:'Редактирование исходящего платежа',
                access:{
                    action:'edit',
                    params:'OutgoingTransfer'
                }
            },
            views:{
                "content@app":{
                    controller: 'EditOutgoingTransferCtrl',
                    templateUrl: '/app/outgoing_transfers/views/EditOutgoingTransfer.html'
                }
            }
        });
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 24.12.15.
 */

(function () {

    "use strict";
    var module = angular.module('app.pages', ['ui.router']);

    module.config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state('app.pages', {
            url: '/pages?q',
            data:{
                title: 'Статичные страницы',
                access:{
                    action:'index',
                    params:'Page'
                }
            },
            params:{
              q:''
            },
            views:{
                "content@app": {
                    controller: 'PagesCtrl',
                    templateUrl: '/app/pages/views/pages.html'
                }
            }
        }).state('app.pages.view', {
            url: '/:id',
            data:{
                access:{
                    action:'read',
                    params:'Page'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewPageCtrl',
                    templateUrl: '/app/pages/views/viewPage.html'
                }
            }
        }).state('app.pages.edit', {
            url: '/edit',
            data:{
                title: 'Изменить страницу',
                access:{
                    action:'edit',
                    params:'Page'
                }
            },
            params:{
              q:''
            },
            views:{
                "content@app": {
                    controller: 'EditPageCtrl',
                    templateUrl: '/app/pages/views/editPage.html'
                }
            }
        });
    }]);
}());
/**
 * Created by Egor Lobanov on 17.11.15.
 * Модуль страницы "Партнер"
 */
(function (){

    "use strict";

    var module = angular.module('app.partners', ['ui.router']);

    module.config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state('app.partners', {
            url: '/partners?q',
            data:{
                title: 'Партнёры',
                access:{
                    action:'index',
                    params:'Partner'
                }
            },
            params:{
              q:''
            },
            views:{
                "content@app": {
                    controller: 'PartnersCtrl',
                    templateUrl: '/app/partners/views/partners.html'
                }
            }
        }).state('app.partners.view', {
            url: '/:id',
            data:{
                access:{
                    action:'show',
                    params:'Partner'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewPartnerCtrl',
                    templateUrl: '/app/partners/views/showPartner.html'
                }
            }
        }).state('app.partners.view.edit', {
            url: '/edit',
            data:{
                title:'Редактирование партнёра',
                access:{
                    action:'edit',
                    params:'Partner'
                }
            },
            views:{
                "content@app":{
                    controller: 'EditPartnerCtrl',
                    templateUrl: '/app/partners/views/editPartner.html'
                }
            }
        });
    }]);

    module.filter('innKpp', function(){
       return function(inn, kpi){
           return inn && kpi ? inn.toString() + "/" + kpi.toString() : '';
       }
    });
}());
/**
 * Created by Mikhail Arzhaev on 20.11.15.
 * Модуль страницы категорий товаров для каталога
 */

(function () {

    "use strict";
    var module = angular.module('app.pdf_catalogues', ['ui.router']);

    module.config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state('app.pdf_catalogues', {
            url: '/pdf_catalogues?q',
            data:{
                title: 'PDF Каталоги',
                access:{
                    action:'index',
                    params:'pdf_catalogues'
                }
            },
            params:{
              q:''
            },
            views:{
                "content@app": {
                    controller: 'PdfCataloguesCtrl',
                    templateUrl: '/app/pdf_catalogues/views/pdf_catalogues.html'
                }
            }
        }).state('app.pdf_catalogues.view', {
            url: '/:id',
            data:{
                title: 'Просмотр производителя',
                access:{
                    action:'read',
                    params:'pdf_catalogues'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewPdfCatalogueCtrl',
                    templateUrl: '/app/pdf_catalogues/views/viewPdfCatalogue.html'
                }
            }
        });
    }]);
}());
/**
 * Created by Egor Lobanov on 09.12.15.
 */
(function (){

    "use strict";

    var module = angular.module('app.products', ['ui.router']);

    module.config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state('app.product', {
            url: '/products/:id',
            params: {
                id: ''
            },
            data:{
                title:'Продукт',
                access:{
                    action:'read',
                    params:'Product'
                }
            },
            views:{
                "content@app":{
                    controller: 'ProductCtrl',
                    templateUrl: '/app/products/views/show_product.html'
                }
            }
        }).state('app.product.edit', {
            url: '/edit',
            params: {
                id: ''
            },
            data:{
                title:'Редактирование продукта',
                access:{
                    action:'edit',
                    params:'Product'
                }
            },
            views:{
                "content@app":{
                    controller: 'EditProductCtrl',
                    templateUrl: '/app/products/views/edit_product.html'
                }
            }
        }).state('app.product.partner_logs', {
            url: '/partner_logs',
            params: {
                id: ''
            },
            data:{
                title:'История товара',
                access:{
                    action:'read',
                    params:'PartnerLog'
                }
            },
            views:{
                "content@app":{
                    controller: 'PartnerLogsProductCtrl',
                    templateUrl: '/app/products/views/partner_logs.html'
                }
            }
        }).state('app.product.supplier_infos', {
            url: '/supplier_infos',
            params: {
                id: ''
            },
            data:{
                title:'История товара',
                access:{
                    action:'supplier_infos',
                    params:'Product'
                }
            },
            views:{
                "content@app":{
                    controller: 'SupplierInfosProductCtrl',
                    templateUrl: '/app/products/views/supplier_infos.html'
                }
            }
        });
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 26.11.15.
 * Модуль страницы движения
 */
(function () {

    "use strict";

    var module = angular.module('app.receive_orders', ['ui.router']);

    module.config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state('app.receive_orders', {
            url: '/receive_orders?q',
            data:{
                title: 'Поступление',
                access:{
                    action:'index',
                    params:'ReceiveOrder'
                }
            },
            params:{
                q:''
            },
            views:{
                "content@app": {
                    controller: 'ReceiveOrdersCtrl',
                    templateUrl: '/app/receive_orders/views/receive_orders.html'
                }
            }
        }).state('app.receive_orders.view', {
            url: '/:id',
            data:{
                title: 'Просмотр поступления',
                access:{
                    action:'read',
                    params:'ReceiveOrder'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewReceiveOrderCtrl',
                    templateUrl: '/app/receive_orders/views/viewReceiveOrder.html'
                }
            }
        }).state('app.receive_orders.view.edit', {
            url:'/edit',
            data:{
                title: 'Редактирование поступления',
                access:{
                    action:'edit',
                    params:'ReceiveOrder'
                }
            },
            views:{
                "content@app":{
                    controller: 'EditReceiveOrderCtrl',
                    templateUrl: '/app/receive_orders/views/editReceiveOrder.html'
                }
            }
        });
    }]);
}());
/**
 * Created by Egor Lobanov on 02.11.15.
 * Модуль поиска продуктов включает в себя маршруты к странице поиска
 * и странице просмотра продукта.
 */
(function () {

    "use strict";

    var module = angular.module('app.search', ['ui.router']);

    module.config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state('app.search', {
            url:'/search=*searchString',
            params: {
                searchString:''
            },
            data: {
                title: 'Поиск'
            },
            views:{
                "content@app": {
                    controller: 'TopSearchCtrl',
                    templateUrl: '/app/search/views/search.html'
                }
            }
        });
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 19.11.15.
 * Модуль страницы заказов постащикам
 */

(function () {

    "use strict";
    var module = angular.module('app.supplier_orders', ['ui.router', 'easypiechart']);

    module.config(["$stateProvider", function ($stateProvider) {
        $stateProvider.state('app.supplier_orders', {
            url: '/supplier_orders?q',
            data:{
                title: 'Заказы поставщикам',
                access:{
                    action:'index',
                    params:'SupplierOrder'
                }
            },
            params:{
              q:''
            },
            views:{
                "content@app": {
                    controller: 'SupplierOrdersCtrl',
                    templateUrl: '/app/supplier_orders/views/supplierOrders.html'
                }
            }
        }).state('app.supplier_orders.view', {
            url: '/:id',
            data:{
                title: 'Просмотр заказа',
                access:{
                    action:'read',
                    params:'SupplierOrder'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewSupplierOrderCtrl',
                    templateUrl: '/app/supplier_orders/views/viewSupplierOrder.html'
                }
            }
        }).state('app.supplier_orders.view.edit', {
            url: '/edit',
            data:{
                title:'Редактирование заказа',
                access:{
                    action:'write',
                    params:'SupplierOrder'
                }
            },
            views:{
                "content@app":{
                    controller: 'EditSupplierOrderCtrl',
                    templateUrl: '/app/supplier_orders/views/editSupplierOrder.html'
                }
            }
        });
    }]);
}());
(function () {

    'use strict';

    angular.module('app.layout').factory('User', ["$http", "$q", function ($http, $q) {
        var dfd = $q.defer();

        var UserModel = {
            dfd: dfd,
            initialized: dfd.promise,
            username: 'Пользователь',
            picture: '/assets/smart_admin/avatars/male.png'
        };

        return UserModel;
    }]);
}());

(function(){
    "use strict";

    angular.module('app.layout').directive('loginInfo', ["User", function(User){

        return {
            restrict: 'A',
            templateUrl: '/app/auth/directives/login-info.tpl.html',
            link: function(scope){
                User.initialized.then(function(){
                    scope.user = User;
                });
            }
        }
    }]);
}());

/**
 * Created by Egor Lobanov on 19.11.15.
 */
(function(){

    "use strict";

    var module = angular.module('app.templates',[]);

    module.run(['$templateCache', function($templateCache){

        $templateCache.put('ordersFilter.tmpl.html',
            '<div class="smart-form col-xs-12 col-md-6 col-lg-5 no-padding">'+
                '<section>'+
                    '<label class="label">Запрос</label>'+
                    '<label class="input">'+
                        '<input type="text" ng-model="searchQuery" placeholder="Введите часть номера" class="input-sm" ng-keypress="exeSearch($event)">'+
                    '</label>'+
                '</section>'+
            '</div>'+
            '<button class="btn btn-primary un-float margin-bottom-10" ng-click="exeSearch()">'+
                '<i class="fa fa-search"></i> Поиск'+
            '</button>'
        );

        $templateCache.put('formNavButtons.tmpl.html',
            '<div ng-repeat="item in buttons track by $index" ng-if="item.hasOwnProperty(\'disabled\') || !item.role || role[item.role] === true" ng-disabled="item.disabled" ng-class="item.class" ng-click="buttonClick(item)">'+
                '<i class="fa fa-{{item.ico}}"></i><span class="hidden-xs">{{item.name}}</span>'+
            '</div>'
        );
    }]);
}());

(function () {

    "use strict";

    angular.module('app.layout').directive('fullScreen', function(){
        return {
            restrict: 'A',
            link: function(scope, element){
                var $body = $('body');
                var toggleFullSceen = function(e){
                    if (!$body.hasClass("full-screen")) {
                        $body.addClass("full-screen");
                        if (document.documentElement.requestFullscreen) {
                            document.documentElement.requestFullscreen();
                        } else if (document.documentElement.mozRequestFullScreen) {
                            document.documentElement.mozRequestFullScreen();
                        } else if (document.documentElement.webkitRequestFullscreen) {
                            document.documentElement.webkitRequestFullscreen();
                        } else if (document.documentElement.msRequestFullscreen) {
                            document.documentElement.msRequestFullscreen();
                        }
                    } else {
                        $body.removeClass("full-screen");
                        if (document.exitFullscreen) {
                            document.exitFullscreen();
                        } else if (document.mozCancelFullScreen) {
                            document.mozCancelFullScreen();
                        } else if (document.webkitExitFullscreen) {
                            document.webkitExitFullscreen();
                        }
                    }
                };

                element.on('click', toggleFullSceen);

            }
        }
    });
}());

(function () {
    "use strict";

    angular.module('app.layout').directive('minifyMenu', function(){
        return {
            restrict: 'A',
            link: function(scope, element){
                    var $body = $('body');
                var minifyMenu = function() {
                    if (!$body.hasClass("menu-on-top")) {
                        $body.toggleClass("minified");
                        $body.removeClass("hidden-menu");
                        $('html').removeClass("hidden-menu-mobile-lock");
                    }
                };

                element.on('click', minifyMenu);
            }
        }
    })

}());

(function () {

    'use strict';

    angular.module('app.layout').directive('reloadState', ["$rootScope", function ($rootScope) {
        return {
            restrict: 'A',
            compile: function (tElement, tAttributes) {
                tElement.removeAttr('reload-state data-reload-state');
                tElement.on('click', function (e) {
                    $rootScope.$state.transitionTo($rootScope.$state.current, $rootScope.$stateParams, {
                        reload: true,
                        inherit: false,
                        notify: true
                    });
                    e.preventDefault();
                })
            }
        }
    }]);
}());

(function () {

    "use strict";

    angular.module('app.layout').directive('resetWidgets', ["$state", function($state){

        return {
            restrict: 'A',
            link: function(scope, element){
                element.on('click', function(){
                    $.SmartMessageBox({
                        title : "<i class='fa fa-refresh' style='color:green'></i> Clear Local Storage",
                        content : "Would you like to RESET all your saved widgets and clear LocalStorage?1",
                        buttons : '[No][Yes]'
                    }, function(ButtonPressed) {
                        if (ButtonPressed == "Yes" && localStorage) {
                            localStorage.clear();
                            location.reload()
                        }
                    });

                });
            }
        }

    }])

}());

(function () {

    'use strict';

    angular.module('app.layout').directive('searchMobile', function () {
        return {
            restrict: 'A',
            compile: function (element, attributes) {
                element.removeAttr('search-mobile data-search-mobile');

                element.on('click', function (e) {
                    $('body').addClass('search-mobile');
                    e.preventDefault();
                });

                $('#cancel-search-js').on('click', function (e) {
                    $('body').removeClass('search-mobile');
                    e.preventDefault();
                });
            }
        }
    });
}());

(function () {
    "use strict";

    angular.module('app.layout').directive('toggleMenu', function(){
        return {
            restrict: 'A',
            link: function(scope, element){
                var $body = $('body');

                var toggleMenu = function(){
                    if (!$body.hasClass("menu-on-top")){
                        $('html').toggleClass("hidden-menu-mobile-lock");
                        $body.toggleClass("hidden-menu");
                        $body.removeClass("minified");
                    } else if ( $body.hasClass("menu-on-top") && $body.hasClass("mobile-view-activated") ) {
                        $('html').toggleClass("hidden-menu-mobile-lock");
                        $body.toggleClass("hidden-menu");
                        $body.removeClass("minified");
                    }
                };

                element.on('click', toggleMenu);

                scope.$on('requestToggleMenu', function(){
                    toggleMenu();
                });
            }
        }
    })

}());

/**
 * Created by Egor Lobanov on 28.11.15.
 * App filters
 */
(function(){

    var module = angular.module('app.layout');

    module.directive('modelFilter', ['$filter', function($filter){
        return {
            restrict:'A',
            require:'ngModel',
            link:function(scope, element, attrs, c){
                var params = {};

                scope.$watch(attrs.modelFilter, function(value){
                    params = value;
                }, true);

                scope.$watch(attrs.ngModel, function(value, oldValue){
                    if(value !== oldValue) {
                        c.$setViewValue($filter(attrs.filterName)(value, params));
                        c.$render();
                    }
                });
            }
        }
    }]);

    module.filter('price_net', function(){
        return function(item, multiplier){
            var value = 0;
            if(item.hasOwnProperty('price')){
                value = item.price * (item.hasOwnProperty('discount') ?  (1 - item.discount/100) : 1);
                if(multiplier>=0) value*=multiplier;
            }
            return value;
        };
    });

    module.filter('te_number', function(){
        return function(value, params){
            var strValue = (value || '').toString(),
                typeIsNumber = params.hasOwnProperty('number');
            if(strValue === '' || (typeIsNumber && strValue.indexOf('.')==strValue.length-1 || typeIsNumber && strValue[strValue.length-1] == '0'))
                return value;
            var v  = (params.hasOwnProperty('number') ? parseFloat : parseInt)(value || 0) || 0;
            if(params.hasOwnProperty('min') && v<params.min) return params.min;
            if(params.hasOwnProperty('max') && v>params.max) return params.max;
            return v;
        }
    });
}());
/**
 * Created by Egor Lobanov on 05.12.15.
 */
(function(){

    var module = angular.module('app.layout');

    module.service('funcFactory', function(){
       this.showNotification = function(title, content, succes){
           var c = !succes && typeof content === 'object' ? Object.keys(content).map(function(item){
               return item + ' ' + content[item];
           }).join('\n') : content;
           $.smallBox({
               title: title,
               iconSmall: "fa fa-check fa-2x fadeInRight animated",
               content: '<i class="fa fa-edit"></i> <i>' + c + '</i>',
               color: succes ? '#739E73' : '#C46A69',
               timeout: 4000
           })
       };

       this.setPageTitle = function(title){
           angular.element('html head title').text(title);
       };

       this.getPercent = function(value, total){
           return ((value/total*100) || 0).toFixed(0);
       };

       this.getTinymceOptions = function(){
           return {
               plugins : 'advlist autolink link image lists charmap preview textcolor colorpicker code',
               toolbar1: 'insertfile undo redo | preview code | styleselect | bold italic | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
               language: 'ru',
               menubar:false
           };
       };
    });

    /**
     * Service send requests to server and return response into callback function
     */
    module.service('serverApi', [ '$http', function($http){

        //get data of two dashboard tables
        this.getDashboard = function(success, fail){
            $http.get('/back/dashboard').then(success, fail);
        };

        //get current list of searched data
        this.getSearch = function(page, query, config, success, fail){
            var encoded = encodeURIComponent(query);
            $http.get('/admin/search.json?term='+encoded+'&$skip='+(page*25)+'&$top=25', config || null).then(success, fail);
        };

        // get product info
        this.getProduct = function(id, success, fail){
            $http.get('/api/products/'+id +'.json').then(success, fail);
        };
        this.updateProduct = function(id, data, success, fail){
            $http.patch('/api/products/' + id, data).then(success, fail);
        };
        this.getProductPartnerLogs = function(id, success, fail){
            $http.get('/api/products/'+id +'/partner_logs.json').then(success, fail);
        };
        this.deleteProductPartnerLog = function(product_id, log_id, success, fail){
            $http.delete('/api/products/'+product_id+'/partner_logs/' + log_id).then(success, fail);
        };
        this.getProductSupplierInfos = function(id, success, fail){
            $http.get('/api/products/'+id +'/supplier_infos.json').then(success, fail);
        };

        //Customer Orders
        this.getCustomerOrders = function(page, query, config, success, fail){
            var path = '/api/customer_orders?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.createCustomerOrder = function(data, success, fail){
            $http.post('/api/customer_orders', data).then(success, fail);
        };
        this.deleteCustomerOrder = function(order_id, success, fail){
            $http.delete('/api/customer_orders/' + order_id).then(success, fail)
        };
        this.getCustomerOrderDetails = function(id, success, fail){
            $http.get('/api/customer_orders/' + id).then(success, fail);
        };
        this.updateCustomerOrder = function(id, data, success, fail){
            $http.put('/api/customer_orders/' + id, data).then(success, fail);
        };
        this.addCustomerOrderProduct = function(id, data, success, fail){
            $http.post('/api/customer_orders/'+id+'/customer_order_contents', data).then(success, fail);
        };
        this.updateCustomerOrderProduct = function(order_id, product_id, data, success, fail){
            $http.put('/api/customer_orders/'+order_id+'/customer_order_contents/' + product_id, data).then(success, fail);
        };
        this.removeCustomerOrderProduct = function(order_id, product_id, success, fail){
            $http.delete('/api/customer_orders/'+order_id+'/customer_order_contents/' + product_id).then(success);
        };
        this.getCustomerOrderLogs = function(id, success, fail){
            $http.get('/api/customer_orders/' + id + '/logs').then(success, fail);
        };
        this.sendCustomerOrderInvoice = function(id, success, fail){
            $http.put('/api/customer_orders/' + id + '/send_invoice').then(success, fail);
        };
        this.recalculateCustomerOrder = function(id, success, fail){
            $http.get('/api/customer_orders/' + id + '/recalculate').then(success, fail);
        };
        this.updateStatusCustomerOrder = function(id, data, success, fail){
            $http.put('/api/customer_orders/' + id + '/update_status', data).then(success, fail);
        };
        this.updateCommandCustomerOrder = function(id, data, success, fail){
            $http.put('/api/customer_orders/' + id + '/update_command', data).then(success, fail);
        };

        // Supplier Orders
        this.getSupplierOrders = function(page, query, config, success, fail){
            var path = '/api/supplier_orders?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.createSupplierOrder = function(data, success, fail){
            $http.post('/api/supplier_orders', data).then(success, fail);
        };
        this.deleteSupplierOrder = function(id, success, fail){
            $http.delete('/api/supplier_orders/'+id).then(success, fail);
        };
        this.getSupplierOrderDetails = function(id, success, fail){
            $http.get('/api/supplier_orders/' + id).then(success, fail);
        };
        this.updateSupplierOrder = function(id, data, success, fail){
            $http.put('/api/supplier_orders/' + id, data).then(success, fail);
        };
        this.addSupplierOrderProduct = function(id, data, success, fail){
            $http.post('/api/supplier_orders/'+id+'/supplier_order_contents', data).then(success, fail);
        };
        this.updateSupplierOrderProduct = function(order_id, product_id, data, success, fail){
            $http.put('/api/supplier_orders/'+order_id+'/supplier_order_contents/' + product_id, data).then(success, fail);
        };
        this.removeSupplierOrderProduct = function(order_id, product_id, success, fail){
            $http.delete('/api/supplier_orders/'+order_id+'/supplier_order_contents/' + product_id).then(success);
        };
        this.automaticallyCreateSupplierOrders = function(success, fail){
            $http.post('/api/supplier_orders/mass_make').then(success, fail);
        };
        this.updateStatusSupplierOrder = function(id, data, success, fail){
            $http.put('/api/supplier_orders/' + id + '/update_status', data).then(success, fail);
        };
//        this.createSupplierOrderContent = function(id, data, success, fail){
//            $http.put('/api/supplier_orders/' + id + '/supplier_order_contents', data).then(success, fail);
//        };

        // Products' catalogues
        this.getCatalogues = function(page, query, config, success, fail){
            var path = '/api/catalogues?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.getCatalogueDetails = function(id, success, fail){
            $http.get('/api/catalogues/' + id).then(success, fail);
        };
        this.updateCatalogue = function(id, data, success, fail){
            $http.put('/api/catalogues/' + id, data).then(success, fail);
        };
        this.deleteCatalogue = function(id, success, fail){
            $http.delete('/api/catalogues/' + id).then(success, fail)
        };

        // Manufacturers
        this.getManufacturers = function(page, query, config, success, fail){
            var path = '/api/manufacturers?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.getManufacturerDetails = function(id, success, fail){
            $http.get('/api/manufacturers/' + id).then(success, fail);
        };
        this.updateManufacturer = function(id, data, success, fail){
            $http.put('/api/manufacturers/' + id, data).then(success, fail);
        };
        this.deleteManufacturer = function(id, success, fail){
            $http.delete('/api/manufacturers/' + id).then(success, fail)
        };

        // PDF Catalogues
        this.getPdfCatalogues = function(page,query, config, success, fail){
            var path = '/api/pdf_catalogues?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.getPdfCatalogueDetails = function(id, success, fail){
            $http.get('/api/pdf_catalogues/' + id).then(success, fail);
        };
        this.deletePdfCatalogue = function(id, success, fail){
            $http.delete('/api/pdf_catalogues/' + id).then(success, fail);
        };

        // Входящие платежи
        this.getIncomingTransfers = function(page, query, config, success, fail){
            var path = '/api/incoming_transfers?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.createIncomingTransfer = function(data, success, fail){
            $http.post('/api/incoming_transfers', data).then(success, fail);
        };
        this.getIncomingTransferDetails = function(id, success, fail){
            $http.get('/api/incoming_transfers/' + id).then(success, fail);
        };
        this.appendIncomingTransferOrder = function(incoming_transfer_id, data, success, fail){
            $http.post('/api/incoming_transfers/'+incoming_transfer_id+'/money_to_orders', data).then(success, fail);
        };
        this.removeIncomingTransferOrder = function(incoming_transfer_id, order_id, success, fail){
            $http.delete('/api/incoming_transfers/'+incoming_transfer_id+'/money_to_orders/' + order_id).then(success, fail);
        };
        this.deleteIncomingTransfer = function(transfer_id, success, fail){
            $http.delete('/api/incoming_transfers/' + transfer_id).then(success, fail);
        };

        // Исходящие платежи
        this.getOutgoingTransfers = function(page, query, config, success, fail){
            var path = '/api/outgoing_transfers?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.createOutgoingTransfer = function(data, success, fail){
            $http.post('/api/outgoing_transfers', data).then(success, fail);
        };
        this.getOutgoingTransferDetails = function(id, success, fail){
            $http.get('/api/outgoing_transfers/' + id).then(success, fail);
        };
        this.appendOutgoingTransferOrder = function(outgoing_transfer_id, data, success, fail){
            $http.post('/api/outgoing_transfers/'+outgoing_transfer_id+'/outgoing_money_distributions', data).then(success, fail);
        };
        this.removeOutgoingTransferOrder = function(outgoing_transfer_id, order_id, success, fail){
            $http.delete('/api/outgoing_transfers/'+outgoing_transfer_id+'/outgoing_money_distributions/' + order_id).then(success, fail);
        };
        this.deleteOutgoingTransfer = function(transfer_id, success, fail){
            $http.delete('/api/outgoing_transfers/' + transfer_id).then(success, fail);
        };

        // Партнёры
        this.getPartners = function(page, query, config, success, fail){
            var path = '/api/partners?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.getPartnerDetails = function(id, success, fail){
            $http.get('/api/partners/' + id).then(success, fail);
        };
        this.updatePartner = function(id, data, success, fail){
            $http.put('/api/partners/' + id, data).then(success, fail);
        };
        this.createPartner = function(data, success, fail){
            $http.post('/api/partners/', data).then(success, fail);
        };

        // Представители партнёра
        this.createPerson = function(partner_id, data, success, fail){
            $http.post('/api/partners/' + partner_id + '/people', data).then(success, fail);
        };

        // Контакты
        this.getContacts = function(page, query, config, success, fail){
            var path = '/api/contacts?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.createContact = function(data, success, fail){
            $http.post('/api/contacts', data).then(success, fail);
        };
        this.getContactDetails = function(id, success, fail){
            $http.get('/api/contacts/' + id).then(success, fail);
        };
        this.updateContact = function(id, data, success, fail){
            $http.put('/api/contacts/' + id, data).then(success, fail);
        };

        // DispatchOrder
        this.getDispatchOrders = function(page, query, config, success, fail){
            var path = '/api/dispatch_orders?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.getDispatchOrderDetails = function(id, success, fail){
            $http.get('/api/dispatch_orders/' + id).then(success, fail);
        };
        this.updateDispatchOrder = function(id, data, success, fail){
            $http.put('/api/dispatch_orders/' + id, data).then(success, fail);
        };
        this.updateStatusDispatchOrder = function(id, data, success, fail){
            $http.put('/api/dispatch_orders/' + id + '/update_status', data).then(success, fail);
        };

        // ReceiveOrder
        this.getReceiveOrders = function(page, query, config, success, fail){
            var path = '/api/receive_orders?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.createReceiveOrder = function(data, success, fail){
            $http.post('/api/receive_orders/', data).then(success, fail);
        };
        this.getReceiveOrderDetails = function(id, success, fail){
            $http.get('/api/receive_orders/' + id).then(success, fail);
        };
        this.updateReceiveOrder = function(id, data, success, fail){
            $http.put('/api/receive_orders/' + id, data).then(success, fail);
        };
        this.getUnreceivedProducts = function(receive_order_id, query, config, success, fail){
            $http.get('/api/receive_orders/'+receive_order_id+'/unreceived_products?q=' + query, config).then(success, fail);
        };
        this.createReceiveOrderContents = function(receive_order_id, data, success, fail){
            $http.post('/api/receive_orders/'+receive_order_id+'/product_order_contents', data).then(success, fail);
        };
        this.updateReceiveOrderContents = function(receive_order_id, content_id, data, success, fail){
            $http.put('/api/receive_orders/'+receive_order_id+'/product_order_contents/'+content_id, data).then(success, fail);
        };
        this.deleteReceiveOrderContents = function(receive_order_id, content_id, success, fail){
            $http.delete('/api/receive_orders/'+receive_order_id+'/product_order_contents/' + content_id).then(success, fail)
        };
        this.deleteReceiveOrder = function(receive_order_id, success, fail){
            $http.delete('/api/receive_orders/' + receive_order_id).then(success, fail);
        };

        //Lead time
        this.getLeadTime = function(id, quantity, success, fail){
            var path = '/api/products/'+id+'/lead_time?quantity='+quantity;
            $http.get(path).then(success, fail);
        };
        //Files
        this.deleteFile = function(view, view_id, file_id, success, fail){
            $http.delete('/api/'+view+'/'+view_id+'/documents/' + file_id).then(success, fail);
        };
        this.deleteImage = function(view, view_id, file_id, success, fail){
            $http.delete('/api/'+view+'/'+view_id+'/image').then(success, fail);
        };

        // Pages
        this.getPages = function(page, query, config, success, fail){
            var path = '/api/pages?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.getPageDetails = function(id, success, fail){
            $http.get('/api/pages/' + id).then(success, fail);
        };

        // Articles
        this.getArticles = function(page, query, config, success, fail){
            var path = '/api/articles?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };

        // News
        this.getNews = function(page, query, config, success, fail){
            var path = '/api/news?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };

        this.signOut = function(){
            $http.delete('/users/sign_out').then(function(){
                window.location.reload();
            });
        };
        this.signIn = function(data, success, fail){
            $http.post('/users/sign_in', data).then(success, fail);
        };
        this.resetPassword = function(data, success, fail){
            $http.post('/users/password', data).then(success, fail);
        };
        this.getAbilities = function(success, fail){
            $http.get('/api/system_info').then(success, fail);
        };
    }]);

    module.factory('Abilities', ['serverApi', '$q', '$state', 'CanCan', 'User', function(serverApi, $q, $state, CanCan, User){
        var dfd = $q.defer(),
            s,
            p;

        var o = {
            get ready () {
                return dfd.promise;
            }
        };

        window.gon && setUserInfo();

        o.getGon = function(stateName, params){
            s = stateName;
            p = params;
            getInfo();
        };

        var getInfo = function(){
            serverApi.getAbilities(function(result){
                window.gon = result.data;
                CanCan.getAbility(window.gon);
                setUserInfo();
                dfd.resolve();
                $state.go(s, p);
            });
            getInfo = angular.noop;
        };

        function setUserInfo(){
            User.username = window.gon.user.first_name + ' ' +window.gon.user.last_name;
            User.dfd.resolve();
        }
        return o;
    }]);

    /**
     * Subscribe to Rails Websocket server channels
     */
    module.service('CableApi', ['Abilities', function(Abilities) {
        var _this = this;

        window.gon ? getConsumer() : Abilities.ready.then(function(){
            getConsumer();
        });

        this.subscribe = function(channel, callbacks) {
            return _this.consumer.subscriptions.create(channel, callbacks);
        };

        function getConsumer (){
            _this.consumer = new Cable.Consumer(window.gon.websocket_url);
        }
    }]);
}());

(function () {

    'use strict';

    angular.module('app.layout').directive('bigBreadcrumbs', function () {
        return {
            restrict: 'E',
            replace: true,
            template: '<div><h1 class="page-title txt-color-blueDark"></h1></div>',
            scope: {
                items: '=',
                icon: '@'
            },
            link: function (scope, element) {
                var first = _.first(scope.items);

                var icon = scope.icon || 'home';
                element.find('h1').append('<i class="fa-fw fa fa-' + icon + '"></i> ' + first);
                _.rest(scope.items).forEach(function (item) {
                    element.find('h1').append(' <span>> ' + item + '</span>')
                })
            }
        }
    });
}());

/** 
 * Created by Sergey Baev on 06.12.15.
 * Execute an angular expression when we click out of the current element
 */
(function(){
    angular.module('app.layout').directive('clickOut', ['$window', '$parse', function ($window, $parse) {
        return {
          restrict: 'A',
          link: function (scope, element, attrs) {
            var clickOutHandler = $parse(attrs.clickOut);

              function handleClick(event) {
                  if (element[0].contains(event.target) || event.target.contains(element[0]) || !$window.document.contains(event.target))
                      return;

                  clickOutHandler(scope, {$event: event});
                  !scope.$$phase && scope.$apply();
              }

            var w = angular.element($window).on('click', handleClick);

            scope.$on('$destroy', function(){
                w.off('click', handleClick);
            });
          }
        };
    }]);
}());
(function () {

    'use strict';

    angular.module('app.layout').directive('dismisser', function () {
        return {
            restrict: 'A',
            compile: function (element) {
                element.removeAttr('dismisser data-dissmiser')
                var closer = '<button class="close">&times;</button>';
                element.prepend(closer);
                element.on('click', '>button.close', function(){
                    element.fadeOut('fast',function(){ $(this).remove(); });

                })
            }
        }
    });
});

/**
 * Created by Egor Lobanov on 10.01.16.
 */
(function(){

    angular.module('app.layout').directive('fileInput', [
            '$parse',
            function ($parse) {
                return {
                    restrict: 'A',
                    link: function(scope, element, attrs) {

                        var handler = $parse(attrs.fileInput)(scope),
                            isModel = typeof handler !== 'function';

                        element.bind('change', function(){

                            scope.$apply(function(){
                                var files = element[0].files;
                                if(!attrs.multiple) files = files[0];
                                returnFile(files);
                            });
                        });

                        function returnFile(files){
                            isModel ? handler.assign(scope, files) : handler(files);
                        }

                        scope.$on('$destroy', function(){
                            element.unbind();
                        });
                    }
                };
            }
        ]);
}());
/**
 * Created by Egor Lobanov on 11.12.15.
 * UI that give user ability to work with attached files
 * trigger - function that will be called when user click button to show worker modal
 * config - fileWorker options object, include dropzoneConfig property
 * dropzoneConfig - object with dropzone options that should overwrite fileWorker standard options
 */
(function(){
    angular.module('app.layout').directive('fileWorker', ['funcFactory', 'CanCan', function(funcFactory, CanCan){
        return {
            restrict:'E',
            scope:{
                trigger: '=',
                config: '='
            },
            link: function(scope, element){
                var modal = element.find('.modal'),
                    _drop = modal.find('div[smart-dropzone]')[0],//dropzone element
                    _value, //config value
                    _isConfigured = false;
                var canDestroy = CanCan.can('destroy', 'Attachments::Document'); // check, can user remove file

                scope.fullQueue = false; // show upload button or not

                /**
                 * Load list of files from server
                 * @param config - value of config
                 * @param dropzone - dropzone object
                 */
                function loadFilesList(config){
                    //get files list
                    config.hasOwnProperty('r_get') ?
                    config.r_get(config.view, config.id, function(result){
                        !result.data.errors && addFilesToList(result.data)
                    }) : addFilesToList(config.files);
                }

                function addFilesToList (files){
                    var dropzone = _drop.dropzone;
                    dropzone.removeAllFiles(true);//clear files list
                    if(angular.isArray(files)){
                        var serverFiles = files.map(function(item){
                            if(item !== null && typeof item === 'object'){
                                var mockFile = { name: item.title, size: item.file_size, id:item.id};
                                dropzone.emit("addedfile", mockFile);
                                dropzone.emit("thumbnail", mockFile, '/uploads/'+ item.id + '/preview' + cutExtension(item.title).extension);
                                return mockFile;
                            }
                        });
                        dropzone.serverFiles = serverFiles;
                    }
                }

                /**
                 * create custom controls for  previewElement
                 * @param file
                 */
                function createControls(file){
                    var template = $(file.previewElement);
                    var titleSpan = template.find('span[data-dz-name]')[file.id ? 'show' : 'hide'](); // get name span and check display it or not

                    if(file.id){//if file uploaded
                        var dLink = '/uploads/'+ file.id + '/original' + cutExtension(file.name).extension; // create download link
                        var button =$('<a/>', {class:'dz-download', href:dLink, text:'Скачать', download:file.name});
                        template.find('.dz-filename-input').remove();
                        template.find('.dz-error-message').after(button);
                        template.find('[data-dz-name]').attr('title', file.name);
                    }else{// if file not yet uploaded
                        var filename = template.find('.dz-filename'),
                            f = cutExtension(file.title = titleSpan.text()); // split file name and extension, set file name to file.title
                        //text area to give user ability change file name
                        var input = $('<textarea>', {type:'text', placeholder:'Имя файла', class:'form-control dz-filename-input', val: f.name}).on('change', function(){
                            titleSpan.text(file.title = (input.val() + f.extension));// set file title on change
                        });
                        filename.append(input);
                        scope.fullQueue = true; // show upload button
                        !scope.$$phase && scope.$apply(angular.noop);
                    }
                }

                /**
                 * split - fileName on name and extension
                 * @param fileName - file name with extension
                 * @returns {{name: (string|*), extension: (string|*)}}
                 */
                function cutExtension(fileName){
                    var index = fileName.lastIndexOf('.'),
                        e = index>-1 ? fileName.substring(index, fileName.length) : '',
                        n = fileName.substring(0, index);
                    return {name: n, extension: e};
                }

                /**
                 * check if QueuedFiles && UploadingFiles queues are empty
                 */
                function checkUploadQueue(){
                    var d= _drop.dropzone;
                    if(d.getQueuedFiles().length ==0 && d.getUploadingFiles().length == 0){
                        scope.fullQueue = false;
                        !scope.$$phase && scope.$apply(angular.noop);
                    }
                }

                /**
                 *  click on upload button
                 */
                scope.uploadFiles = function(){
                    _drop.dropzone.processQueue();
                };

                /**
                 * show fileWorker modal && start initial load of file list
                 */
                scope.trigger = function(){
                    modal.modal('show');
                    //first time when user opens modal window and dropzone options are seted, load file list;
                    if(_isConfigured) {
                        loadFilesList(_value, _drop.dropzone);
                        _isConfigured = false;
                    }
                };



                /**
                 * watch config changes and create option object for dropzone
                 */
                scope.$watch('config', function(value){
                    if(value){
                        _value = value;
                        _isConfigured = true;

                        var config = {
                            url: value.url,
                            addRemoveLinks: canDestroy,
                            autoProcessQueue:false,
                            acceptedFiles: '.jpg,.jpeg,.png,.gif,.txt,.doc,.docx,.odt,.xls,.xlsx,.ods,.csv,.ppt,.pptx,.odp',
                            init : d_init,
                            complete : d_complete,
                            sending : d_sending,
                            accept: d_accept
                        };

                        var dc = value.dropzoneConfig;
                        if(dc && typeof dc === 'object') config = angular.extend(config, dc);
                        scope.options = config;//set option property
                    }
                });

                /**
                 * dropzone custom init
                 * @param value - user config
                 */
                function d_init (){
                    var dropzone = this;

                    dropzone.cutExtension = cutExtension;

                    canDestroy && dropzone.on('removedfile', function(file){
                        file.id && _value.r_delete(_value.view, _value.id, file.id, function(result){
                            result.data.errors && funcFactory.showNotification('Не удалось удалить файл ' + file.name, result.data.errors);
                        });
                        checkUploadQueue();
                    });

                    dropzone.on('addedfile', createControls);

                    dropzone.on('queuecomplete', checkUploadQueue);

                    _value.hasOwnProperty('init') && _value.init.bind(this)();
                }

                function d_complete(file){
                    if(file.xhr){
                        var data;
                        try{
                            data = JSON.parse(file.xhr.response); // parse response string
                        }catch(e){
                            data = {};
                            console.log(e);
                        }finally{
                            if(data.id && !data.errors){
                                file.id = data.id; // append id to file
                                createControls(file);
                            }else {
                                this.removeFile(file); // remove file from list if error
                                funcFactory.showNotification('Не удалось загрузить файл: ' + file.title, (data.errors || {}));
                            }

                            _value.hasOwnProperty('complete') && _value.complete.bind(this)(file);
                        }
                    }
                }

                function d_sending(file, xhr, formData){
                    //append title to formData before send
                    formData.append("title", file.title);
                    _value.hasOwnProperty('sending') && _value.sending.bind(this)(file, xhr, formData);
                }

                function d_accept(file, done){
                    var c = _value.filesCount;

                    if(c){
                        if(this.getQueuedFiles().length<c){
                            done()
                        }else {
                            done('Можно добавить только один файл');
                            this.removeFile(file);
                        }
                    }else done();
                }
            },
            templateUrl: '/assets/admin/app/layout/partials/fileWorker.html'
        }
    }]);
}());

/**
 * Created by Egor Lobanov on 08.11.15.
 * Директива создающая кнопки навигации на основе прав пользователя и наличия тех или иных кнопок на странице
 */
(function(){

    'use strict';

    angular.module('app.layout').directive('formNavButtons', ['$templateCache', function($templateCache){
        return {
            restrict: 'E',
            scope:{
                role: '=',
                options:'=',//список кнопок которые необходимо отобразить
                subdata: '=' // модель или данные которые необходимо вернуть в хендлер клика
            },
            link: function(scope, element, attrs){
                var temp = [];
                var options = scope.options;
                var roles = scope.role || {};
                var buttons = {
                    new:{name: 'Новый', ico: 'plus'},
                    show: {name:'Смотреть', ico:'search'},
                    edit:{name:'Изменить',ico:'pencil'},
                    files:{name:'Файлы', ico:'file'},
                    recalculate:{name:'Пересчитать', ico:'repeat', role:'can_edit'},
                    send_email:{name:'Отправить', ico:'envelope'},
                    logs:{name:'История', ico:'book'},
                    confirm_order:{ico:'check'/*, role:'can_confirm'*/},
                    view: {ico:'eye', class:'btn-info', disabled:false},
                    remove:{ico:'trash-o', class: 'btn-danger', role:'can_destroy', disabled:true},
                    table_edit:{ico:'pencil', class:'btn-default', role:'can_edit', disabled:true},
                    back:{name:'К списку', ico:'arrow-left'},
                    upd_form_pdf:{name:'УПД', ico:'file-pdf-o'},
                    label_pdf:{name:'Бирка', ico:'truck'},
                    packing_list_pdf:{name:'Упаковочный лист', ico:'list-ol'},
                    at_partners:{name:'У партнёров', ico:'exchange'},
                    automatically: {name: 'Автоматически', ico: 'rocket'}
                };

                var btnClass = attrs.contentClass || 'btn btn-success';

                buildButtons();

                if(attrs.subdata ){
                    scope.$watch('subdata', function(value){
                        value && Object.keys(Object(value)).length>0 && buildButtons();
                    })
                } else buttons = roles = null;

                function buildButtons(){
                    temp = [];
                    //пробегаемся по списку кнопок и проверяем существуют ли настроки для кнопки
                    if(angular.isArray(options) && options.length>0) {
                        options.map(function(item){
                            var btn = buttons[item.type],
                                role = btn.role;
                            if(btn){
                                btn.callback = item.callback;
                                btn.class = btnClass + ' ' + (btn.class || '');
                                if(btn.hasOwnProperty('disabled') && role && roles[role]){
                                    btn.disabled = !roles[role];
                                }

                                if(item.type === 'confirm_order') {
                                    createConfirmOrderControls(scope.subdata, btn, temp);
                                    return 0;
                                }

                                temp.push(btn);
                            }
                        });
                    }
                    scope.buttons = temp;
                }

                function createConfirmOrderControls(data, button, btnList){
                    var events = data.events;
                    events && angular.isArray(events) && events.map(function(item){
                        var btn= angular.extend(item, button);
                        btnList.push(btn);
                    });
                }

                scope.buttonClick = function(item){
                    //вызываем callback кнопки
                    !item.disabled && item.callback && item.callback(scope.subdata, item);
                }
            },
            template: $templateCache.get('formNavButtons.tmpl.html')
        }
    }]);
}());

(function () {

    'use strict';

    angular.module('app.layout').directive('hrefVoid', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attributes) {
                element.attr('href','#');
                element.on('click', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                })
            }
        }
    })
    .directive('navTabs', function(){
        return {
            restrict: 'C',
            link: function(scope, element){
                element.find('a[data-toggle="tab"]').each(function(ind, link){
                    var l = $(link);
                    l.attr('data-target', l.attr('href')).removeAttr('href');
                });
            }
        };
    });
}());

/**
 * Created by Egor Lobanov on 23.12.15.
 */
(function(){
    angular.module('app.layout').directive('imgError', function(){
        return {
            restrict: 'AC',
            link: function(scope, element, attrs){
                element.bind('error', function(){
                    attrs.$set('src', attrs.imgError);
                    element.unbind('error');
                });
            }
        }
    });
}());
/**
 * Created by Sergey Baev on 02.12.15.
 * Load notifications and subscribe to its websocket channels
 */
(function() {
    angular.module('app.layout').directive('notifications', ['CableApi', function(CableApi) {
        return {
            restrict: 'E',
            
            link: function(sc, element, attrs) {
                sc.notifications = window.gon.notifications;
                sc.hidden = true;
                
                // Deal with a private channel
                sc.channel = CableApi.subscribe('NotificationsChannel', {
                    connected: function(data) {
                        console.info("Канал получения уведомлений настроен!")
                    },
                    rejected: function(data) {
                        console.info("Канал получения уведомлений. Не удалось установить соединение!")
                    },
                    received: function(data) {
                        sc.notifications.unshift(data);
                        sc.$apply();
                        $.smallBox({
                            title: "Уведомление",
                            content: "Вам пришло новое уведомление",
                            color: "#739E73",
                            iconSmall: "fa fa-check fadeInRight animated",
                            timeout: 4000
                        });
                    }
                });
                
                // Trigger named events on a server through the private channel
                sc.markAsSeen = function(item) {
                    if (item.seen) return;
                    sc.channel.perform('see', {id: item.id});
                    item.seen = true;
                };
                sc.markAsDeleted = function(item) {
                    if (!item.seen) return;
                    sc.channel.perform('delete', {id: item.id})
                    sc.notifications = _.without(sc.notifications, item);
                };
                
                // DOM
                sc.hide = function() { sc.hidden = true  };
                sc.show = function() { sc.hidden = false };
                sc.toggle = function() { sc.hidden = !sc.hidden };
            },
            
            templateUrl: '/assets/admin/app/layout/partials/notifications.tpl.html'
        };
    }]);
}());

/**
 * Created by Egor Lobanov on 19.11.15.
 * UI для фильтрации по документам
 * атрибут to-state - определяет к какому стейту нужно перейти для выполнения поиска
 */
(function(){
    angular.module('app.layout').directive('ordersFilter', ['$templateCache', '$state', function($templateCache, $state){
        return {
            restrict:'EA',
            scope:{
                searchQuery:'='//поисковый запрос
            },
            link: function(scope, element, attrs){
                var transitionTo = function(){
                    var q = scope.searchQuery;
                    $state.transitionTo(attrs.toState, q?{q:q}:{}, {reload:true});
                };
                scope.exeSearch = function(e){
                    if(e){
                        e.keyCode == 13 && transitionTo();
                    }else transitionTo();
                };
            },
            template:$templateCache.get('ordersFilter.tmpl.html')
        }
    }]);
}());

(function () {

    'use strict';

    /*
    * Directive for toggling a ng-model with a button
    * Source: https://gist.github.com/aeife/9374784
    */

    angular.module('app.layout').directive('radioToggle', ["$log", function ($log) {
      return {
        scope: {
          model: "=ngModel",
          value: "@value"
        },
        link: function(scope, element, attrs) {

          element.parent().on('click', function() {
            scope.model = scope.value;
            scope.$apply();
          });
        }
      }
    }]);
}());
/**
 * DETECT MOBILE DEVICES
 * Description: Detects mobile device - if any of the listed device is
 *
 * detected class is inserted to <tElement>.
 *
 *  (so far this is covering most hand held devices)
 */


(function () {

    'use strict';

    angular.module('app.layout').directive('smartDeviceDetect', function () {
        return {
            restrict: 'A',
            compile: function (tElement, tAttributes) {
                tElement.removeAttr('smart-device-detect data-smart-device-detect');

                var isMobile = (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));
                
                tElement.toggleClass('desktop-detected', !isMobile);
                tElement.toggleClass('mobile-detected', isMobile);


            }
        }
    });
}());

(function () {

    'use strict';

    angular.module('app.layout').directive('smartDropzone', function () {
        return {
            restrict: 'A',
            scope:{
                options:'=smartDropzone'
            },
            link:function(scope, element){
                var config = {
                    addRemoveLinks : true,
                    dictCancelUpload: 'Отменить',
                    dictRemoveFile: 'Удалить',
                    dictDefaultMessage: '<span class="font-lg"><i class="fa fa-caret-right text-danger"></i> Перетащите файл для загрузки <br>(или Нажмите)</span>',
                    dictResponseError: 'Ошибка загрузки файла!',
                    headers: {
                        'X-CSRF-Token': $('meta[name=csrf-token]').attr('content'),
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };

                scope.$watch('options', function(value){
                    if(value){
                        element.dropzone(angular.extend(config, value));
                    }
                })
            }
        }
    });
}());

(function () {

    'use strict';

    angular.module('app.layout').directive('smartFitAppView', ["$rootScope", "SmartCss", function ($rootScope, SmartCss) {
        return {
            restrict: 'A',
            compile: function (element, attributes) {
                element.removeAttr('smart-fit-app-view data-smart-fit-app-view leading-y data-leading-y');

                var leadingY = attributes.leadingY ? parseInt(attributes.leadingY) : 0;

                var selector = attributes.smartFitAppView;

                if(SmartCss.appViewSize && SmartCss.appViewSize.height){
                    var height =  SmartCss.appViewSize.height - leadingY < 252 ? 252 :  SmartCss.appViewSize.height - leadingY;
                    SmartCss.add(selector, 'height', height+'px');
                }

                var listenerDestroy = $rootScope.$on('$smartContentResize', function (event, data) {
                    var height = data.height - leadingY < 252 ? 252 : data.height - leadingY;
                    SmartCss.add(selector, 'height', height+'px');
                });

                element.on('$destroy', function () {
                    listenerDestroy();
                    SmartCss.remove(selector, 'height');
                });


            }
        }
    }]);
}());

(function(){

    "use strict";

    angular.module('app.layout').directive('smartInclude', function () {
            return {
                replace: true,
                restrict: 'A',
                templateUrl: function (element, attr) {
                    return attr.smartInclude;
                },
                compile: function(element){
                    element[0].className = element[0].className.replace(/placeholder[^\s]+/g, '');
                }
            };
        }
    );

}());

(function () {

    'use strict';

    var _debug = 0;

    function getDocHeight() {
        var D = document;
        return Math.max(
            D.body.scrollHeight, D.documentElement.scrollHeight,
            D.body.offsetHeight, D.documentElement.offsetHeight,
            D.body.clientHeight, D.documentElement.clientHeight
        );
    }


    angular.module('app.layout').directive('smartLayout', ["$rootScope", "$timeout", "$interval", "$q", function ($rootScope, $timeout, $interval, $q) {

        var initialized = false, initializedResolver = $q.defer();
        initializedResolver.promise.then(function () {
            initialized = true;
        });

        var $window = $(window),
            $document = $(document),
            $html = $('html'),
            $body = $('body'),
            $navigation ,
            $menu,
            $ribbon,
            $footer,
            $contentAnimContainer;


        (function cacheElements() {
            $navigation = $('#header');
            $menu = $('#left-panel');
            $ribbon = $('#ribbon');
            $footer = $('.page-footer');
            if (_.every([$navigation, $menu, $ribbon, $footer], function ($it) {
                return angular.isNumber($it.height())
            })) {
                initializedResolver.resolve();
            } else {
                $timeout(cacheElements, 100);
            }
        })();


        return {
            priority: 2014,
            restrict: 'A',
            compile: function (tElement, tAttributes) {
                tElement.removeAttr('smart-layout data-smart-layout');

                var appViewHeight = 0 ,
                    appViewWidth = 0,
                    calcWidth,
                    calcHeight,
                    deltaX,
                    deltaY;

                var forceResizeTrigger = false;

                function resizeListener() {

//                    full window height appHeight = Math.max($menu.outerHeight() - 10, getDocHeight() - 10);

                    var menuHeight = $body.hasClass('menu-on-top') && $menu.is(':visible') ? $menu.height() : 0;
                    var menuWidth = !$body.hasClass('menu-on-top') && $menu.is(':visible') ? $menu.width() + $menu.offset().left : 0;

                    var $content = $('#content');
                    var contentXPad = $content.outerWidth(true) - $content.width();
                    var contentYPad = $content.outerHeight(true) - $content.height();


                    calcWidth = $window.width() - menuWidth - contentXPad;
                    calcHeight = $window.height() - menuHeight - contentYPad - $navigation.height() - $ribbon.height() - $footer.height();

                    deltaX = appViewWidth - calcWidth;
                    deltaY = appViewHeight - calcHeight;
                    if (Math.abs(deltaX) || Math.abs(deltaY) || forceResizeTrigger) {

                        //console.log('exec', calcWidth, calcHeight);
                        $rootScope.$broadcast('$smartContentResize', {
                            width: calcWidth,
                            height: calcHeight,
                            deltaX: deltaX,
                            deltaY: deltaY
                        });
                        appViewWidth = calcWidth;
                        appViewHeight = calcHeight;
                        forceResizeTrigger = false;
                    }
                }


                var looping = false;
                $interval(function () {
                    if (looping) loop();
                }, 300);

                var debouncedRun = _.debounce(function () {
                    run(300)
                }, 300);

                function run(delay) {
                    initializedResolver.promise.then(function () {
                        attachOnResize(delay);
                    });
                }

                run(10);

                function detachOnResize() {
                    looping = false;
                }

                function attachOnResize(delay) {
                    $timeout(function () {
                        looping = true;
                    }, delay);
                }

                function loop() {
                    $body.toggleClass('mobile-view-activated', $window.width() < 979);

                    if ($window.width() < 979)
                        $body.removeClass('minified');

                    resizeListener();
                }

                function handleHtmlId(toState) {
                    if (toState.data && toState.data.htmlId) $html.attr('id', toState.data.htmlId);
                    else $html.removeAttr('id');
                }

                $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                    //console.log(1, '$stateChangeStart', event, toState, toParams, fromState, fromParams);

                    handleHtmlId(toState);
                    detachOnResize();
                });

                // initialized with 1 cause we came here with one $viewContentLoading request
                var viewContentLoading = 1;
                $rootScope.$on('$viewContentLoading', function (event, viewConfig) {
                    //console.log(2, '$viewContentLoading', event, viewConfig);
                    viewContentLoading++;
                });

                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    //console.log(3, '$stateChangeSuccess', event, toState, toParams, fromState, fromParams);
                    forceResizeTrigger = true;
                });

                $rootScope.$on('$viewContentLoaded', function (event) {
                    //console.log(4, '$viewContentLoaded', event);
                    viewContentLoading--;

                    if (viewContentLoading == 0 && initialized) {
                        debouncedRun();
                    }
                });
            }
        }
    }]);
}());

(function () {

    "use strict";

    (function ($) {

        $.fn.smartCollapseToggle = function () {

            return this.each(function () {

                var $body = $('body');
                var $this = $(this);

                // only if not  'menu-on-top'
                if ($body.hasClass('menu-on-top')) {


                } else {

                    $body.hasClass('mobile-view-activated')

                    // toggle open
                    $this.toggleClass('open');

                    // for minified menu collapse only second level
                    if ($body.hasClass('minified')) {
                        if ($this.closest('nav ul ul').length) {
                            $this.find('>a .collapse-sign .fa').toggleClass('fa-minus-square-o fa-plus-square-o');
                            $this.find('ul:first').slideToggle(appConfig.menu_speed || 200);
                        }
                    } else {
                        // toggle expand item
                        $this.find('>a .collapse-sign .fa').toggleClass('fa-minus-square-o fa-plus-square-o');
                        $this.find('ul:first').slideToggle(appConfig.menu_speed || 200);
                    }
                }
            });
        };
    })(jQuery);

    angular.module('app.layout').directive('smartMenu', ["$state", "$rootScope", function ($state, $rootScope) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var $body = $('body');

                var $collapsible = element.find('li[data-menu-collapse]');
                $collapsible.each(function (idx, li) {
                    var $li = $(li);
                    $li
                        .on('click', '>a', function (e) {

                            // collapse all open siblings
                            $li.siblings('.open').smartCollapseToggle();

                            // toggle element
                            $li.smartCollapseToggle();

                            // add active marker to collapsed element if it has active childs
                            if (!$li.hasClass('open') && $li.find('li.active').length > 0) {
                                $li.addClass('active')
                            }

                            e.preventDefault();
                        })
                        .find('>a').append('<b class="collapse-sign"><em class="fa fa-plus-square-o"></em></b>');

                    // initialization toggle
                    if ($li.find('li.active').length) {
                        $li.smartCollapseToggle();
                        $li.find('li.active').parents('li').addClass('active');
                    }
                });

                // click on route link
                element.on('click', 'a[data-ui-sref]', function (e) {
                    // collapse all siblings to element parents and remove active markers
                    $(this)
                        .parents('li').addClass('active')
                        .each(function () {
                            $(this).siblings('li.open').smartCollapseToggle();
                            $(this).siblings('li').removeClass('active')
                        });

                    if ($body.hasClass('mobile-view-activated')) {
                        $rootScope.$broadcast('requestToggleMenu');
                    }
                });


                scope.$on('$smartLayoutMenuOnTop', function (event, menuOnTop) {
                    if (menuOnTop) {
                        $collapsible.filter('.open').smartCollapseToggle();
                    }
                });

            }
        }
    }]);


}());

(function () {

    'use strict';

    angular.module('app.layout').directive('smartPageTitle', ["$rootScope", "$timeout", function ($rootScope, $timeout) {
        return {
            restrict: 'A',
            compile: function (element, attributes) {
                element.removeAttr('smart-page-title data-smart-page-title');

                var defaultTitle = attributes.smartPageTitle;
                var listener = function(event, toState, toParams, fromState, fromParams) {
                    var title = defaultTitle;
                    if (toState.data && toState.data.title) title = toState.data.title + ' | ' + title;
                    // Set asynchronously so page changes before title does
                    $timeout(function() {
                        $('html head title').text(title);
                    });
                };

                $rootScope.$on('$stateChangeStart', listener);

            }
        }
    }]);
}());

(function () {

    'use strict';

    angular.module('app.layout').directive('smartRouterAnimationWrap', ["$rootScope", "$timeout", function ($rootScope,$timeout) {
        return {
            restrict: 'A',
            compile: function (element, attributes) {
                element.removeAttr('smart-router-animation-wrap data-smart-router-animation-wrap wrap-for data-wrap-for');

                element.addClass('router-animation-container');


                $('<div class="router-animation-loader"><i class="fa fa-gear fa-4x fa-spin"></i></div>').appendTo(element);


                var animateElementSelector = attributes.wrapFor;
                var viewsToMatch = attributes.smartRouterAnimationWrap.split(/\s/);

                var needRunContentViewAnimEnd = false;
                function contentViewAnimStart() {
                    needRunContentViewAnimEnd = true;
                    element.css({
                        height: element.height() + 'px',
                        overflow: 'hidden'
                    }).addClass('active');

                    $(animateElementSelector).addClass('animated faster fadeOutDown');
                }

                function contentViewAnimEnd() {
                    if(needRunContentViewAnimEnd){
                        element.css({
                            height: 'auto',
                            overflow: 'visible'
                        }).removeClass('active');

                        $(animateElementSelector).addClass('animated faster fadeInUp');

                        needRunContentViewAnimEnd = false;

                        $timeout(function(){
                            $(animateElementSelector).removeClass('animated');
                        },10);
                    }
                }


                var destroyForStart = $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                    var isAnimRequired = _.any(viewsToMatch, function(view){
                       return _.has(toState.views, view) || _.has(fromState.views, view);
                    });
                    if(isAnimRequired){
                        contentViewAnimStart()
                    }
                });

                var destroyForEnd = $rootScope.$on('$viewContentLoaded', function (event) {
                    contentViewAnimEnd();
                });

                element.on('$destroy', function(){
                    destroyForStart();
                    destroyForEnd();

                });



            }
        }
    }]);
}());

(function () {

    'use strict';

    angular.module('app.layout').directive('stateBreadcrumbs', ["$rootScope", "$state", function ($rootScope, $state) {


        return {
            restrict: 'E',
            replace: true,
            template: '<ol class="breadcrumb"><li>Приложение</li></ol>',
            link: function (scope, element) {

                function setBreadcrumbs(breadcrumbs) {
                    var html = '<li>Приложение</li>';
                    angular.forEach(breadcrumbs, function (crumb) {
                        html += '<li>' + crumb + '</li>'
                    });
                    element.html(html)
                }

                function fetchBreadcrumbs(stateName, breadcrunbs) {

                    var state = $state.get(stateName);

                    if (state && state.data && state.data.title && breadcrunbs.indexOf(state.data.title) == -1) {
                        breadcrunbs.unshift(state.data.title)
                    }

                    var parentName = stateName.replace(/.?\w+$/, '');
                    if (parentName) {
                        return fetchBreadcrumbs(parentName, breadcrunbs);
                    } else {
                        return breadcrunbs;
                    }
                }

                function processState(state) {
                    var breadcrumbs;
                    if (state.data && state.data.breadcrumbs) {
                        breadcrumbs = state.data.breadcrumbs;
                    } else {
                        breadcrumbs = fetchBreadcrumbs(state.name, []);
                    }
                    setBreadcrumbs(breadcrumbs);
                }

                processState($state.current);

                $rootScope.$on('$stateChangeStart', function (event, state) {
                    processState(state);
                })
            }
        }
    }]);
}());

/**
 * Created by Egor lobanov on 06.01.16.
 * directive create Jq UI element with options
 */
(function(){
    angular.module('app.layout').directive('teJqUi', function(){
        return{
            restrict: 'A',
            scope:{
                options: '=teJqUi'
            },
            link: function(scope, element, attrs){
                var type = attrs.uiType;

                if(type && element[type]){

                    var setOptions = function(value){
                        element[type](value||{});
                    };

                    attrs.watchOptions ? scope.watch('options', function(value){
                            value && setOptions(value);
                        })
                    : setOptions(scope.options);

                    scope.$on('$destroy', function(){
                        element[type]('destroy');
                    })
                }
            }
        };
    });
}());
/**
 * Created by Egor Lobanov on 21.11.15.
 * Helps init infinite-scroll by default app params
 */
(function(){
    angular.module('app.layout').directive('teLazyHelper', ['serverApi', function(serverApi){
        return {
            restrict:'A',
            scope:{
                list:'=',
                searchQuery:'='
            },
            link: function(scope, element, attrs){
                var pageNumber = attrs.hasOwnProperty('startPage') ? parseInt(attrs.startPage) : 1,
                    startPage = pageNumber,// номер загружаемой страницы;
                    loader = angular.element('<div class="font-lg text-align-center"><i class="fa fa-gear fa-spin"></i> Загрузка...</div>');

                scope.loadList = function(){
                    attrs.$set('infiniteScrollDisabled', true); //даем infiniteScroll знать что ждем загрузку данных
                    setVisualStatus(true);
                    serverApi[attrs.serverApiMethod](pageNumber, scope.searchQuery, {}, function(result){
                        var stop = result.data.length == 0;
                        setVisualStatus(false, stop && pageNumber == startPage);
                        scope.list = scope.list.concat(result.data); //склеиваем уже загруженные данные и вновь прибывшие
                        pageNumber++; //увеличиваем номер листа
                        attrs.$set('infiniteScrollDisabled', stop);// даем infiniteScroll знать что данные загружены если данных пришло меньше 20 подгрузка завершается
                    });
                };

                function setVisualStatus(inLoad, noResults){
                    inLoad ? element.after(loader) : loader.remove();
                    noResults && element.after('<div class="font-lg text-align-center">Нет резульатов.</div>');
                }

                attrs.$set('infiniteScroll', scope.loadList);
            }
        };
    }]);
}());

/**
 * Created by Egor Lobanov on 21.11.15.
 * Append button to scroll top
 */
(function(){
    angular.module('app.layout').directive('teScrollTop', function(){
        return {
            restrict: 'E',
            link: function(scope, element){
                element.addClass('scroll-up-btn not-selectable');
                scope.teScrollTop = function(){
                    angular.element('body').scrollTop(0);
                };
            },
            template: '<div ng-click="teScrollTop()">'+
                '<span class="glyphicon glyphicon-arrow-up"></span>'+
            '</div>'
        };
    });
}());

/**
 * Created by Egor Lobanov on 18.12.15.
 * directive of create transfer form
 */
(function(){
    angular.module('app.layout').directive('transferBuilder', ['serverApi', 'funcFactory', function(serverApi, funcFactory){
        return {
            restrict: 'E',
            scope:{
                config: '=',
                transfersList: '='
            },
            link: function(scope, element, attrs){
                var _modal = element.find('.modal');

                scope.partnerSelectConfig ={
                    dataMethod: serverApi.getPartners
                };

                scope.data = {
                    partnersList:[]
                };

                scope.config.showForm = function(){
                    clearForm();
                    _modal.modal('show');
                };

                scope.dateDrop = {
                    opened: false,
                    open: function() {
                        scope.dateDrop.opened = true;
                    }
                };

                clearForm();

                scope.createTransfer = function(){
                    var data = scope.newTransfer;
                    if(data.partner) data.partner_id = data.partner.id;
                    delete data.partner;

                    var appendTransfer = function(item){
                        scope.transfersList.unshift(item);
                        funcFactory.showNotification((item.type === 'IncomingTransfer' ? 'Входящий' : 'Исходящий') + ' платеж успешно добавлен', item.number, true);
                    };

                    scope.config.createMethod(data, function(result){
                        if(!result.data.errors){
                            angular.isArray(result.data) ? result.data.map(function(item){
                                appendTransfer(item);
                            }) : appendTransfer(result.data);

                            _modal.modal('hide');
                            clearForm();
                        }else funcFactory.showNotification('Не удалось создать платеж', result.data.errors);
                    }, angular.noop);
                };

                function clearForm(){
                    scope.newTransfer = {
                        date: new Date,
                        amount:0,
                        partner:{},
                        partner_id:'',
                        number: null,
                        description: ''
                    };
                    scope.dateDrop.maxDate = scope.newTransfer.date;
                }
            },
            templateUrl: '/assets/admin/app/layout/partials/transfer-builder.tplt.html'
        }
    }]);
}());
/**
 * Created by Egor Lobanov on 26.11.15.
 * append directive to ui-select with 'select2' theme to provide lazy loading of searched data
 * include your config via ui-select-infinity attribute
 * dataMethod should match following format: function(page, query, configuration, success)
 */
(function(){

    angular.module('app.layout').directive('uiSelectInfinity', ['$q', '$compile', '$timeout', function($q, $compile, $timeout){
        return {
            restrict:'A',
            link:function(scope, element, attrs){
                var config = {
                    startFrom:2,
                    startPage:1,
                    scrollDistance:50,
                    maxHeight: 200,
                    delay: 500,
                    dataMethod: angular.noop,
                    searchStatusTmpl: '<div class="ui-select-status">' +
                        '<span ng-if="searchStatus == \'before\'">Введите еще хотя бы {{config.startFrom}} символа</span>'+
                        '<span ng-if="searchStatus == \'noresult\'">Поиск не дал результатов</span>'+
                        '<span ng-if="searchStatus == \'inload\'">Поиск...</span>'+
                        '</div>'
                };

                var page,                   // current page for load
                    content,                // ui-select-choices-content
                    inLoad,                 // loading status
                    query,                  // search query
                    canceler,               // request canceler
                    timeout_p,              // $timeout promise
                    defer = $q.defer();     // defer to append scroll listener

                var unWatchConfig = scope.$watch(attrs.uiSelectInfinity, function(value){
                    if(value) {
                        config = scope.config = angular.extend(config, value);
                        element.find('.ui-select-choices').append($compile(config.searchStatusTmpl)(scope));
                        scope.searchStatus='before';
                        unWatchConfig();
                    }

                });

                scope.$watch('$select.search', function(value){
                    if(value !== undefined){
                        inLoad && canceler.resolve();
                        $timeout.cancel(timeout_p);
                        page = config.startPage;
                        inLoad = false;
                        query = value;
                        scope.$select.items = [];
                        if(value !== '' && value.length>=config.startFrom) timeout_p = $timeout(load, config.delay);
                        else scope.searchStatus='before';
                    }
                });


                defer.promise.then(function(){
                    content = element.find('.ui-select-choices-content').scroll(scroll);
                });

                scope.$watch('$select.open', function(value){
                    if(value){
                        defer.resolve();
                        $timeout(function(){scope.$select.searchInput[0].focus()}, 100);
                    }
                });

                function scroll(){
                    if(!inLoad && ((config.maxHeight - content.scrollTop())<config.scrollDistance)){
                        page++;
                        load(true);
                    }
                }

                function load (notShowStatus){
                    inLoad = true;
                    scope.searchStatus= notShowStatus ? 'result' : 'inload';
                    canceler = $q.defer();
                    config.dataMethod(page, query, {timeout:canceler.promise}, function(result){
                        inLoad = result.data.length==0;
                        scope.$select.items =  scope.$select.items.concat(result.data);
                        if(page == config.startPage && result.data.length==0) scope.searchStatus='noresult';
                        else scope.searchStatus='result';
                    });
                }

                scope.$on('$destroy', function(){
                    content && content.off('scroll');
                });
            }
        };
    }]);
}());

/**
 * Jarvis Widget Directive
 *
 *    colorbutton="false"
 *    editbutton="false"
      togglebutton="false"
       deletebutton="false"
        fullscreenbutton="false"
        custombutton="false"
        collapsed="true"
          sortable="false"
 *
 *
 */
(function(){

    "use strict";

    angular.module('app.layout').directive('jarvisWidget', ["$rootScope", function($rootScope){
        console.log('created widget directive');
        return {
            restrict: "A",
            compile: function(element, attributes){
                if(element.data('widget-color'))
                    element.addClass('jarviswidget-color-' + element.data('widget-color'));

                element.find('.widget-body').prepend('<div class="jarviswidget-editbox"><input class="form-control" type="text"></div>');

                element.addClass('jarviswidget');
                $rootScope.$emit('jarvisWidgetAdded', element )

            }
        }
    }])
}());
(function () {
    "use strict";

    angular.module('app.layout').directive('widgetGrid', ["$rootScope", "$compile", "$q", "$state", "$timeout", function ($rootScope, $compile, $q, $state, $timeout) {

        var jarvisWidgetsDefaults = {
            grid: 'article',
            widgets: '.jarviswidget',
            localStorage: true,
            deleteSettingsKey: '#deletesettingskey-options',
            settingsKeyLabel: 'Reset settings?',
            deletePositionKey: '#deletepositionkey-options',
            positionKeyLabel: 'Reset position?',
            sortable: true,
            buttonsHidden: false,
            // toggle button
            toggleButton: true,
            toggleClass: 'fa fa-minus | fa fa-plus',
            toggleSpeed: 200,
            onToggle: function () {
            },
            // delete btn
            deleteButton: true,
            deleteMsg: 'Warning: This action cannot be undone!',
            deleteClass: 'fa fa-times',
            deleteSpeed: 200,
            onDelete: function () {
            },
            // edit btn
            editButton: true,
            editPlaceholder: '.jarviswidget-editbox',
            editClass: 'fa fa-cog | fa fa-save',
            editSpeed: 200,
            onEdit: function () {
            },
            // color button
            colorButton: true,
            // full screen
            fullscreenButton: true,
            fullscreenClass: 'fa fa-expand | fa fa-compress',
            fullscreenDiff: 3,
            onFullscreen: function () {
            },
            // custom btn
            customButton: false,
            customClass: 'folder-10 | next-10',
            customStart: function () {
                alert('Hello you, this is a custom button...');
            },
            customEnd: function () {
                alert('bye, till next time...');
            },
            // order
            buttonOrder: '%refresh% %custom% %edit% %toggle% %fullscreen% %delete%',
            opacity: 1.0,
            dragHandle: '> header',
            placeholderClass: 'jarviswidget-placeholder',
            indicator: true,
            indicatorTime: 600,
            ajax: true,
            timestampPlaceholder: '.jarviswidget-timestamp',
            timestampFormat: 'Last update: %m%/%d%/%y% %h%:%i%:%s%',
            refreshButton: true,
            refreshButtonClass: 'fa fa-refresh',
            labelError: 'Sorry but there was a error:',
            labelUpdated: 'Last Update:',
            labelRefresh: 'Refresh',
            labelDelete: 'Delete widget:',
            afterLoad: function () {
            },
            rtl: false, // best not to toggle this!
            onChange: function () {

            },
            onSave: function () {

            },
            ajaxnav: true

        }

        var dispatchedWidgetIds = [];
        var setupWaiting = false;

        var debug = 1;

        var setupWidgets = function (element, widgetIds) {

            if (!setupWaiting) {

                if(_.intersection(widgetIds, dispatchedWidgetIds).length != widgetIds.length){

                    dispatchedWidgetIds = _.union(widgetIds, dispatchedWidgetIds);

//                    console.log('setupWidgets', debug++);

                    element.data('jarvisWidgets') && element.data('jarvisWidgets').destroy();
                    element.jarvisWidgets(jarvisWidgetsDefaults);
//                    initDropdowns(widgetIds);
                }

            } else {
                if (!setupWaiting) {
                    setupWaiting = true;
                    $timeout(function () {
                        setupWaiting = false;
                        setupWidgets(element, widgetIds)
                    }, 200);
                }
            }

        };

        var destroyWidgets = function(element, widgetIds){
            element.data('jarvisWidgets') && element.data('jarvisWidgets').destroy();
            dispatchedWidgetIds = _.xor(dispatchedWidgetIds, widgetIds);
        };

        var initDropdowns = function (widgetIds) {
            angular.forEach(widgetIds, function (wid) {
                $('#' + wid + ' [data-toggle="dropdown"]').each(function () {
                    var $parent = $(this).parent();
                    $(this).removeAttr('data-toggle');
                    if (!$parent.attr('dropdown')) {
                        $(this).removeAttr('href');
                        $parent.attr('dropdown', '');
                        var compiled = $compile($parent)($parent.scope());
                        $parent.replaceWith(compiled);
                    }
                })
            });
        };

        var jarvisWidgetAddedOff,
            $viewContentLoadedOff,
            $stateChangeStartOff;

        return {
            restrict: 'A',
            compile: function(element){

                element.removeAttr('widget-grid data-widget-grid');

                var widgetIds = [];

                $viewContentLoadedOff = $rootScope.$on('$viewContentLoaded', function (event, data) {
                    $timeout(function () {
                        setupWidgets(element, widgetIds)
                    }, 100);
                });


                $stateChangeStartOff = $rootScope.$on('$stateChangeStart',
                    function(event, toState, toParams, fromState, fromParams){
                        jarvisWidgetAddedOff();
                        $viewContentLoadedOff();
                        $stateChangeStartOff();
                        destroyWidgets(element, widgetIds)
                    });

                jarvisWidgetAddedOff = $rootScope.$on('jarvisWidgetAdded', function (event, widget) {
                    if (widgetIds.indexOf(widget.attr('id')) == -1) {
                        widgetIds.push(widget.attr('id'));
                        $timeout(function () {
                            setupWidgets(element, widgetIds)
                        }, 100);
                    }
                });

            }
        }
    }])


}());

/**
 * Created by Mikhail Arzhaev on 24.12.15.
 */
(function(){

    'use strict';

    angular.module('app.articles').controller('ArticlesCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        
        var sc = $scope;
        
        sc.visual = {
            navButtsOptions:[{
                type: 'new',
                callback: function(){}
            }],
            navTableButts:[{type:'view', callback: viewArticle}, {type:'table_edit', callback: editArticle}, {type:'remove', callback: removeArticle}]
        };
        
        sc.data = {
            articlesList:[],
            searchQuery:$stateParams.q
        };

        function viewArticle(data){
            $state.go('app.pages.view', {id:data.id || data._id});
        }
        
        function editArticle(data){
            $state.go('app.pages.view.edit', {id: (data.id || data._id)});
        }

        function removeArticle(data){
            $.SmartMessageBox({
                title: "Удалить страницу?",
                content: "Вы действительно хотите удалить страницу " + data.title,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deletePage(data.id, function(result){
                        if(!result.data.errors){
                            sc.data.pagesList.splice(data.index,1);
                            funcFactory.showNotification('Страница ' + data.title + ' успешно удалена.', '', true);
                        } else {
                            funcFactory.showNotification('Не удалось удалить страницу ' + data.title, result.data.errors);
                        }
                    });
                }
            });
        }
    }]);
}());
/**
 * Created by Egor Lobanov on 31.01.16.
 * Controller of Sign in page
 */
(function(){
    angular.module('login').controller('loginCtrl', ['$scope', 'serverApi', '$state', 'funcFactory', function(sc, serverApi, $state, funcFactory){
        sc.loginData = {
            user: {email:  '', password: ''}
        };
        sc.restoreData = {
            user: {email: ''}
        };
        sc.forgotPass = false;
        sc.authError=false;
        sc.passRestored = false;

        sc.flipForm = function(flip){
            sc.forgotPass = flip;
            sc.authError = false;
            sc.passRestored = false;
        };

        sc.restorePass = function(){
            serverApi.resetPassword(sc.restoreData, function(result){
                sc.authError = false;
                sc.passRestored = true;
            }, function(error){
                funcFactory.showNotification('Не удалось восстановить пароль', 'Пользователь не существует!');
            });
        };

        sc.submit = function(){
            sc.authError = false;
            serverApi.signIn(sc.loginData, function(result){
                window.authorized = result.data.id;
                $state.go('app.dashboard');
            }, function(error){
                sc.authError = true;
            });
        };
    }]);
}());
/**
 * Created by Egor Lobanov on 07.11.15.
 */
(function(){

    'use strict';

    angular.module('app.catalogues').controller('CataloguesCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        var sc = $scope;
        sc.visual = {
            navButtsOptions:[{
                type: 'new',
                callback: function(){}
            }],
            navTableButts:[{type:'view', callback: viewCatalogue}, {type:'table_edit', callback: editCatalogue}, {type:'remove', callback: removeCatalogue}]
        };
        sc.data = {
            cataloguesList:[],
            searchQuery:$stateParams.q
        };

        function viewCatalogue(data){
            $state.go('app.catalogues.view', {id:data.id || data._id});
        }
        
        function editCatalogue(data){
            $state.go('app.catalogues.view.edit', {id: (data.id || data._id)});
        }

        function removeCatalogue(data){
            $.SmartMessageBox({
                title: "Удалить категорию?",
                content: "Вы действительно хотите удалить категорию " + data.name,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deleteCatalogue(data.id, function(result){
                        if(!result.data.errors){
                            sc.data.cataloguesList.splice(data.index,1);
                            funcFactory.showNotification('Категория ' + data.name + ' успешно удалена.', '', true);
                        } else {
                            funcFactory.showNotification('Не удалось удалить категорию ' + data.name, result.data.errors);
                        }
                    });
                }
            });
        }
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 07.12.15.
 */
(function(){
    angular.module('app.catalogues').controller('EditCatalogueCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        var sc = $scope;
        sc.data ={
            catalogue:{}
        };
        sc.visual = {
            navButtsOptions:[{type:'back', callback:goToIndex}, {type:'show', callback:goToShow}],
            roles: {}
        };

        sc.tinymceOptions = funcFactory.getTinymceOptions();

        serverApi.getCatalogueDetails($stateParams.id, function(result){
            var catalogue = sc.data.catalogue = result.data;
            sc.visual.roles = {
                can_edit: catalogue.can_edit,
                can_destroy: catalogue.can_destroy
            }
        });

        /**
         * Обновляем информацию по категории
         */
        sc.saveCatalogue = function(){
            var catalogue = sc.data.catalogue;
            var data = {
                    catalogue:{
                        name: catalogue.name,
                        description: catalogue.description
                    }
                };
            serverApi.updateCatalogue(catalogue.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    funcFactory.showNotification("Успешно", 'Категория '+catalogue.name+' успешно отредактирована.',true);
                }else funcFactory.showNotification("Неудача", 'Не удалось отредактировать категорию '+catalogue.name,true);
            });
        };

        function goToShow(){
            $state.go('app.catalogues.view', $stateParams);
        }
        function goToIndex(){
            $state.go('app.catalogues', $stateParams);
        }
    }]);
}());

/**
 * Created by Egor Lobanov on 15.11.15.
 */
(function(){

    "use strict";

    angular.module('app.catalogues').controller('ViewCatalogueCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$sce', function($scope, $state, $stateParams, serverApi, $sce){
        var sc = $scope;
        sc.catalogue = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack},{type:'edit', callback:editCatalogue}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            }
        };

        serverApi.getCatalogueDetails($stateParams.id, function(result){
            console.log(result.data);
            sc.catalogue = result.data;
            sc.catalogue.description = $sce.trustAsHtml(result.data.description);
        });

        function returnBack(){
            $state.go('app.catalogues',{});
        }
        
        function editCatalogue(){
            $state.go('app.catalogues.view.edit',$stateParams);
        }
    }]);
}());
/**
 * Created by Egor Lobanov on 07.11.15.
 */
(function(){

    'use strict';
    angular.module('app.contacts').controller('ContactsCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{type: 'new', callback: openCreateContactForm}],
            navTableButts:[{type:'view', callback:viewContact}, {type:'table_edit', callback:editContact}, {type:'remove'}],
            titles:[window.gon.index.Contact.indexTitle]
        };
        sc.data = {
            contactsList:[],
            searchQuery:$stateParams.q,
            partnersList:[]
        };
        sc.partnerSelectConfig ={
            dataMethod: serverApi.getPartners
        };

        function viewContact(data){
            $state.go('app.contacts.view', {id:data.id || data._id});
        }

        function editContact(data){
            $state.go('app.contacts.view.edit', {id:data.id || data._id});
        }

        function openCreateContactForm(){
            clearForm();
            $('#createNewContactModal').modal('show');
        }

        function clearForm (){
            sc.newContact = {
                first_name:'',
                last_name: '',
                email:'',
                partner_id:''
            };
        }

        sc.createContact = function(){
            console.log(sc.newContact);
            var data = sc.newContact;
            if(data.partner) data.partner_id = data.partner.id;
            delete data.partner;
            serverApi.createContact(data, function(result){
                if(!result.data.errors){
                    sc.data.contactsList.unshift(result.data);
                    funcFactory.showNotification('Успешно', 'Контакт ' +  result.data.email + ' добавлен в список', true);
                } else {
                    funcFactory.showNotification('Не удалось создать новый контакт', result.data.errors);
                }
            });
        };
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 10.12.15.
 */
(function(){
    angular.module('app.contacts').controller('EditContactCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        var sc = $scope;
        sc.data ={
            contact: {},
            partnersList: [],
            newPartner: {}
        };
        
        sc.visual = {
            navButtsOptions:[{type:'back', callback:goToIndex}, {type:'show', callback:goToShow}],
            roles: {},
            canChangePartner: true,//CanCan.can('change_partner', 'Contact')
            titles:['Редактировать ' + window.gon.index.Contact.objectTitle.toLowerCase()]
        };

        serverApi.getContactDetails($stateParams.id, function(result){
            var contact = sc.data.contact = result.data;
            funcFactory.setPageTitle('Контакт ' + contact.email);
        });
        
        sc.partnerSelectConfig ={
            dataMethod: serverApi.getPartners
        };

        /**
         * Обновляем информацию по контакту
         */
        sc.saveContact = function(){
            var contact = sc.data.contact;
            var data = {
                    contact:{
                        first_name: contact.first_name,
                        last_name: contact.last_name,
                        do_not_email: contact.do_not_email,
                        partner_id: contact.partner.id
                    }
                };
            serverApi.updateContact(contact.id, data, function(result){
                if(!result.data.errors)
                    funcFactory.showNotification("Успешно", 'Контакт ' + contact.email + ' успешно отредактирован.',true);
                else funcFactory.showNotification('Не удалось отредактировать контакт '+contact.email, result.data.errors);
            });
        };

        function goToShow(){
            $state.go('app.contacts.view', $stateParams);
        }
        
        function goToIndex(){
            $state.go('app.contacts', $stateParams);
        }
    }]);
}());

/**
 * Created by Mikhail Arzhaev on 26.11.15.
 */
(function(){

    "use strict";

    angular.module('app.contacts').controller('ViewContactCtrl', ['$scope', '$state', '$stateParams', 'serverApi', function($scope, $state, $stateParams, serverApi){
        var sc = $scope;
        sc.contact = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'edit', callback: goToEdit}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            titles: window.gon.index.Contact.objectTitle + ': '
        };

        serverApi.getContactDetails($stateParams.id, function(result){
            console.log(result.data);
            sc.contact = result.data;
        });

        function returnBack(){
            $state.go('app.contacts',{});
        }
        
        function goToEdit(){
            $state.go('app.contacts.view.edit',{});
        }
    }]);
}());
/**
 * Created by Egor Lobanov on 07.11.15.
 */
(function(){

    'use strict';

    angular.module('app.customer_orders').controller('CustomerOrdersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'CanCan', 'funcFactory', function($scope, $state, $stateParams, serverApi, CanCan, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{ type: 'new', callback: createNewOrder }],
            navTableButts:[{type:'view', callback:viewCustomerOrder}, {type:'table_edit', callback:editCustomerOrder}, {type:'remove', callback:removeCustomerOrder}],
            canAddPartner: CanCan.can('see_multiple', 'Partner'),
            titles:[window.gon.index.CustomerOrder.indexTitle]
        };
        sc.data = {
            ordersList:[],
            partnersList:[],
            searchQuery:$stateParams.q
        };
        sc.partnerSelectConfig ={
            dataMethod: serverApi.getPartners
        };

        sc.addNewOrder = function(){
            if(sc.newOrderData.partner && sc.newOrderData.partner)
                sc.newOrderData.partner_id = sc.newOrderData.partner.id;
            delete sc.newOrderData.date;// delete forbidden property
            delete sc.newOrderData.partner;
            serverApi.createCustomerOrder(sc.newOrderData, function(result){
                if(!result.data.errors){
                    sc.data.ordersList.unshift(result.data);
                    funcFactory.showNotification('Заказ успешно добавлен', '', true);
                    sc.clearCreateOrder();
                    $state.go('app.customer_orders.view.edit', {id: result.data.id});
                } else {
                    funcFactory.showNotification('Не удалось создать заказ', result.data.errors);
                };
            });
        };

        sc.clearCreateOrder = function(){
            sc.newOrderData = {
                date: null,
                title:'',
                description:'',
                partner_id: '',
                request_original:''
            };
        };

        sc.clearCreateOrder();

        function viewCustomerOrder(item){
            $state.go('app.customer_orders.view', {id:item.data.id || item.data._id});
        }

        function editCustomerOrder(item){
            $state.go('app.customer_orders.view.edit', {id:item.data.id || item.data._id});
        }

        function createNewOrder(){
            sc.newOrderData.date = new Date();
            $('#createNewOrderModal').modal('show');
        }

        function removeCustomerOrder(item){
            $.SmartMessageBox({
                title: "Удалить заказ?",
                content: "Вы действительно хотите удалить заказ " + item.data.number,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deleteCustomerOrder(item.data.id, function(result){
                        if(!result.data.errors){
                            sc.data.ordersList.splice(item.index,1);
                            funcFactory.showNotification('Заказ ' + item.data.number + ' успешно удален.', '', true);
                        } else {
                            funcFactory.showNotification('Не удалось удалить заказ ' + item.data.number, result.data.errors);
                        };
                    });
                }
            });
        }
    }]);
}());
/**
 * Created by Egor Lobanov on 23.11.15.
 */
(function(){
    angular.module('app.customer_orders').controller('EditCustomerOrder', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', 'customerOrdersNotifications', function($scope, $state, $stateParams, serverApi, $filter, funcFactory, notifications){
        var sc = $scope;
        sc.data ={
            order:{},
            partnersList: [],//селект выбор партнера
            productsList: [],//селект выбора продукта
            total:0
        };
        sc.productForAppend = {};//данные продукта, который необходимо добавить к заказу
        sc.visual = {
            navButtsOptions:[{type:'back', callback:goToIndex}, {type:'show', callback:goToShow}, {type:'files', callback:showFileModal}, {type: 'send_email', callback: sendCustomerOrder}, {type: 'recalculate', callback: recalculateCustomerOrder}, {type:'logs', callback: goToLogs}, {type:'confirm_order', callback:confirmCustomerOrder}],
            navTableButts:[{type:'table_edit', disabled:false, callback: updateProductOfOrder}, {type:'remove', disabled:false, callback:removeProduct}],
            roles: {},
            showFileModal: angular.noop,
            titles:[window.gon.index.CustomerOrder.indexTitle, 'Редактировать ' + window.gon.index.CustomerOrder.objectTitle.toLowerCase() + ': #'],
            sortOpts: {
                update: updateRowPosition,
                items: "> .order-items"
            }
        };
        //config для селекта продуктов
        sc.pSelectConfig = {
            startPage: 0,
            dataMethod: serverApi.getSearch
        };
        sc.partnerSelectConfig = {
            dataMethod: serverApi.getPartners
        };

        serverApi.getCustomerOrderDetails($stateParams.id, function(result){
            var o = sc.data.order = result.data;
            sc.data.order.date = $filter('date')(o.date, 'dd.MM.yyyy HH:mm');
            sc.visual.roles = {
                can_edit: o.can_edit,
                can_destroy: o.can_edit,
                can_confirm: o.can_confirm
            };

            funcFactory.setPageTitle('Заказ ' + sc.data.order.number);

            sc.fileModalOptions={
                url:'/api/customer_orders/'+ o.id +'/documents',
                files: o.documents,
                r_delete: serverApi.deleteFile,
                view: 'customer_orders',
                id: o.id
            };

            notifications.subscribe({
                channel: 'CustomerOrdersChannel',
                customer_order_id: $stateParams.id
            }, sc.data.order.customer_order_contents);
        });

        /**
         * Обновляем информацию по заказу
         */
        sc.saveOrderInfo = function(){
            var order = sc.data.order,
                data = {
                    customer_order:{
                        title: order.title,
                        description: order.description,
                        partner_id: order.partner.id
                    }
                };
            serverApi.updateCustomerOrder(order.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    funcFactory.showNotification("Успешно", 'Заказ '+order.number+' успешно отредактирован.',true);
                }else funcFactory.showNotification("Неудача", 'Не удалось отредактировать заказ '+order.number,true);
            });
        };

        /**
         * выбор продукта для добавления к заказу
         */
        sc.selectProductForAppend = function(item){
            sc.productForAppend = item;
            sc.productForAppend.id = item.id || item._id;
            sc.productForAppend.quantity = 0;
            if(!item.hasOwnProperty('discount')) sc.productForAppend.discount = 0;
        };

        /**
         * Добавить продукт в список
         */
        sc.appendProduct = function(event){
            var append = function(){
                var t=sc.productForAppend,
                    data = angular.extend(t, {product: {name:t.name, id: t.id}}),
                    post = {
                        product_id: t.id,
                        quantity: t.quantity,
                        discount: t.discount
                    };
                sc.productForAppend = {};
                sc.data.selectedProduct = null;

                serverApi.addCustomerOrderProduct(sc.data.order.id, post,function(result){
                    if(!result.data.errors){
                        sc.data.order.customer_order_contents.push(angular.extend(data, result.data));
                        funcFactory.showNotification('Успешно добавлен продукт', t.name, true);
                    } else {
                        funcFactory.showNotification('Не удалось добавить продукт', result.data.errors);
                    }
                });
            };
            if(event){
                if(event.keyCode == 13){
                    append();
                }
            } else append();
        };

        /**
         * Обновляет параметры продукта включенного в заказ
         * @param item - данные продукта
         */
        sc.updateProductOfOrder = updateProductOfOrder;

        function updateProductOfOrder(row, item, event){
            var update = function(){
                var item = row.data;
                serverApi.updateCustomerOrderProduct(sc.data.order.id, item.id, {
                    quantity: item.quantity,
                    discount: item.discount
                }, function(result){
                    if(!result.data.errors){
                        var r = sc.data.order.customer_order_contents[row.index];
                        sc.data.order.customer_order_contents[row.index] = angular.extend(r, result.data);
                        funcFactory.showNotification('Успешно обновлены данные продукта', item.product.name, true);
                    }else{
                        funcFactory.showNotification('Не удалось обновить данные продукта', result.data.errors);
                    }
                });
            };
            if(sc.visual.roles.can_edit){
                if(event){
                    if(event.keyCode == 13){
                        update();
                    }
                } else update();
            }
        }

        /**
         * Удаление продукта
         * @param item - объект с индексом продукта в листе и id
         */
        function removeProduct(item){
            serverApi.removeCustomerOrderProduct(sc.data.order.id, item.data.id, function(result){
                if(!result.data.errors){
                    sc.data.order.customer_order_contents.splice(item.index, 1);
                    funcFactory.showNotification('Продукт удален:', item.data.product.name, true);
                } else {
                    funcFactory.showNotification('Не удалось удалить продукт', result.data.errors);
                }
            });
        }

        /**
         * следим за изменеиями в коллекции (включая свойства коллекции) при изменении пересчитываем total
         */
        sc.$watch('data.order.customer_order_contents', function(values){
            if(values){
                var total = 0;

                values.map(function(item){
                    total += $filter('price_net')(item, item.quantity);
                });

                sc.data.total = total;
            }
        }, true);

        /**
         * Устанавливаем фокус на input с количеством продукта
         */
        sc.focusOnProduct = function(){
            window.setTimeout(function(){
                angular.element('#append_product_quantity')[0].focus();
            },0);//таймер что бы дать время контенту отрендериться
        };

        function goToShow(){
            $state.go('app.customer_orders.view', $stateParams);
        }
        
        function goToIndex(){
            $state.go('app.customer_orders', $stateParams);
        }
        
        function goToLogs(){
            $state.go('app.customer_orders.view.logs',{});
        }
        
        function sendCustomerOrder(){
            serverApi.sendCustomerOrderInvoice($stateParams.id, function(result){
                if(result.status == 200 && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Заказ успешно отправлен.', true);
                } else if (result.status == 200 && result.data.errors) {
                    funcFactory.showNotification("Неудача", result.data.errors, true);
                } else {
                    funcFactory.showNotification("Неудача", 'Ошибка при попытке отправить заказ.', true);
                }
            });
        }

        function showFileModal(){
            sc.visual.showFileModal();
        }

        function confirmCustomerOrder(subdata, item) {
            var data = {
                customer_order:{
                    event: item.event
                }
            };
            serverApi.updateStatusCustomerOrder($stateParams.id, data, function(result){
                if(result.status == 200 && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Удалось ' + item.name.toLowerCase() + ' заказ', true);
                    sc.data.order = result.data;
                } else {
                    funcFactory.showNotification("Не удалось " + item.name.toLowerCase() + ' заказ', result.data.errors);
                }
            });
        }
        
        function recalculateCustomerOrder() {
            console.log("Started");
            serverApi.recalculateCustomerOrder($stateParams.id, function(result){
                if(result.status == 200 && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Заказ успешно отправлен.', true);
                    sc.data.order = result.data;
                } else {
                    funcFactory.showNotification("Неудача", 'Ошибка при попытке отправить заказ.', true);
                }
            });
        }

        function updateRowPosition(e, ui){
            var $this = $(this),
                last_ind = angular.element(ui.item).scope().$index,
                new_ind = ui.item.index(),
                data = {customer_order: {command: "переместить_строку "+(last_ind+1)+"_на_" + (new_ind+1)}};

            serverApi.updateCommandCustomerOrder(sc.data.order.id, data, function(result){
                if(result.status == 200){
                    sc.data.order.customer_order_contents.swapItemByindex(last_ind, new_ind);
                }else{
                    funcFactory.showNotification('Не удалось переместить сторку', result.data.errors);
                    $this.sortable( "cancel" );
                }
            }, function(){
                $this.sortable( "cancel" );
            });
        }
    }]);
}());

/**
 * Created by Egor Lobanov on 15.11.15.
 */

(function(){

    "use strict";

    angular.module('app.customer_orders').controller('LogsCustomerOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.logs = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'files'}, {type:'send_email', callback: sendCustomerOrder}, {type:'recalculate'}, {type:'confirm_order'}, {type: 'show', callback: goToShow}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            }
        };

        serverApi.getCustomerOrderLogs($stateParams.id, function(result){
            var logs = sc.logs = result.data;
        });

        function goToShow(){
            $state.go('app.customer_orders.view', $stateParams);
        }
        
        function returnBack(){
            $state.go('app.customer_orders',{});
        }
        
        function sendCustomerOrder(){
            serverApi.sendCustomerOrderInvoice($stateParams.id, function(result){
                if(result.status == 200 && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Заказ успешно отправлен.', true);
                } else if (result.status == 200 && result.data.errors) {
                    funcFactory.showNotification("Неудача", result.data.errors, true);
                } else {
                    funcFactory.showNotification("Неудача", 'Ошибка при попытке отправить заказ.', true);
                }
            });
        }
        
    }]);
}());
/**
 * Created by Egor Lobanov on 15.11.15.
 */
(function(){

    "use strict";

    angular.module('app.customer_orders').controller('ViewCustomerOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', '$filter', 'customerOrdersNotifications', function($scope, $state, $stateParams, serverApi, funcFactory, $filter, notifications){
        var sc = $scope;
        sc.order = {};
        sc.total = 0;
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type: 'edit', callback: goEditCustomerOrder}, {type:'files', callback: showFileModal}, {type: 'send_email', callback: sendCustomerOrder}, {type:'recalculate'}, {type:'logs', callback: goToLogs}, {type:'confirm_order', callback: confirmCustomerOrder}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            showFileModal: angular.noop,
            titles: window.gon.index.CustomerOrder.objectTitle + ': №'
        };

        sc.amontPercent = 0;
        sc.dispatchedPercent = 0;

        /**
         * Get order details
         */
        serverApi.getCustomerOrderDetails($stateParams.id, function(result){
            console.log(result.data);
            var order = sc.order = result.data;

            funcFactory.setPageTitle('Заказ ' + sc.order.number);
            sc.amontPercent = funcFactory.getPercent(order.paid_amount, order.total);
            sc.dispatchedPercent = funcFactory.getPercent(order.dispatched_amount, order.total);

            calculateTotals(order);
            completeInitPage(order)
        });

        function completeInitPage(order){
            sc.fileModalOptions={
                url:'/api/customer_orders/'+ order.id +'/documents',
                files: order.documents,
                r_delete: serverApi.deleteFile,
                view: 'customer_orders',
                id: order.id
            };

            notifications.subscribe({
                channel: 'CustomerOrdersChannel',
                customer_order_id: $stateParams.id
            }, sc.order.customer_order_contents);
        }

        function calculateTotals(order){
            var x, y, i, il;

            // Считаем суммы по входящим платежам
            x = 0;
            y = 0;
            for (i = 0, il = order.incoming_transfers.length; i < il; i++) {
                var t = order.incoming_transfers[i];
                x += t.linked_total;
                y += t.amount;
            }
            sc.total_paid_linked = x;
            sc.total_paid = y;

            // Считаем суммы по отгрузкам
            x = 0;
            y = 0;
            for (i = 0, il=order.dispatch_orders.length; i < il; i++) {
                var d = order.dispatch_orders[i];
                x += d.linked_total;
                y += d.amount;
            }
            sc.total_dispatched_linked = x;
            sc.total_dispatched = y;
        }

        /**
         * следим за изменеиями в коллекции (включая свойства коллекции) при изменении пересчитываем total
         */
        sc.$watch('order.customer_order_contents', function(values){
            if(values){
                var total = 0;

                values.map(function(item){
                    total += $filter('price_net')(item, item.quantity);
                });

                sc.total = total;
            }
        }, true);

        function returnBack(){
            $state.go('app.customer_orders', {});
        }
        
        function goToLogs(){
            $state.go('app.customer_orders.view.logs', {});
        }
        
        function goEditCustomerOrder(){
            $state.go('app.customer_orders.view.edit', {});
        }
        
        function showFileModal(){
            sc.visual.showFileModal();
        }
        
        function sendCustomerOrder(){
            serverApi.sendCustomerOrderInvoice($stateParams.id, function(result){
                if(result.status == 200 && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Заказ успешно отправлен.', true);
                } else if (result.status == 200 && result.data.errors) {
                    funcFactory.showNotification("Неудача", result.data.errors, true);
                } else {
                    funcFactory.showNotification("Неудача", 'Ошибка при попытке отправить заказ.', true);
                }
            });
        }

        function confirmCustomerOrder(subdata, item) {
            var data = {
                customer_order:{
                    event: item.event
                }
            };
            serverApi.updateStatusCustomerOrder($stateParams.id, data, function(result){
                if(result.status == 200 && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Удалось ' + item.name.toLowerCase() + ' заказ', true);
                    sc.order = result.data;
                } else {
                    funcFactory.showNotification("Не удалось " + item.name.toLowerCase() + ' заказ', result.data.errors);
                }
            });
        }
    }]);
}());
(function () {

    'use strict';

    angular.module('app.dashboard').controller('DashboardCtrl', ['$scope', 'serverApi', function ($scope, serverApi) {
        $scope.data = {
            customerOrders:[],
            dispatchOrders:[]
        };
        
        serverApi.getCustomerOrders(1, "", {}, function(result){
            console.log('customer_orders', result);
            $scope.data.customerOrders = result.data.slice(0,10);
        });

        serverApi.getDispatchOrders(1, "", {}, function(result){
            $scope.data.dispatchOrders = result.data.slice(0,10);
        });
        
    }]);

}());

/**
 * Created by Egor Lobanov on 02.12.15.
 */
(function(){

    var module = angular.module('app.incoming_transfers');

    module.controller('EditIncomingTransferCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', '$q', function($scope, $state, $stateParams, serverApi, funcFactory, $q){
        var sc = $scope;
        sc.transfer ={};
        sc.data = {
            partnersList:[],
            ordersList: [],
            orderForAppend: {
                amount:0
            }
        };
        sc.visual = {
            navButtsOptions:[{type:'back', callback:goToIndex}, {type:'show', callback:goToShow}, {type:'files', callback:showFileModal}, {type:'send_email'}, {type:'logs'}],
            navTableButts:[{type:'remove', callback:removeOrder}],
            roles: {
                can_destroy: true
            },
            showFileModal: angular.noop,
            titles: ['Редактировать ' + window.gon.index.IncomingTransfer.objectTitle.toLowerCase()]
        };
        sc.partnerSelectConfig = {
            dataMethod: serverApi.getPartners
        };
        sc.orderSelectConf = {
            dataMethod: function(page, query, config, success){
                var canceler1 = $q.defer(),
                    canceler2 = $q.defer();
                var data = [],//data for callback
                    checkStatus = function(result){
                        return result.status == 200 ? result.data : [];// if result not success, return []
                    },
                    defers = [$q.defer(),$q.defer()];//requests defers
                serverApi.getCustomerOrders(page, query, {timeout:canceler1.promise}, function(result){
                    defers[0].resolve(checkStatus(result));
                });
                serverApi.getOutgoingTransfers(page, query, {timeout:canceler2.promise}, function(result){
                    defers[1].resolve(checkStatus(result));
                });
                //cancel both requests
                config.timeout.then(function(){
                    canceler1.resolve();
                    canceler2.resolve();
                });
                //wait all promises
                $q.all(defers.map(function(item){
                    return item.promise;
                })).then(function(result){
                    data = result[0].concat(result[1]);//concat results
                    success({data:data});
                });
            }
        };

        serverApi.getIncomingTransferDetails($stateParams.id, function(result){
            console.log(result.data);
            var transfer = sc.transfer = result.data;
            sc.fileModalOptions={
                url:'/api/incoming_transfers/'+ transfer.id +'/documents',
                files: transfer.documents,
                r_delete: serverApi.deleteFile,
                view: 'incoming_transfers',
                id: transfer.id
            };
        });

        sc.appendOrder = function(event){
            var data = sc.data.orderForAppend,
                append = function(){
                    sc.data.orderForAppend = {};
                    var postData = {
                        amount: data.amount
                    };
                    
                    var transfer = false;
                    if (data.type === "OutgoingTransfer") {
                        transfer = true;
                        postData.outgoing_transfer_id = data.id;
                    } else {
                        postData.customer_order_id = data.id;
                    }
                    
                    serverApi.appendIncomingTransferOrder(sc.transfer.id, postData, function(result){
                       var t = transfer?'Платеж ' + data.number: 'Заказ '+ data.number;
                       if(!result.data.errors){
                           sc.transfer.remaining_amount = result.data.money_transfer.remaining_amount;
                           sc.transfer.money_to_orders.push(result.data);
                           funcFactory.showNotification('Успешно', t + ' успешно добавлен', true);
                       }else funcFactory.showNotification('Неудалось прикрепить ' + t, result.data.errors);
                    });
                };
            if(event){
                event.keyCode == 13 && append();
            }else append();
        };

        function removeOrder(data){
            var item = data.data;
            serverApi.removeIncomingTransferOrder(sc.transfer.id, item.id, function(result){
                var transfer = item.hasOwnProperty('outgoing_transfer');
                var t = transfer?'Платеж ' + item.outgoing_transfer.incoming_code: 'Заказ '+ item.customer_order.number;
                if(!result.data.errors){
                    sc.transfer.remaining_amount = result.data.money_transfer.remaining_amount;
                    sc.transfer.money_to_orders.splice(data.index, 1);
                    funcFactory.showNotification(t + ' успешно удален','', true);
                } else {
                    funcFactory.showNotification('Неудалось удалить ' + t, result.data.errors);
                };
            });
        }

        function goToIndex(){
            $state.go('app.incoming_transfers', $stateParams);
        }

        function goToShow(){
            $state.go('app.incoming_transfers.view', $stateParams);
        }
        function showFileModal(){
            sc.visual.showFileModal();
        }
    }]);
    /**
     * filter define is item is transfer or order and append prefix icon
     */
    module.filter('f_incomingT', function(){
        return function(item){
            return item.hasOwnProperty('incoming_code') ? '<i class="fa fa-rub" title="Платеж"></i> ' + item.incoming_code: '<i class="fa fa-book" title="Заказ"></i> ' + item.number;
        };
    });
}());

/**
 * Created by Egor Lobanov on 07.11.15.
 */
(function(){

    'use strict';

    angular.module('app.incoming_transfers').controller('IncomingTransfersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'CanCan', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, CanCan, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{
                type: 'new',
                callback: createIncomingTransfer
            }],
            navTableButts:[{type:'view', callback:viewIncomingTransfer}, {type:'table_edit', callback:editIncomingTransfer}, {type:'remove', callback:removeIncomingTransfer}],
            role:{
                can_edit: CanCan.can('edit', 'IncomingTransfer'),
                can_destroy: CanCan.can('destroy', 'IncomingTransfer')
            },
            titles:[window.gon.index.IncomingTransfer.indexTitle]
        };
        sc.data = {
            incomingTransfersList:[],
            searchQuery:$stateParams.q
        };

        sc.newTransferConfig = {
            createMethod: serverApi.createIncomingTransfer,
            showForm: angular.noop
        };

        function viewIncomingTransfer(item){
            $state.go('app.incoming_transfers.view', {id:item.data.id || item.data._id});
        }

        function editIncomingTransfer(item){
            $state.go('app.incoming_transfers.view.edit', {id:item.data.id || item.data._id});
        }

        function createIncomingTransfer(){
            sc.newTransferConfig.showForm();
        }

        function removeIncomingTransfer(item){
            $.SmartMessageBox({
                title: "Удалить входящий платёж?",
                content: "Вы действительно хотите удалить входящий платёж " + item.data.number,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deleteIncomingTransfer(item.data.id, function(result){
                        if(!result.data.errors){
                            sc.data.incomingTransfersList.splice(item.index,1);
                            funcFactory.showNotification('Платеж ' + item.data.number + ' успешно удален.', '', true);
                        }else funcFactory.showNotification('Не удалось удалить платеж ' + item.data.number, result.data.errors);
                    });
                }
            });
        }
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 25.11.15.
 */
(function(){

    "use strict";

    angular.module('app.incoming_transfers').controller('ViewIncomingTransferCtrl', ['$scope', '$state', '$stateParams', 'serverApi', function($scope, $state, $stateParams, serverApi){
        var sc = $scope;
        sc.incomingTransfer = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type: 'edit', callback: goToEditIncomingTransfer}, {type:'files', callback: showFileModal}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            showFileModal: angular.noop,
            navTableButts:[{type:'view', callback: viewDocument}],
            titles: window.gon.index.IncomingTransfer.objectTitle + ': # '
        };

        serverApi.getIncomingTransferDetails($stateParams.id, function(result){
            console.log(result.data);

            var transfer = sc.incomingTransfer = result.data;
            sc.fileModalOptions={
                url:'/api/incoming_transfers/'+ transfer.id +'/documents',
                files: transfer.documents,
                r_delete: serverApi.deleteFile,
                view: 'incoming_transfers',
                id: transfer.id
            };
        });

        function returnBack(){
            $state.go('app.incoming_transfers',{});
        }
        
        function showFileModal(){
            sc.visual.showFileModal();
        }
        
        function goToEditIncomingTransfer(){
            $state.go('app.incoming_transfers.view.edit', $stateParams)  
        }
        
        function viewDocument(item){
            if (item.data.hasOwnProperty('customer_order')) {
                $state.go('app.customer_orders.view', {id: item.data.customer_order.id});    
            }
            if (item.data.hasOwnProperty('incoming_transfer')) {
                $state.go('app.incoming_transfer.view', {id: item.data.incoming_transfer.id});    
            }
        }
    }]);
}());
/**
 * Created by Egor Lobanov on 08.11.15.
 */
(function(){

    'use strict';

    angular.module('app.dispatch_orders').controller('DispatchOrdersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', function($scope, $state, $stateParams, serverApi){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[
            ],
            navTableButts:[{type:'view', callback:viewOrder}, {type:'table_edit'}, {type:'remove'}],
            titles:[window.gon.index.DispatchOrder.indexTitle]
        };

        sc.data = {
            ordersList:[],
            searchQuery:$stateParams.q
        };

        function viewOrder(id){
            $state.go('app.dispatch_orders.view', {id:id});
        }
    }]);
}());

/**
 * Created by Mikhail Arzhaev 26.11.15
 */
(function(){

    "use strict";

    angular.module('app.dispatch_orders').controller('ViewDispatchOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var _pattern = /\/?#/;

        var sc = $scope;
        sc.dispatchOrder = {};
        sc.visual = {
            navButtsOptions:[
                { type: 'back', callback: returnBack },
                { type: 'files', callback:showFileModal},
                { type: 'upd_form_pdf', callback: openDispatchOrderPdf },
                { type: 'label_pdf', callback: openLabelPdf },
                { type: 'packing_list_pdf', callback: openPackingListPdf },
                { type:'confirm_order', callback: updateStatusDispatchOrder}
            ],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            showFileModal: angular.noop,
            titles: window.gon.index.DispatchOrder.objectTitle + ': #'
        };

        sc.amontPercent = 0;
        sc.dispatchedPercent = 0;

        serverApi.getDispatchOrderDetails($stateParams.id, function(result){
            console.log(result.data);

            var dispatchOrder = sc.dispatchOrder = result.data;
            sc.amontPercent = funcFactory.getPercent(dispatchOrder.paid_amount, dispatchOrder.total);
            sc.dispatchedPercent = funcFactory.getPercent(dispatchOrder.dispatched_amount, dispatchOrder.total);

            sc.fileModalOptions={
                url:'/api/dispatch_orders/'+ dispatchOrder.id +'/documents',
                r_get: serverApi.getDocuments,
                r_delete: serverApi.deleteFile,
                view: 'dispatch_orders',
                id: dispatchOrder.id
            };
        });

        function returnBack(){
            $state.go('app.dispatch_orders',{});
        }
        
        function openDispatchOrderPdf(){
            var pdfUrl = location.href.replace(_pattern,"")+".pdf";
            window.open(pdfUrl, '_blank');
        }
        
        function openLabelPdf(){
            var pdfUrl = location.href.replace(_pattern,"")+"/label.pdf";
            window.open(pdfUrl, '_blank');
        }
        
        function openPackingListPdf(){
            var pdfUrl = location.href.replace(_pattern,"")+"/packing_list.pdf";
            window.open(pdfUrl, '_blank');
        }
        
        function showFileModal(){
            sc.visual.showFileModal();
        }
        
        sc.saveChosenPerson = function(){
            var data = {
                dispatch_order:{
                    person_id: sc.dispatchOrder.chosenPersonId
                }
            };
            serverApi.updateDispatchOrder(sc.dispatchOrder.id, data, function(result){
                if(!result.data.errors){
                    sc.dispatchOrder = result.data;
                    funcFactory.showNotification("Успешно", 'Человек выбран.',true);
                } else {
                    funcFactory.showNotification('Ошибка при выборе человека', result.data.errors);
                }
            });
        };

        function updateStatusDispatchOrder(subdata, item) {
            var data = {
                dispatch_order:{
                    event: item.event
                }
            };
            serverApi.updateStatusDispatchOrder($stateParams.id, data, function(result){
                if(result.status == 200 && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Удалось ' + item.name.toLowerCase() + ' заказ', true);
                    sc.dispatchOrder = result.data;
                } else {
                    funcFactory.showNotification("Не удалось " + item.name.toLowerCase() + ' заказ', result.data.errors);
                }
            });
        }
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 07.12.15.
 */
(function(){
    angular.module('app.manufacturers').controller('EditManufacturerCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        var sc = $scope;
        sc.data ={
            manufacturer:{}
        };
        sc.visual = {
            navButtsOptions:[{type:'back', callback:goToIndex}, {type:'show', callback:goToShow}],
            roles: {}
        };

        sc.tinymceOptions = funcFactory.getTinymceOptions();

        serverApi.getManufacturerDetails($stateParams.id, function(result){
            var manufacturer = sc.data.manufacturer = result.data;
            sc.visual.roles = {
                can_edit: manufacturer.can_edit,
                can_destroy: manufacturer.can_destroy
            }
        });

        /**
         * Обновляем информацию по категории
         */
        sc.saveManufacturer = function(){
            var manufacturer = sc.data.manufacturer;
            var data = {
                    manufacturer:{
                        name: manufacturer.name,
                        description: manufacturer.description
                    }
                };
            serverApi.updateManufacturer(manufacturer.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    funcFactory.showNotification("Успешно", 'Производитель '+manufacturer.name+' успешно отредактирован.',true);
                }else funcFactory.showNotification("Неудача", 'Не удалось отредактировать производителя '+manufacturer.name,true);
            });
        };

        function goToShow(){
            $state.go('app.manufacturers.view', $stateParams);
        }
        function goToIndex(){
            $state.go('app.manufacturers', $stateParams);
        }
    }]);
}());

/**
 * Created by Mikhail Arzhaev on 20.11.15.
 */
(function(){

    'use strict';

    angular.module('app.manufacturers').controller('ManufacturersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.visual = {
            navButtsOptions:[{
                type: 'new',
                callback: function(){}
            }],
            navTableButts:[{type:'view', callback:viewManufacturer}, {type:'table_edit', callback: editManufacturer}, {type:'remove', callback:removeManufacturer}]
        };
        sc.data = {
            manufacturersList:[],
            searchQuery:$stateParams.q
        };

        function viewManufacturer(item){
            $state.go('app.manufacturers.view', {id:item.data.id || item.data._id});
        }
        
        function editManufacturer(item){
            $state.go('app.manufacturers.view.edit', {id:item.data.id || item.data._id});
        }

        function removeManufacturer(item){
            var data = item.data;
            $.SmartMessageBox({
                title: "Удалить производителя?",
                content: "Вы действительно хотите удалить производителя " + data.name,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deleteManufacturer(data.id, function(result){
                        if(!result.data.errors){
                            sc.data.manufacturersList.splice(item.index,1);
                            funcFactory.showNotification('Производитель ' + data.name + ' успешно удален.', '', true);
                        } else {
                            funcFactory.showNotification('Не удалось удалить производителя ' + data.name, result.data.errors);
                        }
                    });
                }
            });
        }
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 20.11.15.
 */
(function(){

    "use strict";

    angular.module('app.manufacturers').controller('ViewManufacturerCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$sce', function($scope, $state, $stateParams, serverApi, $sce){
        var sc = $scope;
        sc.manufacturer = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'edit', callback:editManufacturer}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            }
        };

        serverApi.getManufacturerDetails($stateParams.id, function(result){
            console.log(result.data);
            sc.manufacturer = result.data;
            sc.manufacturer.description = $sce.trustAsHtml(result.data.description);
        });

        function returnBack(){
            $state.go('app.manufacturers',{});
        }
        function editManufacturer(){
            $state.go('app.manufacturers.view.edit',$stateParams);
        }
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 24.12.15.
 */
(function(){

    'use strict';

    angular.module('app.news').controller('NewsCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        
        var sc = $scope;
        
        sc.visual = {
            navButtsOptions:[{
                type: 'new',
                callback: function(){}
            }],
            navTableButts:[{type:'view', callback: viewNews}, {type:'table_edit', callback: editNews}, {type:'remove', callback: removeNews}]
        };
        
        sc.data = {
            newsList:[],
            searchQuery:$stateParams.q
        };

        function viewNews(data){
            $state.go('app.news.view', {id:data.id || data._id});
        }
        
        function editNews(data){
            $state.go('app.news.view.edit', {id: (data.id || data._id)});
        }

        function removeNews(data){
            $.SmartMessageBox({
                title: "Удалить страницу?",
                content: "Вы действительно хотите удалить страницу " + data.title,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deletePage(data.id, function(result){
                        if(!result.data.errors){
                            sc.data.pagesList.splice(data.index,1);
                            funcFactory.showNotification('Страница ' + data.title + ' успешно удалена.', '', true);
                        } else {
                            funcFactory.showNotification('Не удалось удалить страницу ' + data.title, result.data.errors);
                        }
                    });
                }
            });
        }
    }]);
}());
/**
 * Created by Egor Lobanov on 08.12.15.
 */
(function(){
    angular.module('app.outgoing_transfers').controller('EditOutgoingTransferCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.transfer ={};
        sc.data = {
            partnersList:[],
            ordersList: [],
            orderForAppend: {
                amount:0
            }
        };
        sc.visual = {
            navButtsOptions:[{type:'back', callback:goToIndex}, {type:'show', callback:goToShow}, {type:'files', callback:showFileModal}, {type:'send_email'}, {type:'logs'}],
            navTableButts:[{type:'remove', callback:removeOrder}],
            roles: {
                can_destroy: true
            },
            showFileModal: angular.noop,
            titles: ['Редактировать ' + window.gon.index.OutgoingTransfer.objectTitle.toLowerCase()]
        };
        sc.partnerSelectConfig = {
            dataMethod: serverApi.getPartners
        };
        sc.orderSelectConf = {
            dataMethod: serverApi.getSupplierOrders
        };

        serverApi.getOutgoingTransferDetails($stateParams.id, function(result){
            console.log(result.data);
            var transfer = sc.transfer = result.data;
            sc.fileModalOptions={
                url:'/api/outgoing_transfers/'+ transfer.id +'/documents',
                files: transfer.documents,
                r_delete: serverApi.deleteFile,
                view: 'outgoing_transfers',
                id: transfer.id
            };
        });

        sc.appendOrder = function(event){
            var data = sc.data.orderForAppend,
                append = function(){
                    sc.data.orderForAppend = {};
                    serverApi.appendOutgoingTransferOrder(sc.transfer.id, {
                        outgoing_transfer_id: sc.transfer.id,
                        amount: data.amount,
                        supplier_order_id: data.id
                    }, function(result){
                        if(!result.data.errors){
                            console.log(result.data);
                            sc.transfer.remaining_amount = result.data.outgoing_money_distributions.remaining_amount;
                            sc.transfer.outgoing_money_distributions.push(angular.extend({
                                amount: data.amount,
                                supplier_order: {
                                    number: data.number
                                }
                            }, result.data));
                            funcFactory.showNotification('Успешно','Заказ ' + data.number + ' успешно добавлен', true);
                        }else funcFactory.showNotification('Неудалось прикрепить заказ ' + data.number, result.data.errors);
                    });
                };
            if(event){
                event.keyCode == 13 && append();
            }else append();
        };

        function removeOrder(item){
            var data = item.data;
            serverApi.removeOutgoingTransferOrder(sc.transfer.id, data.id, function(result){
                if(!result.data.errors){
                    sc.transfer.remaining_amount = result.data.outgoing_money_distributions.remaining_amount;
                    sc.transfer.outgoing_money_distributions.splice(item.index, 1);
                    funcFactory.showNotification('Заказ ' + data.supplier_order.number + ' успешно удален','', true);
                }else funcFactory.showNotification('Неудалось удалить заказ ' + data.supplier_order.number, result.data.errors);
            });
        }
        function goToIndex(){
            $state.go('app.outgoing_transfers', $stateParams);
        }

        function goToShow(){
            $state.go('app.outgoing_transfers.view', $stateParams);
        }
        function showFileModal(){
            sc.visual.showFileModal();
        }
    }]);
}());
/**
 * Created by Egor Lobanov on 07.11.15.
 */
(function(){

    'use strict';

    angular.module('app.outgoing_transfers').controller('OutgoingTransfersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'CanCan', 'funcFactory', function($scope, $state, $stateParams, serverApi, CanCan, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{
                type: 'new',
                callback: createOutgoingTransfer
            }],
            navTableButts:[{type:'view', callback:viewOutgoingTransfer}, {type:'table_edit', callback:editOutgoingTransfer}, {type:'remove', callback:removeOutgoingTransfer}],
            role:{
                can_edit: CanCan.can('edit', 'OutgoingTransfer'),
                can_destroy: CanCan.can('destroy', 'OutgoingTransfer')
            },
            titles:[window.gon.index.OutgoingTransfer.indexTitle]
        };
        sc.data = {
            outgoingTransfersList:[],
            searchQuery:$stateParams.q
        };
        sc.newTransferConfig = {
            createMethod: serverApi.createOutgoingTransfer,
            showForm: angular.noop
        };

        function viewOutgoingTransfer(item){
            $state.go('app.outgoing_transfers.view', {id:item.data.id || item.data._id});
        }

        function editOutgoingTransfer(item){
            $state.go('app.outgoing_transfers.view.edit', {id:item.data.id || item.data._id});
        }

        function createOutgoingTransfer(){
            sc.newTransferConfig.showForm();
        }

        function removeOutgoingTransfer(item){
            $.SmartMessageBox({
                title: "Удалить исходящий платёж?",
                content: "Вы действительно хотите удалить исходящий платёж " + item.data.number,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deleteOutgoingTransfer(item.data.id, function(result){
                        if(!result.data.errors){
                            sc.data.outgoingTransfersList.splice(item.index,1);
                            funcFactory.showNotification('Исходящий платёж', 'Вы удалили исходящий платёж '+item.data.number, true);
                        }else funcFactory.showNotification('Не удалось удалить платеж ' + item.data.number, result.data.errors);
                    });
                }
            });
        }
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 25.11.15.
 */
(function(){

    "use strict";

    angular.module('app.outgoing_transfers').controller('ViewOutgoingTransferCtrl', ['$scope', '$state', '$stateParams', 'serverApi', function($scope, $state, $stateParams, serverApi){
        var sc = $scope;
        sc.outgoingTransfer = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'files', callback:showFileModal}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            showFileModal: angular.noop,
            titles: window.gon.index.OutgoingTransfer.objectTitle + ' #'
        };

        serverApi.getOutgoingTransferDetails($stateParams.id, function(result){
            console.log(result.data);

            var transfer = sc.outgoingTransfer = result.data;
            sc.fileModalOptions={
                url:'/api/outgoing_transfers/'+ transfer.id +'/documents',
                files: transfer.documents,
                r_delete: serverApi.deleteFile,
                view: 'outgoing_transfers',
                id: transfer.id
            };
        });

        function returnBack(){
            $state.go('app.outgoing_transfers',{});
        }
        function showFileModal(){
            sc.visual.showFileModal();
        }
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 24.12.15.
 */
(function(){

    'use strict';

    angular.module('app.pages').controller('PagesCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        
        var sc = $scope;
        
        sc.visual = {
            navButtsOptions:[{
                type: 'new',
                callback: function(){}
            }],
            navTableButts:[{type:'view', callback: viewPage}, {type:'table_edit', callback: editPage}, {type:'remove', callback: removePage}]
        };
        
        sc.data = {
            pagesList:[],
            searchQuery:$stateParams.q
        };

        function viewPage(data){
            console.log('page', data);
            $state.go('app.pages.view', {id:data.id || data._id});
        }
        
        function editPage(data){
            $state.go('app.pages.view.edit', {id: (data.id || data._id)});
        }

        function removePage(data){
            $.SmartMessageBox({
                title: "Удалить страницу?",
                content: "Вы действительно хотите удалить страницу " + data.title,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deletePage(data.id, function(result){
                        if(!result.data.errors){
                            sc.data.pagesList.splice(data.index,1);
                            funcFactory.showNotification('Страница ' + data.title + ' успешно удалена.', '', true);
                        } else {
                            funcFactory.showNotification('Не удалось удалить страницу ' + data.title, result.data.errors);
                        }
                    });
                }
            });
        }
    }]);
}());
/**
 * Created by Mikhail Arzhaev 24.12.2015
 */
(function(){

    "use strict";

    angular.module('app.pages').controller('ViewPageCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$sce', function($scope, $state, $stateParams, serverApi, $sce){
        var sc = $scope;
        sc.page = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack},{type:'edit', callback:editPage}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            }
        };

        serverApi.getPageDetails($stateParams.id, function(result){
            sc.page = result.data;
            sc.page.content = $sce.trustAsHtml(result.data.content);
        });

        function returnBack(){
            $state.go('app.pages',{});
        }
        
        function editPage(){
            $state.go('app.pages.view.edit',$stateParams);
        }
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 20.11.15.
 */
(function(){

    'use strict';

    angular.module('app.pdf_catalogues').controller('PdfCataloguesCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'CanCan', 'funcFactory', function($scope, $state, $stateParams, serverApi, CanCan, funcFactory){
        var sc = $scope;
        sc.visual = {
            navButtsOptions:[{
                type: 'new',
                callback: function(){}
            }],
            navTableButts:[{type:'view', callback:viewPdfCatalogue}, {type:'table_edit'}, {type:'remove', callback:removePdfCatalogue}],
            role:{
                can_edit: CanCan.can('edit', 'pdf_catalogues'),
                can_destroy: CanCan.can('destroy', 'pdf_catalogues')
            }
        };

        sc.data = {
            pdfCataloguesList:[],
            searchQuery:$stateParams.q
        };

        function viewPdfCatalogue(item){
            $state.go('app.pdf_catalogues.view', {id:item.data.id || item.data._id});
        }

        function removePdfCatalogue(item){
            var title = item.data.title;
            $.SmartMessageBox({
                title: "Удалить PDF каталог?",
                content: "Вы действительно хотите удалить PDF каталог " + title,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deletePdfCatalogue(item.data.id, function(result){
                         if(!result.data.errors){
                             funcFactory.showNotification('Успешно', 'Каталог ' + title + ' удален!', true);
                             sc.data.pdfCataloguesList.splice(item.index, 1);
                         }else funcFactory.showNotification('Не удалось удалить PDF каталог', result.data.errors);
                    });
                }
            });
        }
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 20.11.15.
 */
(function(){

    "use strict";

    angular.module('app.pdf_catalogues').controller('ViewPdfCatalogueCtrl', ['$scope', '$state', '$stateParams', 'serverApi', function($scope, $state, $stateParams, serverApi){
        var sc = $scope;
        sc.pdfCatalogue = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            }
        };

        serverApi.getPdfCatalogueDetails($stateParams.id, function(result){
            sc.pdfCatalogue = result.data;
        });

        function returnBack(){
            $state.go('app.pdf_catalogues',{});
        }
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 09.12.15.
 */
(function(){
    angular.module('app.partners').controller('EditPartnerCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        var sc = $scope;
        sc.data ={
            partner:{}
        };
        sc.visual = {
            navButtsOptions:[{type:'back', callback:goToIndex}, {type:'show', callback:goToShow}],
            roles: {},
            titles: 'Редактирование:  ' +window.gon.index.Partner.objectTitle.toLowerCase()
        };
        
        serverApi.getPartnerDetails($stateParams.id, function(result){
            console.log(result.data);
            sc.data.partner = result.data;
        });

        /**
         * Обновляем информацию по категории
         */
        sc.savePartner = function(){
            var partner = sc.data.partner;
            var data = {
                    partner:{
                        name: partner.name,
                        legal_name: partner.legal_name,
                        delivery_address: partner.delivery_address,
                        legal_address: partner.legal_address,
                        phone: partner.phone
                    }
                };
            serverApi.updatePartner(partner.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    funcFactory.showNotification("Успешно", 'Категория '+partner.name+' успешно отредактирована.',true);
                }else funcFactory.showNotification("Неудача", 'Не удалось отредактировать категорию '+partner.name,true);
            });
        };

        function goToShow(){
            $state.go('app.partners.view', $stateParams);
        }
        function goToIndex(){
            $state.go('app.partners', $stateParams);
        }
    }]);
}());

/**
 * Created by Mikhail Arzhaev on 26.11.15.
 */
(function(){

    'use strict';

    angular.module('app.partners').controller('PartnersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{type: 'new', callback: createPartner}],
            navTableButts:[{type:'view', callback:viewPartner}, {type:'table_edit', callback:editPartner}, {type:'remove'}],
            titles:[window.gon.index.Partner.indexTitle]
        };
        
        sc.data = {
            partnersList:[],
            searchQuery:$stateParams.q
        };
        
        sc.newPartnerData = {
            inn: '',
            name: '',
            delivery_address: '',
            phone: ''
        };
        
        sc.addNewPartner = function(){
            serverApi.createPartner(sc.newPartnerData, function(result){
                if(!result.data.errors){
                    sc.data.partnersList.unshift(result.data);
                    funcFactory.showNotification('Партнёр успешно добавлен', '', true);
                    sc.clearNewPartnerData();
                } else {
                    funcFactory.showNotification('Не удалось создать партнёра', result.data.errors);
                };
            });
        };

        sc.clearNewPartnerData = function(){
            sc.newPartnerData = {
                inn: '',
                name: '',
                delivery_address: '',
                phone: ''
            };
        };
        
        sc.onAddFile = function(){
            //this.parentNode.nextSibling.value = this.value;
        };

        function viewPartner(data){
            $state.go('app.partners.view', {id:data.id || data._id});
        }

        function editPartner(data){
            $state.go('app.partners.view.edit', {id:data.id || data._id});
        }

        function createPartner(){
            $('#createPartnerModal').modal('show');
        }
    }]);
}());
/**
 * Created by Egor Lobanov on 17.11.15.
 * Контроллер страницы "Партнер"
 */
(function(){

    angular.module('app.partners').controller('ViewPartnerCtrl',['$scope', '$state', 'serverApi', '$stateParams', 'funcFactory', function($scope, $state, serverApi, $stateParams, funcFactory){
        var sc = $scope;
        
        sc.partner = {};
        
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack},{type:'edit', callback:editPartner}, {type:'files'}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            titles: window.gon.index.Partner.objectTitle + ': '
        };
        
        sc.newPerson = {
        };

        serverApi.getPartnerDetails($stateParams.id, function(result){
            console.log(result.data);
            sc.partner = result.data;
            
            serverApi.getCustomerOrders(1, "-"+sc.partner.prefix+"-", {}, function(result){
                console.log("CustomerOrders: ", result);
                sc.partner.customerOrders = result.data;
            });
            
            serverApi.getDispatchOrders(1, "-"+sc.partner.prefix+"-", {}, function(result){
                console.log("DispatchOrders: ", result);
                sc.partner.dispatchOrders = result.data;
            });
        });
        
        function returnBack(){
            $state.go('app.partners',{});
        }
        
        function editPartner(){
            $state.go('app.partners.view.edit',{});
        }
        
        sc.createPerson = function(){
            $('#createPersonModal').modal('show');
        };
        
        sc.clearPerson = function(){
            sc.newPerson = {};
            sc.passport_scan = sc.person_photo= "";
        };
        
        sc.addNewPerson = function(){
            var data  = {
                person: sc.newPerson
            };
            serverApi.createPerson(sc.partner.id, data, function(result){
                if(!result.data.errors){
                    funcFactory.showNotification('Представитель успешно добавлен', '', true);
                    sc.partner.people.push(result.data);
                    sc.clearNewPartnerData();
                } else {
                    funcFactory.showNotification('Не удалось создать представителя', result.data.errors);
                }
            });
        };

        sc.appendScanHandler = function(file){
            sc.passport_scan=file.name;
            sc.newPerson.passport_scan = file;
        };

        sc.appendPersonPhotoHandler = function(file){
            sc.person_photo=file.name;
            sc.newPerson.person_photo = file;
        };
    }]);
}());

/**
 * Created by Mikhail Arzhaev on 07.12.15.
 */
(function(){
    angular.module('app.products').controller('EditProductCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.data ={
            product:{},
            manufacturers:[],
            catalogues:[]
        };
        sc.visual = {
            navButtsOptions:[{type:'show', callback:goToShow}],
            roles:{},
            showFileModal: angular.noop
        };

        sc.tinymceOptions = funcFactory.getTinymceOptions();
        //manufacture select options
        sc.mSelectConfig = {
            dataMethod: serverApi.getManufacturers
        };
        //category select options
        sc.cselectConfig = {
            dataMethod: serverApi.getCatalogues
        };

        serverApi.getProduct($stateParams.id, function(result){
            console.log(result.data);
            var product = sc.data.product = result.data;
            product.vat_rate.selected = product.vat_rate.selected.toString();// to let 'select' set selected option from model
            sc.visual.roles = {
                can_edit: product.can_edit,
                can_destroy: product.can_destroy
            };

            setFileWorkerOptions(product);
        });

        function setFileWorkerOptions(product){
            sc.fileModalOptions={
                url:'/api/products/'+ product.id +'/image',
                files: [product.image],
                r_delete: serverApi.deleteImage,
                view: 'products',
                id: product.id,
                filesCount:1,
                sending: function(file, xhr, formData){
                    var f = this.serverFiles,
                        files = this.files;

                    if(f.length>0 && f[0]) {
                        this.removeFile(f[0]);
                        f.splice(0,1);
                    }
                    files.length>1 && this.removeFile(files[0]);

                    //append title to formData before send
                    formData.append("title", file.title);
                },
                complete: function(file){
                    product.image_url = '/uploads/'+ file.id + '/original' + this.cutExtension(file.name).extension;
                    !sc.$$phase && sc.$apply(angular.noop);
                },
                dropzoneConfig: {
                    acceptedFiles: '.jpg,.png,.gif'
                }
            };
        }

        /**
         * Обновляем информацию по категории
         */
        sc.saveProduct = function(){
            var product = sc.data.product;
            var data = {
                    product:{
                        name: product.name,
                        description: product.description,
                        article: product.article,
                        manufacturer_id: product.manufacturer.id,
                        catalogue_ids: (product.catalogues || []).map(function(item){
                            return item.id;
                        }),
                        type: product.type.selected,
                        unit: product.unit.selected,
                        vat_rate: product.vat_rate.selected,
                        weight: product.weight
                    }
                };
            serverApi.updateProduct(product.id, data, function(result){
                console.log(result);
                if(!result.data.errors){
                    funcFactory.showNotification("Успешно", 'Товар '+product.name+' успешно отредактирована.',true);
                } else {
                    funcFactory.showNotification('Не удалось отредактировать категорию '+product.name, result.data.errors);
                }
            });
        };

        function goToShow(){
            $state.go('app.product', $stateParams);
        }
    }]);
}());
/**
 * Created by Egor Lobanov on 04.11.15.
 * Контроллер страицы просмотра продукта
 */
(function() {

    'use strict';

    angular.module('app.products').controller('PartnerLogsProductCtrl', ['$scope', '$stateParams', 'serverApi', '$state', 'funcFactory', function($scope, $stateParams, serverApi, $state, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{type:'edit', callback: goToEdit}, {type:'show', callback: goToProduct}],
            navTableButts:[{type:'remove', callback:removePartnerLog}]
        };

        sc.product = {};// данные продукта
        sc.partner_logs = [];

        //получаем информацию о продукте при загрузке контроллера $stateParams.id - id продукта
        serverApi.getProduct($stateParams.id, function(result){
            sc.product = result.data;
        });

        //получаем информацию о продукте при загрузке контроллера $stateParams.id - id продукта
        serverApi.getProductPartnerLogs($stateParams.id, function(result){
            sc.partner_logs = result.data;
        });

        function goToEdit(){
            $state.go('app.product.edit', $stateParams);
        }

        function goToProduct(){
            $state.go('app.product', $stateParams);
        }

        function removePartnerLog(item){
            serverApi.deleteProductPartnerLog(sc.product.id, item.id, function(result){
                if(!result.data.errors){
                    for (var i=0; i < sc.partner_logs.other_logs.length; i++) {
                        if(sc.partner_logs.other_logs[i].id === item.id) {
                            sc.partner_logs.other_logs.splice(i,1);
                            break;
                        }
                    };
                    for (var i=0; i < sc.partner_logs.mfk_logs.length; i++) {
                        if(sc.partner_logs.mfk_logs[i].id === item.id) {
                            sc.partner_logs.mfk_logs.splice(i,1);
                            break;
                        }
                    }
                    funcFactory.showNotification('Лог удален:', item.human_name, true);
                } else {
                    funcFactory.showNotification('Не удалось удалить лог', result.data.errors);
                }
            });
        }
    }]);
}());
/**
 * Created by Egor Lobanov on 04.11.15.
 * Контроллер страицы просмотра продукта
 */
(function() {

    'use strict';

    angular.module('app.products').controller('ProductCtrl', ['$scope', '$stateParams', 'serverApi', '$state', 'funcFactory', function($scope, $stateParams, serverApi, $state, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{type:'edit', callback: goToEdit}, {type:'logs', callback: goToPartnerLogs}, {type: 'at_partners', callback: goToSupplierInfos}],
            roles: {}
        };

        sc.product = {};// данные продукта
        sc.data = {
            quantity:0
        };

        //получаем информацию о продукте при загрузке контроллера $stateParams.id - id продукта
        serverApi.getProduct($stateParams.id, function(result){
            sc.product = result.data;
            console.log(result.data);
        });

        sc.getLeadTime = function(id, quantity){
            if(event.keyCode == 13){
                serverApi.getLeadTime(id, quantity, function(result){
                    var info = result.data.lead_time_info;
                    funcFactory.showNotification("Успешно", 'Тариф: ' + info.price_tarif + " руб., Скидка: " + info.discount + "%, Закупка: " + info.cost + " руб., Срок поставки: " + info.delivery_date + ", Мин. кол-во: " + info.quantity_min, true);
                });
            }
        };

        function goToEdit(){
            $state.go('app.product.edit', $stateParams);
        }

        function goToPartnerLogs(){
            $state.go('app.product.partner_logs', $stateParams);
        }

        function goToSupplierInfos(){
            $state.go('app.product.supplier_infos', $stateParams);
        }
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 23.12.15.
 * Контроллер страицы просмотра продукта
 */
(function() {

    'use strict';

    angular.module('app.products').controller('SupplierInfosProductCtrl', ['$scope', '$stateParams', 'serverApi', '$state', function($scope, $stateParams, serverApi, $state){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{type: 'edit', callback: goToEdit}, {type: 'show', callback: goToProduct}],
            navTableButts:[{type: 'view'},{type: 'table_edit'},{type: 'remove'}]
        };

        sc.product = {};// данные продукта
        sc.supplier_infos = [];

        //получаем информацию о продукте при загрузке контроллера $stateParams.id - id продукта
        serverApi.getProduct($stateParams.id, function(result){
            sc.product = result.data;
        });

        //получаем информацию о продукте при загрузке контроллера $stateParams.id - id продукта
        serverApi.getProductSupplierInfos($stateParams.id, function(result){
            sc.supplier_infos = result.data;
        });

        function goToEdit(){
            $state.go('app.product.edit', $stateParams);
        }

        function goToProduct(){
            $state.go('app.product', $stateParams);
        }
    
//            function removePartnerLog(item){
//                serverApi.deleteProductPartnerLog(sc.product.id, item.id, function(result){
//                    if(!result.data.errors){
//                        for (var i=0; i < sc.partner_logs.other_logs.length; i++) {
//                            if(sc.partner_logs.other_logs[i].id === item.id) {
//                                sc.partner_logs.other_logs.splice(i,1);
//                                break;
//                            }
//                        };
//                        for (var i=0; i < sc.partner_logs.mfk_logs.length; i++) {
//                            if(sc.partner_logs.mfk_logs[i].id === item.id) {
//                                sc.partner_logs.mfk_logs.splice(i,1);
//                                break;
//                            }
//                        }
//                        funcFactory.showNotification('Лог удален:', item.human_name, true);
//                    } else {
//                        funcFactory.showNotification('Не удалось удалить лог', result.data.errors);
//                    }
//                });
//            };
    }]);
}());
/**
 * Created by Egor Lobanov on 09.12.15.
 */
(function(){
    angular.module('app.receive_orders').controller('EditReceiveOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.receiveOrder = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:goToIndex}, {type:'show', callback:goToShow}, {type:'files', callback:showFileModal}],
            navTableButts:[{type:'table_edit', callback:updateContentsProduct}, {type:'remove', callback:deleteContentsProduct}],
            roles:{
                can_edit:true,
                can_destroy: true
            },
            showFileModal: angular.noop,
            titles: 'Редактировать ' + window.gon.index.ReceiveOrder.objectTitle.toLowerCase()
        };
        sc.data = {};
        sc.productSelectConf = {
            dataMethod: function(page, query, config, success){
                if(page>1) success({data:[]});
                else serverApi.getUnreceivedProducts($stateParams.id, query, config, success);
            }
        };

        function clearProductForAppend (){
            sc.data.productForAppend={country:'',gtd:'', quantity:0, total:0}
        }
        clearProductForAppend();

        serverApi.getReceiveOrderDetails($stateParams.id, function(result){
            if(!result.data.errors){
                var receiveOrder = sc.receiveOrder = result.data;
                funcFactory.setPageTitle('Поступление ' + sc.receiveOrder.number);

                sc.fileModalOptions={
                    url:'/api/receive_orders/'+ receiveOrder.id +'/documents',
                    files: receiveOrder.documents,
                    r_delete: serverApi.deleteFile,
                    view: 'receive_orders',
                    id: receiveOrder.id
                };
            }else funcFactory.showNotification('Ошибка загрузки данных', result.data.errors);
        });

        sc.appendOrder = function(event){
            var append = function(){
                var data = sc.data.productForAppend,
                    post = {
                        product_id: data.product.id,
                        quantity: data.quantity,
                        country: data.country || '',
                        gtd: data.gtd || '',
                        total_w_vat: data.total,
                        supplier_order_id: data.supplier_order.id
                    };
                serverApi.createReceiveOrderContents(sc.receiveOrder.id, post, function(result){
                    if(!result.data.errors){
                        funcFactory.showNotification('Успешно', 'Продукт ' + data.product.name + ' успешно добвален', true);
                        sc.receiveOrder.product_order_contents.push(angular.extend(data, result.data));
                        clearProductForAppend();
                    }else funcFactory.showNotification('Не удалось добавить продукт ' + data.product.name, result.data.errors);
                });
            };
            var p = sc.data.productForAppend.product;
            if(p && p.id) if(event){
                event.keyCode == 13 && append();
            }else append();
        };

        sc.updateContentsProduct = updateContentsProduct;
        function updateContentsProduct(row, item, event){
            var updateFunc = function(){
                var data = row.data;
                var put = {
                    quantity: data.quantity,
                    country: data.country || '',
                    gtd: data.gtd || '',
                    total_w_vat: data.total
                };
                serverApi.updateReceiveOrderContents(sc.receiveOrder.id, data.id, put, function(result){
                    if(!result.data.errors){
                        var r = sc.receiveOrder.product_order_contents;
                        r[row.index] = angular.extend(r[row.index], result.data);
                        funcFactory.showNotification('Успешно', 'Продукт ' + data.product.name + ' успешно обновлен', true);
                    }else funcFactory.showNotification('Не удалось обновить продукт ' + data.product.name, result.data.errors);
                })
            };
            if(event){
                event.keyCode == 13 && updateFunc();
            }else updateFunc()
        }

        function deleteContentsProduct(item){
            var data = item.data;
            serverApi.deleteReceiveOrderContents(sc.receiveOrder.id, data.id, function(result){
                if(!result.data.errors){
                    funcFactory.showNotification('Успешно', 'Продукт ' + data.product.name + ' успешно удален', true);
                    sc.receiveOrder.product_order_contents.splice(item.index, 1);
                }else funcFactory.showNotification('Не удалось удалить продукт ' + data.product.name, result.data.errors);
            });
        }

        sc.initMaxValue = function(item, prop){
            item[prop + '_max'] = item[prop];
        };

        sc.onSelectProduct = function(item){
            item.total_max = item.total;
            item.quantity_max = item.quantity;
        };

        function goToIndex(){
            $state.go('app.receive_orders', $stateParams);
        }
        function goToShow(){
            $state.go('app.receive_orders.view', $stateParams);
        }
        function showFileModal(){
            sc.visual.showFileModal();
        }
        
        sc.saveReceiveOrderInfo = function(){
            var receiveOrder = sc.receiveOrder,
                data = {
                    receive_order:{
                        number: receiveOrder.number,
                        vat_code: receiveOrder.vat_code,
                        partner_id: receiveOrder.partner.id,
                        date: receiveOrder.date
                    }
                };
            serverApi.updateReceiveOrder(receiveOrder.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    funcFactory.showNotification("Успешно", 'Заказ '+receiveOrder.number+' успешно отредактирован.',true);
                }else funcFactory.showNotification("Неудача", 'Не удалось отредактировать заказ '+receiveOrder.number,true);
            });
        }
    }]);
}());

/**
 * Created by Mikhail Arzhaev on 26.11.15.
 */
(function(){

    'use strict';

    angular.module('app.receive_orders').controller('ReceiveOrdersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'CanCan', 'funcFactory', function($scope, $state, $stateParams, serverApi, CanCan, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{ type: 'new', callback: createNewOrder }],
            navTableButts:[{type:'view', callback:viewReceiveOrder}, {type:'table_edit', callback:editReceiveOrder}, {type:'remove', callback:deleteReceiveOrder}],
            role:{
                can_edit: CanCan.can('edit', 'ReceiveOrder'),
                can_destroy: CanCan.can('destroy', 'ReceiveOrder')
            },
            titles: [window.gon.index.ReceiveOrder.indexTitle]
        };

        sc.data = {
            ordersList:[],
            partnersList:[],
            searchQuery:$stateParams.q
        };
        
        sc.partnerSelectConfig ={
            dataMethod: serverApi.getPartners
        };
        
        sc.newOrderData = {};
        
        function createNewOrder(){
            sc.newOrderData.date = new Date();
            $('#createNewReceiveOrderModal').modal('show');
        }
        
        sc.addNewOrder = function(){
            var data = {
                date: sc.newOrderData.date,
                number: sc.newOrderData.number,
                vat_code: sc.newOrderData.vat_code,
                partner_id: sc.newOrderData.partner.id
            };
            serverApi.createReceiveOrder(data, function(result){
                if(!result.data.errors){
                    sc.data.ordersList.unshift(result.data);
                    funcFactory.showNotification('Поступление успешно создано', '', true);
                    sc.clearCreateOrder();
                    $state.go('app.receive_orders.view.edit', {id: result.data.id});
                } else {
                    funcFactory.showNotification('Не удалось создать поступление', result.data.errors);
                };
            });
        };

        sc.clearCreateOrder = function(){
            sc.newOrderData = {};
        };

        function viewReceiveOrder(item){
           $state.go('app.receive_orders.view', {id:item.data.id || item.data._id});
        }
        function editReceiveOrder(item){
           $state.go('app.receive_orders.view.edit', {id:item.data.id || item.data._id});
        }
        function deleteReceiveOrder(item){
            $.SmartMessageBox({
                title: "Удалить заказ?",
                content: "Вы действительно хотите удалить поступление " + item.data.number,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deleteReceiveOrder(item.data.id, function(result){
                        if(!result.data.errors){
                            sc.data.ordersList.splice(item.index,1);
                            funcFactory.showNotification('Поступление ' + item.data.number + ' успешно удалено.', '', true);
                        }else funcFactory.showNotification('Не удалось удалить поступление ' + item.data.number, result.data.errors);
                    });
                }
            });
        }
    }]);
}());

/**
 * Created by Mikhail Arzhaev 26.11.15
 */
(function(){

    "use strict";

    angular.module('app.receive_orders').controller('ViewReceiveOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.receiveOrder = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'files', callback:showFileModal}, {type:'edit', callback: goEditReceiveOrder}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            showFileModal: angular.noop,
            titles: window.gon.index.ReceiveOrder.objectTitle + ': #'
        };

        sc.amontPercent = 0;
        sc.receivedPercent = 0;

        serverApi.getReceiveOrderDetails($stateParams.id, function(result){
            console.log(result.data);
            var receiveOrder = sc.receiveOrder = result.data;
            funcFactory.setPageTitle('Поступление ' + sc.receiveOrder.number);
            sc.amontPercent = funcFactory.getPercent(receiveOrder.paid_amount, receiveOrder.total);
            sc.receivedPercent = funcFactory.getPercent(receiveOrder.receivedPercent, receiveOrder.total);

            sc.fileModalOptions={
                url:'/api/receive_orders/'+ receiveOrder.id +'/documents',
                files: receiveOrder.documents,
                r_delete: serverApi.deleteFile,
                view: 'receive_orders',
                id: receiveOrder.id
            };
        });

        function returnBack(){
            $state.go('app.receive_orders',{});
        }
        function showFileModal(){
            sc.visual.showFileModal();
        }
        
        function goEditReceiveOrder(){
            $state.go('app.receive_orders.view.edit', $stateParams)
        }
    }]);
}());
/**
 * Created by Egor Lobanov on 02.11.15.
 * Контролер страницы поиска продуктов
 */
(function(){

        'use strict';

        angular.module('app.search').controller('TopSearchCtrl', ['$scope', '$stateParams', '$location', '$state', 'serverApi', 'CanCan', function($scope, $stateParams, $location, $state, serverApi, CanCan){
            var sc = $scope;

            sc.data = {
                searchText: decodeURIComponent($stateParams.searchString), //содержимое сроки поиска в топ меню
                searchList: [] // массив с результатами поиска
            };
            sc.visual = {
                //контролы таблицы
                navButtsOptions:[
                    {type:'view', callback: viewProduct },
                    {type:'table_edit', callback: editProduct},
                    {type:'remove'}
                ],
                role:{
                    can_edit: CanCan.can('Product', 'edit'),
                    can_destroy: CanCan.can('Product', 'destroy')
                }
            };

            /**
             * Открывает view с просмотром информации о продукте
             * @param id - id продукта информацию по которому необходимо посмотреть
             */
            function viewProduct(id){
                $state.go('app.product', {id: id});
            }
            
            /**
             * Открывает edit для редактирования товара
             * @param id - id продукта информацию по которому необходимо посмотреть
             */
            function editProduct(id){
                $state.go('app.product.edit', {id: id});
            }
        }]);
}());

/**
 * Created by Mikhail Arzhaev on 30.11.15.
 */
(function(){
    angular.module('app.supplier_orders').controller('EditSupplierOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        var sc = $scope;
        sc.data ={
            supplierOrder:{},
            partnersList: [],
            productsList: [],
            total:0
        };
        sc.productForAppend = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:goToIndex}, {type:'show', callback:goToShow}, {type:'files', callback:showFileModal}, {type:'confirm_order', callback: confirmOrder}],
            navTableButts:[{type:'table_edit', disabled:false, callback: updateProductOfOrder}, {type:'remove', disabled:false, callback:removeProduct}],
            roles: {can_destroy:true, can_edit:true},
            showFileModal: angular.noop,
            titles: 'Редактировать ' + window.gon.index.SupplierOrder.objectTitle.toLowerCase()
        };
        sc.pSelectConfig = {
            startPage: 0,
            dataMethod: serverApi.getSearch
        };
        sc.partnerSelectConfig = {
            dataMethod: serverApi.getPartners
        };

        serverApi.getSupplierOrderDetails($stateParams.id, function(result){
            var order = sc.data.supplierOrder = result.data;
            sc.data.supplierOrder.date = $filter('date')(result.data.date, 'dd.MM.yyyy HH:mm');

            sc.visual.roles.can_confirm = order.can_confirm;

            sc.fileModalOptions={
                url:'/api/supplier_orders/'+ order.id +'/documents',
                files: order.documents,
                r_delete: serverApi.deleteFile,
                view: 'supplier_orders',
                id: order.id
            };
        });

        /**
         * Обновляем информацию по заказу
         */
        sc.saveOrderInfo = function(){
            var supplierOrder = sc.data.supplierOrder
            var data = {
                    supplier_order:{
                        title: supplierOrder.title,
                        description: supplierOrder.description,
                        partner_id: supplierOrder.partner.id,
                        number: supplierOrder.number
                    }
                };
            serverApi.updateSupplierOrder(supplierOrder.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    $.smallBox({
                        title: "Успешно",
                        content: "<i class='fa fa-edit'></i> <i>Заказ "+supplierOrder.number+" успешно отредактирован.</i>",
                        color: "#739E73",
                        iconSmall: "fa fa-check fa-2x fadeInRight animated",
                        timeout: 4000
                    });
                } else {
                    $.smallBox({
                        title: "Ошибка",
                        content: "<i class='fa fa-edit'></i> <i>Не смог обновить заказ "+supplierOrder.number+".</i>",
                        color: "#A90329",
                        iconSmall: "fa fa-close fa-2x fadeInRight animated",
                        timeout: 4000
                    });
                }
            });
        };

        /**
         * выбор продукта для добавления к заказу
         */
        sc.selectProductForAppend = function(item){
            sc.productForAppend = item;
            sc.productForAppend.id = item.id || item._id;
            sc.productForAppend.quantity = 0;
            if(!item.hasOwnProperty('discount')) sc.productForAppend.discount = 0;
        };

        /**
         * Добавить продукт в список
         */
        sc.appendProduct = function(event){
            var append = function(){
                var t=sc.productForAppend,
                    data = angular.extend(t, {product: {name:t.name, id: t.id}}),
                    post = {
                        product_id: t.id,
                        quantity: t.quantity,
                        discount: t.discount
                    };

                serverApi.addSupplierOrderProduct(sc.data.supplierOrder.id, post,function(result){
                    if(!result.data.errors){
                        sc.productForAppend = {};
                        sc.data.selectedProduct = null;
                        sc.data.supplierOrder.supplier_order_contents.push(angular.extend(data, result.data));
                        funcFactory.showNotification('Успешно добавлен продукт', t.name, true);
                    } else {
                        funcFactory.showNotification('Не удалось добавить продукт', result.data.errors);
                    }
                });
            };
            if(event){
                if(event.keyCode == 13){
                    append();
                }
            } else append();
        };

        /**
         * Обновляет параметры продукта включенного в заказ
         * @param item - данные продукта
         */
        sc.updateProductOfOrder = updateProductOfOrder;

        function updateProductOfOrder(item, d, event){
            var update = function(){
                var data = {
                    quantity: item.data.quantity
                };
                serverApi.updateSupplierOrderProduct(sc.data.supplierOrder.id, item.data.id, data, function(result){
                    if(!result.data.errors) {
                        var r = sc.data.supplierOrder.supplier_order_contents[item.index];
                        sc.data.supplierOrder.supplier_order_contents[item.index] = angular.extend(r, result.data);
                        funcFactory.showNotification('Успешно обновлены данные продукта', item.data.product.name, true);
                    } else {
                        funcFactory.showNotification('Не удалось обновить данные продукта', result.data.errors);
                    }
                });
            };
            if(event){
                if(event.keyCode == 13){
                    update();
                }
            } else {
                update();
            }
        }

        /**
         * Удаление продукта
         * @param item - объект с индексом продукта в листе и id
         */
        function removeProduct(item){
            serverApi.removeSupplierOrderProduct(sc.data.supplierOrder.id, item.data.id, function(result){
                if(!result.data.errors) {
                    sc.data.supplierOrder.supplier_order_contents.splice(item.index, 1);
                    funcFactory.showNotification('Продукт удален:', item.data.product.name, true);
                } else {
                    funcFactory.showNotification('Не удалось удалить продукт', result.data.errors);
                }
            });
        }

        /**
         * следим за изменеиями в коллекции (включая свойства коллекции) при изменении пересчитываем total
         */
        sc.$watch('data.supplierOrder.supplier_order_contents', function(values){
            if(values){
                var total = 0;
                values.map(function(item){
                    total += $filter('price_net')(item, item.quantity);
                });

                sc.data.total = total;
            }
        }, true);

        /**
         * Устанавливаем фокус на input с колличестовм продукта
         */
        sc.focusOnProduct = function(){
            window.setTimeout(function(){
                angular.element('#append_product_quantity')[0].focus();
            },0);//таймер что бы дать время контенту отрендериться
        };

        function confirmOrder(subdata, item) {
            var data = {
                supplier_order:{
                    event: item.event
                }
            };
            serverApi.updateStatusSupplierOrder($stateParams.id, data, function(result){
                if(result.status == 200 && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Удалось ' + item.name.toLowerCase() + ' заказ', true);
                    sc.data.supplierOrder = result.data;
                } else {
                    funcFactory.showNotification("Не удалось " + item.name.toLowerCase() + ' заказ', result.data.errors);
                }
            });
        }

        function goToShow(){
            $state.go('app.supplier_orders.view', $stateParams);
        }
        function goToIndex(){
            $state.go('app.supplier_orders', $stateParams);
        }
        function showFileModal(){
            sc.visual.showFileModal();
        }
    }]);
}());

/**
 * Created by Mikhail Arzhaev on 19.11.15.
 */
(function(){

    'use strict';

    angular.module('app.supplier_orders').controller('SupplierOrdersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'CanCan', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, CanCan, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{type: 'new', callback: createNewSupplierOrder}, {type: 'automatically', callback: createAutomatically}],
            navTableButts:[{type:'view', callback:viewOrder}, {type:'table_edit', callback:editOrder}, {type:'remove', callback:removeOrder}],
            canAddPartner: CanCan.can('see_multiple', 'Partner'),
            titles:[window.gon.index.SupplierOrder.indexTitle]
        };
        sc.data = {
            ordersList:[],
            searchQuery:$stateParams.q
        };
        sc.newOrderData = {
            date: null
        };

        function viewOrder(item){
            $state.go('app.supplier_orders.view', {id: item.data.id || item.data._id});
        }
        
        function editOrder(item){
            $state.go('app.supplier_orders.view.edit', {id:item.data.id || item.data._id});
        }

        function createNewSupplierOrder(){
            sc.newOrderData.date = $filter('date')(new Date, 'dd.MM.yyyy HH:mm');
            $('#createNewOrderModal').modal('show');
        }
        
        function createAutomatically(){
            serverApi.automaticallyCreateSupplierOrders(function(result){
//                debugger;
                if(!result.data.errors){
                    for(var i=0; i < result.data.supplier_orders.length; i++){
                        sc.data.ordersList.unshift(result.data.supplier_orders[i]);
                    }
                    funcFactory.showNotification('Успешно', 'Всё сделал', true);
                } else {
                    funcFactory.showNotification('Не удалось создать заказы');
                }
            });
        }

        function removeOrder(item){
            var data = item.data;
            $.SmartMessageBox({
                title: "Удалить заказ?",
                content: "Вы действительно хотите удалить заказ " + data.number,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deleteSupplierOrder(data.id, function(result){
                        if(!result.data.errors){
                            console.log(result);
                            sc.data.ordersList.splice(item.index, 1);
                            funcFactory.showNotification('Успешно', 'Заказ ' + data.number + ' удален', true);
                        } else funcFactory.showNotification('Не удалось удалить заказ ' + data.number);
                    });
                }
            });
        }
    }]);
}());
/**
 * Created by Mikhail Arzhaev on 19.11.15.
 */
(function(){

    "use strict";

    angular.module('app.supplier_orders').controller('ViewSupplierOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.order = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'files', callback:showFileModal}, {type: 'edit', callback: goEditSupplierOrder}, {type:'confirm_order', callback: confirmOrder}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            showFileModal: angular.noop,
            titles:window.gon.index.SupplierOrder.objectTitle + ': #'
        };

        sc.amontPercent = 0;
        sc.dispatchedPercent = 0;

        serverApi.getSupplierOrderDetails($stateParams.id, function(result){
            console.log(result.data);

            var order = sc.order = result.data;
            sc.amontPercent = funcFactory.getPercent(order.paid_amount, order.total);
            sc.dispatchedPercent = funcFactory.getPercent(order.received_amount, order.total);

            sc.visual.roles = {
                can_confirm: order.can_confirm
            };

            sc.fileModalOptions={
                url:'/api/supplier_orders/'+ order.id +'/documents',
                files: order.documents,
                r_delete: serverApi.deleteFile,
                view: 'supplier_orders',
                id: order.id
            };
        });

        function confirmOrder(subdata, item) {
            var data = {
                supplier_order:{
                    event: item.event
                }
            };
            serverApi.updateStatusSupplierOrder($stateParams.id, data, function(result){
                if(result.status == 200 && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Удалось ' + item.name.toLowerCase() + ' заказ', true);
                    sc.order = result.data;
                } else {
                    funcFactory.showNotification("Не удалось " + item.name.toLowerCase() + ' заказ', result.data.errors);
                }
            });
        }
        
        function goEditSupplierOrder(){
            $state.go('app.supplier_orders.view.edit', $stateParams)
        }

        function returnBack(){
            $state.go('app.supplier_orders', {});
        }
        function showFileModal(){
            sc.visual.showFileModal();
        }
    }]);
}());
'use strict';

/**
 * @ngdoc overview
 * @name app [smartadminApp]
 * @description
 * # app [smartadminApp]
 *
 * Main module of the application.
 */

window.appConfig = {};

appConfig.menu_speed = 200;
appConfig.serverUrl = 'http://localhost:3000';

appConfig.smartSkin = "smart-style-0";

appConfig.skins = [
    {name: "smart-style-0",
        logo: "styles/img/logo.png",
        class: "btn btn-block btn-xs txt-color-white margin-right-5",
        style: "background-color:#4E463F;",
        label: "Smart Default"},

    {name: "smart-style-1",
        logo: "styles/img/logo-white.png",
        class: "btn btn-block btn-xs txt-color-white",
        style: "background:#3A4558;",
        label: "Dark Elegance"}
];



appConfig.sound_path = "/app/sound/";
appConfig.sound_on = true;

(function (angular) {

    $.sound_path = appConfig.sound_path;
    $.sound_on = appConfig.sound_on;

    var app = angular.module('app', [
        'ngSanitize',
        'ngAnimate',
        'ui.router',
        'ui.bootstrap',
        'infinite-scroll',
        'ui.select',
        'ui.tinymce',
        
        // Permissions
        'cancan.export',
        // App
        'app.layout',
        'login',
        'app.templates',
        'app.search',
        'app.dashboard',
        'app.customer_orders',
        'app.dispatch_orders',
        'app.contacts',
        'app.partners',
        'app.supplier_orders',
        'app.catalogues',
        'app.manufacturers',
        'app.pdf_catalogues',
        'app.incoming_transfers',
        'app.outgoing_transfers',
        'app.receive_orders',
        'app.products',
        'app.articles',
        'app.news',
        'app.pages'
    ]);

    app.config(["$provide", "$httpProvider", function ($provide, $httpProvider) {
        //CSRF
        $httpProvider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
        // satisfy request.xhr? check on server-side
        $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        $httpProvider.defaults.headers.common['Accept'] = 'application/json;charset=utf-8';
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';


        // Intercept http calls.
        $provide.factory('ErrorHttpInterceptor', ['$q', '$rootScope', function ($q, $rootScope) {
            var errorCounter = 0;
            function notifyError(rejection){
                console.log(rejection);
                $.bigBox({
                    title: rejection.status + ' ' + rejection.statusText,
                    content: rejection.data,
                    color: "#C46A69",
                    icon: "fa fa-warning shake animated",
                    number: ++errorCounter,
                    timeout: 6000
                });
            }

            function setInload(inLoad){
                $rootScope.showRibbonLoader = inLoad;
            }

            return {
                request: function(config){
                    var url = encodeURI(config.url);
                    config.url = config.method == 'GET' && url.indexOf('html')>-1 ? url : appConfig.serverUrl + url;
                    setInload(true);
                    return config;
                },
                response: function(response){
                    setInload(false);
                    return response;
                },
                // On request failure
                requestError: function (rejection) {
                    setInload(false);
                    // show notification
                    notifyError(rejection);

                    // Return the promise rejection.
                    return $q.reject(rejection);
                }
            };
        }]);

        // Add the interceptor to the $httpProvider.
        $httpProvider.interceptors.push('ErrorHttpInterceptor');

    }]);

    app.run(['$rootScope', '$state', '$stateParams', 'CanCan', 'Abilities', function ($rootScope, $state, $stateParams, CanCan, Abilities) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        //check user id, if user not authorized redirect to sign_in page
        var authorized = window.authorized = $('meta[name="user-id"]').attr('content');
        if(!authorized) $state.transitionTo('login', null);

        //scroll page top if page not search
        $rootScope.$on('$stateChangeSuccess', function(){
            if($state.current.name !== "app.search")angular.element('body').scrollTop(0);
        });

        //checking permissions of state while navigating
        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {

                if(!window.authorized && toState.name !== ''){
                    event.preventDefault();
                    return 0;
                }

                if(toState != 'login' && !window.gon) {
                    event.preventDefault();
                    Abilities.getGon(toState.name, toParams);
                }

                var access = (toState.data || {}).access;
                if(access){
                    var can = CanCan.can(access.action, access.params);
//                    console.log('access',access, 'can', can);
                    if(!can) {
                        event.preventDefault();
                        $state.transitionTo('app.dashboard', null, {reload:true});
                    }
                }
            }
        );
    }]);

    Array.prototype.swapItemByindex = function(currentIndex, newIndex){
        var item = this.splice(currentIndex,1)[0];
        this.splice(newIndex,0,item);
    };
}(window.angular));
