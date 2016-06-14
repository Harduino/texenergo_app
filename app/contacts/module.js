/**
 * Created by Egor Lobanov on 07.11.15.
 * Модуль страницы контакты
 */
(function () {

    "use strict";

    var module = angular.module('app.contacts', ['ui.router']);

    module.config(function ($stateProvider) {
        $stateProvider.state('app.contacts', {
            url: '/contacts?q',
            data:{
                title: 'Контакты',
                access:{
                    action:'index',
                    params:'Contact'
                }
            },
            views:{
                "content@app": {
                    controller: 'ContactsCtrl',
                    templateUrl: '/app/contacts/views/contacts.html'
                }
            }
        }).state('app.contacts.view', {
            url: '/:id',
            data:{
                title: 'Просмотр контакта',
                access:{
                    action:'read',
                    params:'Contact'
                }
            },
            views:{
                "content@app":{
                    controller: 'ViewContactCtrl',
                    templateUrl: '/app/contacts/views/viewContact.html'
                }
            }
        });
    });
}());