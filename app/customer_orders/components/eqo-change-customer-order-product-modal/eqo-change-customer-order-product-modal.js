class EqoChangeCustomerOrderProductModalCtrl {
    constructor(serverApi) {
        let self = this;
        this.pSelectConfig = {startPage: 0, dataMethod: serverApi.getSearch};
        this.data = {selectedProduct: self.resolve.product, productsList: []};
        this.resolve.config = angular.extend({title: 'Изменить товар', btnOkText: 'Изменить', btnCancelText: 'Отмена'},
            self.resolve.config);
    }

    ok () {
        this.modalInstance.close(this.data.selectedProduct);
    }

    cancel () {
        this.modalInstance.dismiss('cancel');
    }
}

EqoChangeCustomerOrderProductModalCtrl.$inject = ['serverApi'];

angular.module('app.customer_orders').component('eqoChangeCustomerOrderProductModal', {
    controller: EqoChangeCustomerOrderProductModalCtrl,
    controllerAs: '$ctrl',
    bindings: {modalInstance: '<', resolve: '<'},
    templateUrl: 'app/customer_orders/components/eqo-change-customer-order-product-modal/eqo-change-customer-order-product-modal.html'
});
