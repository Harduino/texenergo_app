/**
 * Created by Mikhail Arzhaev on 09.12.15.
 */
(function(){
    angular.module('app.partners').controller('EditPartnerCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        var sc = $scope;
        sc.data ={
            partner:{}
        };
        sc.visual = {
            navButtsOptions:[{type:'back', callback:goToIndex}, {type:'show', callback:goToShow}],
            roles: {},
            titles: 'Редактирование:  ' +window.gon.index.Partner.objectTitle.toLowerCase()
        };
        
        serverApi.getPartnerDetails($stateParams.id, function(result){
            console.log(result.data);
            sc.data.partner = result.data;
        });

        /**
         * Обновляем информацию по категории
         */
        sc.savePartner = function(){
            var partner = sc.data.partner;
            var data = {
                    partner:{
                        name: partner.name,
                        legal_name: partner.legal_name,
                        delivery_address: partner.delivery_address,
                        legal_address: partner.legal_address,
                        phone: partner.phone
                    }
                };
            serverApi.updatePartner(partner.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    funcFactory.showNotification("Успешно", 'Категория '+partner.name+' успешно отредактирована.',true);
                }else funcFactory.showNotification("Неудача", 'Не удалось отредактировать категорию '+partner.name,true);
            });
        };

        function goToShow(){
            $state.go('app.partners.view', $stateParams);
        }
        function goToIndex(){
            $state.go('app.partners', $stateParams);
        }
    }]);
}());
