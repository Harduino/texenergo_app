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
                    template: '<view-product></view-product>'
                }
            }
        }).state('app.product.logs', {
            url: '/logs',
            params: {
                id: ''
            },
            data:{
                title:'История товара',
                access:{
                    action:'read',
                    params:'Product'
                }
            },
            views:{
                "content@app":{
                    template: '<logs-product></logs-product>'
                }
            }
        });
    });
}());