class ViewContactCtrl {
    constructor($state, serverApi, CanCan, funcFactory) {
        this.contact = {};
        this.data = {partnersList: []};
        this.partnerSelectConfig = {dataMethod: serverApi.getPartners};

        this.$state = $state;
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;

        let self = this;
        let getContactDetails = () => serverApi.getContactDetails(self.contactId, res => self.contact = res.data);

        this.visual = {
            navButtsOptions:[
                {type:'back', callback: () => $state.go('app.contacts', {})},
                {type:'refresh', callback: getContactDetails}
            ],
            chartOptions: {barColor:'rgb(103,135,155)', scaleColor:false, lineWidth:5, lineCap:'circle', size:50},
            titles: 'Контакт: ',
            roles: {can_edit: CanCan.can('edit', 'Contact')}
        };

        getContactDetails();
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
                email: contact.email
            }
        };

        serverApi.updateContact(contact.id, data, res => {
            if(!res.data.errors) {
                self.concat = res.data;
                self.funcFactory.showNotification("Успешно", 'Контакт ' + contact.email + ' успешно отредактирован.', true);
            } else {
                self.funcFactory.showNotification('Не удалось отредактировать контакт ' + contact.email, res.data.errors);
            }
        });
    }

    goToPartner() {
        this.$state.go('app.partners.view', {id: (this.contact.partner.id || this.contact.partner._id)})
    }
}

ViewContactCtrl.$inject = ['$state', 'serverApi', 'CanCan', 'funcFactory'];

angular.module('app.contacts').component('viewContact', {
    controller: ViewContactCtrl,
    controllerAs: 'viewContactCtrl',
    bindings: {contactId: '<'},
    templateUrl: '/app/contacts/components/view-contact/view-contact.html'
});
