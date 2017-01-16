class ReplacementProductModalCtrl{
    constructor(serverApi){
        let self = this;
        this.serverApi = serverApi;

        this.pSelectConfig = {
            startPage: 0,
            dataMethod: self.serverApi.getSearch
        };
        this.selectedProduct = {};
        this.productsList = [];
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
    controllerAs: 'replacementProductModalCtrl',
    bindings: { modalInstance: "<", resolve: "<" }
});