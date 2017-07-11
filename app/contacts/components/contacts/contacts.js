class ContactsCtrl {
  constructor($state, $stateParams, serverApi, funcFactory, $uibModal) {
    let self = this;
    this.serverApi = serverApi;
    this.funcFactory = funcFactory;
    this.$uibModal = $uibModal;

    this.visual = {
      navButtsOptions: [
        {
          type: 'new',
          callback: () => {
            self.openCreateModal();
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
  }

  openCreateModal(){
    let self = this;

    this.$uibModal.open({
      templateUrl: 'app/contacts/components/create-contact/create-contact.html',
      controller: 'CreateContactCtrl',
      controllerAs: '$ctrl',
      resolve: {
        partner: undefined
      }
    }).result.then(res => {
      if(!res.data.errors) {
        self.data.contactsList.unshift(res.data);
        self.funcFactory.showNotification('Успешно', 'Контакт ' +  res.data.email + ' добавлен в список', true);
      } else {
        self.funcFactory.showNotification('Не удалось создать новый контакт', res.data.errors);
      }
    });
  }
}

ContactsCtrl.$inject = [
  '$state',
  '$stateParams',
  'serverApi',
  'funcFactory',
  '$uibModal'
];

angular.module('app.contacts').component('contacts', {
    controller: ContactsCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/contacts/components/contacts/contacts.html'
});
