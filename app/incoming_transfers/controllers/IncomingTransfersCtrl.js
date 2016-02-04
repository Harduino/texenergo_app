/**
 * Created by Egor Lobanov on 07.11.15.
 */
(function(){

    'use strict';

    angular.module('app.incoming_transfers').controller('IncomingTransfersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'CanCan', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, CanCan, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{
                type: 'new',
                callback: createIncomingTransfer
            }],
            navTableButts:[{type:'view', callback:viewIncomingTransfer}, {type:'table_edit', callback:editIncomingTransfer}, {type:'remove', callback:removeIncomingTransfer}],
            role:{
                can_edit: CanCan.can('edit', 'IncomingTransfer'),
                can_destroy: CanCan.can('destroy', 'IncomingTransfer')
            },
            titles:[window.gon.index.IncomingTransfer.indexTitle]
        };
        sc.data = {
            incomingTransfersList:[],
            searchQuery:$stateParams.q
        };

        sc.newTransferConfig = {
            createMethod: serverApi.createIncomingTransfer,
            showForm: angular.noop
        };

        function viewIncomingTransfer(item){
            $state.go('app.incoming_transfers.view', {id:item.data.id || item.data._id});
        }

        function editIncomingTransfer(item){
            $state.go('app.incoming_transfers.view.edit', {id:item.data.id || item.data._id});
        }

        function createIncomingTransfer(){
            sc.newTransferConfig.showForm();
        }

        function removeIncomingTransfer(item){
            $.SmartMessageBox({
                title: "Удалить входящий платёж?",
                content: "Вы действительно хотите удалить входящий платёж " + item.data.number,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deleteIncomingTransfer(item.data.id, function(result){
                        if(!result.data.errors){
                            sc.data.incomingTransfersList.splice(item.index,1);
                            funcFactory.showNotification('Платеж ' + item.data.number + ' успешно удален.', '', true);
                        }else funcFactory.showNotification('Не удалось удалить платеж ' + item.data.number, result.data.errors);
                    });
                }
            });
        }
    }]);
}());