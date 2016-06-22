/**
 * Created by Egor Lobanov on 17.11.15.
 * Контроллер страницы "Партнер"
 */
(function(){

    angular.module('app.partners').controller('ViewPartnerCtrl',['$scope', '$state', 'serverApi', '$stateParams', 'funcFactory', '$http', '$parse', function($scope, $state, serverApi, $stateParams, funcFactory, $http, $parse){
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
            titles: window.gon.index.Partner.objectTitle + ': ',
            roles: {
                can_edit: sc.partner.can_edit
            }
        };
        
        sc.newPerson = {
        };

        sc.newBankAccount = {};
        
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

        /**
         * Обновляем информацию по категории
         */
        sc.savePartner = function(){
            var partner = sc.partner;
            var data = {
                    partner:{
                        name: partner.name,
                        // delivery_address: partner.delivery_address,
                        // legal_address: partner.legal_address,
                        phone: partner.phone,
                        email: partner.email,
                        ceo_name: partner.ceo_name,
                        ceo_title: partner.ceo_title
                    }
                };
            serverApi.updatePartner(partner.id, data, function(result){
                if(result.status == 200 && !result.data.errors){
                    funcFactory.showNotification("Успешно", 'Категория ' + partner.name + ' успешно отредактирована.', true);
                }else funcFactory.showNotification("Неудача", 'Не удалось отредактировать категорию ' + partner.name, true);
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

        sc.createBankAccount = function(){
            $('#createBankAccountModal').modal('show');
        };

        sc.clearBankAccount = function(){
            sc.newBankAccount = {};
        };

        sc.addBankAccount = function(){
            var data = {
                bank_account: sc.newBankAccount
            };

            serverApi.createBankAccount(sc.partner.id, data, function(result){
                if(!result.data.errors){
                    funcFactory.showNotification('Создал банковский счёт', '', true);
                    sc.partner.bank_accounts.push(result.data);
                    sc.clearBankAccount();
                } else {
                    funcFactory.showNotification('Не удалось создать банковский счёт', result.data.errors);
                }
            });
        };

        sc.saveBankAccount = function(data){
            var bank_account = data.item;
            serverApi.updateBankAccount(sc.partner.id, bank_account.id, {
                rs: bank_account.rs,
                ks: bank_account.ks,
                bik: bank_account.bik,
                bank_name: bank_account.bank_name
            }, function(result){
                if(!result.data.errors){
                    for (var j = 0; j < sc.partner.bank_accounts.length; j++) {
                        var x = sc.partner.bank_accounts[j];
                        if (x.id === result.data.id) {
                            sc.partner.bank_accounts[j] = angular.extend(x, result.data);
                            funcFactory.showNotification('Успешно обновлен банковский счёт', (x.rs || ""), true);
                            break;
                        }
                    }
                }else{
                    funcFactory.showNotification('Не удалось обновить данные продукта', result.data.errors);
                }
            });
        };

        sc.getDaDataSuggestions = function(type, val, field_name){
            return serverApi.validateViaDaData(type, {"query": val}).then(function(result){
                return result.data.suggestions.map(function(item){
                    return {label: item.data.name.payment, item: item, field: field_name};
                });
            });
        };

        sc.fillBySuggestion = function($item, prop){
            var data = $item.item.data;
            sc.newBankAccount.bik = data.bic;
            sc.newBankAccount.ks = data.correspondent_account;
            sc.newBankAccount.bank_name = data.name.payment;
        }
    }]);
}());
