/**
 * Created by Egor Lobanov on 24.03.16.
 */
(function(){
    angular.module('app.layout').controller('productToCustomerOrderModalCtrl', ['product', '$uibModalInstance', 'serverApi', 'funcFactory', function(product, $uibModalInstance, serverApi, funcFactory){
        var self = this;
        this.data = {product: product, quantity: null, customerOrdersList: []};

        serverApi.getCustomerOrders(0, null, {}, function(result) {
            self.data.customerOrdersList = result.data.filter(function(obj) {
                return obj.can_edit;
            });
        });

        this.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        this.addProductToCustomerOrder = function(customer_order){
            var post = {product_id: self.data.product.id, quantity: self.data.quantity || 1};

            serverApi.addCustomerOrderProduct(customer_order.id, post, function(result) {
                if(result.data.errors) {
                    funcFactory.showNotification('Не удалось добавить продукт', result.data.errors);
                } else {
                    for(var i = 0; i < self.data.customerOrdersList.length; i++) {
                        if(self.data.customerOrdersList[i].number === customer_order.number) {
                            self.data.customerOrdersList.splice(i, 1);
                            break;
                        }
                    }

                    funcFactory.showNotification('Успешно добавлен в заказ', customer_order.number, true);
                }
            });
        }
    }]);
}());
