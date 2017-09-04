class DispatchOrdersCtrl {
    constructor($state, $stateParams, serverApi, funcFactory, authService) {
        let self = this;
        this.state = $state;
        this.serverApi = serverApi;
        this.authService = authService;
        this.funcFactory = funcFactory;
        this.data = {ordersList:[], searchQuery: $stateParams.q, dispatchableProducts: []};

        this.restoreStatusFromSate();

        this.visual = {
            navButtsOptions:[
                {type: 'refresh', callback: () => $state.go('app.dispatch_orders', {}, {reload:true})}
            ],
            navTableButts: [
                {
                    type: 'view',
                    callback: (item) => $state.go('app.dispatch_orders.view', {id: item.data.id})
                },
                {
                    type: 'remove',
                    callback: (item, button, $event) => {
                        $.SmartMessageBox({
                            title: 'Удалить списание?',
                            content: 'Вы действительно хотите удалить списание ' + item.data.number,
                            buttons: '[Нет][Да]'
                        }, ButtonPressed => {
                            if (ButtonPressed === 'Да') {
                                button.disableOnLoad(true, $event);
                                serverApi.deleteDispatchOrder(item.data.id, result => {
                                    button.disableOnLoad(false, $event);
                                    if(!result.data.errors){
                                        self.data.ordersList.splice(item.index,1);
                                        funcFactory.showNotification('Списание ' + item.data.number +
                                            ' успешно удалено.', '', true);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить списание ' +
                                            item.data.number, result.data.errors);
                                    }
                                }, () => {
                                  button.disableOnLoad(false, $event);
                                });
                            }
                        });
                    }
                }
            ],
            titles: ['Списания']
        };

        this.funcFactory.setPageTitle('Реализации');

        serverApi.getDispatchableProducts(r => self.data.dispatchableProducts = r.data);

        this.fetchOrders = (pageNumber, searchQuery, config, callback) => {

          // Добавляем статус к запросу
          if(self.isIncomplete){
            config.additionalParams = {
              status: 'incomplete'
            };
          }

          self.serverApi.getDispatchOrders(pageNumber, searchQuery, config, callback);
        };
    }

    restoreStatusFromSate() {
      let params = this.state.params,
          userMeta = this.authService.userMetadata,
          status;

      if(userMeta.hasOwnProperty('dispatchOrders')){
        status = userMeta.dispatchOrders.status;
      }

      // restore status from metadata
      if(status && params.status !== status){
        params.status = status;
        this.state.go(this.state.current.name, this.state.params, {reload: true, notify: false});
      }

      this.isIncomplete = this.state.params.status === 'incomplete';
    }

    reloadState(){
      if(this.isIncomplete){
        this.state.params.status = 'incomplete';
      }else this.state.params.status = undefined;

      this.authService.updateUserMetadata({
        dispatchOrders: {
          status: this.state.params.status
        }
      });

      this.state.go('app.dispatch_orders', this.state.params, {reload:true});
    }

    fetchAddableOrder(order) {
        let self = this;

        for (let orderIndex = 0; orderIndex < self.data.ordersList.length; orderIndex++) {
            let currentOrder = self.data.ordersList[orderIndex];

            if(currentOrder.partner.id === order.partner.id && currentOrder.can_edit) {
                return currentOrder;
            }
        }
    }

    addDispatchOrderContent(item, dispatchOrder) {
        let self = this;
        let data = {
            customer_order_content_id: item.customer_order_content_id,
            quantity: item.remains_to_dispatch,
            customer_order_id: item.customer_order_id
        };

        self.serverApi.createDispatchOrderContent(dispatchOrder.id, data, r => {
            if (!!r.data && !r.data.errors) {
                self.funcFactory.showNotification('Позиция списана', 'Позиция добавлена в реализацию ' +
                    dispatchOrder.number, true);

                for (var i = self.data.dispatchableProducts.length - 1; i >= 0; i--) {
                    if(self.data.dispatchableProducts[i].customer_order_content_id === item.customer_order_content_id) {
                        self.data.dispatchableProducts.splice(i, 1);
                    }
                }
            } else {
                self.funcFactory.showNotification('Не смог списать', 'Сервер ответил ' + r.data.errors);
            }
        });
    }

    dispatchItem(order) {
        let self = this;
        let currentOrder = self.fetchAddableOrder(order);

        let data = {
            partner_id: order.partner.id
        };

        if (currentOrder === undefined) {
            self.serverApi.createDispatchOrder(data, r => {
                self.data.ordersList.unshift(r.data);
                currentOrder = self.fetchAddableOrder(order);

                if(currentOrder !== undefined){
                    self.funcFactory.showNotification('Создание реализации', 'Создан новый документ реализации ' +
                        currentOrder.number, true);
                    self.addDispatchOrderContent(order, currentOrder);
                } else {
                    self.funcFactory.showNotification('Нет списания',
                        'Не смог ни найти, ни создать новый документ реализации. ', false)
                }
            });
        } else {
            self.addDispatchOrderContent(order, currentOrder);
        }
    }

    disallowAutomatic(order) {
        this.setAutomatic(order, false, 'Позиция НЕ будет обрабатываться роботом.',
            'Не получилось поставить отметку о разрешении списания роботом.');
    }

    allowAutomatic(order) {
        this.setAutomatic(order, true, 'Позиция будет списана роботом автоматически.',
            'Не получилось снять отметку о запрете списания роботом.');
    }

    setAutomatic (order, state, successMessage, failureMessage) {
        let self = this;
        let data = { automatically_dispatchable: state };

        self.serverApi.updateCustomerOrderProduct(order.customer_order_id, order.customer_order_content_id, data, r => {
            if(!r.data.errors){
                order.automatically_dispatchable = state;
                self.funcFactory.showNotification('Получилось', successMessage, true);
            } else {
                self.funcFactory.showNotification('Не получилось', failureMessage + ' ' + r.data.errors, false);
            }
        });
    }
}

DispatchOrdersCtrl.$inject = [
  '$state',
  '$stateParams',
  'serverApi',
  'funcFactory',
  'authService'
];

angular.module('app.dispatch_orders').component('dispatchOrders', {
    controller: DispatchOrdersCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/dispatch_orders/components/dispatch-orders/dispatch-orders.html'
});
