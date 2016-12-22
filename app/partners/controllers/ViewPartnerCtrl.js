/**
 * Created by Egor Lobanov on 17.11.15.
 * Контроллер страницы "Партнер"
 */
(function(){
    angular.module('app.partners').controller('ViewPartnerCtrl',['$state', 'serverApi', '$stateParams', 'funcFactory', function ($state, serverApi, $stateParams, funcFactory) {
        var self = this;
        this.partner = {};
        
        this.visual = {
            navButtsOptions:[
                {
                    type: 'back',
                    callback: function() {
                        $state.go('app.partners', {});
                    }
                },
                {
                    type: 'logs',
                    callback: function() {
                        $state.go('app.partners.view.logs', {});
                    }
                },
                {
                    type: 'refresh',
                    callback: function() {
                        serverApi.getPartnerDetails($stateParams.id, function(res) {
                            self.partner = res.data;
                        });
                    }
                }
            ],
            chartOptions: {
                barColor: 'rgb(103,135,155)',
                scaleColor: false,
                lineWidth: 5,
                lineCap: 'circle',
                size: 50
            },
            titles: 'Партнёр: ',
            roles: {can_edit: self.partner.can_edit}
        };
        
        this.newPerson = {};
        this.newBankAccount = {};
        
        serverApi.getPartnerDetails($stateParams.id, function (result) {
            self.partner = result.data;
            
            serverApi.getCustomerOrders(1, '-' + self.partner.prefix + '-', {}, function (result) {
                self.partner.customerOrders = result.data;
            });
            
            serverApi.getDispatchOrders(1, '-' + self.partner.prefix + "-", {}, function(result){
                self.partner.dispatchOrders = result.data;
            });
        });
        
        this.canCreatePerson = function () {
            for(var i = 0; i < gon.ability.rules.length; i++) {
                if(['all', 'Person'].indexOf(gon.ability.rules[i].subjects[0]) !== -1) {
                    return true;
                }
            }

            return false;
        };

        /**
         * Обновляем информацию по категории
         */
        this.savePartner = function() {
            var partner = self.partner;

            var data = {
                partner:{
                    name: partner.name,
                    kpp: partner.kpp,
                    delivery_address: partner.delivery_address,
                    legal_address: partner.legal_address,
                    phone: partner.phone,
                    email: partner.email,
                    ceo_name: partner.ceo_name,
                    ceo_title: partner.ceo_title,
                    invoice_conditions: partner.invoice_conditions
                }
            };

            debugger;

            serverApi.updatePartner(partner.id, data, function (result) {
                if((result.status == 200) && !result.data.errors){
                    funcFactory.showNotification('Успешно', 'Категория ' + partner.name + ' успешно отредактирована.',
                        true);
                } else {
                    funcFactory.showNotification('Неудача', 'Не удалось отредактировать категорию ' + partner.name,
                        true);
                }
            });
        };
        
        this.createPerson = function () {
            $('#createPersonModal').modal('show');
        };
        
        this.clearPerson = function () {
            self.newPerson = {};
            self.passport_scan = self.person_photo= '';
        };
        
        this.addNewPerson = function () {
            var data  = {person: self.newPerson};

            serverApi.createPerson(self.partner.id, data, function(result){
                if(!result.data.errors){
                    funcFactory.showNotification('Представитель успешно добавлен', '', true);
                    self.partner.people.push(result.data);
                    self.clearPerson();
                } else {
                    funcFactory.showNotification('Не удалось создать представителя', result.data.errors);
                }
            });
        };


        this.createBankAccount = function () {
            $('#createBankAccountModal').modal('show');
        };

        this.clearBankAccount = function () {
            self.newBankAccount = {};
        };

        this.addBankAccount = function() {
            var data = {bank_account: self.newBankAccount};

            serverApi.createBankAccount(self.partner.id, data, function(result){
                if(!result.data.errors){
                    funcFactory.showNotification('Создал банковский счёт', '', true);
                    self.partner.bank_accounts.push(result.data);
                    self.clearBankAccount();
                } else {
                    funcFactory.showNotification('Не удалось создать банковский счёт', result.data.errors);
                }
            });
        };

        this.saveBankAccount = function (data) {
            var bank_account = data.item;
            serverApi.updateBankAccount(this.partner.id, bank_account.id, {
                rs: bank_account.rs,
                ks: bank_account.ks,
                bik: bank_account.bik,
                bank_name: bank_account.bank_name
            }, function (result) {
                if(!result.data.errors){
                    for (var j = 0; j < self.partner.bank_accounts.length; j++) {
                        var bankAccount = self.partner.bank_accounts[j];

                        if (bankAccount.id === result.data.id) {
                            self.partner.bank_accounts[j] = angular.extend(bankAccount, result.data);
                            funcFactory.showNotification('Успешно обновлен банковский счёт', (bankAccount.rs || ""), true);
                            break;
                        }
                    }
                } else {
                    funcFactory.showNotification('Не удалось обновить данные продукта', result.data.errors);
                }
            });
        };


        this.getDaDataSuggestions = function (type, val, fieldName) {
            return serverApi.validateViaDaData(type, {query: val}).then(function (result) {
                return result.data.suggestions.map(function (item) {
                    return {label: item.data.name.payment, item: item, field: fieldName};
                });
            });
        };

        this.fillBySuggestion = function ($item) {
            var data = $item.item.data;
            self.newBankAccount.bik = data.bic;
            self.newBankAccount.ks = data.correspondent_account;
            self.newBankAccount.bank_name = data.name.payment;
        };
    }]);
}());
