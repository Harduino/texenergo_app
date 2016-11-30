/**
 * Created by Egor Lobanov on 07.11.15.
 */
(function() {
    'use strict';

    angular.module('app.outgoing_transfers').controller('OutgoingTransfersCtrl', ['$state', '$stateParams', 'serverApi', 'CanCan', 'funcFactory', function($state, $stateParams, serverApi, CanCan, funcFactory){
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
                    type:'refresh',
                    callback: function() {
                        $state.go('app.outgoing_transfers', {}, {reload: true});
                    }
                }
            ],
            navTableButts: [
                {
                    type:'view',
                    callback: function(item) {
                        $state.go('app.outgoing_transfers.view', {id: item.data.id || item.data._id});
                    }
                },
                {
                    type:'remove',
                    callback: function(item) {
                        $.SmartMessageBox({
                            title: "Удалить исходящий платёж?",
                            content: "Вы действительно хотите удалить исходящий платёж " + item.data.number,
                            buttons: '[Нет][Да]'
                        }, function (ButtonPressed) {
                            if (ButtonPressed === "Да") {
                                serverApi.deleteOutgoingTransfer(item.data.id, function(result) {
                                    if(!result.data.errors) {
                                        self.data.outgoingTransfersList.splice(item.index, 1);
                                        funcFactory.showNotification('Исходящий платёж', 'Вы удалили исходящий платёж '
                                            + item.data.number, true);
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
            role: {
                can_edit: CanCan.can('edit', 'OutgoingTransfer'),
                can_destroy: CanCan.can('destroy', 'OutgoingTransfer')
            },
            titles: ["Исходящий платёж"]
        };

        this.data = {outgoingTransfersList:[], searchQuery: $stateParams.q};
        this.newTransferConfig = {createMethod: serverApi.createOutgoingTransfer, showForm: angular.noop};
    }]);
}());
