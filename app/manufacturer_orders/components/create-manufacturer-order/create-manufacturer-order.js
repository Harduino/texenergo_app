class CreateManufacturerOrderCtrl{
  constructor($uibModalInstance, serverApi, $q){
    this.$uibModalInstance = $uibModalInstance;
    this.serverApi = serverApi;
    this.cancel = $uibModalInstance.dismiss;
    this.$q = $q;
    this.newManufacturerOrder = this.clearManufacturerOrder();
  }

  createManufacturerOrder() {
    let newManufacturerOrder = this.newManufacturerOrder;

    delete newManufacturerOrder.partner;
    let self = this,
        defer = this.$q.defer();

    this.$uibModalInstance.close(defer.promise);

    this.serverApi.createManufacturerOrder(newManufacturerOrder, res => {
      defer.resolve(res);
    });
  }

  clearManufacturerOrder(){
    return {
      number: ''
    };
  }
}

CreateManufacturerOrderCtrl.$inject = [
  '$uibModalInstance',
  'serverApi',
  '$q'
];

angular.module('app.manufacturer_orders').controller('CreateManufacturerOrderCtrl', CreateManufacturerOrderCtrl);