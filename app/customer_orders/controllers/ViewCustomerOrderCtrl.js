/**
 * Created by Egor Lobanov on 15.11.15.
 */
(function(){
    "use strict";

    angular.module('app.customer_orders')
        .controller('ViewCustomerOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', '$filter', 'customerOrdersNotifications', '$uibModal', '$parse', '$timeout', function($scope, $state, $stateParams, serverApi, funcFactory, $filter, notifications, $uibModal, $parse, $timeout){
            var _subscription;
            var sc = $scope;
            var self = this;

            this.partnersList = [];
            this.partnerSelectConfig = {dataMethod: serverApi.getPartners};
            this.order = {};
            this.total = 0;

            this.visual = {
                navButtsOptions:[
                    {
                        type: 'back',
                        callback: function() {
                            $state.go('app.customer_orders', {});
                        }
                    },
                    {
                        type: 'command',
                        callback: function() {
                            $uibModal.open({
                                component: 'commandCustomerOrderModal',
                                windowClass: 'eqo-centred-modal',
                                resolve: {config: {}}
                            }).result.then(function (command) {
                                var data = {customer_order: {command: command}};

                                serverApi.updateCommandCustomerOrder(self.order.id, data, function(res) {
                                    if(res.status == 200) {
                                        self.order = res.data;
                                        funcFactory.showNotification('Комманда выполнена', "", true);
                                    } else {
                                        funcFactory.showNotification('Не удалось переместить сторку', res.data.errors);
                                    }
                                }, angular.noop);
                            });
                        }
                    },
                    {
                        type: 'send_email',
                        callback: function () {
                            serverApi.sendCustomerOrderInvoice($stateParams.id, function(result){
                                if(result.status == 200 && !result.data.errors) {
                                    funcFactory.showNotification("Успешно", 'Заказ успешно отправлен.', true);
                                } else if (result.status == 200 && result.data.errors) {
                                    funcFactory.showNotification("Неудача", result.data.errors, true);
                                } else {
                                    funcFactory.showNotification("Неудача", 'Ошибка при попытке отправить заказ.', true);
                                }
                            });
                        }
                    },
                    {
                        type: 'recalculate',
                        callback: function() {
                            serverApi.recalculateCustomerOrder($stateParams.id, function(result){
                                if(result.status == 200 && !result.data.errors) {
                                    funcFactory.showNotification("Успешно", 'Заказ успешно пересчитан.', true);
                                    self.data.order = result.data;
                                } else {
                                    funcFactory.showNotification("Неудача", 'Ошибка при пересчёте заказа.', true);
                                }
                            });
                        }
                    },
                    {
                        type: 'logs',
                        callback: function () {
                            $state.go('app.customer_orders.view.logs', {});
                        }
                    },
                    {
                        type: 'confirm_order',
                        callback: function (subdata, item) {
                            var data = {customer_order: {event: item.event}};

                            serverApi.updateStatusCustomerOrder($stateParams.id, data, function(res) {
                                if(res.status == 200 && !res.data.errors) {
                                    funcFactory.showNotification("Успешно", 'Удалось ' + item.name.toLowerCase() +
                                        ' заказ', true);
                                    self.order = res.data;
                                } else {
                                    funcFactory.showNotification("Не удалось " + item.name.toLowerCase() + ' заказ',
                                        res.data.errors);
                                }
                            });
                        }
                    },
                    {
                        type: 'refresh',
                        callback: getOrderDetails
                    }
                ],
                chartOptions: {
                    barColor:'rgb(103,135,155)',
                    scaleColor:false,
                    lineWidth:5,
                    lineCap:'circle',
                    size:50,
                    tooltip: true
                },
                titles: 'Заказ клиента: №',
                sortOpts: {
                    update: function (e, ui) {
                        var $this = $(this),
                            last_ind = angular.element(ui.item).scope().$index,
                            new_ind = ui.item.index(),
                            data = {customer_order: {command: 'переместить_строку ' + (last_ind + 1) + '_на_' + (new_ind + 1)}};
                        serverApi.updateCommandCustomerOrder(self.order.id, data, function(result) {
                            if(result.status == 200) {
                                self.order.customer_order_contents.swapItemByindex(last_ind, new_ind);
                            } else {
                                funcFactory.showNotification('Не удалось переместить сторку', result.data.errors);
                                $this.sortable('cancel');
                            }
                        }, function(){
                            $this.sortable( "cancel" );
                        });
                    },
                    items: "> .order-items"
                },
                roles: {},
                navTableButts:[
                    {
                        type: 'remove',
                        disabled: false,
                        callback: function (item) {
                            serverApi.removeCustomerOrderProduct(self.order.id, item.data.id, function(result) {
                                if(!result.data.errors){
                                    self.order.customer_order_contents.splice(item.index, 1);
                                    funcFactory.showNotification('Продукт удален:', item.data.product.name, true);
                                    updateTotal();
                                } else {
                                    funcFactory.showNotification('Не удалось удалить продукт', result.data.errors);
                                }
                            });
                        }
                    }
                ]
            };

            this.data = {
                networkData: null,
                productsList: [],//селект выбора продукта
                networkConfig: {
                    actions:[
                        {
                            select: '.node',
                            action: 'click',
                            handler: function (item) {
                                if (d3.event.defaultPrevented) return;
                                $state.go(getPropertyByDocumentType(item).state, {id: item.id});
                            }
                        }
                    ],
                    colorSetter: function(item){
                        return getPropertyByDocumentType(item).color;
                    },
                    tooltip: function(item){
                        return '<div class="vco-graph-tooltip">' +
                                '<ul>' +
                                    '<li><b>Тип:</b> '+getPropertyByDocumentType(item).title+'</li>' +
                                    '<li><b>Номер:</b> '+item.number+'</li>' +
                                    '<li><b>Дата:</b> '+$filter('date')(item.date, 'dd MMMM yy, HH:mm')+'</li>' +
                                    '<li><b>Итого:</b> '+$filter('currency')(item.total)+'</li>' +
                                '</ul>' +
                            '</div>'
                    },
                    zoomChange: function(zoom){
                        $("#graph_zoom_slider").slider("value", zoom);
                    }
                }
            };

            this.amontPercent = 0;
            this.dispatchedPercent = 0;
            this.productForAppend = {};//данные продукта, который необходимо добавить к заказу
            this.pSelectConfig = {startPage: 0, dataMethod: serverApi.getSearch};

            this.sliderOptions = {
                value:1,
                min: 0.9,
                max: 3,
                step: 0.01,
                slide: function(event, ui){
                    self.data.networkConfig.zoom = ui.value;
                }
            };

            this.summaryPanelOptions = {appendTo: 'body', scroll: true, containment: 'body'};
            this.summaryData = {show: false, positions: {}, total: 0};

            /**
             * Обновляем информацию по заказу
             */
            this.saveOrderInfo = function(){
                var order = self.order,
                    data = {
                        customer_order:{
                            title: order.title,
                            description: order.description,
                            partner_id: order.partner.id,
                            issued_by_id: order.issued_by.id,
                            transportation: order.transportation_info.transportation,
                            delivery_address: {
                                postal_index: order.transportation_info.delivery_address.postal_index,
                                region: order.transportation_info.delivery_address.region,
                                city: order.transportation_info.delivery_address.city,
                                street: order.transportation_info.delivery_address.street,
                                house: order.transportation_info.delivery_address.house
                            }
                        }
                    };

                serverApi.updateCustomerOrder(order.id, data, function(result){
                    if(result.status == 200 && !result.data.errors){
                        self.order = result.data;
                        funcFactory.showNotification("Успешно", 'Заказ ' + order.number + ' успешно отредактирован.', true);
                    } else {
                        funcFactory.showNotification("Неудача", 'Не удалось отредактировать заказ ' + order.number, true);
                    }
                });
            };

            var processUpdateCustomerDataResponse = function(result) {
                if(!result.data.errors) {
                    for (var i = 0; i < result.data.length; i++) {
                        var updated_row = result.data[i];

                        for (var j = 0; j < self.order.customer_order_contents.length; j++) {
                            var x = self.order.customer_order_contents[j];

                            if (x.id === updated_row.id) {
                                self.order.customer_order_contents[j] = angular.extend(x, updated_row);
                                funcFactory.showNotification('Успешно обновлены данные продукта', x.product.name, true);
                                break;
                            }
                        }
                    }

                    updateTotal();
                } else {
                    funcFactory.showNotification('Не удалось обновить данные продукта', result.data.errors);
                }
            };

            this.saveProductChange = function(data) {
                var product = data.item;

                serverApi.updateCustomerOrderProduct(self.order.id, product.id, {
                    quantity: product.quantity,
                    discount: product.discount
                }, processUpdateCustomerDataResponse);
            };

            // Заменяет товар в строке и вызывается из модального окна. Следовательно, не знаем index-а строки и поэтому ищем через for(){}
            // Именно этим и отличается от sc.savProductChange
            this.saveProductSubstitute = function(data) {
                serverApi.updateCustomerOrderProduct(self.order.id, data.id, {product_id: data.product_id},
                    processUpdateCustomerDataResponse);
            };

            /**
             * Открываем модальное окно, чтобы заменить товар в Комплектации на другой
             * Opens modal window with ability to change product of Product item.
             * @param p - product
             */
            this.changeCustomerOrderProductModal = function(p) {
                $uibModal.open({
                    component: 'eqoChangeCustomerOrderProductModal',
                    windowClass: 'eqo-centred-modal',
                    resolve: {product : p.product, config: {}}
                }).result.then(function (selectedProduct) {
                    self.saveProductSubstitute({
                        id: p.id,
                        quantity: p.quantity,
                        product_id: selectedProduct._id || selectedProduct.id
                    });
                });
            };

            this.productDetailsModal = function(row) {
                $uibModal.open({
                    component: 'eqoProductDetailsModal',
                    windowClass: 'eqo-centred-modal',
                    resolve: {row: row, order: self.order, config: {}}
                });
            };

            this.selectPosition = function($event, item) {
                if($event.shiftKey) {
                    $event.preventDefault();
                    $event.stopImmediatePropagation();
                    item.selected = !item.selected;

                    if(item.selected) {
                        self.summaryData.positions[item.id] = item;
                    } else {
                        delete self.summaryData.positions[item.id];
                    }

                    updateSelectedItemsSummary();
                }
            };

            /**
             * выбор продукта для добавления к заказу
             */
            this.selectProductForAppend = function(item){
                self.productForAppend = item;
                self.productForAppend.id = item.id || item._id;
                self.productForAppend.quantity = 0;

                $timeout(function(){
                    angular.element('#append_product_quantity').focus();
                }, 10);
            };

            /**
             * Добавить продукт в список
             */
            this.appendProduct = function(event) {
                if(!event || (event.keyCode == 13)) {
                    var t = self.productForAppend,
                        data = angular.extend(t, {product: {name: t.name, id: t.id}}),
                        selectCtrl = angular.element('#vco_prod_select').data().$uiSelectController,
                        post = {product_id: t.id, quantity: t.quantity, query_original: selectCtrl.search};

                    self.productForAppend = {};
                    self.data.selectedProduct = null;

                    serverApi.addCustomerOrderProduct(self.order.id, post, function(result) {
                        if(result.data.errors) {
                            funcFactory.showNotification('Не удалось добавить продукт', result.data.errors);
                        } else {
                            for (var i = 0; i < result.data.length; i++) {
                                self.order.customer_order_contents.push(angular.extend(data, result.data[i]));
                            }

                            updateTotal();
                            funcFactory.showNotification('Успешно добавлен продукт', t.name, true);
                            selectCtrl.open = true;
                            selectCtrl.search = '';
                        }
                    });
                }
            };

            var updateSelectedItemsSummary = function() {
                var values = self.summaryData.positions;
                var total = 0;
                var keys = Object.keys(values);

                self.summaryData.show = keys.length > 0;

                keys.map(function(prop) {
                    total += $filter('price_net')(values[prop], values[prop].quantity);
                });

                self.summaryData.total = total;
            };

            // Send HTTP request to remove the product from Customer Order.
            this.removeProduct = function(item, index){
                $.SmartMessageBox({
                    title: "Удалить товар?",
                    content: "Вы действительно хотите номенклатуру " + item.product.name,
                    buttons: '[Нет][Да]'
                }, function (ButtonPressed) {
                    if (ButtonPressed === "Да") {
                        serverApi.removeCustomerOrderProduct(self.order.id, item.id, function(result) {
                            if(!result.data.errors){
                                self.order.customer_order_contents.splice(index, 1);
                                funcFactory.showNotification('Продукт удален:', item.product.name, true);
                                updateTotal();
                            } else {
                                funcFactory.showNotification('Не удалось удалить продукт', result.data.errors);
                            }
                        });
                    }
                });
            };

            this.deleteSelectedItems = function(useSelected) {
                self.order.customer_order_contents.forEach(function(item, i) {
                    if (item.selected === useSelected) {
                        serverApi.removeCustomerOrderProduct(self.order.id, item.id, function(result) {
                            if(result.data.errors) {
                                funcFactory.showNotification('Не удалось удалить продукт', result.data.errors);
                            } else {
                                if(useSelected) {
                                    delete self.summaryData.positions[item.id];
                                    updateSelectedItemsSummary();
                                }

                                self.order.customer_order_contents.splice(i, 1);
                                updateTotal();
                                funcFactory.showNotification('Продукт удален:', item.product.name, true);
                            }
                        });
                    }
                });
            };

            /**
             * Get order details
             */
            getOrderDetails();
            function getOrderDetails (){
                serverApi.getCustomerOrderDetails($stateParams.id, function(result){
                    var order = self.order = result.data;

                    funcFactory.setPageTitle('Заказ ' + self.order.number);
                    self.amontPercent = funcFactory.getPercent(order.paid_amount, order.total);
                    self.dispatchedPercent = funcFactory.getPercent(order.dispatched_amount, order.total);

                    self.visual.roles = {
                        can_edit: order.can_edit,
                        can_destroy: order.can_destroy,
                        can_confirm: order.can_confirm
                    };

                    calculateTotals(order);
                    updateTotal();

                    _subscription =  notifications.subscribe({
                        channel: 'CustomerOrdersChannel',
                        customer_order_id: $stateParams.id
                    }, self.order.customer_order_contents);
                });
            }

            serverApi.getRelatedOrdersOfCustomer($stateParams.id, function(result) {
                self.data.networkData = result.data;
            });

            function calculateTotals(order){
                var x, y, i;

                // Считаем суммы по входящим платежам
                x = 0;
                y = 0;
                for (i = 0; i < order.incoming_transfers.length; i++) {
                    var t = order.incoming_transfers[i];
                    x += t.linked_total;
                    y += t.amount;
                }

                self.total_paid_linked = x;
                self.total_paid = y;

                // Считаем суммы по отгрузкам
                x = 0;
                y = 0;
                for (i = 0; i < order.dispatch_orders.length; i++) {
                    var d = order.dispatch_orders[i];
                    x += d.linked_total;
                    y += d.amount;
                }

                self.total_dispatched_linked = x;
                self.total_dispatched = y;
            }

            var updateTotal = function() {
                var total = 0;

                self.order.customer_order_contents.map(function(item){
                    total += $filter('price_net')(item, item.quantity);
                });

                self.total = total;
            };

            this.getDaDataSuggestions = function(val, field_name){
                return serverApi.validateViaDaData('address', {"query": val}).then(function(result){
                   return result.data.suggestions.map(function(item){
                       return {label: $parse(field_name)(item) || val, item: item, field: field_name};
                   });
                });
            };

            this.fillBySuggestion = function($item){
                var data = $item.item.data;

                switch ($item.field){
                    case 'data.postal_code': {
                        setValue('data.postal_code', data.postal_code);
                        setValue('data.region_with_type', data.region_with_type);
                        setValue('data.city', data.city);
                        setValue('data.house', data.house);
                        break;
                    }
                    case 'data.city' : {
                        setValue('data.postal_code', data.postal_code);
                        setValue('data.region_with_type', data.region_with_type);
                        setValue('data.city', data.city);
                        setValue('data.house', data.house);
                        break;
                    }
                    case 'data.street' : {
                        setValue('data.postal_code', data.postal_code);
                        setValue('data.region_with_type', data.region_with_type);
                        setValue('data.city', data.city);
                        setValue('data.house', data.house);
                        break;
                    }
                    default :  break;
                }

                //will set value into x-editable element
                function setValue(e_name, value){
                    angular.element('[e-name="'+e_name+'"]').scope().$editable.scope.$data = value;
                }
            };

            function getPropertyByDocumentType(item){
                if (self.data.networkData.format !== undefined && self.data.networkData.format[item.type] !== undefined) {
                    return self.data.networkData.format[item.type];
                }

                switch (item.type){
                    case "CustomerOrder" : return {
                        title: "Заказ клиента",
                        color: "#1f77b4",
                        state: "app.customer_orders.view"
                    };
                    case "DispatchOrder": return {
                        title: "Списание",
                        color: "#d62728",
                        state: "app.dispatch_orders.view"
                    };
                    case "IncomingTransfer": return {
                        title: "Входящий платеж",
                        color: "#2ca02c",
                        state: "app.incoming_transfers.view"
                    };
                    default : return {
                        title: "Не определен",
                        color: "#c7c7c7"
                    }
                }
            }

            sc.$on('$destroy', function(){
               _subscription && _subscription.unsubscribe();
            });

            this.goToPartner = function() {
                $state.go('app.partners.view', {id: self.order.partner.id})
            };
        }])
    ;
}());
