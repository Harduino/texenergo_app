/**
 * Created by Egor Lobanov on 17.11.15.
 * Контроллер страницы "Партнер"
 */
(function(){

    angular.module('app.partners').controller('ViewPartnerCtrl',['$scope', '$state', 'serverApi', '$stateParams', 'funcFactory', '$http', function($scope, $state, serverApi, $stateParams, funcFactory, $http){
        var sc = $scope;
        
        sc.partner = {};
        
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack}, {type:'files'}],
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

        sc.canEditPartner = function(){
            for(var i=0; i < gon.ability.rules.length; i++) {
                if(gon.ability.rules[i].subjects[0]==="Partner") {
                    return true;
                }
                if(gon.ability.rules[i].subjects[0]==="edit") {
                    return true;
                }
            }
            return false;
        }

        /**
         * Обновляем информацию по категории
         */
        sc.savePartner = function(){
            var partner = sc.partner;
            var data = {
                    partner:{
                        name: partner.name,
                        legal_name: partner.legal_name,
                        delivery_address: partner.delivery_address,
                        legal_address: partner.legal_address,
                        phone: partner.phone,
                        email: partner.email,
                        ceo_title: partner.ceo_title,
                        ceo_name: partner.ceo_name
                    }
                };
            serverApi.updatePartner(partner.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    funcFactory.showNotification("Успешно", 'Категория '+partner.name+' успешно отредактирована.',true);
                }else funcFactory.showNotification("Неудача", 'Не удалось отредактировать категорию '+partner.name,true);
            });
        };
        
        function returnBack(){
            $state.go('app.partners',{});
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

        sc.legalAddressString = function(){
            var addr = sc.partner.legal_address;
            return addr.postal_index + ' ' + addr.region + ' ' + addr.city + ' ' + addr.street + ' ' + addr.house;
        }

        sc.deliveryAddressString = function(){
            var addr = sc.partner.delivery_address;
            return addr.postal_index + ' ' + addr.region + ' ' + addr.city + ' ' + addr.street + ' ' + addr.house;
        }
    }]);
}());
