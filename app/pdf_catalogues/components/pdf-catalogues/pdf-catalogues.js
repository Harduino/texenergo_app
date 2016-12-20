class PdfCataloguesCtrl {
    constructor($state, $stateParams, serverApi, CanCan, funcFactory) {
        let self = this;

        this.visual = {
            navButtsOptions:[
                {
                    type: 'new', callback: angular.noop
                },
                {
                    type: 'refresh',
                    callback: () => $state.go('app.pdf_catalogues', {}, {reload: true})
                }
            ],
            navTableButts:[
                {
                    type: 'view',
                    callback: item => $state.go('app.pdf_catalogues.view', {id: item.data.id || item.data._id})
                },
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
                                serverApi.deletePdfCatalogue(item.data.id, r => {
                                    if(!r.data.errors){
                                        funcFactory.showNotification('Успешно', 'Каталог ' + title + ' удален!', true);
                                        self.data.pdfCataloguesList.splice(item.index, 1);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить PDF каталог', r.data.errors);
                                    }
                                });
                            }
                        });
                    }
                }
            ]
        };

        this.data = {pdfCataloguesList: [], searchQuery: $stateParams.q};
    }
}

PdfCataloguesCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'CanCan', 'funcFactory'];

angular.module('app.pdf_catalogues').component('pdfCatalogues', {
    controller: PdfCataloguesCtrl,
    controllerAs: 'pdfCataloguesCtrl',
    templateUrl: '/app/pdf_catalogues/components/pdf-catalogues/pdf-catalogues.html'
});
