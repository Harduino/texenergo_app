class ViewReceiveOrderCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
        let self = this;
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;

        this.receiveOrder = {};
        this.addableProduct = { product: {} }; // Stores a product that we are about to add.
        this.searchProductsList = []; // Stores filtered unreceived products
        this.unreceivedProducts = []; // Stores as of yet unreceived products
        this.visual = {
            navButtsOptions:[
                {type: 'back', callback: () => $state.go('app.receive_orders', {})},
                {type: 'logs', callback: () => $state.go('app.receive_orders.view.logs', {})},
                {
                    type: 'refresh',
                    callback: () => serverApi.getReceiveOrderDetails($stateParams.id, r => self.receiveOrder = r.data)
                }
            ],
            // Пока не используется
            chartOptions: {
                barColor: 'rgb(103,135,155)',
                scaleColor: false,
                lineWidth: 5,
                lineCap: 'circle',
                size: 50
            },
            titles: 'Поступление: №',
            summaryPanelOptions: {
                appendTo: 'body',
                scroll: true,
                containment: 'body'
            }
        };

        this.goToPartner = () => $state.go('app.partners.view', {id: (this.receiveOrder.partner.id || this.receiveOrder.partner._id)});
        
        // Load ReceiverOrder details and any other required details.
        serverApi.getReceiveOrderDetails($stateParams.id, result => {
            self.receiveOrder = result.data;

            // Это что за две строчки?
            self.amountPercent = funcFactory.getPercent(self.receiveOrder.paid_amount, self.receiveOrder.total);
            self.receivedPercent = funcFactory.getPercent(self.receiveOrder.receivedPercent, self.receiveOrder.total);
        });
        // Queries and returns all yet unreceived products.
        serverApi.getUnreceivedProducts($stateParams.id, '', {}, r => self.unreceivedProducts = r.data);
    }

    // Reset the product we are about to add;
    clearProductForAppend() {
        this.addableProduct = { product: {} };
    }

    // Implements adding a product
    addProduct(event) {
        let p = this.addableProduct.product;

        if(p && p.id) {
            if(!event || (event.keyCode == 13)) {
                let self = this;
                let data = this.addableProduct;

                let post = {
                    product_id: data.product.id,
                    quantity: data.quantity,
                    country: data.country || '',
                    gtd: data.gtd || '',
                    total_w_vat: data.total,
                    supplier_order_id: data.supplier_order.id
                };

                this.serverApi.createReceiveOrderContents(this.receiveOrder.id, post, result => {
                    if(!result.data.errors) {
                        self.funcFactory.showNotification('Успешно', 'Продукт ' + data.product.name + ' успешно добвален', true);
                        self.receiveOrder.product_order_contents.push(angular.extend(data, result.data));
                        self.clearProductForAppend();

                        for (let i = self.unreceivedProducts.length - 1; i >= 0; i--) {
                            let unreceived_row = self.unreceivedProducts[i];

                            if(unreceived_row.product.id === data.product.id && unreceived_row.supplier_order_id === data.supplier_order_id) {
                                if (unreceived_row.unreceived === data.quantity) {
                                    // Standard case. We are receiving all the pending quantity.
                                    self.unreceivedProducts.splice(i, 1);
                                } else if (data.quantity < unreceived_row.unreceived) {
                                    // Partially receiving the quantities
                                    unreceived_row.unreceived = unreceived_row.unreceived - data.quantity;
                                }
                                // Pending a case when a customer order has got two rows of the product received as a single row.
                            }
                        }

                        angular.element('#vro_prod_select').focus();
                    } else {
                        self.funcFactory.showNotification('Не удалось добавить продукт ' + data.product.name,
                            result.data.errors, false);
                    }
                });
            }
        } else {
            this.funcFactory.showNotification('У товара нет ID', 'У введённого товара нет ID. Обычно такое происходит тогда, когда Вы самостоятельно ввели товар вместо выбора из списка.', false);
        }
    };

    // Remove the product from the Receive Order
    deleteProduct(item) {
        let self = this;
        let receiveOrder = this.receiveOrder;

        this.serverApi.deleteReceiveOrderContents(receiveOrder.id, item.id, result => {
            if(!result.data.errors) {
                self.funcFactory.showNotification('Успешно', 'Продукт ' + item.product.name + ' успешно удален', true);
                for (let i = 0; i < self.receiveOrder.product_order_contents.length; i++) {
                    let c = self.receiveOrder.product_order_contents[i];
                    if(c.id === item.id) self.receiveOrder.product_order_contents.splice(i, 1);
                }
            } else {
                self.funcFactory.showNotification('Не удалось удалить продукт ' + item.product.name, result.data.errors);
            }
        });
    }

    // Update an already entered product
    updateContentsProduct(row) {
        let self = this;
        let data = row.data;
        let put = {
            quantity: data.quantity || 0,
            country: data.country || '',
            gtd: data.gtd || '',
            total_w_vat: data.total || 0
        };

        this.serverApi.updateReceiveOrderContents(this.receiveOrder.id, data.id, put, result => {
            if(!result.data.errors){
                let r = self.receiveOrder.product_order_contents;
                r[row.index] = angular.extend(r[row.index], result.data);
                self.funcFactory.showNotification('Успешно', 'Продукт ' + data.product.name + ' успешно обновлен', true);
            } else {
                self.funcFactory.showNotification('Не удалось обновить продукт ' + data.product.name, result.data.errors);
            }
        })
    };

    // Sets a product we are about to add to one in the item variable provided
    setAddableProduct(item) {
        this.addableProduct = jQuery.extend(true, {}, item);
        // Handling a case when unreceived quantity less than a quantity in customer order content entry.
        // The product at the line had been previously partially received.
        this.addableProduct.quantity = item.unreceived;
        this.addableProduct.total = item.total / item.quantity * item.unreceived;
        this.searchProductsList = [];
    }

    // Search for a product among unreceived products. We assume you can add a product iff it is amongst unreceived.
    productSearch() {
        let query = this.addableProduct.product.name;
        delete this.addableProduct.product.id; // Such that a user cannot input a name for a specific product_id

        if (query === undefined || query.length <= 1) {
            this.searchProductsList = [];
        } else {
            this.searchProductsList = this.unreceivedProducts.filter( item => {
                return (item.product.name.match(new RegExp(query, 'i')) !== null) ||
                    (item.product.article.match(new RegExp(query, 'i')) !== null);
            })
        }
    }
}

ViewReceiveOrderCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];

angular.module('app.receive_orders').component('viewReceiveOrder', {
    controller: ViewReceiveOrderCtrl,
    controllerAs: '$ctrl',
    templateUrl: 'app/receive_orders/components/view-receive-order/view-receive-order.html'
});
