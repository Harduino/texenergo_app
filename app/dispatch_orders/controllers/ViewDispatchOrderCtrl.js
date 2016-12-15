angular.module('app.dispatch_orders').controller('ViewDispatchOrderCtrl', ['$state', '$stateParams', 'serverApi', 'funcFactory', 'FileUploader', '$http', '$localStorage', function($state, $stateParams, serverApi, funcFactory, FileUploader, $http, $localStorage){
    var self = this;
    this.dispatchOrder = {};

    this.visual = {
        navButtsOptions:[
            {
                type: 'back',
                callback: function() {
                    $state.go('app.dispatch_orders',{});
                }
            },
            {
                type: 'upd_form_pdf',
                callback: function() {
                    openPdf('');
                }
            },
            {
                type: 'label_pdf',
                callback: function() {
                    openPdf('/label');
                }
            },
            {
                type: 'packing_list_pdf',
                callback: function() {
                    openPdf('/packing_list');
                }
            },
            {
                type: 'confirm_order',
                callback: function(subdata, item) {
                    var data = {
                        dispatch_order:{
                            event: item.event
                        }
                    };
                    serverApi.updateStatusDispatchOrder($stateParams.id, data, function(result){
                        if(result.status == 200 && !result.data.errors) {
                            funcFactory.showNotification("Успешно", 'Удалось ' + item.name.toLowerCase() + ' заказ', true);
                            self.dispatchOrder = result.data;
                        } else {
                            funcFactory.showNotification("Не удалось " + item.name.toLowerCase() + ' заказ', result.data.errors);
                        }
                    });
                }
            },
            {
                type: 'refresh',
                callback: getDispatchOrderDetails
            },
            {
                type: 'logs',
                callback: function() {
                    $state.go('app.dispatch_orders.view.logs', {});
                }
            }
        ],
        chartOptions: {
            barColor:'rgb(103,135,155)',
            scaleColor:false,
            lineWidth:5,
            lineCap:'circle',
            size:50
        },
        showFileModal: angular.noop,
        titles: 'Списание: №'
    };

    this.amontPercent = 0;
    this.dispatchedPercent = 0;

    this.uploader = new FileUploader({
        withCredentials: true,
        queueLimit: 5,
        onCompleteItem: function(fileItem, response, status) {
            if(status === 200){
                self.dispatchOrder.documents.push(response);
                self.uploader.clearQueue();
                funcFactory.showNotification("Успешно", 'Приложил документ.', true);
            } else {
                funcFactory.showNotification('Не удалось приложить документ', response.errors);
            }
        }
    });

    function setFileUploadOptions(dispatch_order){
        self.uploader.url = window.APP_ENV.TEXENERGO_COM_API_HTTP_BASE_URL + '/dispatch_order/' + dispatch_order.id +
            '/documents';
    }

    getDispatchOrderDetails();

    function getDispatchOrderDetails(){
        serverApi.getDispatchOrderDetails($stateParams.id, function(result){

            var dispatchOrder = self.dispatchOrder = result.data;
            self.amontPercent = funcFactory.getPercent(dispatchOrder.paid_amount, dispatchOrder.total);
            self.dispatchedPercent = funcFactory.getPercent(dispatchOrder.dispatched_amount, dispatchOrder.total);

            setFileUploadOptions(dispatchOrder);
        });
    }

    function openPdf(path) {
        window.open(window.APP_ENV.TEXENERGO_COM_API_HTTP_BASE_URL + '/dispatch_orders/' + self.dispatchOrder.id + path +
            '.pdf?token=' + $localStorage.id_token, '_blank');
    }

    this.saveChosenPerson = function(){
        var data = {dispatch_order: {person_id: self.dispatchOrder.chosenPersonId}};

        serverApi.updateDispatchOrder(self.dispatchOrder.id, data, function(result){
            if(!result.data.errors){
                self.dispatchOrder = result.data;
                funcFactory.showNotification("Успешно", 'Человек выбран.',true);
            } else {
                funcFactory.showNotification('Ошибка при выборе человека', result.data.errors);
            }
        });
    };
}]);
