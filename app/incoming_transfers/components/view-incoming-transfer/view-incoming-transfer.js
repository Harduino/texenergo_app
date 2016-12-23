class ViewIncomingTransferCtrl {
    constructor($state, $stateParams, serverApi, $q, funcFactory, CanCan) {
        let self = this;
        this.funcFactory = funcFactory;
        this.serverApi = serverApi;

        this.incomingTransfer = {};

        this.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.incoming_transfers', {})},
                {type: 'logs', callback: () => $state.go('app.incoming_transfers.view.logs', {})},
                {
                    type: 'refresh',
                    callback: () => {
                        serverApi.getIncomingTransferDetails($stateParams.id, res => {
                            self.incomingTransfer = res.data;
                            self.calculateRemainingAmount();
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
                    callback: item => {
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
                    callback: data => {
                        let item = data.data;

                        serverApi.removeIncomingTransferOrder(self.incomingTransfer.id, item.id, res => {
                            let transferInfo;

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
                                self.calculateRemainingAmount();
                                self.funcFactory.showNotification(transferInfo + ' успешно удален', '', true);
                            }
                        });
                    }
                }
            ],
            titles: 'Входящий платеж: №',
            roles: {can_destroy: true, can_edit: CanCan.can('edit', 'IncomingTransfer')}
        };

        this.data = {ordersList: [], orderForAppend: {amount: 0}};

        serverApi.getIncomingTransferDetails($stateParams.id, result => {
            let transfer = self.incomingTransfer = result.data;
            self.calculateRemainingAmount();

            self.fileModalOptions = {
                url: '/api/incoming_transfers/' + transfer.id + '/documents',
                files: transfer.documents,
                r_delete: serverApi.deleteFile,
                view: 'incoming_transfers',
                id: transfer.id
            };
        });

        this.orderSelectConf = {
            dataMethod: (page, query, config, success) => {
                let canceler1 = $q.defer(), canceler2 = $q.defer();

                let checkStatus = result => {
                        return result.status == 200 ? result.data : [];// if result not success, return []
                    },
                    defers = [$q.defer(), $q.defer()];//requests defers

                serverApi.getCustomerOrders(page, query, {timeout:canceler1.promise}, res => {
                    defers[0].resolve(checkStatus(res));
                }, null, self.incomingTransfer.partner.id);

                serverApi.getOutgoingTransfers(page, query, {timeout:canceler2.promise}, res => {
                    defers[1].resolve(checkStatus(res));
                }, null, self.incomingTransfer.partner.id);

                //cancel both requests
                config.timeout.then(() => {
                    canceler1.resolve();
                    canceler2.resolve();
                });

                //wait all promises
                $q.all(defers.map(item => {
                    return item.promise;
                })).then(res => success( {data: res[0].concat(res[1])} ));
            }
        };
    }

    onOrderSelect () {
        let order = this.data.orderForAppend;

        if (order.hasOwnProperty('type') && (order.type.search(/transfer/gi) > -1)) {
            order.total = new Number(order.amount);
        } else {
            order.amount = new Number(order.total);
        }
    }

    appendOrder (event) {
        let
            self = this,
            data = this.data.orderForAppend,
            append = () => {
                self.data.orderForAppend = {};
                let postData = {amount: data.amount};
                let transfer = false;

                if (data.type === 'OutgoingTransfer') {
                    transfer = true;
                    postData.outgoing_transfer_id = data.id;
                } else {
                    postData.customer_order_id = data.id;
                }

                self.serverApi.appendIncomingTransferOrder(self.incomingTransfer.id, postData, res => {
                    let transferInfo = transfer ? 'Платеж ' + data.number : 'Заказ ' + data.number;

                    if (!res.data.errors) {
                        self.incomingTransfer.remaining_amount = res.data.money_transfer.remaining_amount;
                        self.incomingTransfer.money_to_orders.push(res.data);
                        self.calculateRemainingAmount();
                        self.funcFactory.showNotification('Успешно', transferInfo + ' успешно добавлен', true);
                        angular.element('#vit_order_select').data().$uiSelectController.open = true;
                    } else {
                        self.funcFactory.showNotification('Не удалось прикрепить ' + transferInfo, res.data.errors);
                    }
                });
            };

        if (event) {
            event.keyCode == 13 && append();
        } else {
            append();
        }
    }

    getMax () {
        return Math.min(this.data.orderForAppend.total, this.incomingTransfer.remaining_amount);
    }

    calculateRemainingAmount () {
        let remainingAmount = this.incomingTransfer.amount;
        angular.forEach(this.incomingTransfer.money_to_orders, item => remainingAmount -= item.amount);
        this.incomingTransfer.remaining_amount = remainingAmount;
    }
}

ViewIncomingTransferCtrl.$inject = ['$state', '$stateParams', 'serverApi', '$q', 'funcFactory', 'CanCan'];

angular.module('app.incoming_transfers').component('viewIncomingTransfer', {
    controller: ViewIncomingTransferCtrl,
    controllerAs: 'viewIncomingTransferCtrl',
    templateUrl: '/app/incoming_transfers/components/view-incoming-transfer/view-incoming-transfer.html'
});
