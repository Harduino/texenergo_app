/**
 * Created by Mikhail Arzhaev on 26.11.15.
 */
(function() {
    'use strict';

    angular.module('app.contacts').controller('ViewContactCtrl', ['$state', '$stateParams', 'serverApi', 'CanCan', 'funcFactory', function($state, $stateParams, serverApi, CanCan, funcFactory) {
        var self = this;
        this.contact = {};
        this.data = {partnersList: []};
        this.partnerSelectConfig = {dataMethod: serverApi.getPartners};

        var getContactDetails = function () {
            serverApi.getContactDetails($stateParams.id, function(result) {
                self.contact = result.data;
            });
        };

        this.visual = {
            navButtsOptions:[
                {type:'back', callback: function() {
                    $state.go('app.contacts',{});
                }},
                {type:'refresh', callback: getContactDetails}
            ],
            chartOptions: {barColor:'rgb(103,135,155)', scaleColor:false, lineWidth:5, lineCap:'circle', size:50},
            titles: 'Контакт: ',
            roles: {can_edit: CanCan.can('edit', 'Contact')}
        };

        getContactDetails();

        /**
         * Обновляем информацию по контакту
         */
        this.saveContact = function(){
            var contact = self.contact;
            var data = {
                contact:{
                    first_name: contact.first_name,
                    last_name: contact.last_name,
                    do_not_email: contact.do_not_email,
                    partner_id: contact.partner.id,
                    mobile: contact.mobile,
                    email: contact.email
                }
            };

           serverApi.updateContact(contact.id, data, function(result) {
               if(!result.data.errors) {
                   self.concat = result.data;
                   funcFactory.showNotification("Успешно", 'Контакт ' + contact.email + ' успешно отредактирован.', true);
               } else {
                   funcFactory.showNotification('Не удалось отредактировать контакт ' + contact.email, result.data.errors);
               }
           });
        };

        this.goToPartner = function() {
            $state.go('app.partners.view', {id: (self.contact.partner.id || self.contact.partner._id)})
        };
    }]);
}());
