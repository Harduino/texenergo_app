/**
 * Created by Mikhail Arzhaev on 19.11.15.
 */
(function(){

    "use strict";

    angular.module('app.supplier_orders').controller('ViewSupplierOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', 'supplierOrdersNotifications', '$filter', '$localStorage', function($scope, $state, $stateParams, serverApi, funcFactory, notifications, $filter, $localStorage){
        var sc = $scope;
        
        sc._subscription = {};  
        
        sc.data = {
            supplierOrder:{},
            partnersList: [],
            productsList: [],
            total:0
        };

        sc.visual = {
            navButtsOptions:[
                { type: 'back', callback: returnBack },
                { type: 'confirm_order', callback: updateStatus },
                { type: 'send_email', callback: sendSupplierOrderRFQ },
                { type: 'txt_export', callback: openSupplierOrderTxt },
                { type: 'refresh', callback: refresh }
            ],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            role: {},
            showFileModal: angular.noop,
            titles: 'Заказ поставщику: №'
        };

        sc.amontPercent = 0;

        sc.dispatchedPercent = 0;
        
        sc.productForAppend = {};
        
        sc.pSelectConfig = {
            startPage: 0,
            dataMethod: serverApi.getSearch
        };

        sc.partnerSelectConfig = {
            dataMethod: serverApi.getPartners
        };

        var updateTotal = function() {
            var total = 0;

            sc.data.supplierOrder.supplier_order_contents.map(function(item) {
                total += $filter('price_net')(item, item.quantity);
            });

            sc.data.supplierOrder.total = total;
        };

        serverApi.getSupplierOrderDetails($stateParams.id, function(result){
            var order = sc.data.supplierOrder = result.data;
            updateTotal();
            sc.amontPercent = funcFactory.getPercent(order.paid_amount, order.total);
            sc.dispatchedPercent = funcFactory.getPercent(order.received_amount, order.total);
            sc.visual.roles = {can_edit: order.can_edit, can_confirm: order.can_confirm};

            sc.fileModalOptions={
                url:'/api/supplier_orders/'+ order.id +'/documents',
                files: order.documents,
                r_delete: serverApi.deleteFile,
                view: 'supplier_orders',
                id: order.id
            };

            sc._subscription =  notifications.subscribe({
                channel: 'SupplierOrdersChannel',
                supplier_order_id: $stateParams.id
            }, sc);
        });

        function refresh(){
            serverApi.getSupplierOrderDetails($stateParams.id, function(result) {
                var order = sc.data.supplierOrder = result.data;
                updateTotal();
                sc.amontPercent = funcFactory.getPercent(order.paid_amount, order.total);
                sc.dispatchedPercent = funcFactory.getPercent(order.received_amount, order.total);
                sc.visual.roles = {can_confirm: order.can_confirm};
            });
        }

        function openSupplierOrderTxt() {
            window.open(window.APP_ENV.TEXENERGO_COM_API_HTTP_BASE_URL + '/supplier_orders/' + sc.data.supplierOrder.id +
                '.txt?token=' + $localStorage.id_token, '_blank');
        }

        function sendSupplierOrderRFQ(){
            serverApi.sendSupplierOrderRFQ($stateParams.id, function(result){
                if(result.status == 200 && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Заказ успешно отправлен.', true);
                } else if (result.status == 200 && result.data.errors) {
                    funcFactory.showNotification("Неудача", result.data.errors, true);
                } else {
                    funcFactory.showNotification("Неудача", 'Ошибка при попытке отправить заказ.', true);
                }
            });
        }

        sc.selectProductForAppend = function(item){
            sc.productForAppend = item;
            sc.productForAppend.id = item.id || item._id;
            sc.productForAppend.quantity = 1;
        };

        sc.appendProduct = function(event){
            if(!event || (event.keyCode == 13)) {
                var t = sc.productForAppend;
                sc._subscription.send({action: 'create_content', data: {product_id: t.id, quantity: t.quantity}});
            }
        };

        sc.$on('$destroy', function(){
            sc._subscription.send({message: "Я нах пошёл отсюда"});// мило :)
            sc._subscription && sc._subscription.unsubscribe();
        });

        sc.saveSupplierOrderInfo = function(){
            var supplierOrder = sc.data.supplierOrder;
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
         * Удаление продукта
         * @param item - объект с индексом продукта в листе и id
         */
        sc.removeProduct = function(item) {
            sc._subscription.send({action: "destroy_content", data: item});
        };

        sc.saveProductChange = function(data) {
            sc._subscription.send({action: "update_content", data: data.item});
        };

        function updateStatus(subdata, item) {
            sc._subscription.send({action: "update_status", data: {event: item.event}});
        }

        function returnBack(){
            $state.go('app.supplier_orders', {});
        }
    }]);
}());
