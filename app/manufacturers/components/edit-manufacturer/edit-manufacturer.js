class EditManufacturerCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
        let self = this;
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;

        this.data = {manufacturer: {}};
        this.tinymceOptions = funcFactory.getTinymceOptions();

        this.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.manufacturers', $stateParams)},
                {type: 'show', callback: () => $state.go('app.manufacturers.view', $stateParams)}
            ],
            roles: {}
        };

        serverApi.getManufacturerDetails($stateParams.id, result => {
            let manufacturer = self.data.manufacturer = result.data;

            self.visual.roles = {
                can_edit: manufacturer.can_edit,
                can_destroy: manufacturer.can_destroy
            }
        });
    }

    saveManufacturer() {
        let self = this;
        let manufacturer = this.data.manufacturer;
        let data = {manufacturer: {name: manufacturer.name, description: manufacturer.description}};

        this.serverApi.updateManufacturer(manufacturer.id, data, result => {
            if((result.status == 200) && !result.data.errors) {
                self.funcFactory.showNotification('Успешно', 'Производитель ' + manufacturer.name +
                    ' успешно отредактирован.', true);
            } else {
                self.funcFactory.showNotification('Неудача', 'Не удалось отредактировать производителя ' +
                    manufacturer.name, true);
            }
        });
    }
}

EditManufacturerCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];

angular.module('app.manufacturers').component('editManufacturer', {
    controller: EditManufacturerCtrl,
    controllerAs: 'editManufacturerCtrl',
    templateUrl: '/app/manufacturers/components/edit-manufacturer/edit-manufacturer.html'
});
