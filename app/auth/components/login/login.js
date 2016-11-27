class LoginCtrl {
    constructor(authService) {
        this.authService = authService;
        authService.login();
    }

    goToPaswordless() {
        this.authService.logInPaswordless();
    }
}

LoginCtrl.$inject = ['authService'];

angular.module('login').component('login', {
    controller: LoginCtrl,
    controllerAs: 'loginCtrl',
    templateUrl: '/app/auth/components/login/login.html'
});
