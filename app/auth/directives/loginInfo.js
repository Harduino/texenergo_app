(function(){
    "use strict";

    angular.module('app.layout').directive('loginInfo', function(User){

        return {
            restrict: 'A',
            templateUrl: '/assets/admin/app/auth/directives/login-info.tpl.html',
            link: function(scope){
                User.initialized.then(function(){
                    scope.user = User;
                });
            }
        }
    });
}());
