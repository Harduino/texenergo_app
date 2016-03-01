(function () {

    'use strict';

    angular.module('app.dashboard').controller('DashboardCtrl', ['$scope', 'serverApi', function ($scope, serverApi) {
        var sc = $scope;
        sc.data = {
            customerOrders:[],
            dispatchOrders:[],
            parseLogSearchQ: "",
            searchLogSearchQ: ""
        };

        sc.searchLogScrlCnfg = {
            dataMethod: serverApi.getSearchLogs,
            resultCollection: [],
            setQueryValue: angular.noop // here the directive will return setQueryFunction
        };

        sc.parseLogScrlCnfg = {
            dataMethod: serverApi.getParseLogs,
            resultCollection: [],
            setQueryValue: angular.noop // here the directive will return setQueryFunction
        };

        
        serverApi.getCustomerOrders(1, "", {}, function(result){
            sc.data.customerOrders = result.data.slice(0,10);
        });

        serverApi.getDispatchOrders(1, "", {}, function(result){
            sc.data.dispatchOrders = result.data.slice(0,10);
        });

        sc.filterLogTable = function(e, type){
            if(e.keyCode == 13 || e.type == "click"){
                sc[type + "LogScrlCnfg"].setQueryValue(sc.data[type + "LogSearchQ"]);
            }
        };

    }]);

}());
