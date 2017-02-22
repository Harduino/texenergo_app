class ReplacementProductModalCtrl{
    constructor(serverApi) {
        this.pSelectConfig = {startPage: 0, dataMethod: serverApi.getSearch};
    }

    ok () {
        this.modalInstance.close(this.resolve.product);
    }

    cancel () {
        this.modalInstance.dismiss('cancel');
    }
}

ReplacementProductModalCtrl.$inject = ['serverApi'];

angular.module('app.products').component('replacementProductModal', {
    bindings: {modalInstance: '<', resolve: '<'},
    controller: ReplacementProductModalCtrl,
    controllerAs: '$ctrl',
    templateUrl: 'app/products/components/replacement-product-modal/replacement-product-modal.html'
});
