class ViewQuotationOrderCtrl {
    constructor($state, $stateParams, serverApi, funcFactory, $localStorage) {
        let self = this;
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;
        this.$localStorage = $localStorage;

        this.quotation = {};
        this.addableProduct = { product: {} }; // Stores a product that we are about to add.
        this.searchProductsList = []; // Stores filtered unreceived products
        this.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.quotation_orders', {})},
                {
                    type: 'confirm_order',
                    callback: (subdata, item, $event) => {
                        item.disableOnLoad(true, $event);
                        serverApi.updateStatusQuotationOrder($stateParams.id, { quotation_order: { event: item.event } }, r => {
                            item.disableOnLoad(false, $event);
                            this.quotationOrder.status = r.data.status;
                            this.quotationOrder.can_edit = r.data.can_edit;
                            this.quotationOrder.events = r.data.events;
                            item.updateConfirmButton();
                        }, () => {
                          item.disableOnLoad(false, $event);
                        });
                    }
                },
                {
                    type: 'recalculate',
                    callback: (subData, button, $event) => {
                        button.disableOnLoad(true, $event);
                        serverApi.recalculateQuotationOrder($stateParams.id, result => {
                            button.disableOnLoad(false, $event);
                            if(result.status == 200 && !result.data.errors) {
                                funcFactory.showNotification('Успешно', 'Заказ успешно пересчитан.', true);
                                self.quotationOrder = result.data;
                                self.updateTotal();
                            } else {
                                funcFactory.showNotification('Неудача', 'Ошибка при пересчёте заказа.', false);
                            }
                        }, () => {
                          button.disableOnLoad(false, $event);
                        });
                    }
                },
                {
                    type: 'send_email',
                    callback: (subData, button, $event) => {
                        button.disableOnLoad(true, $event);
                        serverApi.sendQuotationOrderRFQ($stateParams.id, result => {
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
                    type: 'refresh',
                    callback: (subData, button, $event) => {
                        button.disableOnLoad(true, $event);
                        this.loadStuff(() => button.disableOnLoad(false, $event));
                    }
                },
                {type: 'print_form_pdf', callback: () => self.openPdf('')}
            ],
            navTableButts:[
                {
                    type: 'remove',
                    disabled: false,
                    callback: (item, button, $event) => {
                        button.disableOnLoad(true, $event);
                        serverApi.removeQuotationOrderContent(self.quotationOrder.id, item.data.id,
                            (res) => {
                                button.disableOnLoad(false, $event);
                                self.getRemovePositionHandler(item.data)(res);
                            }, () => {
                                button.disableOnLoad(false, $event);
                        });
                    }
                }
            ],
            // Пока не используется
            chartOptions: {
                barColor: 'rgb(103,135,155)',
                scaleColor: false,
                lineWidth: 5,
                lineCap: 'circle',
                size: 50
            },
            titles: 'Поступление: №',
            summaryPanelOptions: {
                appendTo: 'body',
                scroll: true,
                containment: 'body'
            }
        };

        this.pSelectConfig = {startPage: 0, dataMethod: serverApi.getSearch};
        this.productForAppend = null;
        this.partnerSelectConfig = {dataMethod: serverApi.getPartners};

        this.goToPartner = () => $state.go('app.partners.view', {id: (this.quotationOrder.partner.id || this.quotationOrder.partner._id)});

        this.loadStuff = (callback) => {
            // Load ReceiverOrder details and any other required details.
            serverApi.getQuotationOrderDetails($stateParams.id, result => {
                self.quotationOrder = result.data;
                self.funcFactory.setPageTitle('Заказ производства ' + self.quotationOrder.number);
                self.updateTotal();
                if(callback !== undefined) callback();
            });
        }
        this.loadStuff();
    }

    showCost() {
        let self = this;
        if(self.quotationOrder === undefined) return false;
        for (var i = self.quotationOrder.quotation_order_contents.length - 1; i >= 0; i--) {
            if (self.quotationOrder.quotation_order_contents[i].quantity !== undefined && self.quotationOrder.quotation_order_contents[i].quantity !== null) {
                return true;
            }
        }
        return false;
    }

    saveOrderInfo () {
        let self = this,
        order = self.quotationOrder,
        data = {
            quotation_order: {
                title: order.title,
                partner_id: order.partner.id,
                coefficient: order.coefficient,
                quantity: order.quantity
            }
        };

        this.serverApi.updateQuotationOrder(order.id, data, result => {
            if(result.status == 200 && !result.data.errors) {
                self.quotationOrder = result.data;
                self.updateTotal();
                self.funcFactory.showNotification('Успешно', 'Заказ производства ' + order.number + ' успешно отредактирован.', true);
            } else {
                self.funcFactory.showNotification('Неудача', 'Не удалось отредактировать заказ', false);
            }
        });
    }

    updateTotal () {
        let self = this, sum = 0;
        this.quotationOrder.quotation_order_contents.map(item => sum += (item.price * item.quantity));
        this.quotationOrder.total = sum;

        this.quotationOrder.totalNet = self.quotationOrder.quotation_order_contents.reduce((tot, thiz) => {
            return tot += (thiz.price_discounted * thiz.quantity);
        }, 0) * self.quotationOrder.quantity;
    }

    /**
    * @description Appending product to order
    * @param {EventObject} event - keypress event
    * @param {Object} product - product from upsale suggestions
    */
    appendProduct (event, product) {
        if(!event || (event.keyCode == 13)) {
            let self = this,
                t = product || angular.copy(this.productForAppend),
                data = angular.extend(t, {product: {name: t.name, id: t.id}}),
                selectCtrl = angular.element('#vco_prod_select').data().$uiSelectController,
                post = {product_id: t.id, quantity: t.quantity, query_original: selectCtrl.search};

            this.productForAppend = null;
            this.selectedProduct = null;

            this.serverApi.addQuotationOrderProduct(self.quotationOrder.id, post, result => {
                if(result.data.errors) {
                    self.funcFactory.showNotification('Не удалось добавить продукт', result.data.errors);
                } else {
                    self.quotationOrder.quotation_order_contents.push(result.data);
                    self.funcFactory.showNotification('Успешно добавлен продукт', result.data.product.name, true);

                    self.updateTotal();
                    selectCtrl.open = true; // open dropdown
                }
            });
        }
    }

    // Удаляет товар из списка
    getRemovePositionHandler (item) {
        let self = this;
        return res => {
            if(res.data.errors) {
                self.funcFactory.showNotification('Не удалось удалить продукт', res.data.errors);
            } else {
                self.quotationOrder.quotation_order_contents.forEach( (row, index) => {
                    if(row.id === item.id) {
                        self.quotationOrder.quotation_order_contents.splice(index, 1);
                        self.funcFactory.showNotification('Продукт удален:', item.product.name, true);
                        self.updateTotal();
                        return;
                    }
                });
            }
        };
    }

    // // Update an already entered product
    updateContentsProduct(row) {
        let self = this;
        let entry = row.item;
        let put = {
            quantity: entry.quantity || 1
        };

        this.serverApi.updateQuotationOrderContent(this.quotationOrder.id, entry.id, put, result => {
            if(!result.data.errors){
                let r = self.quotationOrder.quotation_order_contents;
                r[row.index] = angular.extend(r[row.index], result.data);
                self.funcFactory.showNotification('Успешно', 'Продукт ' + entry.product.name + ' успешно обновлен', true);
                self.updateTotal();
            } else {
                self.funcFactory.showNotification('Не удалось обновить продукт ' + entry.product.name, result.data.errors);
            }
        })
    };

    openPdf(path) {
        window.open(window.APP_ENV.TEXENERGO_COM_API_HTTP_BASE_URL + '/quotation_orders/' + this.quotationOrder.id + path + '.pdf?token=' + this.$localStorage.id_token, '_blank');
    }
}

ViewQuotationOrderCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory', '$localStorage'];

angular.module('app.quotation_orders').component('viewQuotationOrder', {
    controller: ViewQuotationOrderCtrl,
    controllerAs: '$ctrl',
    templateUrl: 'app/quotation_orders/components/view-quotation-order/view-quotation-order.html'
});