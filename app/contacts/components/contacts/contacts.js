class ContactsCtrl {
    constructor($state, $stateParams, serverApi, funcFactory, $parse) {
        let self = this;
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;
        this.$parse = $parse;

        this.visual = {
            navButtsOptions: [
                {
                    type: 'new',
                    callback: () => {
                        self.newContact = {first_name: '', last_name: '', email: '', partner_id: '', mobile: ''};
                        $('#createNewContactModal').modal('show');
                    }
                }
            ],
            navTableButts: [
                {type: 'view', callback: (data) => $state.go('app.contacts.view', {id: data.id || data._id})},
                {type: 'remove'}
            ],
            titles: ["Контакты"]
        };

        this.data = {contactsList:[], searchQuery: $stateParams.q};
        this.partnerSelectConfig = {dataMethod: serverApi.getPartners};
    }

    getSuggestions(type, val, field) {
        let self = this;

        return this.serverApi.validateViaDaData(type, {query: val}).then(result => {
            return result.data.suggestions.map(item => {
                return self.$parse(field)(item) || val
            });
        });
    }

    createContact() {
        if(this.newContact.partner) {
            this.newContact.partner_id = this.newContact.partner.id;
        }

        delete this.newContact.partner;
        let self = this;

        this.serverApi.createContact(self.newContact, res => {
            if(!res.data.errors) {
                self.data.contactsList.unshift(res.data);
                self.funcFactory.showNotification('Успешно', 'Контакт ' +  res.data.email + ' добавлен в список', true);
            } else {
                self.funcFactory.showNotification('Не удалось создать новый контакт', res.data.errors);
            }
        });
    }
}

ContactsCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory', '$parse'];

angular.module('app.contacts').component('contacts', {
    controller: ContactsCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/contacts/components/contacts/contacts.html'
});
