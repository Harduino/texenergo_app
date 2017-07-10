class CreateCustomerOrderCtrl{
  constructor($uibModalInstance, serverApi, authService, $q){
    this.$uibModalInstance = $uibModalInstance;
    this.serverApi = serverApi;
    this.authService = authService;
    this.$q = $q;
    this.cancel = $uibModalInstance.dismiss;
    this.newOrderData = this.clearOrder();
  }

  addNewOrder() {
    if(this.newOrderData.partner) {
      this.newOrderData.partner_id = this.newOrderData.partner.id;
    }

    delete this.newOrderData.date;// delete forbidden property
    delete this.newOrderData.partner;
    let defer = this.$q.defer();

    this.$uibModalInstance.close({
      promise: defer.promise,
      data: this.newOrderData
    });

    this.serverApi.createCustomerOrder(this.newOrderData, r => {
      defer.resolve(r);
    });
  }

  clearOrder() {
    return  {
      date: new Date(),
      title:'',
      description:'',
      partner_id: '',
      partner: ((this.authService.profile.user_metadata && this.authService.profile.user_metadata.partner) || null),
      request_original:''
    };
  }
}

CreateCustomerOrderCtrl.$inject = [
  '$uibModalInstance',
  'serverApi',
  'authService',
  '$q'
];

angular.module('app.customer_orders')
.controller('CreateCustomerOrderCtrl', CreateCustomerOrderCtrl);
