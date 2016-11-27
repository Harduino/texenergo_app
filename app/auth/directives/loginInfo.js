class LoginInfoCtrl {
    constructor(authService) {
        this.user = authService;
    }
}

LoginInfoCtrl.$inject = ['authService'];

angular.module('app.layout').component('loginInfo', {
    templateUrl: '/app/auth/directives/login-info.tpl.html',
    controller: LoginInfoCtrl,
    controllerAs: 'loginInfo'
});
