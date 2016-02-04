/**
 * Created by Mikhail Arzhaev on 07.12.15.
 */
(function(){
    angular.module('app.manufacturers').controller('EditManufacturerCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        var sc = $scope;
        sc.data ={
            manufacturer:{}
        };
        sc.visual = {
            navButtsOptions:[{type:'back', callback:goToIndex}, {type:'show', callback:goToShow}],
            roles: {}
        };

        sc.tinymceOptions = funcFactory.getTinymceOptions();

        serverApi.getManufacturerDetails($stateParams.id, function(result){
            var manufacturer = sc.data.manufacturer = result.data;
            sc.visual.roles = {
                can_edit: manufacturer.can_edit,
                can_destroy: manufacturer.can_destroy
            }
        });

        /**
         * Обновляем информацию по категории
         */
        sc.saveManufacturer = function(){
            var manufacturer = sc.data.manufacturer;
            var data = {
                    manufacturer:{
                        name: manufacturer.name,
                        description: manufacturer.description
                    }
                };
            serverApi.updateManufacturer(manufacturer.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    funcFactory.showNotification("Успешно", 'Производитель '+manufacturer.name+' успешно отредактирован.',true);
                }else funcFactory.showNotification("Неудача", 'Не удалось отредактировать производителя '+manufacturer.name,true);
            });
        };

        function goToShow(){
            $state.go('app.manufacturers.view', $stateParams);
        }
        function goToIndex(){
            $state.go('app.manufacturers', $stateParams);
        }
    }]);
}());
