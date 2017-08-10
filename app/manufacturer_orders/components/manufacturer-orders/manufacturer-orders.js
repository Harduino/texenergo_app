class ManufacturerOrdersCtrl {
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
          callback: () => $state.go('app.manufacturer_orders', {}, {reload: true})
        }
      ],
      navTableButts: [
        {type: 'view', callback: (data) => $state.go('app.manufacturer_orders.view', {id: data.id || data._id})},
        {type: 'remove', callback: (item, button, $event) => {
          console.log("item", item);
          $.SmartMessageBox({
            title: 'Удалить?',
            content: 'Вы действительно хотите удалить ' + item.number,
            buttons: '[Нет][Да]'
          }, ButtonPressed => {
            if (ButtonPressed === 'Да') {
              button.disableOnLoad(true, $event);
              serverApi.deleteManufacturerOrder(item.id, result => {
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
      templateUrl: 'app/manufacturer_orders/components/create-manufacturer-order/create-manufacturer-order.html',
      controller: 'CreateManufacturerOrderCtrl',
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

ContactsCtrl.$inject = [
  '$state',
  '$stateParams',
  'serverApi',
  'funcFactory',
  '$uibModal'
];

angular.module('app.manufacturer_orders').component('manufacturerOrders', {
    controller: ManufacturerOrdersCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/manufacturer_orders/components/manufacturer-orders/manufacturer-orders.html'
});
