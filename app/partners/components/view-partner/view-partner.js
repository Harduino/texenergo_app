class ViewPartnerCtrl {
    constructor($state, serverApi, $stateParams, funcFactory, $parse) {
        let self = this;
        this.funcFactory = funcFactory;
        this.serverApi = serverApi;
        this.$parse = $parse;

        this.partner = {};
        this.newPerson = {};
        this.newBankAccount = {};
        this.newAddress = {};
        this.updatableAddress = {};

        this.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.partners', {})},
                {type: 'logs', callback: () => $state.go('app.partners.view.logs', {})},
                {
                    type: 'refresh',
                    callback: (subData, button, $event) => loadPartner(true, button, $event)
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

        var loadResources = () => {
            serverApi.getCustomerOrders(1, '-' + self.partner.prefix + '-', {}, r => {
                window.partners[$stateParams.id].customerOrders = r.data;
                self.partner.customerOrders = r.data;
            });
            serverApi.getDispatchOrders(1, '-' + self.partner.prefix + '-', {}, r => {
                window.partners[$stateParams.id].dispatchOrders = r.data;
                self.partner.dispatchOrders = r.data;
            });
            serverApi.getReceiveOrders( 1, '', {}, r => {
                window.partners[$stateParams.id].receiveOrders = r.data;
                self.partner.receiveOrders = r.data;
            }, {}, self.partner.id);

            self.dellinTerminalsList = [];
            serverApi.getDellinTerminals(self.partner.id, r => {
                console.log("Dellin is on fire!");
                r.data.forEach( city => {
                    city.terminals.forEach(terminal => {
                        terminal.dellin_terminal = terminal.id;
                        self.dellinTerminalsList.push(terminal);
                    })
                });
            });
        }

        var loadPartner = (force_reload, button, $event) => {
            button && button.disableOnLoad(true, $event);
            if (window.partners !== undefined && window.partners[$stateParams.id] !== undefined && force_reload !== true) {
                button && button.disableOnLoad(false, $event);
                self.partner = window.partners[$stateParams.id];
            } else {
                serverApi.getPartnerDetails($stateParams.id, r => {
                    button && button.disableOnLoad(false, $event);
                    self.partner = r.data;
                    if(!window.partners) window.partners = {};
                    window.partners[$stateParams.id] = r.data;
                    loadResources();
                }, () => {
                  button && button.disableOnLoad(false, $event);
                });
            }
        }

        loadPartner();
    }

    canCreatePerson () {
        for(let i = 0; i < gon.ability.rules.length; i++) {
            if(['all', 'Person'].indexOf(gon.ability.rules[i].subjects[0]) !== -1) {
                return true;
            }
        }

        return false;
    }

    //PERSON BEGIN
    savePartner () {
        let self = this;
        let partner = this.partner;

        let data = {
            partner:{
                name: partner.name,
                kpp: partner.kpp,
                phone: partner.phone,
                email: partner.email,
                ceo_name: partner.ceo_name,
                ceo_title: partner.ceo_title,
                invoice_conditions: partner.invoice_conditions
            }
        };

        this.serverApi.updatePartner(partner.id, data, result => {
            if((result.status == 200) && !result.data.errors){
                self.funcFactory.showNotification('Успешно', 'Партнёр ' + partner.name + ' успешно отредактирован.',
                    true);
            } else {
                let msg = "";
                for (var i = 0; i < result.data.errors.name.length; i++) {
                    msg += (result.data.errors.name[i] + " ");
                }
                self.funcFactory.showNotification('Неудача', msg, false);
            }
        });
    }

    showNewPersonForm () {
        $('#createPersonModal').modal('show');
    }

    clearPerson () {
        this.newPerson = {};
        this.passport_scan = this.person_photo = '';
    }

    addNewPerson () {
        let self = this;
        let data  = {person: self.newPerson};

        this.serverApi.createPerson(this.partner.id, data, result => {
            if(!result.data.errors){
                self.funcFactory.showNotification('Представитель успешно добавлен', '', true);
                self.partner.people.push(result.data);
                self.clearPerson();
            } else {
                self.funcFactory.showNotification('Не удалось создать представителя', result.data.errors);
            }
        });
    }
    //PERSON END

    //BANK ACCOUNT BEGIN
    showBankAccountForm () {
        $('#createBankAccountModal').modal('show');
    }

    clearBankAccount () {
        this.newBankAccount = {};
    }

    addBankAccount () {
        let self = this;
        let data = {bank_account: self.newBankAccount};

        this.serverApi.createBankAccount(this.partner.id, data, result => {
            if(!result.data.errors){
                self.funcFactory.showNotification('Создал банковский счёт', '', true);
                self.partner.bank_accounts.push(result.data);
                self.clearBankAccount();
            } else {
                self.funcFactory.showNotification('Не удалось создать банковский счёт', result.data.errors);
            }
        });
    }

    saveBankAccount (data) {
        let self = this;
        let bank_account = data.item;

        this.serverApi.updateBankAccount(this.partner.id, bank_account.id, {
            rs: bank_account.rs,
            ks: bank_account.ks,
            bik: bank_account.bik,
            bank_name: bank_account.bank_name
        }, result => {
            if(!result.data.errors) {
                for (let j = 0; j < self.partner.bank_accounts.length; j++) {
                    let bankAccount = self.partner.bank_accounts[j];

                    if (bankAccount.id === result.data.id) {
                        self.partner.bank_accounts[j] = angular.extend(bankAccount, result.data);
                        self.funcFactory.showNotification('Успешно обновлен банковский счёт', (bankAccount.rs || ''),
                            true);
                        break;
                    }
                }
            } else {
                self.funcFactory.showNotification('Не удалось обновить данные продукта', result.data.errors);
            }
        });
    }
    //BANK ACCOUNT END

    // ADDRESS BEGIN
    getDaDataSuggestions(type, value, fieldName) {
        let self = this;

        return this.serverApi.validateViaDaData(type, {query: value}).then(result => {
            return result.data.suggestions.map(item => {
                return {label: self.$parse(fieldName)(item) || value, item: item, field: fieldName};
            });
        });
    }

    fillAddressBySuggestion(daDataResponse, addr_item) {
        let data = daDataResponse.item.data;
        let addr = (addr_item === undefined) ? this.newAddress : addr_item; // Default to newAddress

        addr.postal_index =  data.postal_code;
        addr.region = data.region_with_type;
        addr.city = (data.city || data.settlement_with_type);
        addr.street_kladr_id = data.street_kladr_id;
        addr.street = data.street_with_type;
        addr.house = data.house;
    }

    showNewAddressForm () {
        $('#createAddressModal').modal('show');
    }

    clearNewAddress () {
        this.newAddress = {};
    }

    addAddress () {
        let self = this;
        let data = { address: self.newAddress };

        self.serverApi.createAddress(self.partner.id, data, result => {
            if(!result.data.errors){
                self.funcFactory.showNotification('Создал адрес', '', true);
                self.partner.addresses.push(result.data);
                self.clearNewAddress();
            } else {
                self.funcFactory.showNotification('Не удалось создать адрес', result.data.errors);
            }
        });
    }

    showUpdateAddressForm (addr) {
        this.updatableAddress = addr;
        $('#updateAddressModal').modal('show');
    }

    clearUpdatableAddress () {
        this.updatableAddress = {};
    }

    saveAddress (addrEntry) {
        let self = this;

        self.serverApi.updateAddress(self.partner.id, addrEntry.id, {
            address: addrEntry
        }, result => {
            if(!result.data.errors) {
                for (let j = 0; j < self.partner.addresses.length; j++) {
                    let address = self.partner.addresses[j];

                    if (address.id === result.data.id) {
                        self.partner.addresses[j] = angular.extend(address, result.data);
                        self.funcFactory.showNotification('Успешно обновлен адрес', (address.rs || ''),
                            true);
                        break;
                    }
                }
            } else {
                self.funcFactory.showNotification('Не удалось обновить данные продукта', result.data.errors);
            }
        });
    }

    dellinTerminals () {
        console.log("Fired dellinTerminals");
        let self = this;

        
    }
    // ADDRESS END

    // getDaDataBankSuggestions (type, val, fieldName) {
    //     return this.serverApi.validateViaDaData(type, {query: val}).then(result => {
    //         return result.data.suggestions.map(item => {
    //             return {label: item.data.name.payment, item: item, field: fieldName};
    //         });
    //     });
    // }

    fillBankBySuggestion ($item) {
        let data = $item.item.data;
        this.newBankAccount.bik = data.bic;
        this.newBankAccount.ks = data.correspondent_account;
        this.newBankAccount.bank_name = data.name.payment;
    }
}

ViewPartnerCtrl.$inject = ['$state', 'serverApi', '$stateParams', 'funcFactory', '$parse'];

angular.module('app.partners').component('viewPartner', {
    controller: ViewPartnerCtrl,
    controllerAs: 'viewPartnerCtrl',
    templateUrl: '/app/partners/components/view-partner/view-partner.html'
});
