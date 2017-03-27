class ViewDispatchOrderCtrl {
    constructor($state, $stateParams, serverApi, funcFactory, FileUploader, $localStorage) {
        let self = this;
        this.$stateParams = $stateParams;
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;
        this.$localStorage = $localStorage;


        this.dispatchOrder = {};

        this.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.dispatch_orders',{})},
                {type: 'upd_form_pdf', callback: () => self.openPdf('')},
                {type: 'label_pdf', callback: () => self.openPdf('/label')},
                {type: 'packing_list_pdf', callback: () => self.openPdf('/packing_list')},
                {
                    type: 'confirm_order',
                    callback: (subdata, item, $event) => {
                        let data = {dispatch_order: {event: item.event}};

                        item.disableOnLoad(true, $event);
                        serverApi.updateStatusDispatchOrder($stateParams.id, data, result => {
                            if(result.status == 200 && !result.data.errors) {
                                funcFactory.showNotification('Успешно', 'Удалось ' + item.name.toLowerCase() + ' заказ',
                                    true);
                                self.dispatchOrder = result.data;
                            } else {
                                funcFactory.showNotification('Не удалось ' + item.name.toLowerCase() + ' заказ',
                                    result.data.errors);
                            }
                            item.disableOnLoad(false, $event);
                        }, function(){
                          item.disableOnLoad(false, $event);
                        });
                    }
                },
                {type: 'refresh', callback: (subData, button, $event) => self.getDispatchOrderDetails(true, button, $event)},
                {type: 'logs', callback: () => $state.go('app.dispatch_orders.view.logs', {})}
            ],
            chartOptions: {
                barColor: 'rgb(103,135,155)',
                scaleColor: false,
                lineWidth: 5,
                lineCap: 'circle',
                size: 50
            },
            showFileModal: angular.noop,
            titles: 'Списание: №'
        };

        this.uploader = new FileUploader({
            withCredentials: true,
            queueLimit: 5,
            onCompleteItem: (fileItem, response, status) => {
                if(status === 200) {
                    self.dispatchOrder.documents.push(response);
                    self.uploader.clearQueue();
                    funcFactory.showNotification('Успешно', 'Приложил документ.', true);
                } else {
                    funcFactory.showNotification('Не удалось приложить документ', response.errors);
                }
            }
        });

        this.getDispatchOrderDetails();
    }

    saveChosenPerson() {
        let data = {dispatch_order: {person_id: this.dispatchOrder.chosenPersonId}};
        let self = this;

        this.serverApi.updateDispatchOrder(this.dispatchOrder.id, data, result => {
            if(result.data.errors) {
                self.funcFactory.showNotification('Ошибка при выборе человека', result.data.errors);
            } else {
                self.dispatchOrder = result.data;
                self.funcFactory.showNotification('Успешно', 'Человек выбран.', true);
            }
        });
    }

    getDispatchOrderDetails(force_reload, button, $event) {
        let self = this;

        button && button.disableOnLoad(true, $event);
        if (window.dispatch_orders !== undefined && window.dispatch_orders[self.$stateParams.id] !== undefined && force_reload !== true) {
            self.dispatchOrder = window.dispatch_orders[self.$stateParams.id];
            button && button.disableOnLoad(false, $event);
        } else {
            let data = {
                dispatch_order: {
                    person_id: self.dispatchOrder.chosenPersonId
                }
            };

            this.serverApi.getDispatchOrderDetails(self.$stateParams.id, result => {
                button && button.disableOnLoad(false, $event);
                if(!window.dispatch_orders) window.dispatch_orders = {};
                let dispatchOrder = self.dispatchOrder = result.data;
                window.dispatch_orders[self.$stateParams.id] = self.dispatchOrder;
                self.amontPercent = self.funcFactory.getPercent(dispatchOrder.paid_amount, dispatchOrder.total);
                self.dispatchedPercent = self.funcFactory.getPercent(dispatchOrder.dispatched_amount, dispatchOrder.total);
                self.setFileUploadOptions(dispatchOrder);
            }, function(){
              button && button.disableOnLoad(false, $event);
            });
        }
    }

    setFileUploadOptions(dispatchOrder) {
        this.uploader.url = window.APP_ENV.TEXENERGO_COM_API_HTTP_BASE_URL + '/dispatch_order/' + dispatchOrder.id +
            '/documents';
    }

    openPdf(path) {
        window.open(window.APP_ENV.TEXENERGO_COM_API_HTTP_BASE_URL + '/dispatch_orders/' + this.dispatchOrder.id +
            path + '.pdf?token=' + this.$localStorage.id_token, '_blank');
    }

    deleteProduct(item) {
        let self = this;
        self.serverApi.deleteDispatchOrderContent(this.$stateParams.id, item.id, r => {
            if (!r.data.errors) {
                for (var i = self.dispatchOrder.product_order_contents.length - 1; i >= 0; i--) {
                    if (self.dispatchOrder.product_order_contents[i].id === item.id) self.dispatchOrder.product_order_contents.splice(i, 1);
                }
                self.funcFactory.showNotification('Удалил товар', 'Успешно удали товаро ' + item.product.name + ' из реализации', true);
            } else {
                self.funcFactory.showNotification('Не смог удалить', r.data.errors, false);
            }
        })
    }
}

ViewDispatchOrderCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory', 'FileUploader', '$localStorage'];

angular.module('app.dispatch_orders').component('viewDispatchOrder', {
    controller: ViewDispatchOrderCtrl,
    controllerAs: 'viewDispatchOrderCtrl',
    templateUrl: '/app/dispatch_orders/components/view-dispatch-order/view-dispatch-order.html'
});
