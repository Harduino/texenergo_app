(function () {
    'use strict';

    angular.module('app.dashboard').controller('DashboardCtrl', ['serverApi', function (serverApi) {
        var self = this;

        this.data = {customerOrders:[], dispatchOrders:[], parseLogSearchQ: "", searchLogSearchQ: ""};
        this.searchLogScrlCnfg = {dataMethod: serverApi.getSearchLogs, resultCollection: [], setQueryValue: angular.noop};
        this.parseLogScrlCnfg = {dataMethod: serverApi.getParseLogs, resultCollection: [], setQueryValue: angular.noop};


        serverApi.getCustomerOrders(1, "", {}, function(result){
            self.data.customerOrders = result.data.slice(0,10);
        });

        serverApi.getDispatchOrders(1, "", {}, function(result){
            self.data.dispatchOrders = result.data.slice(0,10);
        });

        this.filterLogTable = function(e, type) {
            if(e.keyCode == 13 || e.type == "click"){
                this[type + "LogScrlCnfg"].setQueryValue(self.data[type + "LogSearchQ"]);
            }
        };
    }]);
}());
