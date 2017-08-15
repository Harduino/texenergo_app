class ProductToCustomerOrderModalCtrl {
  constructor(serverApi, funcFactory) {
    let self = this;
    this.data = {product: self.resolve.product, quantity: null, customerOrdersList: []};

    this.serverApi = serverApi;
    this.funcFactory = funcFactory;

    serverApi.getCustomerOrders(0, null, {}, result => {
      self.data.customerOrdersList = result.data.filter(obj => {
        return obj.can_edit;
      });
    });
  }

  cancel () {
    this.modalInstance.dismiss('cancel');
  }

  addProductToCustomerOrder (customer_order) {
    let self = this;
    let post = {product_id: self.data.product.id, quantity: self.data.quantity || 1};

    if(self.resolve.withoutUpdate){

      this.modalInstance.close({
        order_id: customer_order.id,
        quantity: post.quantity
      });
    }else{
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
}

ProductToCustomerOrderModalCtrl.$inject = ['serverApi', 'funcFactory'];

angular.module('app.layout').component('productToCustomerOrderModal', {
  controller: ProductToCustomerOrderModalCtrl,
  controllerAs: '$ctrl',
  bindings: {modalInstance: '<', resolve: '<'},
  templateUrl: 'app/layout/components/product-to-customer-orer-modal/product-to-customer-orer-modal.html'
});
