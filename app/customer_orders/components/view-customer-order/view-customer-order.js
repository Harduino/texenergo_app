class ViewCustomerOrderCtrl {
    constructor($state, $stateParams, serverApi, funcFactory, $filter, $parse, $timeout, $uibModal) {
        let self = this;

        this.serverApi = serverApi;
        this.funcFactory = funcFactory;
        this.$uibModal = $uibModal;
        this.$timeout = $timeout;
        this.$parse = $parse;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$filter = $filter;
        this.selectedProduct = null;

        this.partnerSelectConfig = {dataMethod: serverApi.getPartners};
        this.order = {};
        this.total = 0;

        this.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.customer_orders', {})},
                {
                    type: 'command',
                    callback: (subData, button, $event) => {
                        $uibModal.open({
                            component: 'commandCustomerOrderModal',
                            windowClass: 'eqo-centred-modal',
                            resolve: {config: {}}
                        }).result.then(command => {
                            let data = {customer_order: {command: command}};

                            button.disableOnLoad(true, $event);
                            serverApi.updateCommandCustomerOrder(self.order.id, data, res => {
                                if(res.status == 200) {
                                    self.order = res.data;
                                    funcFactory.showNotification('Комманда выполнена', '', true);
                                } else {
                                    funcFactory.showNotification('Не удалось переместить сторку', res.data.errors);
                                }
                                button.disableOnLoad(false, $event);
                            }, () => button.disableOnLoad(false, $event));
                        });
                    }
                },
                {
                    type: 'send_email',
                    callback: (subData, button, $event) => {
                        button.disableOnLoad(true, $event);
                        serverApi.sendCustomerOrderInvoice($stateParams.id, result => {
                            if(result.status == 200 && !result.data.errors) {
                                funcFactory.showNotification('Успешно', 'Заказ успешно отправлен.', true);
                            } else if (result.status == 200 && result.data.errors) {
                                funcFactory.showNotification('Неудача', result.data.errors, true);
                            } else {
                                funcFactory.showNotification('Неудача', 'Ошибка при попытке отправить заказ.', true);
                            }
                            button.disableOnLoad(false, $event);
                        }, result => {
                          button.disableOnLoad(false, $event);
                        });
                    }
                },
                {
                    type: 'recalculate',
                    callback: (subData, button, $event) => {
                        button.disableOnLoad(true, $event);
                        serverApi.recalculateCustomerOrder($stateParams.id, result => {
                            button.disableOnLoad(false, $event);
                            if(result.status == 200 && !result.data.errors) {
                                funcFactory.showNotification('Успешно', 'Заказ успешно пересчитан.', true);
                                self.data.order = result.data;
                            } else {
                                funcFactory.showNotification('Неудача', 'Ошибка при пересчёте заказа.', true);
                            }
                        }, () => {
                          button.disableOnLoad(false, $event);
                        });
                    }
                },
                {type: 'logs', callback: () => $state.go('app.customer_orders.view.logs', {})},
                {
                    type: 'confirm_order',
                    callback: (subdata, item, $event) => {
                        let data = {customer_order: {event: item.event}};

                        item.disableOnLoad(true, $event);
                        serverApi.updateStatusCustomerOrder($stateParams.id, data, res => {
                            if(res.status == 200 && !res.data.errors) {
                                funcFactory.showNotification('Успешно', 'Удалось ' + item.name.toLowerCase() + ' заказ',
                                    true);
                                self.order = res.data;
                            } else {
                                funcFactory.showNotification('Не удалось ' + item.name.toLowerCase() + ' заказ',
                                    res.data.errors);
                            }
                            item.disableOnLoad(false, $event);
                        }, () => {
                          item.disableOnLoad(false, $event);
                        });
                    }
                },
                {type: 'refresh', callback: self.getOrderDetails.bind(self)}
            ],
            chartOptions: {
                barColor: 'rgb(103,135,155)',
                scaleColor: false,
                lineWidth: 5,
                lineCap: 'circle',
                size: 50,
                tooltip: true
            },
            titles: 'Заказ клиента: №',
            sortOpts: {
                update: function (e, ui) {
                    let $this = $(this),
                        last_ind = angular.element(ui.item).scope().$index,
                        new_ind = ui.item.index(),
                        data = {customer_order: {command: 'переместить_строку ' + (last_ind + 1) + '_на_' + (new_ind + 1)}};
                    if(self.visual.roles.can_edit){
                        serverApi.updateCommandCustomerOrder(self.order.id, data, result => {
                            if(result.status == 200) {
                            	Array.swapItemByindex(self.order.customer_order_contents,
                                last_ind, new_ind);
                        	} else {
	                            funcFactory.showNotification('Не удалось переместить сторку', result.data.errors);
	                            $this.sortable('cancel');
                        	}
                        }, () => $this.sortable('cancel'));
                    }else{
               			$this.sortable('cancel');
                    }
                },
                items: '> .order-items'
            },
            roles: {},
            navTableButts:[
                {
                    type: 'remove',
                    disabled: false,
                    callback: (item, button, $event) => {
                      button.disableOnLoad(true, $event);
                      serverApi.removeCustomerOrderProduct(self.order.id, item.data.id,
                        (res) => {
                          button.disableOnLoad(false, $event);
                          self.getRemovePositionHandler(item.data)(res);
                        }, () => {
                          button.disableOnLoad(false, $event);
                        });
                    }
                }
            ]
        };

        this.amontPercent = 0;
        this.dispatchedPercent = 0;
        this.productForAppend = null;//данные продукта, который необходимо добавить к заказу
        this.pSelectConfig = {startPage: 0, dataMethod: serverApi.getSearch};

        this.sliderOptions = {
            value:1,
            min: 0.9,
            max: 3,
            step: 0.01,
            slide: (event, ui) => self.data.networkConfig.zoom = ui.value
        };

        this.getOrderDetails();
        this.$onDestroy = () => self._subscription && self._subscription.unsubscribe();
    }

    addressToString (addr) {
        return [
            (addr.postal_index || "Индекс"),
            (addr.region || "Регион"),
            (addr.city || "Город"),
            (addr.street || "Улица"),
            (addr.house || "Дом")
        ].join(", ");
    }

    saveOrderInfo () {
        let self = this,
            order = self.order,
            data = {
                customer_order: {
                    title: order.title,
                    description: order.description,
                    partner_id: order.partner.id,
                    issued_by_id: order.issued_by.id,
                    transportation: order.transportation_info.transportation,
                    delivery_address_id: (order.transportation_info.delivery_address !== null) ? order.transportation_info.delivery_address.id : null
                }
            };

        this.serverApi.updateCustomerOrder(order.id, data, result => {
            if(result.status == 200 && !result.data.errors) {
                self.order = result.data;
                self.funcFactory.showNotification('Успешно', 'Заказ ' + order.number + ' успешно отредактирован.', true);
            } else {
                self.funcFactory.showNotification('Неудача', 'Не удалось отредактировать заказ ' + order.number, true);
            }
        });
    }

    saveProductChange (data) {
        let product = data.item;

        this.serverApi.updateCustomerOrderProduct(this.order.id, product.id, {
            quantity: product.quantity,
            discount: product.discount
        }, this.processUpdateCustomerDataResponse.bind(this));
    }

    changeCustomerOrderProductModal (p) {
        let self = this;

        this.$uibModal.open({
            component: 'eqoChangeCustomerOrderProductModal',
            windowClass: 'eqo-centred-modal',
            resolve: {product : p.product, config: {}}
        }).result.then(selectedProduct => {
            self.saveProductSubstitute({
                id: p.id,
                quantity: p.quantity,
                product_id: selectedProduct._id || selectedProduct.id
            });
        });
    }

    productDetailsModal (row) {
        this.$uibModal.open({
            component: 'eqoProductDetailsModal',
            windowClass: 'eqo-centred-modal',
            resolve: {row: row, order: this.order, config: {}}
        });
    }

    selectProductForAppend (item) {
        this.productForAppend = item;
        this.productForAppend.id = item.id || item._id;
        this.productForAppend.quantity = 0;
        this.$timeout(() => angular.element('#append_product_quantity').focus(), 10);
    }

    appendProduct (event) {
        if(!event || (event.keyCode == 13)) {
            let self = this,
                t = this.productForAppend,
                data = angular.extend(t, {product: {name: t.name, id: t.id}}),
                selectCtrl = angular.element('#vco_prod_select').data().$uiSelectController,
                post = {product_id: t.id, quantity: t.quantity, query_original: selectCtrl.search};

            this.productForAppend = null;
            this.selectedProduct = null;

            this.serverApi.addCustomerOrderProduct(self.order.id, post, result => {
                if(result.data.errors) {
                    self.funcFactory.showNotification('Не удалось добавить продукт', result.data.errors);
                } else {
                    for (let i = 0; i < result.data.length; i++) {
                        let position = angular.extend(data, result.data[i]);

                        if(self.getPositionIndex(position) === -1) {
                            self.order.customer_order_contents.push(position);
                            self.funcFactory.showNotification('Успешно добавлен продукт', t.name, true);
                        }
                    }

                    self.updateTotal();
                    selectCtrl.open = true;
                    selectCtrl.search = '';
                }
            });
        }
    }

    deleteSelectedItems (useSelected) {
        let self = this;

        this.order.customer_order_contents.forEach((item) => {
            if (item.$selectedForSumm === useSelected) {
                self.serverApi.removeCustomerOrderProduct(self.order.id, item.id, result => {
                    self.getRemovePositionHandler(item)(result);
                });
            }
        });
    }

    getDaDataSuggestions (val, fieldName) {
        let self = this;

        return this.serverApi.validateViaDaData('address', {query: val}).then(result => {
            return result.data.suggestions.map(item => {
                return {label: self.$parse(fieldName)(item) || val, item: item, field: fieldName};
            });
        });
    }

    fillBySuggestion (item) {
        if(['data.postal_code', 'data.city', 'data.street'].indexOf(item.field) !== -1) {
            ['postal_code', 'region_with_type', 'city', 'house'].forEach(name => {
                angular.element('[e-name="data.' + name + '"]').scope().$editable.scope.$data = item.item.data[name];
            });
        }
    }

    goToPartner () {
        let self = this;
        this.$state.go('app.partners.view', {id: self.order.partner.id});
    }

    // Заменяет товар в строке, и вызывается из модального окна, поэтому не знаем index строки, и ищем через for
    // Именно этим и отличается от saveProductChange
    saveProductSubstitute (data) {
        this.serverApi.updateCustomerOrderProduct(this.order.id, data.id, {product_id: data.product_id},
            this.processUpdateCustomerDataResponse.bind(this));
    }

    processUpdateCustomerDataResponse (result) {
        if(!result.data.errors) {
            let self = this;

            result.data.forEach(updated_row => {
                self.order.customer_order_contents.forEach((x, j) => {
                    if (x.id === updated_row.id) {
                        self.order.customer_order_contents[j] = angular.extend(x, updated_row);
                        return self.funcFactory.showNotification('Успешно обновлены данные продукта', x.product.name, true);
                    }
                });
            });

            this.updateTotal();
        } else {
            this.funcFactory.showNotification('Не удалось обновить данные продукта', result.data.errors);
        }
    }

    updateTotal () {
        let self = this, total = 0;
        this.order.customer_order_contents.map(item => total += self.$filter('price_net')(item, item.quantity));
        self.total = total;
    }

    // Used for each selected row to calculate sum
    summarizeRows (row) {
      return this.$filter('price_net')(row, row.quantity);
    }

    getOrderDetails () {
        let self = this;

        this.serverApi.getCustomerOrderDetails(this.$stateParams.id, result => {
            let order = self.order = result.data;

            self.funcFactory.setPageTitle('Заказ ' + self.order.number);
            self.amontPercent = self.funcFactory.getPercent(order.paid_amount, order.total);
            self.dispatchedPercent = self.funcFactory.getPercent(order.dispatched_amount, order.total);

            self.visual.roles = {
                can_edit: order.can_edit,
                can_destroy: order.can_destroy,
                can_confirm: order.can_confirm
            };

            self.calculateTotals(order, 'incoming_transfers', 'total_paid_linked', 'total_paid');
            self.calculateTotals(order, 'dispatch_orders', 'total_dispatched_linked', 'total_dispatched');
            self.updateTotal();
        });
    }

    calculateTotals(order, sourceField, fieldX, fieldY) {
        let x = 0, y = 0;

        order[sourceField].forEach(item => {
            x += item.linked_total;
            y += item.amount;
        });

        this[fieldX] = x;
        this[fieldY] = y;
    }

    getPositionIndex (position) {
        let positionIndex = -1;

        this.order.customer_order_contents.forEach((existingPosition, existingPositionIndex) => {
            if(existingPosition.id === position.id) {
                positionIndex = existingPositionIndex;
            }
        });

        return positionIndex;
    }

    getRemovePositionHandler (item) {
        let self = this;
        return res => {
            if(res.data.errors) {
                self.funcFactory.showNotification('Не удалось удалить продукт', res.data.errors);
            } else {
                self.order.customer_order_contents.forEach( (row, index) => {
                    if(row.id === item.id) {
                        self.order.customer_order_contents.splice(index, 1);
                        self.funcFactory.showNotification('Продукт удален:', item.product.name, true);
                        return;
                    }
                });

                self.updateTotal();
            }
        };
    }
}

ViewCustomerOrderCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory', '$filter', '$parse', '$timeout', '$uibModal'];

angular.module('app.customer_orders').component('viewCustomerOrder', {
    controller: ViewCustomerOrderCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/customer_orders/components/view-customer-order/view-customer-order.html'
});
