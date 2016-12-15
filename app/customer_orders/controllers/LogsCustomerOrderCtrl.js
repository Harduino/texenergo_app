/**
 * Created by Egor Lobanov on 15.11.15.
 */

(function(){
    "use strict";

    angular.module('app.customer_orders').controller('LogsCustomerOrderCtrl', ['$state', '$stateParams', 'serverApi', 'funcFactory', function($state, $stateParams, serverApi, funcFactory) {
        var self = this;
        this.logs = {};

        this.visual = {
            navButtsOptions:[
                {
                    type: 'back',
                    callback: function() {
                        $state.go('app.customer_orders',{});
                    }
                },
                {type: 'files'},
                {
                    type: 'send_email',
                    callback: function() {
                        serverApi.sendCustomerOrderInvoice($stateParams.id, function(result) {
                            if(result.status == 200) {
                                if(result.data.errors) {
                                    funcFactory.showNotification("Неудача", result.data.errors, true);
                                } else {
                                    funcFactory.showNotification("Успешно", 'Заказ успешно отправлен.', true);
                                }
                            } else {
                                funcFactory.showNotification("Неудача", 'Ошибка при попытке отправить заказ.', true);
                            }
                        });
                    }
                },
                {type: 'recalculate'},
                {type: 'confirm_order'},
                {
                    type: 'show',
                    callback: function() {
                        $state.go('app.customer_orders.view', $stateParams);
                    }
                }
            ],
            chartOptions: {
                barColor: 'rgb(103,135,155)',
                scaleColor: false,
                lineWidth: 5,
                lineCap: 'circle',
                size: 50
            }
        };

        serverApi.getCustomerOrderLogs($stateParams.id, function(result){
            self.logs = result.data;
        });
    }]);
}());
