class ViewSupplierOrderCtrl {
    constructor ($state, $stateParams, serverApi, funcFactory, $filter, $localStorage) {
        let self = this;
        this.data = {supplierOrder: {}, total: 0};

        this.serverApi = serverApi;
        this.$filter = $filter;
        this.funcFactory = funcFactory;

        this.visual = {
            navButtsOptions:[
                { type: 'back', callback: () => $state.go('app.supplier_orders', {}) },
                {
                    type: 'confirm_order',
                    callback: (subdata, item, $event) => {
                        item.disableOnLoad(true, $event);
                        serverApi.updateStatusSupplierOrder($stateParams.id, { supplier_order: { event: item.event } }, r => {
                            item.disableOnLoad(false, $event);
                            this.data.supplierOrder.status = r.data.status;
                            this.data.supplierOrder.can_edit = r.data.can_edit;
                            this.data.supplierOrder.events = r.data.events;
                            item.updateConfirmButton();
                        }, () => {
                          item.disableOnLoad(false, $event);
                        });
                    }
                },
                {
                    type: 'send_email',
                    callback: (subData, button, $event) => {
                        button.disableOnLoad(true, $event);
                        serverApi.sendSupplierOrderRFQ($stateParams.id, result => {
                            button.disableOnLoad(false, $event);
                            if(result.status == 200 && !result.data.errors) {
                                funcFactory.showNotification('Успешно', 'Заказ успешно отправлен.', true);
                            } else if (result.status == 200 && result.data.errors) {
                                funcFactory.showNotification('Неудача', result.data.errors, true);
                            } else {
                                funcFactory.showNotification('Неудача', 'Ошибка при попытке отправить заказ.', true);
                            }
                        }, () => {
                          button.disableOnLoad(false, $event);
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
                    callback: (subdata, button, $event) => {
                        button.disableOnLoad(true, $event);
                        serverApi.getSupplierOrderDetails($stateParams.id, result => {
                            button.disableOnLoad(false, $event);
                            let order = self.data.supplierOrder = result.data;
                            self.updateTotal();
                            self.amontPercent = funcFactory.getPercent(order.paid_amount, order.total);
                            self.dispatchedPercent = funcFactory.getPercent(order.received_amount, order.total);
                            self.visual.roles = {can_confirm: order.can_confirm};
                        }, () => {
                          button.disableOnLoad(false, $event);
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
        });
    }

    appendProduct (event) {
        if(!event || (event.keyCode == 13)) {
            let product = this.data.selectedProduct;
            let data = {product_id: product.id, quantity: product.quantity};

            this.serverApi.addSupplierOrderProduct(this.data.supplierOrder.id, data, r => {
                this.data.supplierOrder.supplier_order_contents.push(r.data);

                this.funcFactory.showNotification('Успешно добавлен продукт', r.data.product.name, true);

                this.data.selectedProduct = null;
                angular.element('#eso_prod_select').data().$uiSelectController.open=true;
            })
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
        let row = item;
        this.serverApi.removeSupplierOrderProduct(this.data.supplierOrder.id, item.id, () => {
            for (var i = 0; i < this.data.supplierOrder.supplier_order_contents.length; i++) {
                if (this.data.supplierOrder.supplier_order_contents[i].id === row.id) {
                    this.data.supplierOrder.supplier_order_contents.splice(i, 1);
                    this.funcFactory.showNotification(
                        'Успешно удалил строку',
                        ('Товар '+ row.product.name + ', кол-во ' + row.quantity + ' ед.'),
                        true
                    );
                    break;
                }
            }
        })
    }

    saveProductChange (row) {
        let data = {quantity: row.item.quantity, price: row.item.price};

        this.serverApi.updateSupplierOrderProduct(this.data.supplierOrder.id, row.item.id, data, r => {
            for (var i = 0; i < this.data.supplierOrder.supplier_order_contents.length; i++) {
                if(this.data.supplierOrder.supplier_order_contents[i].id !== r.data.id) continue;
                this.data.supplierOrder.supplier_order_contents[i] = r.data;
                this.funcFactory.showNotification('Успешно обновил строку', 'Обвновил ' + row.item.product.name, true);
                break;
            }
        })
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

ViewSupplierOrderCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory', '$filter', '$localStorage'];

angular.module('app.supplier_orders').component('viewSupplierOrder', {
    controller: ViewSupplierOrderCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/supplier_orders/components/view-supplier-order/view-supplier-order.html'
});
