/**
 * Created by Mikhail Arzhaev on 07.12.15.
 */
(function(){
    angular.module('app.catalogues').controller('EditCatalogueCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        var sc = $scope;
        sc.data ={
            catalogue:{}
        };
        sc.visual = {
            navButtsOptions:[{type:'back', callback:goToIndex}, {type:'show', callback:goToShow}],
            roles: {}
        };

        sc.tinymceOptions = funcFactory.getTinymceOptions();

        serverApi.getCatalogueDetails($stateParams.id, function(result){
            var catalogue = sc.data.catalogue = result.data;
            sc.visual.roles = {
                can_edit: catalogue.can_edit,
                can_destroy: catalogue.can_destroy
            }
        });

        /**
         * Обновляем информацию по категории
         */
        sc.saveCatalogue = function(){
            var catalogue = sc.data.catalogue;
            var data = {
                    catalogue:{
                        name: catalogue.name,
                        description: catalogue.description
                    }
                };
            serverApi.updateCatalogue(catalogue.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    funcFactory.showNotification("Успешно", 'Категория '+catalogue.name+' успешно отредактирована.',true);
                }else funcFactory.showNotification("Неудача", 'Не удалось отредактировать категорию '+catalogue.name,true);
            });
        };

        function goToShow(){
            $state.go('app.catalogues.view', $stateParams);
        }
        function goToIndex(){
            $state.go('app.catalogues', $stateParams);
        }
    }]);
}());
