angular.module('app.dashboard', ['ui.router']).config($stateProvider => {
    $stateProvider
        .state('app.dashboard', {
            url: '/dashboard',
            views: {
                "content@app": {
                    template: '<dashboard></dashboard>'
                }
            },
            data:{
                title: 'Рабочий стол'
            }
        });
});
