/**
 * Created by Egor Lobanov on 15.11.15.
 */

(function(){

    "use strict";

    angular.module('app.customer_orders').controller('LogsCustomerOrderCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.logs = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'files'}, {type:'send_email', callback: sendCustomerOrder}, {type:'recalculate'}, {type:'confirm_order'}, {type: 'show', callback: goToShow}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            }
        };

        serverApi.getCustomerOrderLogs($stateParams.id, function(result){
            var logs = sc.logs = result.data;
        });

        function goToShow(){
            $state.go('app.customer_orders.view', $stateParams);
        }
        
        function returnBack(){
            $state.go('app.customer_orders',{});
        }
        
        function sendCustomerOrder(){
            serverApi.sendCustomerOrderInvoice($stateParams.id, function(result){
                if(result.status == 200 && !result.data.errors) {
                    funcFactory.showNotification("Успешно", 'Заказ успешно отправлен.', true);
                } else if (result.status == 200 && result.data.errors) {
                    funcFactory.showNotification("Неудача", result.data.errors, true);
                } else {
                    funcFactory.showNotification("Неудача", 'Ошибка при попытке отправить заказ.', true);
                }
            });
        }
        
    }]);
}());