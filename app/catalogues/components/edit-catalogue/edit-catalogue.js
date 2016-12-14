class EditCatalogueCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
        let self = this;
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;

        this.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.catalogues', $stateParams)},
                {type: 'show', callback: () => $state.go('app.catalogues.view', $stateParams)}
            ],
            roles: {}
        };

        this.data = {catalogue: {}};
        this.tinymceOptions = funcFactory.getTinymceOptions();

        serverApi.getCatalogueDetails($stateParams.id, result => {
            let catalogue = self.data.catalogue = result.data;
            self.visual.roles = {can_edit: catalogue.can_edit, can_destroy: catalogue.can_destroy}
        });
    }

    saveCatalogue() {
        let self = this;
        let catalogue = this.data.catalogue;
        let data = {catalogue: {name: catalogue.name, description: catalogue.description}};

        self.serverApi.updateCatalogue(catalogue.id, data, result => {
            if(result.status == 200 && !result.data.errors){
                self.funcFactory.showNotification('Успешно', 'Категория ' + catalogue.name +
                    ' успешно отредактирована.', true);
            } else {
                self.funcFactory.showNotification('Неудача', 'Не удалось отредактировать категорию ' + catalogue.name,
                    true);
            }
        });
    }
}

EditCatalogueCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];

angular.module('app.catalogues').component('editCatalogue', {
    controller: EditCatalogueCtrl,
    controllerAs: 'editCatalogueCtrl',
    templateUrl: '/app/catalogues/components/edit-catalogue/edit-catalogue.html'
});
