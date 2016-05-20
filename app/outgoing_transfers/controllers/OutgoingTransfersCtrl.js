/**
 * Created by Egor Lobanov on 07.11.15.
 */
(function(){

    'use strict';

    angular.module('app.outgoing_transfers').controller('OutgoingTransfersCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'CanCan', 'funcFactory', function($scope, $state, $stateParams, serverApi, CanCan, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{
                type: 'new',
                callback: createOutgoingTransfer
            }, {type:'refresh', callback:refresh}],
            navTableButts:[{type:'view', callback:viewOutgoingTransfer}, {type:'table_edit', callback:editOutgoingTransfer}, {type:'remove', callback:removeOutgoingTransfer}],
            role:{
                can_edit: CanCan.can('edit', 'OutgoingTransfer'),
                can_destroy: CanCan.can('destroy', 'OutgoingTransfer')
            },
            titles:[window.gon.index.OutgoingTransfer.indexTitle]
        };
        sc.data = {
            outgoingTransfersList:[],
            searchQuery:$stateParams.q
        };
        sc.newTransferConfig = {
            createMethod: serverApi.createOutgoingTransfer,
            showForm: angular.noop
        };

        function refresh (){
            $state.go('app.outgoing_transfers', {}, {reload:true});
        }

        function viewOutgoingTransfer(item){
            $state.go('app.outgoing_transfers.view', {id:item.data.id || item.data._id});
        }

        function editOutgoingTransfer(item){
            $state.go('app.outgoing_transfers.view.edit', {id:item.data.id || item.data._id});
        }

        function createOutgoingTransfer(){
            sc.newTransferConfig.showForm();
        }

        function removeOutgoingTransfer(item){
            $.SmartMessageBox({
                title: "Удалить исходящий платёж?",
                content: "Вы действительно хотите удалить исходящий платёж " + item.data.number,
                buttons: '[Нет][Да]'
            }, function (ButtonPressed) {
                if (ButtonPressed === "Да") {
                    serverApi.deleteOutgoingTransfer(item.data.id, function(result){
                        if(!result.data.errors){
                            sc.data.outgoingTransfersList.splice(item.index,1);
                            funcFactory.showNotification('Исходящий платёж', 'Вы удалили исходящий платёж '+item.data.number, true);
                        }else funcFactory.showNotification('Не удалось удалить платеж ' + item.data.number, result.data.errors);
                    });
                }
            });
        }
    }]);
}());