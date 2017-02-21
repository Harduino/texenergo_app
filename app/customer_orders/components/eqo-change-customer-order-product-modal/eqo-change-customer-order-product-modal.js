class EqoChangeCustomerOrderProductModalCtrl {
    constructor(serverApi) {
        this.pSelectConfig = {startPage: 0, dataMethod: serverApi.getSearch};
        this.resolve.config = angular.extend({title: 'Изменить товар', btnOkText: 'Изменить', btnCancelText: 'Отмена'},
            this.resolve.config);
    }

    ok () {
        this.modalInstance.close(this.resolve.product);
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
