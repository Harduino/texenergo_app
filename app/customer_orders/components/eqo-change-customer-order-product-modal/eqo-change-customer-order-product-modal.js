'use strict';

angular.module('app.customer_orders')
    .controller('EqoChangeCustomerOrderProductModalCtrl', ['$uibModalInstance', 'serverApi', 'product', 'config', function($uibModalInstance, serverApi, product, config){
        var self = this;

        this.pSelectConfig = {startPage: 0, dataMethod: serverApi.getSearch};
        this.data = {selectedProduct: product, productsList: []};
        this.config = angular.extend({title: 'Изменить товар', btnOkText: 'Изменить', btnCancelText: 'Отмена'}, config);
    
        this.ok = function () {
            $uibModalInstance.close(self.data.selectedProduct);
        };
    
        this.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }])
;
