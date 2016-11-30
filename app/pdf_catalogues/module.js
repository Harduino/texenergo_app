/**
 * Created by Mikhail Arzhaev on 20.11.15.
 * Модуль страницы категорий товаров для каталога
 */

(function () {

    "use strict";
    var module = angular.module('app.pdf_catalogues', ['ui.router']);

    module.config(function ($stateProvider) {
        $stateProvider.state('app.pdf_catalogues', {
            url: '/pdf_catalogues?q',
            data:{
                title: 'PDF Каталоги',
                access:{
                    action:'index',
                    params:'pdf_catalogues'
                }
            },
            params:{
              q:''
            },
            views:{
                "content@app": {
                    controller: 'PdfCataloguesCtrl',
                    controllerAs: 'pdfCataloguesCtrl',
                    templateUrl: '/app/pdf_catalogues/views/pdf_catalogues.html'
                }
            }
        }).state('app.pdf_catalogues.view', {
            url: '/:id',
            data:{
                title: 'Просмотр производителя',
                access:{
                    action:'read',
                    params:'pdf_catalogues'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewPdfCatalogueCtrl',
                    templateUrl: '/app/pdf_catalogues/views/viewPdfCatalogue.html'
                }
            }
        });
    });
}());