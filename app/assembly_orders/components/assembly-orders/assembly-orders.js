class AssemblyOrdersCtrl {
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
        },
        {
          type: 'refresh',
          callback: () => $state.go('app.assembly_orders', {}, {reload: true})
        }
      ],
      navTableButts: [
        {type: 'view', callback: (data) => $state.go('app.assembly_orders.view', {id: data.id || data._id})},
        {type: 'remove', callback: (item, button, $event) => {
          $.SmartMessageBox({
            title: 'Удалить?',
            content: 'Вы действительно хотите удалить ' + item.number,
            buttons: '[Нет][Да]'
          }, ButtonPressed => {
            if (ButtonPressed === 'Да') {
              button.disableOnLoad(true, $event);
              serverApi.deleteAssemblyOrder(item.id, result => {
                button.disableOnLoad(false, $event);
                if(!result.data.errors){
                  self.data.ordersList.splice(item.index,1);
                  funcFactory.showNotification(item.number + ' успешно удален.', '', true);
                } else {
                  funcFactory.showNotification('Не удалось удалить ' + item.number, result.data.errors);
                }
              },() => {
                button.disableOnLoad(false, $event);
              });
            }
          });
        }}
      ],
      titles: ["Выпуски с производства"]
    };

    this.data = {ordersList:[], searchQuery: $stateParams.q};
  }

  openCreateModal(){
    let self = this;

    this.$uibModal.open({
      templateUrl: 'app/assembly_orders/components/create-assembly-order/create-assembly-order.html',
      controller: 'CreateAssemblyOrderCtrl',
      controllerAs: '$ctrl',
      resolve: {
        partner: undefined
      }
    }).result.then(res => {
      if(!res.data.errors) {
        self.data.ordersList.unshift(res.data);
        self.funcFactory.showNotification('Успешно', 'Выписка с производства создана', true);
      } else {
        self.funcFactory.showNotification('Не удалось создать', res.data.errors);
      }
    });
  }
}

AssemblyOrdersCtrl.$inject = [
  '$state',
  '$stateParams',
  'serverApi',
  'funcFactory',
  '$uibModal'
];

angular.module('app.assembly_orders').component('assemblyOrders', {
    controller: AssemblyOrdersCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/assembly_orders/components/assembly-orders/assembly-orders.html'
});
