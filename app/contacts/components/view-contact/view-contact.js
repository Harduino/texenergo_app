class ViewContactCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
        this.contact = {};
        this.partnerSelectConfig = {dataMethod: serverApi.getPartners};

        this.$state = $state;
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;

        let self = this;
        let getContactDetails = (subData, button, $event) => {
          if(button) button.disableOnLoad(true, $event);
          serverApi.getContactDetails($stateParams.id, (res) => {
            button && button.disableOnLoad(false, $event);
            self.contact = res.data;
            this.funcFactory.setPageTitle("Контакт " + res.data.email);
            }, () => {
                button && button.disableOnLoad(false, $event);
          });
        };

        this.visual = {
            navButtsOptions:[
                {type:'back', callback: () => $state.go('app.contacts', {})},
                {type:'refresh', callback: getContactDetails}
            ],
            chartOptions: {barColor:'rgb(103,135,155)', scaleColor:false, lineWidth:5, lineCap:'circle', size:50},
            titles: 'Контакт: '
        };

        getContactDetails();

        this.funcFactory.setPageTitle("Контакт");
    }

    saveContact() {
        let contact = this.contact;
        let self = this;

        let data = {
            contact:{
                first_name: contact.first_name,
                last_name: contact.last_name,
                do_not_email: contact.do_not_email,
                partner_id: contact.partner.id,
                mobile: contact.mobile,
                email: contact.email,
                procurement_emails: contact.procurement_emails
            }
        };

        this.serverApi.updateContact(contact.id, data, res => {
            if(!res.data.errors) {
                self.contact = res.data;
                self.funcFactory.showNotification("Успешно", 'Контакт ' + contact.email + ' успешно отредактирован.', true);
            } else {
                self.funcFactory.showNotification('Не удалось отредактировать контакт ' + contact.email, res.data.errors);
            }
        });
    }

    goToPartner() {
        this.$state.go('app.partners.view', {id: (this.contact.partner.id || this.contact.partner._id)})
    }

    generateApiToken() {
        let contact = this.contact;
        let self = this;

        let data = {};

        this.serverApi.generateApiTokenContact(contact.id, data, res => {
            if (!res.data.errors) {
                self.contact = res.data;
                self.funcFactory.showNotification("Успешно", 'Контакт ' + contact.email + '. Сгенерирован новый токен.', true);
            } else {
                self.funcFactory.showNotification('Не удалось сгенерировать токен для ' + contact.email, res.data.errors);
            }
        });
    }

}

ViewContactCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];

angular.module('app.contacts').component('viewContact', {
    controller: ViewContactCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/contacts/components/view-contact/view-contact.html'
});
