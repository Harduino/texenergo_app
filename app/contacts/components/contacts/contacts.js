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
        let self = this,
            params = {query: val};

        if(type === 'fio'){
          params = self.getFIOParameters(field, params);
        }

        return this.serverApi.validateViaDaData(type, params).then(result => {
          return result.data.suggestions;
        });
    }

    getFIOParameters(field, params){
      let contact = this.newContact,
          p = params || {};

      if(field === 'name'){
        if(angular.isObject(contact.last_name)){
          p.gender = contact.last_name.data.gender;
          p.parts = ["NAME"];
        }
      }else{
        if(angular.isObject(contact.first_name)){
          p.gender = contact.first_name.data.gender;
          p.parts = ["SURNAME"];
        }
      }

      return p;
    }

    parseFioLine($item) {
      let data = $item.data;

      if(data && data.name && data.surname){
        this.newContact.first_name = {
          data: {
            gender: data.gender
          },
          value: data.name
        };
        this.newContact.last_name = {
          data: {
            gender: data.gender
          },
          value: data.surname
        };
      }
    }

    switchFioFields() {
      let f_name = this.newContact.first_name,
          l_name = this.newContact.last_name;

      this.newContact.first_name = l_name;
      this.newContact.last_name = f_name;
    }

    createContact() {
      let newContact = this.newContact;

      if(newContact.partner) {
        newContact.partner_id = newContact.partner.id;
      }
      if(angular.isObject(newContact.first_name)){
        newContact.first_name = newContact.first_name.value;
      }
      if(angular.isObject(newContact.last_name)){
        newContact.last_name = newContact.last_name.value;
      }
      if(angular.isObject(newContact.email)){
        newContact.email = newContact.email.value;
      }

      delete newContact.partner;
      let self = this;

      this.serverApi.createContact(newContact, res => {
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
