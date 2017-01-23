class EqoProductDetailsModalCtrl {
    constructor(funcFactory, serverApi) {
        this.funcFactory = funcFactory;
        this.serverApi = serverApi;
        this.resolve.config = angular.extend({title: 'Подробнее по строке', btnOkText: 'Понятно', btnCancelText: 'Закрыть'},
            this.resolve.config);
    }

    saveProductComment (data) {
        let self = this;

        this.serverApi.updateCustomerOrderProduct(self.resolve.order.id, self.resolve.row.id, {
            customer_order_content: {comment: data.comment}
        }, result => {
            if(result.data.errors) {
                self.funcFactory.showNotification('Не удалось обновить данные продукта', result.data.errors, true);
            } else {
                self.funcFactory.showNotification('Добавил комментарий', 'Добавлен комментарий', true);
            }
        });
    }

    ok () {
        this.modalInstance.close();
    }

    cancel () {
        this.modalInstance.dismiss('cancel');
    }
}

EqoProductDetailsModalCtrl.$inject = ['funcFactory', 'serverApi'];

angular.module('app.customer_orders').component('eqoProductDetailsModal', {
    controller: EqoProductDetailsModalCtrl,
    controllerAs: 'eqoProductDetailsModalCtrl',
    bindings: {modalInstance: "<", resolve: "<"},
    templateUrl: 'app/customer_orders/components/eco-product-details-modal/eco-product-details-modal.html'
});
