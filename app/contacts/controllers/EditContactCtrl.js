/**
 * Created by Mikhail Arzhaev on 10.12.15.
 */
(function(){
    angular.module('app.contacts').controller('EditContactCtrl', ['$scope', '$state', '$stateParams', 'serverApi', '$filter', 'funcFactory', function($scope, $state, $stateParams, serverApi, $filter, funcFactory){
        var sc = $scope;
        sc.data ={
            contact: {},
            partnersList: [],
            newPartner: {}
        };
        
        sc.visual = {
            navButtsOptions:[{type:'back', callback:goToIndex}, {type:'show', callback:goToShow}],
            roles: {},
            canChangePartner: true,//CanCan.can('change_partner', 'Contact')
            titles:['Редактировать ' + window.gon.index.Contact.objectTitle.toLowerCase()]
        };

        serverApi.getContactDetails($stateParams.id, function(result){
            var contact = sc.data.contact = result.data;
            funcFactory.setPageTitle('Контакт ' + contact.email);
        });
        
        sc.partnerSelectConfig ={
            dataMethod: serverApi.getPartners
        };

        /**
         * Обновляем информацию по контакту
         */
        sc.saveContact = function(){
            var contact = sc.data.contact;
            var data = {
                contact:{
                    first_name: contact.first_name,
                    last_name: contact.last_name,
                    do_not_email: contact.do_not_email,
                    partner_id: contact.partner.id
                }
            };
            serverApi.updateContact(contact.id, data, function(result){
                if(!result.data.errors)
                    funcFactory.showNotification("Успешно", 'Контакт ' + contact.email + ' успешно отредактирован.',true);
                else funcFactory.showNotification('Не удалось отредактировать контакт '+contact.email, result.data.errors);
            });
        };

        function goToShow(){
            $state.go('app.contacts.view', $stateParams);
        }
        
        function goToIndex(){
            $state.go('app.contacts', $stateParams);
        }
    }]);
}());
