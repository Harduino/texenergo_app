/**
 * Created by Egor Lobanov on 07.11.15.
 */
(function(){

    'use strict';
    angular.module('app.contacts').controller('ContactsCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', '$parse', function($scope, $state, $stateParams, serverApi, funcFactory, $parse){
        var sc = $scope;

        sc.visual = {
            navButtsOptions: [
                { type: 'new', callback: openCreateContactForm }
            ],
            navTableButts: [
                { type: 'view', callback: viewContact },
                { type: 'remove' }
            ],
            titles: ["Контакты"]
        };
        sc.data = {
            contactsList:[],
            searchQuery:$stateParams.q,
            partnersList:[]
        };
        sc.partnerSelectConfig ={
            dataMethod: serverApi.getPartners
        };

        function viewContact(data){
            $state.go('app.contacts.view', {id:data.id || data._id});
        }

        function openCreateContactForm(){
            clearForm();
            $('#createNewContactModal').modal('show');
        }

        function clearForm (){
            sc.newContact = {
                first_name: '',
                last_name: '',
                email: '',
                partner_id: '',
                mobile: ''
            };
        }

        sc.getDaDataSuggestions = function(type,val, field_name){
            return serverApi.validateViaDaData(type, {"query": val}).then(function(result){
                return result.data.suggestions.map(function(item){
                    return $parse(field_name)(item) || val;
                });
            });
        };

        sc.createContact = function(){
            var data = sc.newContact;
            if(data.partner) data.partner_id = data.partner.id;
            delete data.partner;
            serverApi.createContact(data, function(result){
                if(!result.data.errors){
                    sc.data.contactsList.unshift(result.data);
                    funcFactory.showNotification('Успешно', 'Контакт ' +  result.data.email + ' добавлен в список', true);
                } else {
                    funcFactory.showNotification('Не удалось создать новый контакт', result.data.errors);
                }
            });
        };
    }]);
}());