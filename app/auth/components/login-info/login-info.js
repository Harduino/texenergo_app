class LoginInfoCtrl {
    constructor(authService, Observer) {
        this.user = authService;
        this.Observer = Observer;
    }

    showProfileShortcut () {
        this.Observer.notify('SHOW_PROFILE_SHORTCUT');
    }
}

LoginInfoCtrl.$inject = ['authService', 'Observer'];

angular.module('app.layout').component('loginInfo', {
    templateUrl: '/app/auth/components/login-info/login-info.html',
    controller: LoginInfoCtrl,
    controllerAs: '$ctrl'
});
