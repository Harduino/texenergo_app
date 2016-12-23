/**
 * Created by Mikhail Arzhaev on 25.11.15.
 */
(function () {
    'use strict';

    angular.module('app.incoming_transfers').controller('ViewIncomingTransferCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$q', 'funcFactory', 'CanCan', function ($scope, $state, $stateParams, serverApi, $q, funcFactory, CanCan) {
        var self = this;
        this.incomingTransfer = {};

        this.visual = {
            navButtsOptions:[
                {
                    type: 'back',
                    callback: function () {
                        $state.go('app.incoming_transfers', {});
                    }
                },
                {
                    type: 'logs',
                    callback: function () {
                        $state.go('app.incoming_transfers.view.logs', {});
                    }
                },
                {
                    type: 'refresh',
                    callback: function () {
                        serverApi.getIncomingTransferDetails($stateParams.id, function (res) {
                            self.incomingTransfer = res.data;
                        });
                    }
                }
            ],
            chartOptions: {
                barColor: 'rgb(103,135,155)',
                scaleColor: false,
                lineWidth: 5,
                lineCap: 'circle',
                size: 50
            },
            showFileModal: angular.noop,
            navTableButts: [
                {
                    type:'view',
                    callback: function (item) {
                        if (item.data.hasOwnProperty('customer_order')) {
                            $state.go('app.customer_orders.view', {id: item.data.customer_order.id});
                        }

                        if (item.data.hasOwnProperty('incoming_transfer')) {
                            $state.go('app.incoming_transfer.view', {id: item.data.incoming_transfer.id});
                        }
                    }
                },
                {
                    type:'remove',
                    callback: function (data) {
                        var item = data.data;

                        serverApi.removeIncomingTransferOrder(self.incomingTransfer.id, item.id, function (res) {
                            var transferInfo;

                            if (item.hasOwnProperty('outgoing_transfer')) {
                                transferInfo = 'Платеж ' + item.outgoing_transfer.incoming_code;
                            } else {
                                transferInfo = 'Заказ ' + item.customer_order.number;
                            }

                            if (res.data.errors) {
                                funcFactory.showNotification('Не удалось удалить ' + transferInfo, res.data.errors);
                            } else {
                                self.incomingTransfer.remaining_amount = res.data.money_transfer.remaining_amount;
                                self.incomingTransfer.money_to_orders.splice(data.index, 1);
                                funcFactory.showNotification(transferInfo + ' успешно удален', '', true);
                            }
                        });
                    }
                }
            ],
            titles: 'Входящий платеж: №',
            roles: {can_destroy: true, can_edit: CanCan.can('edit', 'IncomingTransfer')}
        };

        this.data = {ordersList: [], orderForAppend: {amount: 0}};

        serverApi.getIncomingTransferDetails($stateParams.id, function (result) {
            var transfer = self.incomingTransfer = result.data;

            self.fileModalOptions = {
                url: '/api/incoming_transfers/' + transfer.id + '/documents',
                files: transfer.documents,
                r_delete: serverApi.deleteFile,
                view: 'incoming_transfers',
                id: transfer.id
            };
        });

        this.orderSelectConf = {
            dataMethod: function (page, query, config, success) {
                var canceler1 = $q.defer(), canceler2 = $q.defer();

                var data = [],//data for callback
                    checkStatus = function (result) {
                        return result.status == 200 ? result.data : [];// if result not success, return []
                    },
                    defers = [$q.defer(), $q.defer()];//requests defers

                serverApi.getCustomerOrders(page, query, {timeout:canceler1.promise}, function (result) {
                    defers[0].resolve(checkStatus(result));
                }, null, self.incomingTransfer.partner.id);

                serverApi.getOutgoingTransfers(page, query, {timeout:canceler2.promise}, function (result) {
                    defers[1].resolve(checkStatus(result));
                }, null, self.incomingTransfer.partner.id);

                //cancel both requests
                config.timeout.then(function () {
                    canceler1.resolve();
                    canceler2.resolve();
                });

                //wait all promises
                $q.all(defers.map(function (item) {
                    return item.promise;
                })).then(function (result) {
                    data = result[0].concat(result[1]);//concat results
                    success({data:data});
                });
            }
        };

        $scope.$watch(function () {
            return self.incomingTransfer.money_to_orders;
        }, function (val) {
            if (val) {
                var incomingTransfer = self.incomingTransfer,
                    remainingAmount = incomingTransfer.amount;

                angular.forEach(incomingTransfer.money_to_orders, function (item) {
                    remainingAmount -= item.amount;
                });

                incomingTransfer.remaining_amount = remainingAmount;
            }
        });

        this.onOrderSelect = function () {
            var order = self.data.orderForAppend;

            if (order.hasOwnProperty('type') && (order.type.search(/transfer/gi) > -1)) {
                order.total = new Number(order.amount);
            } else {
                order.amount = new Number(order.total);
            }
        };

        this.appendOrder = function (event) {
            var data = self.data.orderForAppend,
                append = function () {
                    self.data.orderForAppend = {};
                    var postData = {amount: data.amount};
                    var transfer = false;

                    if (data.type === "OutgoingTransfer") {
                        transfer = true;
                        postData.outgoing_transfer_id = data.id;
                    } else {
                        postData.customer_order_id = data.id;
                    }

                    serverApi.appendIncomingTransferOrder(self.incomingTransfer.id, postData, function (result) {
                        var transferInfo = transfer ? 'Платеж ' + data.number : 'Заказ ' + data.number;

                        if (!result.data.errors) {
                            self.incomingTransfer.remaining_amount = result.data.money_transfer.remaining_amount;
                            self.incomingTransfer.money_to_orders.push(result.data);
                            funcFactory.showNotification('Успешно', transferInfo + ' успешно добавлен', true);
                            angular.element('#vit_order_select').data().$uiSelectController.open = true;
                        } else {
                            funcFactory.showNotification('Не удалось прикрепить ' + transferInfo, result.data.errors);
                        }
                    });
                };

            if (event) {
                event.keyCode == 13 && append();
            } else {
                append();
            }
        };

        this.getMax = function () {
            return Math.min(self.data.orderForAppend.total, self.incomingTransfer.remaining_amount);
        };
    }]);
}());
