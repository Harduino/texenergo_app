class LoginCtrl {
    constructor(authService, $state) {
        this.authService = authService;
        authService.login();
        if (authService.token !== null && !authService.isTokenExpired(authService.token)) {
          $state.go('app.dashboard');
        }
    }

    goToPaswordless() {
        this.authService.logInPaswordless();
    }
}

LoginCtrl.$inject = ['authService', '$state'];

angular.module('login').component('login', {
    controller: LoginCtrl,
    controllerAs: 'loginCtrl',
    templateUrl: '/app/auth/components/login/login.html'
});
