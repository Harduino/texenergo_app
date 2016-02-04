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
                    controller: 'SupplierOrdersCtrl',
                    templateUrl: '/assets/admin/app/supplier_orders/views/supplierOrders.html'
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
                    templateUrl: '/assets/admin/app/supplier_orders/views/viewSupplierOrder.html'
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
                    templateUrl: '/assets/admin/app/supplier_orders/views/editSupplierOrder.html'
                }
            }
        });
    });
}());