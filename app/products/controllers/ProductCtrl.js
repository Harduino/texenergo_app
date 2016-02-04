/**
 * Created by Egor Lobanov on 04.11.15.
 * Контроллер страицы просмотра продукта
 */
(function() {

    'use strict';

    angular.module('app.products').controller('ProductCtrl', ['$scope', '$stateParams', 'serverApi', '$state', 'funcFactory', function($scope, $stateParams, serverApi, $state, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{type:'edit', callback: goToEdit}, {type:'logs', callback: goToPartnerLogs}, {type: 'at_partners', callback: goToSupplierInfos}],
            roles: {}
        };

        sc.product = {};// данные продукта
        sc.data = {
            quantity:0
        };

        //получаем информацию о продукте при загрузке контроллера $stateParams.id - id продукта
        serverApi.getProduct($stateParams.id, function(result){
            sc.product = result.data;
            console.log(result.data);
        });

        sc.getLeadTime = function(id, quantity){
            if(event.keyCode == 13){
                serverApi.getLeadTime(id, quantity, function(result){
                    var info = result.data.lead_time_info;
                    funcFactory.showNotification("Успешно", 'Тариф: ' + info.price_tarif + " руб., Скидка: " + info.discount + "%, Закупка: " + info.cost + " руб., Срок поставки: " + info.delivery_date + ", Мин. кол-во: " + info.quantity_min, true);
                });
            }
        };

        function goToEdit(){
            $state.go('app.product.edit', $stateParams);
        }

        function goToPartnerLogs(){
            $state.go('app.product.partner_logs', $stateParams);
        }

        function goToSupplierInfos(){
            $state.go('app.product.supplier_infos', $stateParams);
        }
    }]);
}());