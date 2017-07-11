class CreateContactCtrl{
  constructor($uibModalInstance, serverApi, $q, partner){
    this.$uibModalInstance = $uibModalInstance;
    this.serverApi = serverApi;
    this.partnerSelectConfig = {dataMethod: serverApi.getPartners};
    this.cancel = $uibModalInstance.dismiss;
    this.$q = $q;
    this.partner = partner;
    this.newContact = this.clearContact();
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
    let self = this,
        defer = this.$q.defer();

    this.$uibModalInstance.close(defer.promise);

    this.serverApi.createContact(newContact, res => {
      defer.resolve(res);
    });
  }

  clearContact(){
    return {
      first_name: '',
      last_name: '',
      email: '',
      partner_id: (this.partner && this.partner.id || ''),
      partner: this.partner,
      mobile: ''
    };
  }
}

CreateContactCtrl.$inject = [
  '$uibModalInstance',
  'serverApi',
  '$q',
  'partner'
];

angular.module('app.contacts')
.controller('CreateContactCtrl', CreateContactCtrl);
