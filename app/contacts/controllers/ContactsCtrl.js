/**
 * Created by Egor Lobanov on 07.11.15.
 */
(function(){

    'use strict';
    angular.module('app.contacts').controller('ContactsCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;

        sc.visual = {
            navButtsOptions:[{type: 'new', callback: openCreateContactForm}],
            navTableButts:[{type:'view', callback:viewContact}, {type:'table_edit', callback:editContact}, {type:'remove'}],
            titles:[window.gon.index.Contact.indexTitle]
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

        function editContact(data){
            $state.go('app.contacts.view.edit', {id:data.id || data._id});
        }

        function openCreateContactForm(){
            clearForm();
            $('#createNewContactModal').modal('show');
        }

        function clearForm (){
            sc.newContact = {
                first_name:'',
                last_name: '',
                email:'',
                partner_id:''
            };
        }

        sc.createContact = function(){
            console.log(sc.newContact);
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