/**
 * Created by Egor Lobanov on 24.03.16.
 */
(function(){
    angular.module('app.layout').controller('productToCustomerOrderModalCtrl', ['$scope', 'product', '$uibModalInstance', 'serverApi', 'funcFactory', function($scope, product, $uibModalInstance, serverApi, funcFactory){
        var sc = $scope;
        sc.data = {
            product: product,
            quantity: null,
            customerOrdersList: []
        };

        // Закрыть модальное окно
        sc.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        serverApi.getCustomerOrders(0, null, {}, function(result){
            sc.data.customerOrdersList = result.data.filter(function(obj){
                return obj.can_edit;
            });
        });

        sc.addProductToCustomerOrder = function(customer_order){
            var post = {
                product_id: sc.data.product.id,
                quantity: (sc.data.quantity || 1)
            };

            serverApi.addCustomerOrderProduct(customer_order.id, post, function(result){
                if(!result.data.errors){
                    for(var i=0; i<sc.data.customerOrdersList.length; i++){
                        if(sc.data.customerOrdersList[i].number === customer_order.number) {
                            sc.data.customerOrdersList.splice(i, 1);
                            break;
                        }
                    }
                    funcFactory.showNotification('Успешно добавлен в заказ', customer_order.number, true);
                } else {
                    funcFactory.showNotification('Не удалось добавить продукт', result.data.errors);
                }
            });
        }
    }]);
}());