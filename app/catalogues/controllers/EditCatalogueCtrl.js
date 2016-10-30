class EditCatalogueCtrl {
    constructor($scope, $state, $stateParams, serverApi, funcFactory) {
        $scope.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.catalogues', $stateParams)},
                {type: 'show', callback: () => $state.go('app.catalogues.view', $stateParams)}
            ],
            roles: {}
        };

        $scope.data = {catalogue: {}};
        $scope.tinymceOptions = funcFactory.getTinymceOptions();

        serverApi.getCatalogueDetails($stateParams.id, result => {
            let catalogue = $scope.data.catalogue = result.data;
            $scope.visual.roles = {can_edit: catalogue.can_edit, can_destroy: catalogue.can_destroy}
        });

        /**
         * Обновляем информацию по категории
         */
        $scope.saveCatalogue = () => {
            let catalogue = $scope.data.catalogue;
            let data = {catalogue: {name: catalogue.name, description: catalogue.description}};

            serverApi.updateCatalogue(catalogue.id, data, result => {
                if(result.status == 200 && !result.data.errors){
                    funcFactory.showNotification('Успешно', 'Категория ' + catalogue.name + ' успешно отредактирована.',
                        true);
                } else {
                    funcFactory.showNotification('Неудача', 'Не удалось отредактировать категорию ' + catalogue.name,
                        true);
                }
            });
        };
    }
}

EditCatalogueCtrl.$inject = ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory'];
angular.module('app.catalogues').controller('EditCatalogueCtrl', EditCatalogueCtrl);
