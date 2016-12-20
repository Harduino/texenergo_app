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
            title: 'PDF Каталог',
            access:{
                action:'read'
            }
        },
        views:{
            "content@app":{
                template: '<view-pdf-catalogue></view-pdf-catalogue>'
            }
        }
    });
});
