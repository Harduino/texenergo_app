/**
 * Created by Mikhail Arzhaev on 19.11.15.
 * Модуль страницы заказов постащикам
 */

(function () {

    "use strict";
    var module = angular.module('app.supplier_orders', ['ui.router', 'easypiechart']);

    module.config(function ($stateProvider) {
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
                    template: '<supplier-orders></supplier-orders>'
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
            views: {
                "content@app": {
                    template: '<view-supplier-order></view-supplier-order>'
                }
            }
        });
    });
}());