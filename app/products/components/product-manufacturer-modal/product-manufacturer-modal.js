class ProductManufacturerModalCtrl {
    constructor(serverApi){
        this.serverApi = serverApi;
        // this.product = product;
        // this.data = {
        //     manufacturer: product
        // };
        // this.mSelectConfig = {
        //     dataMethod: serverApi.getManufacturers
        // };
        this.resolvez = angular.extend(
            {title: 'Выберите производителя', btnOkText: 'Выбрать', btnCancelText: 'Отмена'},
            this.resolve.config
        );
    }

    ok() {
        this.modalInstance.close();
    }

    cancel() {
        this.modalInstance.dismiss('cancel');
    }
}

ProductManufacturerModalCtrl.$inject = ['serverApi'];
angular.module('app.products').component('productManufacturerModal', {
    controller: ProductManufacturerModalCtrl,
    controllerAs: 'productManufacturerModalCtrl',
    bindings: {modalInstance: "<", resolve: "<"},
    templateUrl: 'app/products/components/product-manufacturer-modal/product-manufacturer-modal.html'
});