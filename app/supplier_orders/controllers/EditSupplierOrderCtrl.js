/**
 * Created by Mikhail Arzhaev on 30.11.15.
 */
(function(){
    angular.module('app.supplier_orders').controller('EditSupplierOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        var sc = $scope;
        sc.data ={
            supplierOrder:{},
            partnersList: [],
            productsList: [],
            total:0
        };
        sc.productForAppend = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:goToIndex}, {type:'show', callback:goToShow}, {type:'files', callback:showFileModal}, {type:'confirm_order', callback: confirmOrder}],
            navTableButts:[{type:'table_edit', disabled:false, callback: updateProductOfOrder}, {type:'remove', disabled:false, callback:removeProduct}],
            roles: {can_destroy:true, can_edit:true},
            showFileModal: angular.noop,
            titles: 'Редактировать ' + window.gon.index.SupplierOrder.objectTitle.toLowerCase()
        };
        sc.pSelectConfig = {
            startPage: 0,
            dataMethod: serverApi.getSearch
        };
        sc.partnerSelectConfig = {
            dataMethod: serverApi.getPartners
        };

        serverApi.getSupplierOrderDetails($stateParams.id, function(result){
            var order = sc.data.supplierOrder = result.data;
            sc.data.supplierOrder.date = $filter('date')(result.data.date, 'dd.MM.yyyy HH:mm');

            sc.visual.roles.can_confirm = order.can_confirm;

            sc.fileModalOptions={
                url:'/api/supplier_orders/'+ order.id +'/documents',
                files: order.documents,
                r_delete: serverApi.deleteFile,
                view: 'supplier_orders',
                id: order.id
            };
        });

        /**
         * Обновляем информацию по заказу
         */
        sc.saveOrderInfo = function(){
            var supplierOrder = sc.data.supplierOrder
            var data = {
                    supplier_order:{
                        title: supplierOrder.title,
                        description: supplierOrder.description,
                        partner_id: supplierOrder.partner.id,
                        number: supplierOrder.number
                    }
                };
            serverApi.updateSupplierOrder(supplierOrder.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    $.smallBox({
                        title: "Успешно",
                        content: "<i class='fa fa-edit'></i> <i>Заказ "+supplierOrder.number+" успешно отредактирован.</i>",
                        color: "#739E73",
                        iconSmall: "fa fa-check fa-2x fadeInRight animated",
                        timeout: 4000
                    });
                } else {
                    $.smallBox({
                        title: "Ошибка",
                        content: "<i class='fa fa-edit'></i> <i>Не смог обновить заказ "+supplierOrder.number+".</i>",
                        color: "#A90329",
                        iconSmall: "fa fa-close fa-2x fadeInRight animated",
                        timeout: 4000
                    });
                }
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

                serverApi.addSupplierOrderProduct(sc.data.supplierOrder.id, post,function(result){
                    if(!result.data.errors){
                        sc.productForAppend = {};
                        sc.data.selectedProduct = null;
                        sc.data.supplierOrder.supplier_order_contents.push(angular.extend(data, result.data));
                        funcFactory.showNotification('Успешно добавлен продукт', t.name, true);
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

        function updateProductOfOrder(item, d, event){
            var update = function(){
                var data = {
                    quantity: item.data.quantity
                };
                serverApi.updateSupplierOrderProduct(sc.data.supplierOrder.id, item.data.id, data, function(result){
                    if(!result.data.errors) {
                        var r = sc.data.supplierOrder.supplier_order_contents[item.index];
                        sc.data.supplierOrder.supplier_order_contents[item.index] = angular.extend(r, result.data);
                        funcFactory.showNotification('Успешно обновлены данные продукта', item.data.product.name, true);
                    } else {
                        funcFactory.showNotification('Не удалось обновить данные продукта', result.data.errors);
                    }
                });
            };
            if(event){
                if(event.keyCode == 13){
                    update();
                }
            } else {
                update();
            }
        }

        /**
         * Удаление продукта
         * @param item - объект с индексом продукта в листе и id
         */
        function removeProduct(item){
            serverApi.removeSupplierOrderProduct(sc.data.supplierOrder.id, item.data.id, function(result){
                if(!result.data.errors) {
                    sc.data.supplierOrder.supplier_order_contents.splice(item.index, 1);
                    funcFactory.showNotification('Продукт удален:', item.data.product.name, true);
                } else {
                    funcFactory.showNotification('Не удалось удалить продукт', result.data.errors);
                }
            });
        }

        /**
         * следим за изменеиями в коллекции (включая свойства коллекции) при изменении пересчитываем total
         */
        sc.$watch('data.supplierOrder.supplier_order_contents', function(values){
            if(values){
                var total = 0;
                values.map(function(item){
                    total += $filter('price_net')(item, item.quantity);
                });

                sc.data.total = total;
            }
        }, true);

        /**
         * Устанавливаем фокус на input с колличестовм продукта
         */
        sc.focusOnProduct = function(){
            window.setTimeout(function(){
                angular.element('#append_product_quantity')[0].focus();
            },0);//таймер что бы дать время контенту отрендериться
        };

        function confirmOrder(subdata, item) {
            var data = {
                supplier_order:{
                    event: item.event
                }
            };
            serverApi.updateStatusSupplierOrder($stateParams.id, data, function(result){
                if(result.status == 200 && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Удалось ' + item.name.toLowerCase() + ' заказ', true);
                    sc.data.supplierOrder = result.data;
                } else {
                    funcFactory.showNotification("Не удалось " + item.name.toLowerCase() + ' заказ', result.data.errors);
                }
            });
        }

        function goToShow(){
            $state.go('app.supplier_orders.view', $stateParams);
        }
        function goToIndex(){
            $state.go('app.supplier_orders', $stateParams);
        }
        function showFileModal(){
            sc.visual.showFileModal();
        }
    }]);
}());
