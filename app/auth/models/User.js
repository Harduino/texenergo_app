(function () {

    'use strict';

    angular.module('app.layout').factory('User', function ($http, $q) {
        var dfd = $q.defer();

        var UserModel = {
            dfd: dfd,
            initialized: dfd.promise,
            username: 'Пользователь',
            picture: '/assets/smart_admin/avatars/male.png'
        };

        return UserModel;
    });
}());
