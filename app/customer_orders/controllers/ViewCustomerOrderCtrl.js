/**
 * Created by Egor Lobanov on 15.11.15.
 */
(function(){
    "use strict";

    angular.module('app.customer_orders')
        .controller('ViewCustomerOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', '$filter', 'customerOrdersNotifications', '$uibModal', '$parse', '$timeout', function($scope, $state, $stateParams, serverApi, funcFactory, $filter, notifications, $uibModal, $parse, $timeout){
            var _subscription;
            var sc = $scope;
            sc.partnersList = [];
            sc.partnerSelectConfig = {
                dataMethod: serverApi.getPartners
            };
            sc.order = {};
            sc.total = 0;
            sc.visual = {
                navButtsOptions:[
                    { type: 'back', callback: returnBack },
                    { type: 'command', callback: showCommandModal },
                    { type: 'send_email', callback: sendCustomerOrder },
                    { type: 'recalculate', callback: recalculateCustomerOrder },
                    { type: 'logs', callback: goToLogs },
                    { type: 'confirm_order', callback: confirmCustomerOrder },
                    { type: 'refresh', callback: refresh }
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
                    update: updateRowPositionView,
                    items: "> .order-items"
                },
                roles: {},
                navTableButts:[{type:'remove', disabled:false, callback:removeProduct}]
            };
            sc.data = {
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

            sc.amontPercent = 0;
            sc.dispatchedPercent = 0;
            sc.productForAppend = {};//данные продукта, который необходимо добавить к заказу

            sc.pSelectConfig = {
                startPage: 0,
                dataMethod: serverApi.getSearch
            };

            sc.sliderOptions = {
                value:1,
                min: 0.9,
                max: 3,
                step: 0.01,
                slide: function(event, ui){
                    sc.data.networkConfig.zoom = ui.value;
                }
            };

            sc.summaryPanelOptions = {
                appendTo: 'body',
                scroll: true,
                containment: 'body'
            };
            sc.summaryData = {
                show: false,
                positions: {},
                total: 0
            };

            /**
             * Обновляем информацию по заказу
             */
            sc.saveOrderInfo = function(){
                var order = sc.order,
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
                        sc.order = result.data;
                        funcFactory.showNotification("Успешно", 'Заказ '+order.number+' успешно отредактирован.',true);
                    } else {
                        funcFactory.showNotification("Неудача", 'Не удалось отредактировать заказ '+order.number,true);
                    }
                });
            };

            var processUpdateCustomerDataResponse = function(result) {
                if(!result.data.errors){
                    for (var i = 0; i < result.data.length; i++) {
                        var updated_row = result.data[i];

                        for (var j = 0; j < sc.order.customer_order_contents.length; j++) {
                            var x = sc.order.customer_order_contents[j];

                            if (x.id === updated_row.id) {
                                sc.order.customer_order_contents[j] = angular.extend(x, updated_row);
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

            sc.saveProductChange = function(data) {
                var product = data.item;
                serverApi.updateCustomerOrderProduct(sc.order.id, product.id, {
                    quantity: product.quantity,
                    discount: product.discount
                }, processUpdateCustomerDataResponse);
            };

            // Заменяет товар в строке и вызывается из модального окна. Следовательно, не знаем index-а строки и поэтому ищем через for(){}
            // Именно этим и отличается от sc.savProductChange
            sc.saveProductSubstitute = function(data) {
                serverApi.updateCustomerOrderProduct(sc.order.id, data.id, {product_id: data.product_id},
                    processUpdateCustomerDataResponse);
            };

            /**
             * Открываем модальное окно, чтобы заменить товар в Комплектации на другой
             * Opens modal window with ability to change product of Product item.
             * @param p - product
             */
            sc.changeCustomerOrderProductModal = function(p){
                $uibModal.open({
                    component: 'eqoChangeCustomerOrderProductModal',
                    windowClass: 'eqo-centred-modal',
                    resolve: {product : p.product, config: {}}
                }).result.then(function (selectedProduct) {
                    sc.saveProductSubstitute({
                        id: p.id,
                        quantity: p.quantity,
                        product_id: selectedProduct._id || selectedProduct.id
                    });
                });
            };

            sc.productDetailsModal = function(row) {
                $uibModal.open({
                    component: 'eqoProductDetailsModal',
                    windowClass: 'eqo-centred-modal',
                    resolve: {row: row, order: sc.order, config: {}}
                });
            };

            sc.selectPosition = function($event, item) {
                if($event.shiftKey) {
                    $event.preventDefault();
                    $event.stopImmediatePropagation();
                    item.selected = !item.selected;

                    if(item.selected) {
                        sc.summaryData.positions[item.id] = item;
                    } else {
                        delete sc.summaryData.positions[item.id];
                    }

                    updateSelectedItemsSummary();
                }
            };

            /**
             * выбор продукта для добавления к заказу
             */
            sc.selectProductForAppend = function(item){
                sc.productForAppend = item;
                sc.productForAppend.id = item.id || item._id;
                sc.productForAppend.quantity = 0;

                $timeout(function(){
                    angular.element('#append_product_quantity').focus();
                }, 10);
            };

            /**
             * Добавить продукт в список
             */
            sc.appendProduct = function(event) {
                if(!event || (event.keyCode == 13)) {
                    var t = sc.productForAppend,
                        data = angular.extend(t, {product: {name: t.name, id: t.id}}),
                        selectCtrl = angular.element('#vco_prod_select').data().$uiSelectController,
                        post = {product_id: t.id, quantity: t.quantity, query_original: selectCtrl.search};

                    sc.productForAppend = {};
                    sc.data.selectedProduct = null;

                    serverApi.addCustomerOrderProduct(sc.order.id, post, function(result) {
                        if(result.data.errors) {
                            funcFactory.showNotification('Не удалось добавить продукт', result.data.errors);
                        } else {
                            for (var i = 0; i < result.data.length; i++) {
                                sc.order.customer_order_contents.push(angular.extend(data, result.data[i]));
                            }

                            updateTotal();
                            funcFactory.showNotification('Успешно добавлен продукт', t.name, true);
                            selectCtrl.open = true;
                            selectCtrl.search = '';
                        }
                    });
                }
            };

            /**
             * Удаление продукта
             * @param item - объект с индексом продукта в листе и id
             */
            function removeProduct(item){
                serverApi.removeCustomerOrderProduct(sc.order.id, item.data.id, function(result){
                    if(!result.data.errors){
                        sc.order.customer_order_contents.splice(item.index, 1);
                        funcFactory.showNotification('Продукт удален:', item.data.product.name, true);
                        updateTotal();
                    } else {
                        funcFactory.showNotification('Не удалось удалить продукт', result.data.errors);
                    }
                });
            }

            var updateSelectedItemsSummary = function() {
                var values = sc.summaryData.positions;
                var total = 0;
                var keys = Object.keys(values);

                sc.summaryData.show = keys.length > 0;

                keys.map(function(prop) {
                    total += $filter('price_net')(values[prop], values[prop].quantity);
                });

                sc.summaryData.total = total;
            };

            // Send HTTP request to remove the product from Customer Order.
            sc.removeProduct = function(item, index){
                $.SmartMessageBox({
                    title: "Удалить товар?",
                    content: "Вы действительно хотите номенклатуру " + item.product.name,
                    buttons: '[Нет][Да]'
                }, function (ButtonPressed) {
                    if (ButtonPressed === "Да") {
                        serverApi.removeCustomerOrderProduct(sc.order.id, item.id, function(result){
                            if(!result.data.errors){
                                sc.order.customer_order_contents.splice(index, 1);
                                funcFactory.showNotification('Продукт удален:', item.product.name, true);
                                updateTotal();
                            } else {
                                funcFactory.showNotification('Не удалось удалить продукт', result.data.errors);
                            }
                        });
                    }
                });
            };

            sc.deleteSelectedItems = function(useSelected) {
                sc.order.customer_order_contents.forEach(function(item, i) {
                    if (item.selected === useSelected) {
                        serverApi.removeCustomerOrderProduct(sc.order.id, item.id, function(result) {
                            if(result.data.errors) {
                                funcFactory.showNotification('Не удалось удалить продукт', result.data.errors);
                            } else {
                                if(useSelected) {
                                    delete sc.summaryData.positions[item.id];
                                    updateSelectedItemsSummary();
                                }

                                sc.order.customer_order_contents.splice(i, 1);
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
                    var order = sc.order = result.data;

                    funcFactory.setPageTitle('Заказ ' + sc.order.number);
                    sc.amontPercent = funcFactory.getPercent(order.paid_amount, order.total);
                    sc.dispatchedPercent = funcFactory.getPercent(order.dispatched_amount, order.total);

                    sc.visual.roles = {
                        can_edit: order.can_edit,
                        can_destroy: order.can_destroy,
                        can_confirm: order.can_confirm
                    };

                    calculateTotals(order);
                    updateTotal();
                    completeInitPage(order)
                });
            }

            getNetworkData();
            function getNetworkData(){
                serverApi.getRelatedOrdersOfCustomer($stateParams.id, function(result){
                    sc.data.networkData = result.data;
                });
            }

            function refresh(){
                getOrderDetails();
                //getNetworkData();
            }

            function completeInitPage(){
                _subscription =  notifications.subscribe({
                    channel: 'CustomerOrdersChannel',
                    customer_order_id: $stateParams.id
                }, sc.order.customer_order_contents);
            }

            function calculateTotals(order){
                var x, y, i, il;

                // Считаем суммы по входящим платежам
                x = 0;
                y = 0;
                for (i = 0, il = order.incoming_transfers.length; i < il; i++) {
                    var t = order.incoming_transfers[i];
                    x += t.linked_total;
                    y += t.amount;
                }
                sc.total_paid_linked = x;
                sc.total_paid = y;

                // Считаем суммы по отгрузкам
                x = 0;
                y = 0;
                for (i = 0, il=order.dispatch_orders.length; i < il; i++) {
                    var d = order.dispatch_orders[i];
                    x += d.linked_total;
                    y += d.amount;
                }
                sc.total_dispatched_linked = x;
                sc.total_dispatched = y;
            }

            var updateTotal = function() {
                var total = 0;

                sc.order.customer_order_contents.map(function(item){
                    total += $filter('price_net')(item, item.quantity);
                });

                sc.total = total;
            };

            sc.getDaDataSuggestions = function(val, field_name){
                return serverApi.validateViaDaData('address', {"query": val}).then(function(result){
                   return result.data.suggestions.map(function(item){
                       return {label: $parse(field_name)(item) || val, item: item, field: field_name};
                   });
                });
            };

            sc.fillBySuggestion = function($item){
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

            function returnBack(){
                $state.go('app.customer_orders', {});
            }

            function goToLogs(){
                $state.go('app.customer_orders.view.logs', {});
            }

            function sendCustomerOrder(){
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

            function confirmCustomerOrder(subdata, item) {
                var data = {
                    customer_order:{
                        event: item.event
                    }
                };
                serverApi.updateStatusCustomerOrder($stateParams.id, data, function(result){
                    if(result.status == 200 && !result.data.errors) {
                        funcFactory.showNotification("Успешно", 'Удалось ' + item.name.toLowerCase() + ' заказ', true);
                        sc.order = result.data;
                    } else {
                        funcFactory.showNotification("Не удалось " + item.name.toLowerCase() + ' заказ', result.data.errors);
                    }
                });
            }

            function recalculateCustomerOrder() {
                serverApi.recalculateCustomerOrder($stateParams.id, function(result){
                    if(result.status == 200 && !result.data.errors) {
                        funcFactory.showNotification("Успешно", 'Заказ успешно пересчитан.', true);
                        sc.data.order = result.data;
                    } else {
                        funcFactory.showNotification("Неудача", 'Ошибка при пересчёте заказа.', true);
                    }
                });
            }

            function getPropertyByDocumentType(item){
                if (sc.data.networkData.format !== undefined && sc.data.networkData.format[item.type] !== undefined) {
                    return sc.data.networkData.format[item.type];
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

            function updateRowPositionView(e, ui){
                var $this = $(this),
                    last_ind = angular.element(ui.item).scope().$index,
                    new_ind = ui.item.index(),
                    data = {customer_order: {command: "переместить_строку "+(last_ind+1)+"_на_" + (new_ind+1)}};
                serverApi.updateCommandCustomerOrder(sc.order.id, data, function(result){
                    if(result.status == 200){
                        sc.order.customer_order_contents.swapItemByindex(last_ind, new_ind);
                    }else{
                        funcFactory.showNotification('Не удалось переместить сторку', result.data.errors);
                        $this.sortable( "cancel" );
                    }
                }, function(){
                    $this.sortable( "cancel" );
                });
            }

            sc.$on('$destroy', function(){
               _subscription && _subscription.unsubscribe();
            });

            sc.goToPartner = function() {
                $state.go('app.partners.view', {id: sc.order.partner.id})
            };

            function showCommandModal(){
                var modalInstance = $uibModal.open({
                    component: 'commandCustomerOrderModal',
                    windowClass: 'eqo-centred-modal',
                    resolve: {
                        config: {}
                    }
                });

                modalInstance.result.then(function (command) {
                    var data = {
                        customer_order: {
                            command: command
                        }
                    };

                    serverApi.updateCommandCustomerOrder(sc.order.id, data, function(result){
                        if(result.status == 200){
                            sc.order = result.data;
                            funcFactory.showNotification('Комманда выполнена', "", true);
                        } else {
                            funcFactory.showNotification('Не удалось переместить сторку', result.data.errors);
                        }
                    }, function(){
                    });
                });
            }

        }])
    ;
}());
