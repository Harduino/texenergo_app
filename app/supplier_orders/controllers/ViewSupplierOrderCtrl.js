angular.module('app.supplier_orders').controller('ViewSupplierOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', 'supplierOrdersNotifications', '$filter', '$localStorage', function($scope, $state, $stateParams, serverApi, funcFactory, notifications, $filter, $localStorage){
    var self = this;
    this._subscription = {};
    this.data = {supplierOrder: {}, partnersList: [], productsList: [], total: 0};

    this.visual = {
        navButtsOptions:[
            {
                type: 'back',
                callback: function () {
                    $state.go('app.supplier_orders', {});
                }
            },
            {
                type: 'confirm_order',
                callback: function (subdata, item) {
                    notifyListener('update_status', {event: item.event});
                }
            },
            {
                type: 'send_email',
                callback: function () {
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
            },
            {
                type: 'txt_export',
                callback: function () {
                    window.open(window.APP_ENV.TEXENERGO_COM_API_HTTP_BASE_URL + '/supplier_orders/' +
                        self.data.supplierOrder.id + '.txt?token=' + $localStorage.id_token, '_blank');
                }
            },
            {
                type: 'refresh',
                callback: function () {
                    serverApi.getSupplierOrderDetails($stateParams.id, function(result) {
                        var order = self.data.supplierOrder = result.data;
                        updateTotal();
                        self.amontPercent = funcFactory.getPercent(order.paid_amount, order.total);
                        self.dispatchedPercent = funcFactory.getPercent(order.received_amount, order.total);
                        self.visual.roles = {can_confirm: order.can_confirm};
                    });
                }
            }
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

    this.amontPercent = 0;
    this.dispatchedPercent = 0;
    this.productForAppend = {};

    this.pSelectConfig = {startPage: 0, dataMethod: serverApi.getSearch};
    this.partnerSelectConfig = {dataMethod: serverApi.getPartners};

    serverApi.getSupplierOrderDetails($stateParams.id, function(result){
        var order = self.data.supplierOrder = result.data;
        updateTotal();
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

    $scope.$on('$destroy', function () {
        self._subscription && self._subscription.unsubscribe();
    });

    this.selectProductForAppend = function(item){
        self.productForAppend = item;
        self.productForAppend.id = item.id || item._id;
        self.productForAppend.quantity = 1;
    };

    this.appendProduct = function(event){
        if(!event || (event.keyCode == 13)) {
            var product = self.productForAppend;
            notifyListener('create_content', {product_id: product.id, quantity: product.quantity});
        }
    };

    this.saveSupplierOrderInfo = function(){
        var supplierOrder = self.data.supplierOrder;
        var data = {
                supplier_order:{
                    title: supplierOrder.title,
                    description: supplierOrder.description,
                    partner_id: supplierOrder.partner.id,
                    number: supplierOrder.number
                }
            };

        serverApi.updateSupplierOrder(supplierOrder.id, data, function(result) {
            if((result.status == 200) && !result.data.errors) {
                showNotification('Успешно', 'Заказ ' + supplierOrder.number + ' успешно отредактирован', '#739E73',
                    'fa-check');
            } else {
                showNotification('Ошибка', 'Не смог обновить заказ ' + supplierOrder.number, '#A90329', 'fa-close');
            }
        });
    };

    this.removeProduct = function(item) {
        notifyListener('destroy_content', item);
    };

    this.saveProductChange = function(data) {
        notifyListener('update_content', data.item);
    };

    var notifyListener = function(action, data) {
        self._subscription.send({action: action, data: data});
    };

    var showNotification = function(title, message, color, icon) {
        $.smallBox({
            title: title,
            content: '<i class="fa fa-edit"></i> <i>' + message + '.</i>',
            color: color,
            iconSmall: 'fa ' + icon + ' fa-2x fadeInRight animated',
            timeout: 4000
        });
    };

    var updateTotal = function() {
        var total = 0;

        self.data.supplierOrder.supplier_order_contents.map(function(item) {
            total += $filter('price_net')(item, item.quantity);
        });

        self.data.supplierOrder.total = total;
    };
}]);
