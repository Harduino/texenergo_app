angular.module('app.manufacturers', ['ui.router']).config($stateProvider => {
    $stateProvider.state('app.manufacturers', {
        url: '/manufacturers?q',
        data:{
            title: 'Производители',
            access:{
                action:'index',
                params:'Manufacturers'
            }
        },
        params:{
          q:''
        },
        views:{
            "content@app": {
                template: '<manufacturers query="$resolve.query"></manufacturers>',
                resolve: {query: ['$stateParams', $stateParams => $stateParams.q]}
            }
        }
    }).state('app.manufacturers.view', {
        url: '/:id',
        data:{
            title: 'Просмотр производителя',
            access:{
                action:'read',
                params:'Manufacturers'
            }
        },
        views:{
            "content@app":{
                controller: 'ViewManufacturerCtrl',
                templateUrl: '/app/manufacturers/views/viewManufacturer.html'
            }
        }
    }).state('app.manufacturers.view.edit', {
        url: '/edit',
        data:{
            title:'Редактирование производителя',
            access:{
                action:'edit',
                params:'Manufacturer'
            }
        },
        views:{
            "content@app":{
                controller: 'EditManufacturerCtrl',
                templateUrl: '/app/manufacturers/views/editManufacturer.html'
            }
        }
    });
});
