class CreateAssemblyOrderCtrl{
  constructor($uibModalInstance, serverApi, $q){
    this.$uibModalInstance = $uibModalInstance;
    this.serverApi = serverApi;
    this.cancel = $uibModalInstance.dismiss;
    this.$q = $q;
    this.newAssemblyOrder = this.clearAssemblyOrder();
  }

  createAssemblyOrder() {
    let newAssemblyOrder = this.newAssemblyOrder;

    delete newAssemblyOrder.partner;
    let self = this,
        defer = this.$q.defer();

    this.$uibModalInstance.close(defer.promise);

    this.serverApi.createAssemblyOrder(newAssemblyOrder, res => {
      defer.resolve(res);
    });
  }

  clearAssemblyOrder(){
    return {
      number: ''
    };
  }
}

CreateAssemblyOrderCtrl.$inject = [
  '$uibModalInstance',
  'serverApi',
  '$q'
];

angular.module('app.assembly_orders').controller('CreateAssemblyOrderCtrl', CreateAssemblyOrderCtrl);