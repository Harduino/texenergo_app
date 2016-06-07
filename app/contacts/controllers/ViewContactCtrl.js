/**
 * Created by Mikhail Arzhaev on 26.11.15.
 */
(function(){

    "use strict";

    angular.module('app.contacts').controller('ViewContactCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'CanCan', 'funcFactory', function($scope, $state, $stateParams, serverApi, CanCan, funcFactory){
        var sc = $scope;
        sc.contact = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'edit', callback: goToEdit}, {type:'refresh', callback:getContactDetails}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            titles: window.gon.index.Contact.objectTitle + ': ',
            roles: {
                can_edit: CanCan.can('edit', 'Contact')
            }
        };
        sc.data = {
            partnersList: []
        };

        sc.partnerSelectConfig ={
            dataMethod: serverApi.getPartners
        };

        function getContactDetails(){
            serverApi.getContactDetails($stateParams.id, function(result){
                console.log(result.data);
                sc.contact = result.data;
            });
        }

        getContactDetails();

        /**
         * Обновляем информацию по контакту
         */
        sc.saveContact = function(){
            var contact = sc.contact;
            var data = {
                contact:{
                    first_name: contact.first_name,
                    last_name: contact.last_name,
                    do_not_email: contact.do_not_email,
                    partner_id: contact.partner.id,
                    mobile: contact.mobile
                }
            };

            serverApi.validateViaDaData('fio', {query: contact.first_name}).then(function(result){
                console.log(result);
            });

//            serverApi.updateContact(contact.id, data, function(result){
//                if(!result.data.errors){
//                    sc.concat = result.data;
//                    funcFactory.showNotification("Успешно", 'Контакт ' + contact.email + ' успешно отредактирован.',true);
//                }
//                else funcFactory.showNotification('Не удалось отредактировать контакт '+contact.email, result.data.errors);
//            });
        };

        function returnBack(){
            $state.go('app.contacts',{});
        }
        
        function goToEdit(){
            $state.go('app.contacts.view.edit',{});
        }
    }]);
}());