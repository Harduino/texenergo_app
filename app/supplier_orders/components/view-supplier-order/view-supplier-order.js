class ViewSupplierOrderCtrl {
    constructor ($state, $stateParams, serverApi, funcFactory, notifications, $filter, $localStorage) {
        let self = this;
        this._subscription = {};
        this.data = {supplierOrder: {}, partnersList: [], productsList: [], total: 0};

        this.serverApi = serverApi;
        this.$filter = $filter;

        this.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.supplier_orders', {})},
                {
                    type: 'confirm_order',
                    callback: (subdata, item) => self.notifyListener('update_status', {event: item.event})
                },
                {
                    type: 'send_email',
                    callback: () => {
                        serverApi.sendSupplierOrderRFQ($stateParams.id, result => {
                            if(result.status == 200 && !result.data.errors) {
                                funcFactory.showNotification('Успешно', 'Заказ успешно отправлен.', true);
                            } else if (result.status == 200 && result.data.errors) {
                                funcFactory.showNotification('Неудача', result.data.errors, true);
                            } else {
                                funcFactory.showNotification('Неудача', 'Ошибка при попытке отправить заказ.', true);
                            }
                        });
                    }
                },
                {
                    type: 'txt_export',
                    callback: () => window.open(window.APP_ENV.TEXENERGO_COM_API_HTTP_BASE_URL + '/supplier_orders/' +
                            self.data.supplierOrder.id + '.txt?token=' + $localStorage.id_token, '_blank')
                },
                {
                    type: 'refresh',
                    callback: () => {
                        serverApi.getSupplierOrderDetails($stateParams.id, result => {
                            let order = self.data.supplierOrder = result.data;
                            self.updateTotal();
                            self.amontPercent = funcFactory.getPercent(order.paid_amount, order.total);
                            self.dispatchedPercent = funcFactory.getPercent(order.received_amount, order.total);
                            self.visual.roles = {can_confirm: order.can_confirm};
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
            role: {},
            showFileModal: angular.noop,
            titles: 'Заказ поставщику: №'
        };

        this.amontPercent = 0;
        this.dispatchedPercent = 0;
        this.productForAppend = {};

        this.pSelectConfig = {startPage: 0, dataMethod: serverApi.getSearch};
        this.partnerSelectConfig = {dataMethod: serverApi.getPartners};

        serverApi.getSupplierOrderDetails($stateParams.id, result => {
            let order = self.data.supplierOrder = result.data;
            self.updateTotal();
            self.amontPercent = funcFactory.getPercent(order.paid_amount, order.total);
            self.dispatchedPercent = funcFactory.getPercent(order.received_amount, order.total);
            self.visual.roles = {can_edit: order.can_edit, can_confirm: order.can_confirm};

            self.fileModalOptions = {
                url:'/api/supplier_orders/'+ order.id +'/documents',
                files: order.documents,
                r_delete: serverApi.deleteFile,
                view: 'supplier_orders',
                id: order.id
            };

            self._subscription =  notifications.subscribe({
                channel: 'SupplierOrdersChannel',
                supplier_order_id: $stateParams.id
            }, self);
        });

        this.$onDestroy = () => self._subscription && self._subscription.unsubscribe();
    }

    selectProductForAppend (item) {
        this.productForAppend = item;
        this.productForAppend.id = item.id || item._id;
        this.productForAppend.quantity = 1;
    }

    appendProduct (event) {
        if(!event || (event.keyCode == 13)) {
            let product = this.productForAppend;
            this.notifyListener('create_content', {product_id: product.id, quantity: product.quantity});
        }
    }

    saveSupplierOrderInfo () {
        let supplierOrder = this.data.supplierOrder;
        let data = {
            supplier_order:{
                title: supplierOrder.title,
                description: supplierOrder.description,
                partner_id: supplierOrder.partner.id,
                number: supplierOrder.number
            }
        };

        this.serverApi.updateSupplierOrder(supplierOrder.id, data, result => {
            if((result.status == 200) && !result.data.errors) {
                ViewSupplierOrderCtrl.showNotification('Успешно', 'Заказ ' + supplierOrder.number +
                    ' успешно отредактирован', '#739E73', 'fa-check');
            } else {
                ViewSupplierOrderCtrl.showNotification('Ошибка', 'Не смог обновить заказ ' + supplierOrder.number,
                    '#A90329', 'fa-close');
            }
        });
    }

    removeProduct (item) {
        this.notifyListener('destroy_content', item);
    }

    saveProductChange (data) {
        this.notifyListener('update_content', data.item);
    }

    notifyListener (action, data) {
        this._subscription.send({action: action, data: data});
    }

    updateTotal () {
        let self = this, sum = 0;
        this.data.supplierOrder.supplier_order_contents.map(item => sum += self.$filter('price_net')(item, item.quantity));
        this.data.supplierOrder.total = sum;
    }

    static showNotification (title, message, color, icon) {
        $.smallBox({
            title: title,
            content: '<i class="fa fa-edit"></i> <i>' + message + '.</i>',
            color: color,
            iconSmall: 'fa ' + icon + ' fa-2x fadeInRight animated',
            timeout: 4000
        });
    }
}

ViewSupplierOrderCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory', 'supplierOrdersNotifications',
    '$filter', '$localStorage'];

angular.module('app.supplier_orders').component('viewSupplierOrder', {
    controller: ViewSupplierOrderCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/supplier_orders/components/view-supplier-order/view-supplier-order.html'
});
