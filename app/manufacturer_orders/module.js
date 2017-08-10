/**
 * Created by Mikhail on 24.02.16.
 * Модуль страницы заказов
 */
(function () {

    "use strict";

    var module = angular.module('app.manufacturer_orders', ['ui.router', 'easypiechart']);

    module.config(function ($stateProvider) {
        $stateProvider.state('app.manufacturer_orders', {
            url: '/manufacturer_orders?q',
            data:{
                title: 'Выпуски с производства',
                access:{
                    action:'index',
                    params:'ManufacturerOrder'
                }
            },
            params:{
                q:'',
                id:''
            },
            views:{
                "content@app": {
                    template: '<manufacturer-orders></manufacturer-orders>'
                }
            }
        }).state('app.manufacturer_orders.view', {
            url: '/:id',
            data:{
                title: 'Выпуск с производства',
                access:{
                    action:'read',
                    params:'ManufacturerOrder'
                }
            },
            views:{
                "content@app":{
                    template: '<view-manufacturer-order></view-manufacturer-order>'
                }
            }
        });
    });
}());