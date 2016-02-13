/**
 * Created by Egor Lobanov on 23.11.15.
 */
(function(){
    angular.module('app.customer_orders').controller('EditCustomerOrder', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', 'customerOrdersNotifications', function($scope, $state, $stateParams, serverApi, $filter, funcFactory, notifications){
        var sc = $scope;
        sc.data ={
            order:{},
            partnersList: [],//селект выбор партнера
            productsList: [],//селект выбора продукта
            total:0
        };
        sc.productForAppend = {};//данные продукта, который необходимо добавить к заказу
        sc.visual = {
            navButtsOptions:[{type:'back', callback:goToIndex}, {type:'show', callback:goToShow}, {type:'files', callback:showFileModal}, {type: 'send_email', callback: sendCustomerOrder}, {type: 'recalculate', callback: recalculateCustomerOrder}, {type:'logs', callback: goToLogs}, {type:'confirm_order', callback:confirmCustomerOrder}],
            navTableButts:[{type:'table_edit', disabled:false, callback: updateProductOfOrder}, {type:'remove', disabled:false, callback:removeProduct}],
            roles: {},
            showFileModal: angular.noop,
            titles:[window.gon.index.CustomerOrder.indexTitle, 'Редактировать ' + window.gon.index.CustomerOrder.objectTitle.toLowerCase() + ': #'],
            sortOpts: {
                update: updateRowPosition,
                items: "> .order-items"
            }
        };
        //config для селекта продуктов
        sc.pSelectConfig = {
            startPage: 0,
            dataMethod: serverApi.getSearch
        };
        sc.partnerSelectConfig = {
            dataMethod: serverApi.getPartners
        };

        serverApi.getCustomerOrderDetails($stateParams.id, function(result){
            var o = sc.data.order = result.data;
            sc.data.order.date = $filter('date')(o.date, 'dd.MM.yyyy HH:mm');
            sc.visual.roles = {
                can_edit: o.can_edit,
                can_destroy: o.can_edit,
                can_confirm: o.can_confirm
            };

            funcFactory.setPageTitle('Заказ ' + sc.data.order.number);

            sc.fileModalOptions={
                url:'/api/customer_orders/'+ o.id +'/documents',
                files: o.documents,
                r_delete: serverApi.deleteFile,
                view: 'customer_orders',
                id: o.id
            };

            notifications.subscribe({
                channel: 'CustomerOrdersChannel',
                customer_order_id: $stateParams.id
            }, sc.data.order.customer_order_contents);
        });

        /**
         * Обновляем информацию по заказу
         */
        sc.saveOrderInfo = function(){
            var order = sc.data.order,
                data = {
                    customer_order:{
                        title: order.title,
                        description: order.description,
                        partner_id: order.partner.id
                    }
                };
            serverApi.updateCustomerOrder(order.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    funcFactory.showNotification("Успешно", 'Заказ '+order.number+' успешно отредактирован.',true);
                }else funcFactory.showNotification("Неудача", 'Не удалось отредактировать заказ '+order.number,true);
            });
        };

        /**
         * выбор продукта для добавления к заказу
         */
        sc.selectProductForAppend = function(item){
            sc.productForAppend = item;
            sc.productForAppend.id = item.id || item._id;
            sc.productForAppend.quantity = 0;
            if(!item.hasOwnProperty('discount')) sc.productForAppend.discount = 0;
        };

        /**
         * Добавить продукт в список
         */
        sc.appendProduct = function(event){
            var append = function(){
                var t=sc.productForAppend,
                    data = angular.extend(t, {product: {name:t.name, id: t.id}}),
                    post = {
                        product_id: t.id,
                        quantity: t.quantity,
                        discount: t.discount
                    };
                sc.productForAppend = {};
                sc.data.selectedProduct = null;

                serverApi.addCustomerOrderProduct(sc.data.order.id, post,function(result){
                    if(!result.data.errors){
                        sc.data.order.customer_order_contents.push(angular.extend(data, result.data));
                        funcFactory.showNotification('Успешно добавлен продукт', t.name, true);
                        angular.element('#eco_prod_select').data().$uiSelectController.open=true;
                    } else {
                        funcFactory.showNotification('Не удалось добавить продукт', result.data.errors);
                    }
                });
            };
            if(event){
                if(event.keyCode == 13){
                    append();
                }
            } else append();
        };

        /**
         * Обновляет параметры продукта включенного в заказ
         * @param item - данные продукта
         */
        sc.updateProductOfOrder = updateProductOfOrder;

        function updateProductOfOrder(row, item, event){
            var update = function(){
                var item = row.data;
                serverApi.updateCustomerOrderProduct(sc.data.order.id, item.id, {
                    quantity: item.quantity,
                    discount: item.discount
                }, function(result){
                    if(!result.data.errors){
                        var r = sc.data.order.customer_order_contents[row.index];
                        sc.data.order.customer_order_contents[row.index] = angular.extend(r, result.data);
                        funcFactory.showNotification('Успешно обновлены данные продукта', item.product.name, true);
                    }else{
                        funcFactory.showNotification('Не удалось обновить данные продукта', result.data.errors);
                    }
                });
            };
            if(sc.visual.roles.can_edit){
                if(event){
                    if(event.keyCode == 13){
                        update();
                    }
                } else update();
            }
        }

        /**
         * Удаление продукта
         * @param item - объект с индексом продукта в листе и id
         */
        function removeProduct(item){
            serverApi.removeCustomerOrderProduct(sc.data.order.id, item.data.id, function(result){
                if(!result.data.errors){
                    sc.data.order.customer_order_contents.splice(item.index, 1);
                    funcFactory.showNotification('Продукт удален:', item.data.product.name, true);
                } else {
                    funcFactory.showNotification('Не удалось удалить продукт', result.data.errors);
                }
            });
        }

        /**
         * следим за изменеиями в коллекции (включая свойства коллекции) при изменении пересчитываем total
         */
        sc.$watch('data.order.customer_order_contents', function(values){
            if(values){
                var total = 0;

                values.map(function(item){
                    total += $filter('price_net')(item, item.quantity);
                });

                sc.data.total = total;
            }
        }, true);

        /**
         * Устанавливаем фокус на input с количеством продукта
         */
        sc.focusOnProduct = function(){
            window.setTimeout(function(){
                angular.element('#append_product_quantity')[0].focus();
            },0);//таймер что бы дать время контенту отрендериться
        };

        function goToShow(){
            $state.go('app.customer_orders.view', $stateParams);
        }
        
        function goToIndex(){
            $state.go('app.customer_orders', $stateParams);
        }
        
        function goToLogs(){
            $state.go('app.customer_orders.view.logs',{});
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

        function showFileModal(){
            sc.visual.showFileModal();
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
                    sc.data.order = result.data;
                } else {
                    funcFactory.showNotification("Не удалось " + item.name.toLowerCase() + ' заказ', result.data.errors);
                }
            });
        }
        
        function recalculateCustomerOrder() {
            console.log("Started");
            serverApi.recalculateCustomerOrder($stateParams.id, function(result){
                if(result.status == 200 && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Заказ успешно отправлен.', true);
                    sc.data.order = result.data;
                } else {
                    funcFactory.showNotification("Неудача", 'Ошибка при попытке отправить заказ.', true);
                }
            });
        }

        function updateRowPosition(e, ui){
            var $this = $(this),
                last_ind = angular.element(ui.item).scope().$index,
                new_ind = ui.item.index(),
                data = {customer_order: {command: "переместить_строку "+(last_ind+1)+"_на_" + (new_ind+1)}};

            serverApi.updateCommandCustomerOrder(sc.data.order.id, data, function(result){
                if(result.status == 200){
                    sc.data.order.customer_order_contents.swapItemByindex(last_ind, new_ind);
                }else{
                    funcFactory.showNotification('Не удалось переместить сторку', result.data.errors);
                    $this.sortable( "cancel" );
                }
            }, function(){
                $this.sortable( "cancel" );
            });
        }
    }]);
}());
