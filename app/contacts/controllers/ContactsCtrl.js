/**
 * Created by Egor Lobanov on 07.11.15.
 */
(function(){

    'use strict';
    angular.module('app.contacts').controller('ContactsCtrl', ['$state', '$stateParams', 'serverApi', 'funcFactory', '$parse', function($state, $stateParams, serverApi, funcFactory, $parse){
        var vm = this;

        vm.visual = {
            navButtsOptions: [
                {
                    type: 'new',
                    callback: () => {
                        vm.newContact = {first_name: '', last_name: '', email: '', partner_id: '', mobile: ''};
                        $('#createNewContactModal').modal('show');
                    }
                }
            ],
            navTableButts: [
                {type: 'view', callback: (data) => $state.go('app.contacts.view', {id: data.id || data._id})},
                {type: 'remove'}
            ],
            titles: ["Контакты"]
        };

        vm.data = {contactsList:[], searchQuery:$stateParams.q, partnersList:[]};
        vm.partnerSelectConfig = {dataMethod: serverApi.getPartners};

        vm.getSuggestions = function(type,val, field_name) {
            return serverApi.validateViaDaData(type, {"query": val}).then(function(result) {
                return result.data.suggestions.map(function(item) {
                    return $parse(field_name)(item) || val;
                });
            });
        };

        vm.createContact = function() {
            var data = vm.newContact;

            if(data.partner) {
                data.partner_id = data.partner.id;
            }

            delete data.partner;

            serverApi.createContact(data, function(result){
                if(!result.data.errors){
                    vm.data.contactsList.unshift(result.data);
                    funcFactory.showNotification('Успешно', 'Контакт ' +  result.data.email + ' добавлен в список', true);
                } else {
                    funcFactory.showNotification('Не удалось создать новый контакт', result.data.errors);
                }
            });
        };
    }]);
}());
