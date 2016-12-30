'use strict';

angular.module('app.customer_orders')
    .controller('EqoProductDetailsModalCtrl', ['$scope', '$uibModalInstance', 'config', 'row', 'order', 'serverApi', function($scope, $uibModalInstance, config, row, order, serverApi){
        var sc = $scope;

        sc.row = row;
        sc.order = order;

        sc.config = angular.extend({
            title: 'Подробнее по строке',
            btnOkText: 'Понятно',
            btnCancelText: 'Закрыть'
        }, config);

        sc.saveProductComment = function(data) {
            serverApi.updateCustomerOrderProduct(sc.order.id, row.id, {
                customer_order_content: {
                    comment: data.comment
                }
            }, function(result){
                if(result.data.errors){
                    funcFactory.showNotification('Не удалось обновить данные продукта', result.data.errors);
                } else {
                    funcFactory.showNotification('Добавил комментарий', 'Добавлен комментарий');
                }
            });
        };

        sc.ok = function () {
            $uibModalInstance.close();
        };

        sc.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }])
;