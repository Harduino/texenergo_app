/**
 * Created by Egor Lobanov on 07.11.15.
 */
(function(){

    'use strict';

    angular.module('app.incoming_transfers').controller('IncomingTransfersCtrl', ['$state', '$stateParams', 'serverApi', '$filter', 'CanCan', 'funcFactory', function($state, $stateParams, serverApi, $filter, CanCan, funcFactory) {
        var self = this;

        this.visual = {
            navButtsOptions:[
                {
                    type: 'new',
                    callback: function() {
                        self.newTransferConfig.showForm();
                    }
                },
                {
                    type: 'refresh',
                    callback: function() {
                        $state.go('app.incoming_transfers', {}, {reload: true});
                    }
                }
            ],
            navTableButts:[
                {
                    type: 'view',
                    callback: function(item) {
                        $state.go('app.incoming_transfers.view', {id: item.data.id || item.data._id});
                    }
                },
                {
                    type: 'remove',
                    callback: function(item) {
                        $.SmartMessageBox({
                            title: 'Удалить входящий платёж?',
                            content: 'Вы действительно хотите удалить входящий платёж ' + item.data.number,
                            buttons: '[Нет][Да]'
                        }, function (ButtonPressed) {
                            if (ButtonPressed === 'Да') {
                                serverApi.deleteIncomingTransfer(item.data.id, function(result) {
                                    if(!result.data.errors) {
                                        self.data.incomingTransfersList.splice(item.index, 1);
                                        funcFactory.showNotification('Платеж ' + item.data.number + ' успешно удален.',
                                            '', true);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить платеж ' + item.data.number,
                                            result.data.errors);
                                    }
                                });
                            }
                        });
                    }
                }
            ],
            role:{
                can_edit: CanCan.can('edit', 'IncomingTransfer'),
                can_destroy: CanCan.can('destroy', 'IncomingTransfer')
            },
            titles: ['Входящие платежи']
        };

        this.data = {incomingTransfersList:[], searchQuery: $stateParams.q};
        this.newTransferConfig = {createMethod: serverApi.createIncomingTransfer, showForm: angular.noop};
    }]);
}());