'use strict';

angular.module('app.customer_orders')
    .controller('EqoProductDetailsModalCtrl', ['$uibModalInstance', 'config', 'row', 'order', 'serverApi', function($uibModalInstance, config, row, order, serverApi) {
        var self = this;

        this.row = row;
        this.order = order;
        this.config = angular.extend({title: 'Подробнее по строке', btnOkText: 'Понятно', btnCancelText: 'Закрыть'},
            config);

        this.saveProductComment = function(data) {
            serverApi.updateCustomerOrderProduct(self.order.id, self.row.id, {
                customer_order_content: {comment: data.comment}
            }, function(result) {
                if(result.data.errors) {
                    funcFactory.showNotification('Не удалось обновить данные продукта', result.data.errors);
                } else {
                    funcFactory.showNotification('Добавил комментарий', 'Добавлен комментарий');
                }
            });
        };

        this.ok = function () {
            $uibModalInstance.close();
        };

        this.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }])
;
