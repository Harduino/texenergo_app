class DispatchOrdersCtrl {
    constructor($state, $stateParams, serverApi) {
        this.data = {ordersList:[], searchQuery: $stateParams.q};

        this.visual = {
            navButtsOptions:[
                {type: 'refresh', callback: () => $state.go('app.dispatch_orders', {}, {reload:true})}
            ],
            navTableButts: [
                {
                    type: 'view',
                    callback: (id) => $state.go('app.dispatch_orders.view', {id: id})
                },
                {
                    type: 'remove',
                    callback: item => {
                        $.SmartMessageBox({
                            title: 'Удалить списание?',
                            content: 'Вы действительно хотите удалить списание ' + item.data.number,
                            buttons: '[Нет][Да]'
                        }, ButtonPressed => {
                            if (ButtonPressed === 'Да') {
                                serverApi.deleteDispatchOrder(item.data.id, result => {
                                    if(!result.data.errors){
                                        self.data.ordersList.splice(item.index,1);
                                        funcFactory.showNotification('Списание ' + item.data.number +
                                            ' успешно удалено.', '', true);
                                    } else {
                                        funcFactory.showNotification('Не удалось удалить списание ' +
                                            item.data.number, result.data.errors);
                                    }
                                });
                            }
                        });
                    }
                }
            ],
            titles: ['Списания']
        };
    }
}

DispatchOrdersCtrl.$inject = ['$state', '$stateParams', 'serverApi'];

angular.module('app.dispatch_orders').component('dispatchOrders', {
    controller: DispatchOrdersCtrl,
    controllerAs: 'dispatchOrdersCtrl',
    templateUrl: '/app/dispatch_orders/components/dispatch-orders/dispatch-orders.html'
});
