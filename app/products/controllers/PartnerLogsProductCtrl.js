/**
 * Created by Egor Lobanov on 04.11.15.
 * Контроллер страицы просмотра продукта
 */
(function() {

    'use strict';

    angular.module('app.products').controller('PartnerLogsProductCtrl', ['$scope', '$stateParams', 'serverApi', '$state', 'funcFactory', function($scope, $stateParams, serverApi, $state, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{type:'edit', callback: goToEdit}, {type:'show', callback: goToProduct}],
            navTableButts:[{type:'remove', callback:removePartnerLog}]
        };

        sc.product = {};// данные продукта
        sc.partner_logs = [];

        //получаем информацию о продукте при загрузке контроллера $stateParams.id - id продукта
        serverApi.getProduct($stateParams.id, function(result){
            sc.product = result.data;
        });

        //получаем информацию о продукте при загрузке контроллера $stateParams.id - id продукта
        serverApi.getProductPartnerLogs($stateParams.id, function(result){
            sc.partner_logs = result.data;
        });

        function goToEdit(){
            $state.go('app.product.edit', $stateParams);
        }

        function goToProduct(){
            $state.go('app.product', $stateParams);
        }

        function removePartnerLog(item){
            serverApi.deleteProductPartnerLog(sc.product.id, item.id, function(result){
                if(!result.data.errors){
                    for (var i=0; i < sc.partner_logs.other_logs.length; i++) {
                        if(sc.partner_logs.other_logs[i].id === item.id) {
                            sc.partner_logs.other_logs.splice(i,1);
                            break;
                        }
                    };
                    for (var i=0; i < sc.partner_logs.mfk_logs.length; i++) {
                        if(sc.partner_logs.mfk_logs[i].id === item.id) {
                            sc.partner_logs.mfk_logs.splice(i,1);
                            break;
                        }
                    }
                    funcFactory.showNotification('Лог удален:', item.human_name, true);
                } else {
                    funcFactory.showNotification('Не удалось удалить лог', result.data.errors);
                }
            });
        }
    }]);
}());