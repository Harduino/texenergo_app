/**
 * Created by Egor Lobanov on 17.11.15.
 * Контроллер страницы "Партнер"
 */
(function(){

    angular.module('app.partners').controller('ViewPartnerCtrl',['$scope', '$state', 'serverApi', '$stateParams', 'funcFactory', '$http', function($scope, $state, serverApi, $stateParams, funcFactory, $http){
        var sc = $scope;
        
        sc.partner = {};
        
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack},{type:'edit', callback:editPartner}, {type:'files'}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            titles: window.gon.index.Partner.objectTitle + ': '
        };
        
        sc.newPerson = {
        };
        
        serverApi.getPartnerDetails($stateParams.id, function(result){
            sc.partner = result.data;
            
            serverApi.getCustomerOrders(1, "-"+sc.partner.prefix+"-", {}, function(result){
                sc.partner.customerOrders = result.data;
            });
            
            serverApi.getDispatchOrders(1, "-"+sc.partner.prefix+"-", {}, function(result){
                sc.partner.dispatchOrders = result.data;
            });
        });
        
        sc.canCreatePerson = function(){
            for(var i=0; i < gon.ability.rules.length; i++) {
                if(gon.ability.rules[i].subjects[0]==="Person") {
                    return true;
                }
                if(gon.ability.rules[i].subjects[0]==="all") {
                    return true;
                }
            }
            return false;
        }
        
        function returnBack(){
            $state.go('app.partners',{});
        }
        
        function editPartner(){
            $state.go('app.partners.view.edit',{});
        }
        
        sc.createPerson = function(){
            $('#createPersonModal').modal('show');
        };
        
        sc.clearPerson = function(){
            sc.newPerson = {};
            sc.passport_scan = sc.person_photo= "";
        };
        
        sc.addNewPerson = function(){
            var data  = {
                person: sc.newPerson
            };

            serverApi.createPerson(sc.partner.id, data, function(result){
                if(!result.data.errors){
                    funcFactory.showNotification('Представитель успешно добавлен', '', true);
                    sc.partner.people.push(result.data);
                    sc.clearPerson();
                } else {
                    funcFactory.showNotification('Не удалось создать представителя', result.data.errors);
                }
            });
        };
    }]);
}());
