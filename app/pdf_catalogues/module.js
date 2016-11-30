angular.module('app.pdf_catalogues', ['ui.router']).config($stateProvider => {
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
                template: '<pdf-catalogues></pdf-catalogues>'
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
