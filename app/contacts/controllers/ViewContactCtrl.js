/**
 * Created by Mikhail Arzhaev on 26.11.15.
 */
(function(){

    "use strict";

    angular.module('app.contacts').controller('ViewContactCtrl', ['$scope', '$state', '$stateParams', 'serverApi', 'funcFactory', function($scope, $state, $stateParams, serverApi, funcFactory){
        var sc = $scope;
        sc.contact = {};
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'edit', callback: goToEdit}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            titles: window.gon.index.Contact.objectTitle + ': '
        };

        sc.canEditContact = function(){
            for(var i=0; i < gon.ability.rules.length; i++) {
                if(gon.ability.rules[i].subjects[0]==="Contact") {
                    for (var j = 0; j <= gon.ability.rules[i].actions.length; j++) {
                        if (gon.ability.rules[j].actions[j]==="update") {
                            return true;
                        }
                    }
                }
                if(gon.ability.rules[i].subjects[0]==="all") {
                    return true;
                }
            }
            return false;
        }

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
                        mobile: contact.mobile
                    }
                };
            serverApi.updateContact(contact.id, data, function(result){
                if(!result.data.errors)
                    funcFactory.showNotification("Успешно", 'Контакт ' + contact.email + ' успешно отредактирован.',true);
                else funcFactory.showNotification('Не удалось отредактировать контакт '+contact.email, result.data.errors);
            });
        };

        serverApi.getContactDetails($stateParams.id, function(result){
            console.log(result.data);
            sc.contact = result.data;
        });

        function returnBack(){
            $state.go('app.contacts',{});
        }
        
        function goToEdit(){
            $state.go('app.contacts.view.edit',{});
        }
    }]);
}());