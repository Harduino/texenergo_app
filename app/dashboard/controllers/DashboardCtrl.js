(function () {

    'use strict';

    angular.module('app.dashboard').controller('DashboardCtrl', ['$scope', 'serverApi', function ($scope, serverApi) {
        $scope.data = {
            customerOrders:[],
            dispatchOrders:[]
        };
        
        serverApi.getCustomerOrders(1, "", {}, function(result){
            console.log('customer_orders', result);
            $scope.data.customerOrders = result.data.slice(0,10);
        });

        serverApi.getDispatchOrders(1, "", {}, function(result){
            $scope.data.dispatchOrders = result.data.slice(0,10);
        });
        
    }]);

}());
