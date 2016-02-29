(function () {

    'use strict';

    angular.module('app.dashboard').controller('DashboardCtrl', ['$scope', 'serverApi', function ($scope, serverApi) {
        var sc = $scope;
        sc.data = {
            customerOrders:[],
            dispatchOrders:[],
            parseLog: [],
            searchLog: [],
            parseLogSearchQ: "",
            searchLogSearchQ: ""
        };


        
        serverApi.getCustomerOrders(1, "", {}, function(result){
            sc.data.customerOrders = result.data.slice(0,10);
        });

        serverApi.getDispatchOrders(1, "", {}, function(result){
            sc.data.dispatchOrders = result.data.slice(0,10);
        });

//        serverApi.getSearchLogs(1, "", {}, function(result){
//           console.log(result.data.length);
//        });

        sc.filterLogTable = function(e, type){
            if(e.keyCode == 13){
                // filter table depending on type
            }
        };

        sc.refreshTable = function(type){
            //cal refresh functions
        }

    }]);

}());
