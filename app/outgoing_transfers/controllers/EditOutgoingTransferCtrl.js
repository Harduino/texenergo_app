/**
 * Created by Egor Lobanov on 08.12.15.
 */
(function(){
    angular.module('app.outgoing_transfers').controller('EditOutgoingTransferCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.transfer ={};
        sc.data = {
            partnersList:[],
            ordersList: [],
            orderForAppend: {
                amount:0
            }
        };
        sc.visual = {
            navButtsOptions:[{type:'back', callback:goToIndex}, {type:'show', callback:goToShow}, {type:'files', callback:showFileModal}, {type:'send_email'}, {type:'logs'}],
            navTableButts:[{type:'remove', callback:removeOrder}],
            roles: {
                can_destroy: true
            },
            showFileModal: angular.noop,
            titles: ['Редактировать ' + window.gon.index.OutgoingTransfer.objectTitle.toLowerCase()]
        };
        sc.partnerSelectConfig = {
            dataMethod: serverApi.getPartners
        };
        sc.orderSelectConf = {
            dataMethod: serverApi.getSupplierOrders
        };

        serverApi.getOutgoingTransferDetails($stateParams.id, function(result){
            console.log(result.data);
            var transfer = sc.transfer = result.data;
            sc.fileModalOptions={
                url:'/api/outgoing_transfers/'+ transfer.id +'/documents',
                files: transfer.documents,
                r_delete: serverApi.deleteFile,
                view: 'outgoing_transfers',
                id: transfer.id
            };
        });

        sc.appendOrder = function(event){
            var data = sc.data.orderForAppend,
                append = function(){
                    sc.data.orderForAppend = {};
                    serverApi.appendOutgoingTransferOrder(sc.transfer.id, {
                        outgoing_transfer_id: sc.transfer.id,
                        amount: data.amount,
                        supplier_order_id: data.id
                    }, function(result){
                        if(!result.data.errors){
                            console.log(result.data);
                            sc.transfer.remaining_amount = result.data.outgoing_money_distributions.remaining_amount;
                            sc.transfer.outgoing_money_distributions.push(angular.extend({
                                amount: data.amount,
                                supplier_order: {
                                    number: data.number
                                }
                            }, result.data));
                            funcFactory.showNotification('Успешно','Заказ ' + data.number + ' успешно добавлен', true);
                            angular.element('#eot_order_select').data().$uiSelectController.open=true;
                        }else funcFactory.showNotification('Неудалось прикрепить заказ ' + data.number, result.data.errors);
                    });
                };
            if(event){
                event.keyCode == 13 && append();
            }else append();
        };

        function removeOrder(item){
            var data = item.data;
            serverApi.removeOutgoingTransferOrder(sc.transfer.id, data.id, function(result){
                if(!result.data.errors){
                    sc.transfer.remaining_amount = result.data.outgoing_money_distributions.remaining_amount;
                    sc.transfer.outgoing_money_distributions.splice(item.index, 1);
                    funcFactory.showNotification('Заказ ' + data.supplier_order.number + ' успешно удален','', true);
                }else funcFactory.showNotification('Неудалось удалить заказ ' + data.supplier_order.number, result.data.errors);
            });
        }
        function goToIndex(){
            $state.go('app.outgoing_transfers', $stateParams);
        }

        function goToShow(){
            $state.go('app.outgoing_transfers.view', $stateParams);
        }
        function showFileModal(){
            sc.visual.showFileModal();
        }
    }]);
}());