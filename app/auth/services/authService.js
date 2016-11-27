class AuthService {
    constructor($rootScope, lock, $localStorage, jwtHelper, lockPasswordless, $location) {
        this._token = $localStorage.id_token || null;
        this._profile = undefined;
        this.authDomain = 'texenergo.eu.auth0.com';

        this.$rootScope = $rootScope;
        this.lock = lock;
        this.$localStorage = $localStorage;
        this.jwtHelper = jwtHelper;
        this.lockPasswordless = lockPasswordless;
        this.$location = $location;

        if(this._token && !jwtHelper.isTokenExpired(this._token)) {
            this.getProfile(this._token);
        }
    }

    get	token() {
        return this._token;
    }

    get	profile() {
        return this._profile;
    }

    login() {
        this.lock.show();
    }

    logout() {
        this.$localStorage.id_token = null;
        this.$localStorage.profile = null;
        window.location = window.APP_ENV.PROTOCOL + '://' + this.authDomain + '/v2/logout?returnTo=' +
            window.APP_ENV.APP_BASE_URL + '&client_id=' + this._profile.clientID;
    }

    registerAuthenticationListener() {
        let self = this;

        this.lock.on('authenticated', authResult => {
            console.log('auth result', authResult);
            self._token = self.$localStorage.id_token = authResult.idToken;
            self.getProfile(authResult.idToken);
            self.$rootScope.$emit('authenticated');
        });
    }

    isTokenExpired(token) {
        let expired = this.jwtHelper.isTokenExpired(token);
        expired && (this.$localStorage.id_token = null);
        return expired;
    }

    logInPaswordless() {
        const options = {
            icon: 'assets/img/logo.png',
            dict: {
                code: {
                    codeInputPlaceholder: 'Ваш код',
                    footerText: '',
                    headerText: "Проверьте почту ({email})<br />Вы получили сообщение от нас<br />с вашим кодом."
                },
                confirmation: {
                    success: 'Вы вошли в систему.'
                },
                email: {
                    emailInputPlaceholder: 'yours@example.com',
                    footerText: '',
                    headerText: 'Введите ваш email, что бы войти или зарегистрируйтесь.'
                },
                title: '',
                welcome: "Добро пожаловать {name}!"
            },
            gravatar: false,
            primaryColor: 'rgb(240,125,27)'
        };

        let self = this;

        this.lockPasswordless.emailcode(options, (error, profile, id_token) => {
            if (error) {
                alert('Error: ' + error);
                return 0;
            }

            self._token = self.$localStorage.id_token = id_token;
            self._profile = profile;

            let url = self.$location.$$absUrl,
                sharpIndex = url.indexOf('#');

            if (sharpIndex > -1){
                url = url.slice(0, sharpIndex);
            }

            window.location = url;
            self.lockPasswordless.close();
        });
    }

    getProfile(idToken) {
        let self = this;

        this.lock.getProfile(idToken, (error, profile) => {
            console.log(profile);

            if (error) {
                console.log(error);
            }

            self._profile = profile;
        });
    }
}

AuthService.$inject = ['$rootScope', 'lock', '$localStorage', 'jwtHelper', 'lockPasswordless', '$location'];
angular.module('login').service('authService', AuthService);
