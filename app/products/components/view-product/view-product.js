class ViewProductCtrl {
    constructor($stateParams, serverApi, $state, funcFactory, $uibModal, FileUploader, $localStorage) {
        let self = this;
        this.serverApi = serverApi;
        this.funcFactory = funcFactory;
        this.localStoraj = $localStorage;
        this.uibModal = $uibModal;

        this.product = {};
        this.manufacturerSelectConfig = {dataMethod: serverApi.getManufacturers};

        this.visual = {
            navButtsOptions:[
                {
                    type: 'logs',
                    callback: () => $state.go('app.product.logs', {})
                },
                {
                    type: 'add',
                    callback: () => {
                        $uibModal.open({
                            component: 'productToCustomerOrderModal',
                            windowClass: 'eqo-centred-modal',
                            resolve: {product : self.product}
                        });
                    }
                }
            ]
        };

        this.tinymceOptions = funcFactory.getTinymceOptions();
        this.data = {quantity: 0};

        this.uploader = new FileUploader({
            queueLimit: 1,
            onCompleteItem: (fileItem, response, status) => {
                if(status === 200) {
                    self.product.image_url = response.image_url;
                    self.uploader.clearQueue();
                    funcFactory.showNotification("Успешно", 'Изменил картинку.', true);
                } else {
                    funcFactory.showNotification('Не удалось изменить картинку', result.data.errors, false);
                }
            }
        });

        if (window.products !== undefined && window.products[$stateParams.id] !== undefined) {
            this.product = window.products[$stateParams.id];
            this.funcFactory.setPageTitle(this.product.article + " " + this.product.name);
            this.uploader.url = 'https://v2.texenergo.com/api/products/' + this.product.id + '/image?token=' + $localStorage.id_token;
        } else {
            serverApi.getProduct($stateParams.id, r => {
                self.product = r.data;
                self.funcFactory.setPageTitle(self.product.article + " " + self.product.name);
                self.uploader.url = 'https://v2.texenergo.com/api/products/' + self.product.id + '/image?token=' + $localStorage.id_token;
                if(!window.products) window.products = {};
                window.products[$stateParams.id] = r.data;

                var componentsCost = self.product.components.reduce((s,v) => {
                    return s + v.product.price * v.quantity
                }, 0);

                self.componentMarkupCorr = self.product.price / componentsCost;
            });
        }
    }

    saveProduct() {
        let self = this, product = this.product,
            data = {
                product:{
                    name: product.name_raw,
                    description: product.description,
                    article: product.article,
                    manufacturer_id: product.manufacturer.id,
                    catalogue_ids: (product.catalogues || []).map(i => { return i.id }),
                    unit: product.unit.selected
                }
            };

        this.serverApi.updateProduct(product.id, data, r => {
            if(!r.data.errors) {
                product.name = r.data.name;
                product.name_raw = r.data.name_raw;
                self.funcFactory.showNotification("Успешно", 'Товар ' + product.name + ' успешно отредактирована.', true);
            } else {
                self.funcFactory.showNotification('Не удалось отредактировать категорию ' + product.name, r.data.errors);
            }
        });
    }

    goToManufacturer() {
        this.state.go('app.manufacturers.view', {id: this.product.manufacturer.id});
    }

    // Persists a product obsolete by sending request to server
    makeObsolete(enable, r_id) {
        let self = this, product = this.product,
            data = {
                product: {
                    obsolete: {
                        // Historically this one is called 'enable' on server side.
                        // Could handle and translate from 'flag' on server side, but leaving on client side until the issue escalates
                        enable: enable,
                        replacement_id :r_id
                    }
                }
            };

        this.serverApi.updateProduct(product.id, data, result => {
            if(!result.data.errors) {
                self.product = result.data;
                self.funcFactory.showNotification("Успешно", 'Товар ' + product.name + ' успешно отредактирована.', true);
            } else {
                self.funcFactory.showNotification('Не удалось отредактировать категорию ' + product.name, result.data.errors);
            }
        });
    }

    selectReplacementProduct() {
        let self = this;

        this.uibModal.open({
            component: 'replacementProductModal',
            windowClass: 'eqo-centred-modal',
            resolve: {product : self.product.obsolete}
        }).result.then(selectedProduct => self.makeObsolete(true, selectedProduct._id || selectedProduct.id));
    }

    /**
    * @description Add set of products to customer order
    */
    addSet() {
      let self = this;

      let appendToOrder = (order_id, product, quantity) => {
        self.serverApi.addCustomerOrderProduct(order_id,
        {
          product_id: product.id,
          quantity
        },
        result => {
          if(result.data.errors) {
            self.funcFactory.showNotification('Не удалось добавить продукт', result.data.errors);
          } else {
            self.funcFactory.showNotification('Успешно', `${product.name} добавлен в заказ`, true);
          }
        });
      }

      this.uibModal.open({
        component: 'productToCustomerOrderModal',
        windowClass: 'eqo-centred-modal',
        resolve: {product : this.product, withoutUpdate: true}
      }).result.then((data) => {

        let {order_id, quantity} = data;

        for(let component of self.product.components){
          appendToOrder(
            order_id,
            component.product,
            Math.ceil(component.quantity) * quantity
          );
        }
      });
    }

    componentShareCost(component) {
        let self = this;
        return (component.product.price * component.quantity / self.product.price * 100) * self.componentMarkupCorr;
    }
}

ViewProductCtrl.$inject = ['$stateParams', 'serverApi', '$state', 'funcFactory', '$uibModal', 'FileUploader', '$localStorage'];

angular.module('app.products').component('viewProduct', {
    controller: ViewProductCtrl,
    controllerAs: '$ctrl',
    templateUrl: 'app/products/components/view-product/view-product.html'
});
