class ViewManufacturerOrderCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
        this.manufacturerOrder = {};
        this.partnerSelectConfig = {dataMethod: serverApi.getPartners};

        this.$state = $state;
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;

        this.addableProduct = { product: {} }; // Stores a product that we are about to add.
        this.searchProductsList = []; // Stores filtered unreceived products
        this.inStockProducts = []; // Stores as of yet unreceived products

        let self = this;
        let getManufacturerOrderDetails = (subData, button, $event) => {
          if(button) button.disableOnLoad(true, $event);
          serverApi.getManufacturerOrderDetails($stateParams.id, (res) => {
            button && button.disableOnLoad(false, $event);
            self.manufacturerOrder = res.data;
            this.funcFactory.setPageTitle("Выписка из производства " + res.data.email);
            serverApi.getInStockProducts(r => {
              self.inStockProducts = r.data
            });
          }, () => {
            button && button.disableOnLoad(false, $event);
          });
        };

        this.visual = {
            navButtsOptions:[
                {type:'back', callback: () => $state.go('app.manufacturer_orders', {})},
                {type:'refresh', callback: getManufacturerOrderDetails}
            ],
            chartOptions: {barColor:'rgb(103,135,155)', scaleColor:false, lineWidth:5, lineCap:'circle', size:50},
            titles: 'Выписка из производства: ',
            navTableButts:[
                {
                    type: 'remove',
                    disabled: false,
                    callback: (item, button, $event) => {
                      button.disableOnLoad(true, $event);
                      serverApi.deleteManufacturerOrderContent(self.manufacturerOrder.id, item.data.id,
                        (res) => {
                          button.disableOnLoad(false, $event);
                          self.getRemovePositionHandler(item.data)(res);
                        }, () => {
                          button.disableOnLoad(false, $event);
                        });
                    }
                }
            ]
        };

        getManufacturerOrderDetails();

        this.funcFactory.setPageTitle("Контакт");
    }

    saveManufacturerOrder() {
        let self = this;
        let manufacturerOrder = self.manufacturerOrder;
        let data = {
            assembly_order: {
                number: manufacturerOrder.number
            }
        };

        this.serverApi.updateManufacturerOrder(manufacturerOrder.id, data, res => {
            if(!res.data.errors) {
                self.manufacturerOrder = res.data;
                self.funcFactory.showNotification("Успешно", 'Успешно отредактирован.', true);
            } else {
                self.funcFactory.showNotification('Не удалось отредактировать', res.data.errors);
            }
        });
    }

    goToPartner() {
        this.$state.go('app.partners.view', {id: (this.manufacturerOrder.partner.id || this.manufacturerOrder.partner._id)})
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
                    quantity: data.quantity
                };

                this.serverApi.createManufacturerOrderContent(this.manufacturerOrder.id, post, result => {
                    if(!result.data.errors) {
                        self.funcFactory.showNotification('Успешно', 'Продукт ' + data.product.name + ' успешно добвален', true);
                        self.manufacturerOrder.contents.push(angular.extend(data, result.data));
                        // self.calculateProductOrderContents();
                        self.clearProductForAppend();

                        for (let i = self.inStockProducts.length - 1; i >= 0; i--) {
                            let inStockProduct = self.inStockProducts[i];

                            if(inStockProduct.product.id === data.product.id) {
                                if (inStockProduct.quantity === data.quantity) {
                                    // Standard case. We are receiving all the pending quantity.
                                    self.inStockProducts.splice(i, 1);
                                    self.calculateUnreceivedProducts();
                                } else if (data.quantity < inStockProduct.unreceived) {
                                    // Partially receiving the quantities
                                    inStockProduct.quantity = inStockProduct.quantity - data.quantity;
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


    // Sets a product we are about to add to one in the item variable provided
    setAddableProduct(item) {
        this.addableProduct = jQuery.extend(true, {}, item);
        // Handling a case when unreceived quantity less than a quantity in customer order content entry.
        // The product at the line had been previously partially received.
        this.addableProduct.quantity = item.stock;
        this.addableProduct.total = 0;
        this.searchProductsList = [];
    }

    // Моя функция которая ищет среди товаров на складе, что лежат в памяти браузера
    productSearch() {
        let query = this.addableProduct.product.name;
        delete this.addableProduct.product.id; // Such that a user cannot input a name for a specific product_id

        if (query === undefined || query.length <= 1) {
            this.searchProductsList = [];
        } else {
            this.searchProductsList = this.inStockProducts.filter( item => {
                return (item.product.name.match(new RegExp(query, 'i')) !== null) ||
                    (item.product.article.match(new RegExp(query, 'i')) !== null);
            })
        }
    }

    // Удаляет товар из списка
    getRemovePositionHandler (item) {
        let self = this;
        return res => {
            if(res.data.errors) {
                self.funcFactory.showNotification('Не удалось удалить продукт', res.data.errors);
            } else {
                self.manufacturerOrder.contents.forEach( (row, index) => {
                    if(row.id === item.id) {
                        self.manufacturerOrder.contents.splice(index, 1);
                        self.funcFactory.showNotification('Продукт удален:', item.product.name, true);
                        return;
                    }
                });
            }
        };
    }

    // Обовляем у уже добавленного красного товара количество.
    // Сервер ответит либо новым количеством и новым итого, либо [если почему-то нельзя менять] старыми.
    updateManufacturerOrderComponent (item) {
        let self = this;
        let data = {
            assembly_order_content: {
                quantity: item.quantity
            }
        }

        self.serverApi.updateManufacturerOrderContent(self.manufacturerOrder.id, item.id, data, result => {
            if(!result.data.errors) {
                self.funcFactory.showNotification('Успешно', 'Продукт ' + item.product.name + ' успешно обновлен', true);
                item.quantity = result.data.quantity;
                item.total    = result.data.total;
            } else {
                self.funcFactory.showNotification('Не удалось добавить продукт ' + data.product.name,
                    result.data.errors, false);
            }
        });
    }
}

ViewManufacturerOrderCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];

angular.module('app.manufacturer_orders').component('viewManufacturerOrder', {
    controller: ViewManufacturerOrderCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/manufacturer_orders/components/view-manufacturer-order/view-manufacturer-order.html'
});