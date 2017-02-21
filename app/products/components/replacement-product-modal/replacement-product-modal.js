class ReplacementProductModalCtrl{
    constructor(serverApi) {
        this.pSelectConfig = {startPage: 0, dataMethod: serverApi.getSearch};
        this.selectedProduct = {};
    }

    ok () {
        this.modalInstance.close();
    }

    cancel () {
        this.modalInstance.dismiss('cancel');
    }
}

ReplacementProductModalCtrl.$inject = ['serverApi'];

angular.module('app.products').component('replacementProductModal', {
    controller: ReplacementProductModalCtrl,
    controllerAs: '$ctrl',
    bindings: {modalInstance: '<', resolve: '<'}
});
