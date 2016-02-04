/**
 * Created by Egor Lobanov on 02.12.15.
 */
(function(){

    var module = angular.module('app.incoming_transfers');

    module.controller('EditIncomingTransferCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', '$q', function($scope, $state, $stateParams, serverApi, funcFactory, $q){
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
            titles: ['Редактировать ' + window.gon.index.IncomingTransfer.objectTitle.toLowerCase()]
        };
        sc.partnerSelectConfig = {
            dataMethod: serverApi.getPartners
        };
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

        serverApi.getIncomingTransferDetails($stateParams.id, function(result){
            console.log(result.data);
            var transfer = sc.transfer = result.data;
            sc.fileModalOptions={
                url:'/api/incoming_transfers/'+ transfer.id +'/documents',
                files: transfer.documents,
                r_delete: serverApi.deleteFile,
                view: 'incoming_transfers',
                id: transfer.id
            };
        });

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
                    
                    serverApi.appendIncomingTransferOrder(sc.transfer.id, postData, function(result){
                       var t = transfer?'Платеж ' + data.number: 'Заказ '+ data.number;
                       if(!result.data.errors){
                           sc.transfer.remaining_amount = result.data.money_transfer.remaining_amount;
                           sc.transfer.money_to_orders.push(result.data);
                           funcFactory.showNotification('Успешно', t + ' успешно добавлен', true);
                       }else funcFactory.showNotification('Неудалось прикрепить ' + t, result.data.errors);
                    });
                };
            if(event){
                event.keyCode == 13 && append();
            }else append();
        };

        function removeOrder(data){
            var item = data.data;
            serverApi.removeIncomingTransferOrder(sc.transfer.id, item.id, function(result){
                var transfer = item.hasOwnProperty('outgoing_transfer');
                var t = transfer?'Платеж ' + item.outgoing_transfer.incoming_code: 'Заказ '+ item.customer_order.number;
                if(!result.data.errors){
                    sc.transfer.remaining_amount = result.data.money_transfer.remaining_amount;
                    sc.transfer.money_to_orders.splice(data.index, 1);
                    funcFactory.showNotification(t + ' успешно удален','', true);
                } else {
                    funcFactory.showNotification('Неудалось удалить ' + t, result.data.errors);
                };
            });
        }

        function goToIndex(){
            $state.go('app.incoming_transfers', $stateParams);
        }

        function goToShow(){
            $state.go('app.incoming_transfers.view', $stateParams);
        }
        function showFileModal(){
            sc.visual.showFileModal();
        }
    }]);
    /**
     * filter define is item is transfer or order and append prefix icon
     */
    module.filter('f_incomingT', function(){
        return function(item){
            return item.hasOwnProperty('incoming_code') ? '<i class="fa fa-rub" title="Платеж"></i> ' + item.incoming_code: '<i class="fa fa-book" title="Заказ"></i> ' + item.number;
        };
    });
}());
