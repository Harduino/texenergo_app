'use strict';

angular.module('app.customer_orders')
    .controller('EqoChangeCustomerOrderProductModalCtrl', ['$scope', '$uibModalInstance', 'serverApi', 'product', 'config', function($scope, $uibModalInstance, serverApi, product, config){
        var sc = $scope;

        sc.pSelectConfig = {startPage: 0, dataMethod: serverApi.getSearch};
        sc.data = {selectedProduct: product, productsList: []};
        sc.config = angular.extend({title: 'Изменить товар', btnOkText: 'Изменить', btnCancelText: 'Отмена'}, config);
    
        sc.ok = function () {
            $uibModalInstance.close(sc.data.selectedProduct);
        };
    
        sc.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }])
;
