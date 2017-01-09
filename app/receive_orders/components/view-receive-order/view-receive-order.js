class ViewReceiveOrderCtrl {
    constructor($state, $stateParams, serverApi, funcFactory){
        let self = this;

        this.receiveOrder = {};
        this.visual = {
            navButtsOptions:[
                {
                    type: 'back',
                    callback: () => $state.go('app.receive_orders', {})
                },
                {
                    type: 'logs',
                    callback: goToLogs
                },
                {
                    type: 'refresh',
                    callback: function() {
                        serverApi.getReceiveOrderDetails($stateParams.id, r => self.receiveOrder = r.data);
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
            showFileModal: angular.noop,
            titles: 'Поступление: №'
        };

        this.amontPercent = 0;
        this.receivedPercent = 0;

        this.productSelectConf = {
            dataMethod: function(page, query, config, success){
                if(page>1) success({data:[]});
                else serverApi.getUnreceivedProducts($stateParams.id, query, config, success);
            }
        };

        this.ordersList = [];
        this.data = {};

        this.onSelectProduct = function(item){
            item.total_max = item.total;
            item.quantity_max = item.quantity;
        };

        this.appendOrder = function(event){
            var append = function(){
                var data = this.data.productForAppend;
                var  post = {
                        product_id: data.product.id,
                        quantity: data.quantity,
                        country: data.country || '',
                        gtd: data.gtd || '',
                        total_w_vat: data.total,
                        supplier_order_id: data.supplier_order.id
                    };
                serverApi.createReceiveOrderContents(this.receiveOrder.id, post, function(result){
                    if(!result.data.errors){
                        funcFactory.showNotification('Успешно', 'Продукт ' + data.product.name + ' успешно добвален', true);
                        this.receiveOrder.product_order_contents.push(angular.extend(data, result.data));
                        clearProductForAppend();
                        angular.element('#vro_prod_select').data().$uiSelectController.open=true;
                    }else funcFactory.showNotification('Не удалось добавить продукт ' + data.product.name, result.data.errors);
                });
            };
            var p = this.data.productForAppend.product;
            if(p && p.id) if(event){
                event.keyCode == 13 && append();
            }else append();
        };

        this.updateContentsProduct = function(row){
            var data = row.data;
            var put = {
                quantity: data.quantity || 0,
                country: data.country || '',
                gtd: data.gtd || '',
                total_w_vat: data.total || 0
            };
            serverApi.updateReceiveOrderContents(this.receiveOrder.id, data.id, put, function(result){
                if(!result.data.errors){
                    var r = this.receiveOrder.product_order_contents;
                    r[row.index] = angular.extend(r[row.index], result.data);
                    funcFactory.showNotification('Успешно', 'Продукт ' + data.product.name + ' успешно обновлен', true);
                }else funcFactory.showNotification('Не удалось обновить продукт ' + data.product.name, result.data.errors);
            })
        };

        this.goToPartner = function() {
            $state.go('app.partners.view', {id: (this.receiveOrder.partner.id || this.receiveOrder.partner._id)})
        }

        function deleteContentsProduct(item){
            var data = item.data;
            serverApi.deleteReceiveOrderContents(this.receiveOrder.id, data.id, function(result){
                if(!result.data.errors){
                    funcFactory.showNotification('Успешно', 'Продукт ' + data.product.name + ' успешно удален', true);
                    this.receiveOrder.product_order_contents.splice(item.index, 1);
                }else funcFactory.showNotification('Не удалось удалить продукт ' + data.product.name, result.data.errors);
            });
        }

        getReceiveOrderDetails();
        function getReceiveOrderDetails(){
            serverApi.getReceiveOrderDetails($stateParams.id, function(result){
                self.receiveOrder = result.data;
                self.amontPercent = funcFactory.getPercent(self.receiveOrder.paid_amount, self.receiveOrder.total);
                self.receivedPercent = funcFactory.getPercent(self.receiveOrder.receivedPercent, self.receiveOrder.total);
            });
        }

        function clearProductForAppend (){
            self.data.productForAppend={country:'',gtd:'', quantity:0, total:0}
        }
        clearProductForAppend();

        function goToLogs(){
            $state.go('app.receive_orders.view.logs', {});
        }
    }
}

ViewReceiveOrderCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];

angular.module('app.receive_orders').component('viewReceiveOrder', {
    controller: ViewReceiveOrderCtrl,
    controllerAs: 'viewReceiveOrderCtrl',
    templateUrl: 'app/receive_orders/components/view-receive-order/view-receive-order.html'
});