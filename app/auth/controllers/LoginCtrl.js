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
angular.module('login').controller('LoginCtrl', LoginCtrl);
