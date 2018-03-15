class AuthService {
    constructor($rootScope, lock, $localStorage, jwtHelper, lockPasswordless,
      $location, $q) {
        this._token = $localStorage.id_token || null;
        this._accessToken = $localStorage.accessToken || null;
        this._profile = undefined;
        this.authDomain = 'texenergo.eu.auth0.com';
        this.clientID = 'cO4FFzRFn4JkByDDy2kCWAFKNdC37BcW',
        this.tokenDefer = $q.defer();
        this._profilePromise;

        this.$rootScope = $rootScope;
        this.lock = lock;
        this.$localStorage = $localStorage;
        this.jwtHelper = jwtHelper;
        this.lockPasswordless = lockPasswordless;
        this.$location = $location;

        let self = this;

        if(this._token && !jwtHelper.isTokenExpired(this._token)) {
          self.tokenDefer.resolve(self._token);
          this._profilePromise = this.getProfile(this._accessToken);
        }
    }

    //TODO: DEPRECATED Remove all usages
    get	token() {
        return this._token;
    }

    get tokenPromise(){
        return this.tokenDefer.promise;
    }

    get	profile() {
        return this._profile;
    }

    get profilePromise() {
      return this._profilePromise;
    }

    get userMetadata() {
      if (this._profile === undefined) {
        return {};
      } else {
        return this._profile.user_metadata;
      }
    }

    login() {
        this.lock.show();
    }

    logout() {
        this.$localStorage.id_token = null;
        this.$localStorage.accessToken = null;
        this.$localStorage.profile = null;
        window.location = window.APP_ENV.PROTOCOL + '://' + this.authDomain + '/v2/logout?returnTo=' +
            window.APP_ENV.APP_BASE_URL + '&client_id=' + this.clientID;
    }

    registerAuthenticationListener() {
        let self = this;
        this.lock.on('authenticated', authResult => {
            console.log('auth result', authResult);
            self._token = self.$localStorage.id_token = authResult.idToken;
            self._accessToken = self.$localStorage.accessToken = authResult.accessToken;
            self.tokenDefer.resolve(self._token); // resolve promises
            self._profilePromise = self.getProfile(authResult.accessToken);
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
            self.tokenDefer.resolve(self._token); // resolve promises
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

    updateProfile(profile) {
      this.$localStorage.profile = profile;
      this._profile = profile;
    }

    getProfile(idToken) {
      let self = this;

      return new Promise((resolve,reject) => {
        this.lock.getUserInfo(idToken, (error, profile) => {
          if (error) {
			  console.log(error);
			  self.$localStorage.authRedirect = self.$location.path();
			  self.logout();
		  } else {
	          self.updateProfile(profile);
	          resolve();
		  }
        });
      });
    }

    /**
    * @description Update user metadata
    * @param {Object} metaData object with user metadata
    */
    updateUserMetadata(metaData) {
      const path = `https://${this.authDomain}/api/v2/users/${this._profile.user_id}`;
      let self = this,
          newMetaData = {"user_metadata": metaData};

      let settings = {
        "async": true,
        "crossDomain": true,
        "url": path,
        "method": "PATCH",
        "headers": {
          "authorization": `Bearer ${this._token}`,
          "content-type": "application/json"
        },
        "processData": false,
        "data": JSON.stringify(newMetaData)
      };

      angular.merge(this._profile, newMetaData);

      $.ajax(settings).done(function (response) {
        self.updateProfile(response);
      });
    }
}

AuthService.$inject = ['$rootScope', 'lock', '$localStorage', 'jwtHelper', 'lockPasswordless', '$location', '$q'];
angular.module('login').service('authService', AuthService);
