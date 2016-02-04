/**
 * Created by Egor Lobanov on 29.01.16.
 * Module for login page.
 */
(function(){

    'use strict';

    var module = angular.module('login', ['ui.router']);

    module.config(['$stateProvider', function($stateProvider){
        $stateProvider.state('login', {
            url: '/sign_in',
            views: {
                root: {
                    controller: 'loginCtrl',
                    templateUrl: '/assets/admin/app/auth/views/login.html'
                }
            }
        });
    }]);
}());