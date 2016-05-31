/**
 * Created by Mikhail Arzhaev on 25.11.15.
 */
(function(){

    "use strict";

    angular.module('app.incoming_transfers').controller('ViewIncomingTransferCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$q', 'funcFactory', 'CanCan', function($scope, $state, $stateParams, serverApi, $q, funcFactory, CanCan){
        var sc = $scope;
        sc.incomingTransfer = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type: 'edit', callback: goToEditIncomingTransfer}, {type:'files', callback: showFileModal},
                {type:'refresh', callback: refresh}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            showFileModal: angular.noop,
            navTableButts:[{type:'view', callback: viewDocument}, {type:'remove', callback:removeOrder}],
            titles: window.gon.index.IncomingTransfer.objectTitle + ': # ',
            roles: {
                can_destroy: true,
                can_edit: CanCan.can('edit', 'IncomingTransfer')
            }
        };
        sc.data = {
            ordersList: [],
            orderForAppend: {
                amount:0
            }
        };

        function refresh(){
            serverApi.getIncomingTransferDetails($stateParams.id, function(result) {

                sc.incomingTransfer = result.data;
            });
        }

        serverApi.getIncomingTransferDetails($stateParams.id, function(result){
            console.log(result.data);

            var transfer = sc.incomingTransfer = result.data;
            sc.fileModalOptions={
                url:'/api/incoming_transfers/'+ transfer.id +'/documents',
                files: transfer.documents,
                r_delete: serverApi.deleteFile,
                view: 'incoming_transfers',
                id: transfer.id
            };
        });

        sc.orderSelectConf = {
            dataMethod: function(page, query, config, success){
                var canceler1 = $q.defer(),
                    canceler2 = $q.defer();
                var data = [],//data for callback
                    checkStatus = function(result){
                        return result.status == 200 ? result.data : [];// if result not success, return []
                    },
                    defers = [$q.defer(),$q.defer()];//requests defers
                serverApi.getCustomerOrders(page, query, {timeout:canceler1.promise}, function(result){
                    defers[0].resolve(checkStatus(result));
                });
                serverApi.getOutgoingTransfers(page, query, {timeout:canceler2.promise}, function(result){
                    defers[1].resolve(checkStatus(result));
                });
                //cancel both requests
                config.timeout.then(function(){
                    canceler1.resolve();
                    canceler2.resolve();
                });
                //wait all promises
                $q.all(defers.map(function(item){
                    return item.promise;
                })).then(function(result){
                    data = result[0].concat(result[1]);//concat results
                    success({data:data});
                });
            }
        };

        sc.appendOrder = function(event){
            var data = sc.data.orderForAppend,
                append = function(){
                    sc.data.orderForAppend = {};
                    var postData = {
                        amount: data.amount
                    };

                    var transfer = false;
                    if (data.type === "OutgoingTransfer") {
                        transfer = true;
                        postData.outgoing_transfer_id = data.id;
                    } else {
                        postData.customer_order_id = data.id;
                    }

                    serverApi.appendIncomingTransferOrder(sc.incomingTransfer.id, postData, function(result){
                        var t = transfer?'Платеж ' + data.number: 'Заказ '+ data.number;
                        if(!result.data.errors){
                            sc.incomingTransfer.remaining_amount = result.data.money_transfer.remaining_amount;
                            sc.incomingTransfer.money_to_orders.push(result.data);
                            funcFactory.showNotification('Успешно', t + ' успешно добавлен', true);
                            angular.element('#vit_order_select').data().$uiSelectController.open=true;
                        }else funcFactory.showNotification('Неудалось прикрепить ' + t, result.data.errors);
                    });
                };
            if(event){
                event.keyCode == 13 && append();
            }else append();
        };

        function removeOrder(data){
            var item = data.data;
            serverApi.removeIncomingTransferOrder(sc.incomingTransfer.id, item.id, function(result){
                var transfer = item.hasOwnProperty('outgoing_transfer');
                var t = transfer?'Платеж ' + item.outgoing_transfer.incoming_code: 'Заказ '+ item.customer_order.number;
                if(!result.data.errors){
                    sc.incomingTransfer.remaining_amount = result.data.money_transfer.remaining_amount;
                    sc.incomingTransfer.money_to_orders.splice(data.index, 1);
                    funcFactory.showNotification(t + ' успешно удален','', true);
                } else {
                    funcFactory.showNotification('Неудалось удалить ' + t, result.data.errors);
                }
            });
        }

        sc.$watch('incomingTransfer.money_to_orders', function(val){
            if(val){
                var it = sc.incomingTransfer,
                    ra = it.amount;
                angular.forEach(it.money_to_orders, function(item){
                    ra -= item.amount;
                });
                it.remaining_amount = ra;
            }
        });

        function returnBack(){
            $state.go('app.incoming_transfers',{});
        }
        
        function showFileModal(){
            sc.visual.showFileModal();
        }
        
        function goToEditIncomingTransfer(){
            $state.go('app.incoming_transfers.view.edit', $stateParams)  
        }
        
        function viewDocument(item){
            if (item.data.hasOwnProperty('customer_order')) {
                $state.go('app.customer_orders.view', {id: item.data.customer_order.id});    
            }
            if (item.data.hasOwnProperty('incoming_transfer')) {
                $state.go('app.incoming_transfer.view', {id: item.data.incoming_transfer.id});    
            }
        }
    }]);
}());