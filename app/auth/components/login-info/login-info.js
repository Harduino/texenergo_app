class LoginInfoCtrl {
    constructor(authService) {
        this.user = authService;
    }
}

LoginInfoCtrl.$inject = ['authService'];

angular.module('app.layout').component('loginInfo', {
    templateUrl: '/app/auth/components/login-info/login-info.html',
    controller: LoginInfoCtrl,
    controllerAs: 'loginInfo'
});
