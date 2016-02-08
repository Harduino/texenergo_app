/**
 * Created by Egor Lobanov on 07.11.15.
 * Модуль страницы заказов
 */
(function () {

    "use strict";

    var module = angular.module('app.outgoing_transfers', ['ui.router']);

    module.config(function ($stateProvider) {
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
    });
}());