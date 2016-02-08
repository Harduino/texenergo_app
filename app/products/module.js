/**
 * Created by Egor Lobanov on 09.12.15.
 */
(function (){

    "use strict";

    var module = angular.module('app.products', ['ui.router']);

    module.config(function ($stateProvider) {
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
    });
}());