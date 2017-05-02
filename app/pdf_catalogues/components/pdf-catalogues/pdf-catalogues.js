class PdfCataloguesCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
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
                    callback: (item, button, $event) => {
                        let title = item.data.title;

                        $.SmartMessageBox({
                            title: 'Удалить PDF каталог?',
                            content: 'Вы действительно хотите удалить PDF каталог ' + title,
                            buttons: '[Нет][Да]'
                        }, ButtonPressed => {
                            if (ButtonPressed === 'Да') {
                                button.disableOnLoad(true, $event);

                                serverApi.deletePdfCatalogue(item.data.id, r => {
                                    button.disableOnLoad(false, $event);

                                    if(!r.data.errors){
                                        funcFactory.showNotification('Успешно', 'Каталог ' + title + ' удален!', true);
                                        self.data.pdfCataloguesList.splice(item.index, 1);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить PDF каталог', r.data.errors);
                                    }
                                }, () => {
                                  button.disableOnLoad(false, $event);
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

PdfCataloguesCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];

angular.module('app.pdf_catalogues').component('pdfCatalogues', {
    controller: PdfCataloguesCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/pdf_catalogues/components/pdf-catalogues/pdf-catalogues.html'
});
