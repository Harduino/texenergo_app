angular.module('app.layout', ['ui.router', 'app.templates', 'login'])
    .config(($stateProvider, $urlRouterProvider) => {
        $stateProvider
            .state('app', {
                abstract: true,
                views: {
                    root: {
                        template: '<layout></layout>'
                    }
                }
            });

        $urlRouterProvider
            .otherwise($injector => {
                let authService = $injector.get('authService'),
                    token = authService.token;

                if(!token || authService.isTokenExpired(token)){
                    return '/sign_in'
                }

                return $injector.get('$sessionStorage').returnToUrl || '/dashboard';
            });
    })
;
