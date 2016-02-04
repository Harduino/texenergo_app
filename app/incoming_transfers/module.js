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
                    templateUrl: '/assets/admin/app/incoming_transfers/views/transfers.html'
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
                    templateUrl: '/assets/admin/app/incoming_transfers/views/viewIncomingTransfer.html'
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
                    templateUrl: '/assets/admin/app/incoming_transfers/views/editIncomingTransfer.html'
                }
            }
        });
    });
}());