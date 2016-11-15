class CataloguesCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
        var vm = this;
        vm.cataloguesList = [];
        vm.searchQuery = $stateParams.q;
        vm.navButtsOptions = [{type: 'new', callback: () => {}}];

        vm.navTableButts = [
            {
                type: 'view',
                callback: data => $state.go('app.catalogues.view', {id: data.id || data._id})
            },
            {
                type: 'table_edit',
                callback: data => $state.go('app.catalogues.view.edit', {id: (data.id || data._id)})
            },
            {
                type: 'remove',
                callback: data => {
                    $.SmartMessageBox({
                        title: 'Удалить категорию?',
                        content: 'Вы действительно хотите удалить категорию ' + data.name,
                        buttons: '[Нет][Да]'
                    }, ButtonPressed => {
                        if(ButtonPressed === 'Да') {
                            serverApi.deleteCatalogue(data.id, result => {
                                if(!result.data.errors) {
                                    vm.cataloguesList.splice(data.index,1);
                                    funcFactory.showNotification('Категория ' + data.name + ' успешно удалена.', '',
                                        true);
                                } else {
                                    funcFactory.showNotification('Не удалось удалить категорию ' + data.name,
                                        result.data.errors);
                                }
                            });
                        }
                    });
                }
            }
        ];
    }
}

CataloguesCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];
angular.module('app.catalogues').controller('CataloguesCtrl', CataloguesCtrl);
