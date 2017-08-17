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
            this.uploader.url = 'https://v2.texenergo.com/api/products/' + this.product.id + '/image?token=' + $localStorage.id_token;
        } else {
            serverApi.getProduct($stateParams.id, r => {
                self.product = r.data;
                self.funcFactory.setPageTitle(self.product.article + " " + self.product.name);
                self.uploader.url = 'https://v2.texenergo.com/api/products/' + self.product.id + '/image?token=' + $localStorage.id_token;
                if(!window.products) window.products = {};
                window.products[$stateParams.id] = r.data;
            });
        }
    }

    getLeadTime(id, quantity, event) {
        if(event.keyCode == 13) {
            let self = this;

            this.serverApi.getLeadTime(id, quantity, r => {
                let info = r.data.lead_time_info;

                if (window.yaCounter7987369 != undefined) {
                    let yaParams = {};

                    if (self.localStoraj && self.localStoraj.profile && self.localStoraj.profile.user_metadata) {
                        yaParams.user_email = self.localStoraj.profile.user_metadata.email;
                        yaParams.user_id = self.localStoraj.profile.user_metadata.contact_id;
                    }

                    yaCounter7987369.reachGoal("SeLeadTime", yaParams);
                }

                let header, msg, flag;
                if (info.obsolete) {
                    header = "Снят с производства";
                    msg = "";
                    flag = false;
                } else if (info.message) {
                    header = "Сообщение";
                    msg = info.message;
                    flag = false;
                } else {
                    header = "Успешно";
                    msg = 'Тариф: ' + info.price_tarif + " руб., Скидка: " + info.discount + "%, Закупка: " + info.cost + " руб., Срок поставки: " + info.delivery_date + ", Мин. кол-во: " + info.quantity_min + ", Остаток у Шнейдера: " + info.schneider_stock
                    flag = true;
                }

                if(info.schneider_stock !== undefined){
                  let p = _.findWhere(self.product.supplier_infos, {supplier_code: 'schneider'});

                  p && (p.quantity = info.schneider_stock);
                }

                self.funcFactory.showNotification(header, msg, flag);
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
}

ViewProductCtrl.$inject = ['$stateParams', 'serverApi', '$state', 'funcFactory', '$uibModal', 'FileUploader', '$localStorage'];

angular.module('app.products').component('viewProduct', {
    controller: ViewProductCtrl,
    controllerAs: '$ctrl',
    templateUrl: 'app/products/components/view-product/view-product.html'
});
