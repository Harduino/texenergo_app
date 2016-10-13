(function(){
    "use strict";

    angular.module('app.layout').directive('loginInfo', function(authService){

        return {
            restrict: 'A',
            templateUrl: '/app/auth/directives/login-info.tpl.html',
            link: function(scope){
                scope.user = authService;

//                scope.$on('userProfileSet', function(event, profile){
//
//                })
            }
        }
    });
}());
