class CreateCustomerOrderCtrl{
  constructor($uibModalInstance, serverApi, authService, $q, partner){
    this.$uibModalInstance = $uibModalInstance;
    this.serverApi = serverApi;
    this.authService = authService;
    this.$q = $q;
    this.partner = partner,
    this.cancel = $uibModalInstance.dismiss;
    this.newOrderData = this.clearOrder();
    this.partnerSelectConfig = {dataMethod: serverApi.getPartners};
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
      partner: this.partner.data,
      request_original:''
    };
  }
}

CreateCustomerOrderCtrl.$inject = [
  '$uibModalInstance',
  'serverApi',
  'authService',
  '$q',
  'partner'
];

angular.module('app.customer_orders').controller('CreateCustomerOrderCtrl', CreateCustomerOrderCtrl);