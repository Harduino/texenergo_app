/**
 * Created by Mikhail on 24.02.16.
 * Модуль страницы заказов
 */
(function () {

    "use strict";

    var module = angular.module('app.quotation_orders', ['ui.router', 'easypiechart']);

    module.config(function ($stateProvider) {
        $stateProvider.state('app.quotation_orders', {
            url: '/quotation_orders?q',
            data:{
                title: 'Рассчёты',
                access:{
                    action:'index',
                    params:'QuotationOrder'
                }
            },
            params:{
                q:'',
                id:''
            },
            views:{
                "content@app": {
                    controller: 'QuotationOrdersCtrl',
                    templateUrl: '/app/quotation_orders/views/quotationOrders.html'
                }
            }
        });
    });
}());