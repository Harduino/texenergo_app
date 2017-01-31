class ProductToCustomerOrderModalCtrl {
    constructor(product, $uibModalInstance, serverApi, funcFactory) {
        let self = this;
        this.data = {product: product, quantity: null, customerOrdersList: []};

        this.$uibModalInstance = $uibModalInstance;
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;

        serverApi.getCustomerOrders(0, null, {}, result => {
            self.data.customerOrdersList = result.data.filter(obj => {
                return obj.can_edit;
            });
        });
    }

    cancel () {
        this.$uibModalInstance.dismiss('cancel');
    }

    addProductToCustomerOrder (customer_order) {
        let self = this;
        let post = {product_id: self.data.product.id, quantity: self.data.quantity || 1};

        this.serverApi.addCustomerOrderProduct(customer_order.id, post, result => {
            if(result.data.errors) {
                self.funcFactory.showNotification('Не удалось добавить продукт', result.data.errors);
            } else {
                for(let i = 0; i < self.data.customerOrdersList.length; i++) {
                    if(self.data.customerOrdersList[i].number === customer_order.number) {
                        self.data.customerOrdersList.splice(i, 1);
                        break;
                    }
                }

                self.funcFactory.showNotification('Успешно добавлен в заказ', customer_order.number, true);
            }
        });
    }
}

ProductToCustomerOrderModalCtrl.$inject = ['product', '$uibModalInstance', 'serverApi', 'funcFactory'];
angular.module('app.layout').controller('productToCustomerOrderModalCtrl', ProductToCustomerOrderModalCtrl);
