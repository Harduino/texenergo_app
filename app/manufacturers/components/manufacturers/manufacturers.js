class ManufacturersCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
        let self = this;

        this.visual = {
            navButtsOptions:[
                {type: 'new', callback: angular.noop}
            ],
            navTableButts:[
                {
                    type: 'view',
                    callback: item => $state.go('app.manufacturers.view', {id: item.data.id || item.data._id})
                },
                {
                    type: 'table_edit',
                    callback: item => $state.go('app.manufacturers.view.edit', {id: item.data.id || item.data._id})
                },
                {
                    type: 'remove',
                    callback: (item, button, $event) => {
                        let data = item.data;

                        $.SmartMessageBox({
                            title: 'Удалить производителя?',
                            content: 'Вы действительно хотите удалить производителя ' + data.name,
                            buttons: '[Нет][Да]'
                        }, ButtonPressed => {
                            if (ButtonPressed === 'Да') {
                                button.disableOnLoad(true, $event);
                                serverApi.deleteManufacturer(data.id, result => {
                                    button.disableOnLoad(false, $event);
                                    if(!result.data.errors) {
                                        self.data.manufacturersList.splice(item.index,1);
                                        funcFactory.showNotification('Производитель ' + data.name + ' успешно удален.',
                                            '', true);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить производителя ' + data.name,
                                            result.data.errors);
                                    }
                                }, function(){
                                  button.disableOnLoad(false, $event);
                                });
                            }
                        });
                    }
                }
            ]
        };

        this.data = {manufacturersList:[], searchQuery: $stateParams.q};
    }
}

ManufacturersCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];

angular.module('app.manufacturers').component('manufacturers', {
    controller: ManufacturersCtrl,
    controllerAs: 'manufacturersCtrl',
    templateUrl: '/app/manufacturers/components/manufacturers/manufacturers.html'
});
