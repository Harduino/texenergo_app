class EqoChangeCustomerOrderProductModalCtrl {
    constructor($uibModalInstance, serverApi, product, config) {
        this.modalInstance = $uibModalInstance;
        this.pSelectConfig = {startPage: 0, dataMethod: serverApi.getSearch};
        this.data = {selectedProduct: product, productsList: []};
        this.config = angular.extend({title: 'Изменить товар', btnOkText: 'Изменить', btnCancelText: 'Отмена'}, config);
    }

    ok () {
        this.modalInstance.close(this.data.selectedProduct);
    }

    cancel () {
        this.modalInstance.dismiss('cancel');
    }
}

EqoChangeCustomerOrderProductModalCtrl.$inject = ['$uibModalInstance', 'serverApi', 'product', 'config'];

angular.module('app.customer_orders')
    .controller('EqoChangeCustomerOrderProductModalCtrl', EqoChangeCustomerOrderProductModalCtrl);
