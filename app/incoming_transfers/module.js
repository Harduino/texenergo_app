/**
 * Created by Egor Lobanov on 07.11.15.
 * Модуль страницы заказов
 */
(function () {

    "use strict";

    var module = angular.module('app.incoming_transfers', ['ui.router']);

    module.config(function ($stateProvider) {
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
                    controllerAs: 'incomingTransfersCtrl',
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
        }).state('app.incoming_transfers.view.logs', {
            url: '/logs',
            data:{
                title:'История поступления',
                access:{
                    action:'logs',
                    params:'IncomingTransfer'
                }
            },
            views:{
                "content@app":{
                    controller: 'LogsIncomingTransferCtrl',
                    templateUrl: '/app/incoming_transfers/views/logsIncomingTransfer.html'
                }
            }
        });
    });

    module.filter('f_incomingT', function(){
        return function(item){
            if(item){
                return item.hasOwnProperty('incoming_code') || (item.hasOwnProperty('type') && item.type.search(/transfer/gi)>-1) ? '<i class="fa fa-rub" title="Платеж"></i> Платёж ' + (item.incoming_code || item.number) : '<i class="fa fa-book" title="Заказ"></i> Заказ ' + item.number;
            }
            return '';
        };
    });
}());