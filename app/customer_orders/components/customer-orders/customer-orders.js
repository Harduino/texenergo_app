class CustomerOrdersCtrl {
    constructor($state, $stateParams, serverApi, funcFactory, authService,
      $uibModal) {
        let self = this;

        this.$state = $state;
        this.serverApi= serverApi;
        this.funcFactory = funcFactory;
        this.$uibModal = $uibModal;
        this.authService = authService;
        this.newOrderData = null;

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
                    callback: () => $state.go('app.customer_orders', {}, {reload: true})
                }
            ],
            navTableButts:[
                {
                    type:'view',
                    callback: (item) => $state.go('app.customer_orders.view', {id:item.data.id || item.data._id})
                },
                {
                    type:'remove',
                    callback: (item, button, $event) => {
                        $.SmartMessageBox({
                            title: 'Удалить заказ?',
                            content: 'Вы действительно хотите удалить заказ ' + item.data.number,
                            buttons: '[Нет][Да]'
                        }, ButtonPressed => {
                            if (ButtonPressed === 'Да') {
                                button.disableOnLoad(true, $event);
                                serverApi.deleteCustomerOrder(item.data.id, result => {
                                    button.disableOnLoad(false, $event);
                                    if(!result.data.errors){
                                        self.data.ordersList.splice(item.index,1);
                                        funcFactory.showNotification('Заказ ' + item.data.number + ' успешно удален.',
                                            '', true);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить заказ ' + item.data.number,
                                            result.data.errors);
                                    }
                                },() => {
                                  button.disableOnLoad(false, $event);
                                });
                            }
                        });
                    }
                }
            ],
            titles: ['Заказы клиентов']
        };

        this.data = {ordersList: [], searchQuery: $stateParams.q};
        this.funcFactory.setPageTitle('Заказы клиентов');
    }

    openCreateModal(){
      let self = this;

      this.$uibModal.open({
        templateUrl: 'app/customer_orders/components/create-customer-order/create-order.html',
        controller: 'CreateCustomerOrderCtrl',
        controllerAs: '$ctrl',
        resolve: {
          partner: {
            data: (self.authService.profile.user_metadata && self.authService.profile.user_metadata.partner || null)
          }
        }
      }).result.then((result)=>{

        result.promise.then((r)=>{
          if(!r.data.errors) {
            self.data.ordersList.unshift(r.data);
            self.funcFactory.showNotification('Заказ успешно добавлен', '', true);
            self.$state.go('app.customer_orders.view', {id: r.data.id});
          } else {
            self.funcFactory.showNotification('Не удалось создать заказ', r.data.errors);
          }
        });
      });
    }
}

CustomerOrdersCtrl.$inject = [
  '$state',
  '$stateParams',
  'serverApi',
  'funcFactory',
  'authService',
  '$uibModal'
];

angular.module('app.customer_orders').component('customerOrders', {
    controller: CustomerOrdersCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/customer_orders/components/customer-orders/customer-orders.html'
});
