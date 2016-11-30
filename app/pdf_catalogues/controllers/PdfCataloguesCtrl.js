/**
 * Created by Mikhail Arzhaev on 20.11.15.
 */
(function(){
    'use strict';

    angular.module('app.pdf_catalogues').controller('PdfCataloguesCtrl', ['$state', '$stateParams', 'serverApi', 'CanCan', 'funcFactory', function($state, $stateParams, serverApi, CanCan, funcFactory){
        var self = this;

        this.visual = {
            navButtsOptions:[{type: 'new', callback: angular.noop}],
            navTableButts:[
                {
                    type: 'view',
                    callback: function(item) {
                        $state.go('app.pdf_catalogues.view', {id: item.data.id || item.data._id});
                    }
                },
                {type: 'table_edit'},
                {
                    type: 'remove',
                    callback: function(item) {
                        var title = item.data.title;
                        $.SmartMessageBox({
                            title: "Удалить PDF каталог?",
                            content: "Вы действительно хотите удалить PDF каталог " + title,
                            buttons: '[Нет][Да]'
                        }, function (ButtonPressed) {
                            if (ButtonPressed === "Да") {
                                serverApi.deletePdfCatalogue(item.data.id, function(res) {
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

        this.data = {pdfCataloguesList: [], searchQuery: $stateParams.q};
    }]);
}());