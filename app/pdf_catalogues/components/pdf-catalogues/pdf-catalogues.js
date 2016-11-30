class PdfCataloguesCtrl {
    constructor($state, serverApi, CanCan, funcFactory) {
        let self = this;

        this.visual = {
            navButtsOptions:[{type: 'new', callback: angular.noop}],
            navTableButts:[
                {
                    type: 'view',
                    callback: item => $state.go('app.pdf_catalogues.view', {id: item.data.id || item.data._id})
                },
                {type: 'table_edit'},
                {
                    type: 'remove',
                    callback: item => {
                        let title = item.data.title;

                        $.SmartMessageBox({
                            title: 'Удалить PDF каталог?',
                            content: 'Вы действительно хотите удалить PDF каталог ' + title,
                            buttons: '[Нет][Да]'
                        }, ButtonPressed => {
                            if (ButtonPressed === 'Да') {
                                serverApi.deletePdfCatalogue(item.data.id, res => {
                                    if(!res.data.errors){
                                        funcFactory.showNotification('Успешно', 'Каталог ' + title + ' удален!', true);
                                        self.data.pdfCataloguesList.splice(item.index, 1);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить PDF каталог', res.data.errors);
                                    }
                                });
                            }
                        });
                    }
                }
            ],
            role:{
                can_edit: CanCan.can('edit', 'pdf_catalogues'),
                can_destroy: CanCan.can('destroy', 'pdf_catalogues')
            }
        };

        this.data = {pdfCataloguesList: [], searchQuery: this.query};
    }
}

PdfCataloguesCtrl.$inject = ['$state', 'serverApi', 'CanCan', 'funcFactory'];

angular.module('app.pdf_catalogues').component('pdfCatalogues', {
    controller: PdfCataloguesCtrl,
    controllerAs: 'pdfCataloguesCtrl',
    bindings: {query: '<'},
    templateUrl: '/app/pdf_catalogues/components/pdf-catalogues/pdf-catalogues.html'
});
