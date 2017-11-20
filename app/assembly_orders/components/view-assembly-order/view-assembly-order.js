class ViewAssemblyOrderCtrl {
    constructor($state, $stateParams, serverApi, funcFactory) {
        this.assemblyOrder = {};
        this.partnerSelectConfig = {dataMethod: serverApi.getPartners};

        this.$state = $state;
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;

        this.addableComponent = { product: {} }; // Stores a product that we are about to add.
        this.searchProductsList = []; // Stores filtered unreceived products
        this.inStockProducts = []; // Stores as of yet unreceived products
        this.productForAppend = null;
        this.pSelectConfig = {startPage: 0, dataMethod: serverApi.getSearch};

        let self = this;
        let getAssemblyOrderDetails = (subData, button, $event) => {
          if(button) button.disableOnLoad(true, $event);
          serverApi.getAssemblyOrderDetails($stateParams.id, (res) => {
            button && button.disableOnLoad(false, $event);
            self.assemblyOrder = res.data;
            this.funcFactory.setPageTitle("Выписка из производства " + res.data.number);
            self.calculateTotal();
            serverApi.getInStockProducts(r => {
              self.inStockProducts = r.data
            });
          }, () => {
            button && button.disableOnLoad(false, $event);
          });
        };

        this.visual = {
            navButtsOptions:[
                {type:'back', callback: () => $state.go('app.assembly_orders', {})},
                {type:'refresh', callback: getAssemblyOrderDetails},
                {
                    type: 'confirm_order',
                    callback: (subdata, item, $event) => {
                        let data = {assembly_order: {event: item.event}};

                        item.disableOnLoad(true, $event);
                        serverApi.updateStatusAssemblyOrder($stateParams.id, data, result => {
                            if(result.status == 200 && !result.data.errors) {
                                funcFactory.showNotification('Успешно', 'Удалось ' + item.name.toLowerCase() + ' заказ',
                                    true);
                                self.dispatchOrder = result.data;
                            } else {
                                funcFactory.showNotification('Не удалось ' + item.name.toLowerCase() + ' заказ',
                                    result.data.errors);
                            }
                            item.disableOnLoad(false, $event);
                        }, () => {
                          item.disableOnLoad(false, $event);
                        });
                    }
                },
            ],
            chartOptions: {barColor:'rgb(103,135,155)', scaleColor:false, lineWidth:5, lineCap:'circle', size:50},
            titles: 'Выписка из производства: ',
            navTableButts:[
                {
                    type: 'remove',
                    disabled: false,
                    callback: (item, button, $event) => {
                      button.disableOnLoad(true, $event);
                      serverApi.deleteAssemblyOrderContent(self.assemblyOrder.id, item.data.id,
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

        getAssemblyOrderDetails();

        this.funcFactory.setPageTitle("Контакт");
    }

    calculateTotal() {
      let self = this;
      let x = 0;

      self.assemblyOrder.components.forEach(item => {
          x += item.total;
      });

      self.assemblyOrder.total = x;
    }

    saveAssemblyOrder() {
        let self = this;
        let assemblyOrder = self.assemblyOrder;
        let data = {
            assembly_order: {
                number: assemblyOrder.number
            }
        };

        this.serverApi.updateAssemblyOrder(assemblyOrder.id, data, res => {
            if(!res.data.errors) {
                self.assemblyOrder = res.data;
                self.funcFactory.showNotification("Успешно", 'Успешно отредактирован.', true);
            } else {
                self.funcFactory.showNotification('Не удалось отредактировать', res.data.errors);
            }
        });
    }

    goToPartner() {
        this.$state.go('app.partners.view', {id: (this.assemblyOrder.partner.id || this.assemblyOrder.partner._id)})
    }

    // Reset the product we are about to add;
    clearProductForAppend() {
        this.addableComponent = { product: {} };
    }

    addProduct(event) {
        if(!event || (event.keyCode == 13)) {
            let p = this.productForAppend;

            if(p && p.id) {
                let self = this;

                let post = {
                    product_id: p.id,
                    quantity: p.quantity,
                    is_product: true
                };

                this.serverApi.createAssemblyOrderContent(this.assemblyOrder.id, post, result => {
                    if(!result.data.errors) {
                        self.funcFactory.showNotification('Успешно', 'Продукт ' + p.name + ' успешно добвален', true);
                        self.assemblyOrder.products.push(angular.extend(p, result.data));
                        this.productForAppend = null;
                    } else {
                        self.funcFactory.showNotification('Не удалось добавить продукт ' + p.name, result.data.errors, false);
                    }
                });
            } else {
                this.funcFactory.showNotification('У товара нет ID', 'У введённого товара нет ID. Обычно такое происходит тогда, когда Вы самостоятельно ввели товар вместо выбора из списка.', false);
            }
        }
    }    

    // Implements adding a component
    addComponent(event) {
      if(!event || (event.keyCode == 13)) {
        let p = this.addableComponent.product;

        if(p && p.id) {  
          let self = this;
          let data = this.addableComponent;

          let post = {
              product_id: data.product.id,
              quantity: data.quantity
          };

          this.serverApi.createAssemblyOrderContent(this.assemblyOrder.id, post, result => {
              if(!result.data.errors) {
                  self.funcFactory.showNotification('Успешно', 'Продукт ' + data.product.name + ' успешно добвален', true);
                  self.assemblyOrder.components.push(angular.extend(data, result.data));
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
        } else {
            this.funcFactory.showNotification('У товара нет ID', 'У введённого товара нет ID. Обычно такое происходит тогда, когда Вы самостоятельно ввели товар вместо выбора из списка.', false);
        }
      }
    };


    // Sets a product we are about to add to one in the item variable provided
    setAddableComponent(item) {
        this.addableComponent = jQuery.extend(true, {}, item);
        // Handling a case when unreceived quantity less than a quantity in customer order content entry.
        // The product at the line had been previously partially received.
        this.addableComponent.quantity = item.stock;
        this.addableComponent.total = 0;
        this.searchProductsList = [];
    }

    // Моя функция которая ищет среди товаров на складе, что лежат в памяти браузера
    productSearch() {
        let query = this.addableComponent.product.name;
        delete this.addableComponent.product.id; // Such that a user cannot input a name for a specific product_id

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
                self.assemblyOrder.components.forEach( (row, index) => {
                    if(row.id === item.id) {
                        self.assemblyOrder.components.splice(index, 1);
                        self.funcFactory.showNotification('Продукт удален:', item.product.name, true);
                        return;
                    }
                });
            }
        };
    }

    // Обовляем у уже добавленного красного товара количество.
    // Сервер ответит либо новым количеством и новым итого, либо [если почему-то нельзя менять] старыми.
    updateAssemblyOrderComponent (item) {
        let self = this;
        let data = {
            assembly_order_content: {
                quantity: item.quantity
            }
        }

        self.serverApi.updateAssemblyOrderContent(self.assemblyOrder.id, item.id, data, result => {
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

ViewAssemblyOrderCtrl.$inject = ['$state', '$stateParams', 'serverApi', 'funcFactory'];

angular.module('app.assembly_orders').component('viewAssemblyOrder', {
    controller: ViewAssemblyOrderCtrl,
    controllerAs: '$ctrl',
    templateUrl: '/app/assembly_orders/components/view-assembly-order/view-assembly-order.html'
});
