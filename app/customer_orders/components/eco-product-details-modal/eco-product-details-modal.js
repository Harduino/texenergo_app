class EqoProductDetailsModalCtrl {
    constructor($uibModalInstance, config, row, order, serverApi) {
        this.$uibModalInstance = $uibModalInstance;
        this.serverApi = serverApi;

        this.row = row;
        this.order = order;
        this.config = angular.extend({title: 'Подробнее по строке', btnOkText: 'Понятно', btnCancelText: 'Закрыть'},
            config);
    }

    saveProductComment (data) {
        let self = this;

        this.serverApi.updateCustomerOrderProduct(self.order.id, self.row.id, {
            customer_order_content: {comment: data.comment}
        }, result => {
            if(result.data.errors) {
                self.funcFactory.showNotification('Не удалось обновить данные продукта', result.data.errors);
            } else {
                self.funcFactory.showNotification('Добавил комментарий', 'Добавлен комментарий');
            }
        });
    }

    ok () {
        this.$uibModalInstance.close();
    }

    cancel () {
        this.$uibModalInstance.dismiss('cancel');
    }
}

EqoProductDetailsModalCtrl.$inject = ['$uibModalInstance', 'config', 'row', 'order', 'serverApi'];
angular.module('app.customer_orders').controller('EqoProductDetailsModalCtrl', EqoProductDetailsModalCtrl);
