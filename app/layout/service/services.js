/**
 * Created by Egor Lobanov on 05.12.15.
 */
(function(){

    var module = angular.module('app.layout');

    module.service('funcFactory', function(){
       this.showNotification = function(title, content, succes){
           var c = !succes && typeof content === 'object' ? Object.keys(content).map(function(item){
               return item + ' ' + content[item];
           }).join('\n') : content;
           $.smallBox({
               title: title,
               iconSmall: "fa fa-check fa-2x fadeInRight animated",
               content: '<i class="fa fa-edit"></i> <i>' + c + '</i>',
               color: succes ? '#739E73' : '#C46A69',
               timeout: 4000
           })
       };

       this.setPageTitle = function(title){
           angular.element('html head title').text(title);
       };

       this.getPercent = function(value, total){
           return ((value/total*100) || 0).toFixed(0);
       };

       this.getTinymceOptions = function(){
           return {
               plugins : 'advlist autolink link image lists charmap preview textcolor colorpicker code',
               toolbar1: 'insertfile undo redo | preview code | styleselect | bold italic | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
               language: 'ru',
               menubar:false
           };
       };
    });

    /**
     * Service send requests to server and return response into callback function
     */
    module.service('serverApi', [ '$http', function($http){

        //get data of two dashboard tables
        this.getDashboard = function(success, fail){
            $http.get('/back/dashboard').then(success, fail);
        };

        //get current list of searched data
        this.getSearch = function(page, query, config, success, fail){
            var encoded = encodeURIComponent(query);
            $http.get('/admin/search.json?term='+encoded+'&$skip='+(page*25)+'&$top=25', config || null).then(success, fail);
        };

        // get product info
        this.getProduct = function(id, success, fail){
            $http.get('/api/products/'+id +'.json').then(success, fail);
        };
        this.updateProduct = function(id, data, success, fail){
            $http.put('/api/products/' + id, data).then(success, fail);
        };
        this.getProductPartnerLogs = function(id, success, fail){
            $http.get('/api/products/'+id +'/partner_logs.json').then(success, fail);
        };
        this.deleteProductPartnerLog = function(product_id, log_id, success, fail){
            $http.delete('/api/products/'+product_id+'/partner_logs/' + log_id).then(success, fail);
        };
        this.getProductSupplierInfos = function(id, success, fail){
            $http.get('/api/products/'+id +'/supplier_infos.json').then(success, fail);
        };

        //Customer Orders
        this.getCustomerOrders = function(page, query, config, success, fail){
            var path = '/api/customer_orders?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.createCustomerOrder = function(data, success, fail){
            $http.post('/api/customer_orders', data).then(success, fail);
        };
        this.deleteCustomerOrder = function(order_id, success, fail){
            $http.delete('/api/customer_orders/' + order_id).then(success, fail)
        };
        this.getCustomerOrderDetails = function(id, success, fail){
            $http.get('/api/customer_orders/' + id).then(success, fail);
        };
        this.updateCustomerOrder = function(id, data, success, fail){
            $http.put('/api/customer_orders/' + id, data).then(success, fail);
        };
        this.addCustomerOrderProduct = function(id, data, success, fail){
            $http.post('/api/customer_orders/'+id+'/customer_order_contents', data).then(success, fail);
        };
        this.updateCustomerOrderProduct = function(order_id, product_id, data, success, fail){
            $http.put('/api/customer_orders/'+order_id+'/customer_order_contents/' + product_id, data).then(success, fail);
        };
        this.removeCustomerOrderProduct = function(order_id, product_id, success, fail){
            $http.delete('/api/customer_orders/'+order_id+'/customer_order_contents/' + product_id).then(success);
        };
        this.getCustomerOrderLogs = function(id, success, fail){
            $http.get('/api/customer_orders/' + id + '/logs').then(success, fail);
        };
        this.sendCustomerOrderInvoice = function(id, success, fail){
            $http.put('/api/customer_orders/' + id + '/send_invoice').then(success, fail);
        };
        this.recalculateCustomerOrder = function(id, success, fail){
            $http.get('/api/customer_orders/' + id + '/recalculate').then(success, fail);
        };
        this.updateStatusCustomerOrder = function(id, data, success, fail){
            $http.put('/api/customer_orders/' + id + '/update_status', data).then(success, fail);
        };
        this.updateCommandCustomerOrder = function(id, data, success, fail){
            $http.put('/api/customer_orders/' + id + '/update_command', data).then(success, fail);
        };
        this.getRelatedOrdersOfCustomer = function(id, success, fail){
            $http.get('/api/customer_orders/' + id + '/trace').then(success, fail);
        };
        
        // Quotataion Orders
        this.getQuotationOrders = function(page, query, config, success, fail){
            var path = '/api/quotation_orders?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };

        // Supplier Orders
        this.getSupplierOrders = function(page, query, config, success, fail){
            var path = '/api/supplier_orders?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.createSupplierOrder = function(data, success, fail){
            $http.post('/api/supplier_orders', data).then(success, fail);
        };
        this.deleteSupplierOrder = function(id, success, fail){
            $http.delete('/api/supplier_orders/'+id).then(success, fail);
        };
        this.getSupplierOrderDetails = function(id, success, fail){
            $http.get('/api/supplier_orders/' + id).then(success, fail);
        };
        this.updateSupplierOrder = function(id, data, success, fail){
            $http.put('/api/supplier_orders/' + id, data).then(success, fail);
        };
        this.addSupplierOrderProduct = function(id, data, success, fail){
            $http.post('/api/supplier_orders/'+id+'/supplier_order_contents', data).then(success, fail);
        };
        this.updateSupplierOrderProduct = function(order_id, product_id, data, success, fail){
            $http.put('/api/supplier_orders/'+order_id+'/supplier_order_contents/' + product_id, data).then(success, fail);
        };
        this.removeSupplierOrderProduct = function(order_id, product_id, success, fail){
            $http.delete('/api/supplier_orders/'+order_id+'/supplier_order_contents/' + product_id).then(success);
        };
        this.automaticallyCreateSupplierOrders = function(success, fail){
            $http.post('/api/supplier_orders/mass_make').then(success, fail);
        };
        this.updateStatusSupplierOrder = function(id, data, success, fail){
            $http.put('/api/supplier_orders/' + id + '/update_status', data).then(success, fail);
        };
//        this.createSupplierOrderContent = function(id, data, success, fail){
//            $http.put('/api/supplier_orders/' + id + '/supplier_order_contents', data).then(success, fail);
//        };

        // Products' catalogues
        this.getCatalogues = function(page, query, config, success, fail){
            var path = '/api/catalogues?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.getCatalogueDetails = function(id, success, fail){
            $http.get('/api/catalogues/' + id).then(success, fail);
        };
        this.updateCatalogue = function(id, data, success, fail){
            $http.put('/api/catalogues/' + id, data).then(success, fail);
        };
        this.deleteCatalogue = function(id, success, fail){
            $http.delete('/api/catalogues/' + id).then(success, fail)
        };

        // Manufacturers
        this.getManufacturers = function(page, query, config, success, fail){
            var path = '/api/manufacturers?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.getManufacturerDetails = function(id, success, fail){
            $http.get('/api/manufacturers/' + id).then(success, fail);
        };
        this.updateManufacturer = function(id, data, success, fail){
            $http.put('/api/manufacturers/' + id, data).then(success, fail);
        };
        this.deleteManufacturer = function(id, success, fail){
            $http.delete('/api/manufacturers/' + id).then(success, fail)
        };

        // PDF Catalogues
        this.getPdfCatalogues = function(page,query, config, success, fail){
            var path = '/api/pdf_catalogues?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.getPdfCatalogueDetails = function(id, success, fail){
            $http.get('/api/pdf_catalogues/' + id).then(success, fail);
        };
        this.deletePdfCatalogue = function(id, success, fail){
            $http.delete('/api/pdf_catalogues/' + id).then(success, fail);
        };

        // Входящие платежи
        this.getIncomingTransfers = function(page, query, config, success, fail){
            var path = '/api/incoming_transfers?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.createIncomingTransfer = function(data, success, fail){
            $http.post('/api/incoming_transfers', data).then(success, fail);
        };
        this.getIncomingTransferDetails = function(id, success, fail){
            $http.get('/api/incoming_transfers/' + id).then(success, fail);
        };
        this.appendIncomingTransferOrder = function(incoming_transfer_id, data, success, fail){
            $http.post('/api/incoming_transfers/'+incoming_transfer_id+'/money_to_orders', data).then(success, fail);
        };
        this.removeIncomingTransferOrder = function(incoming_transfer_id, order_id, success, fail){
            $http.delete('/api/incoming_transfers/'+incoming_transfer_id+'/money_to_orders/' + order_id).then(success, fail);
        };
        this.deleteIncomingTransfer = function(transfer_id, success, fail){
            $http.delete('/api/incoming_transfers/' + transfer_id).then(success, fail);
        };

        // Исходящие платежи
        this.getOutgoingTransfers = function(page, query, config, success, fail){
            var path = '/api/outgoing_transfers?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.createOutgoingTransfer = function(data, success, fail){
            $http.post('/api/outgoing_transfers', data).then(success, fail);
        };
        this.getOutgoingTransferDetails = function(id, success, fail){
            $http.get('/api/outgoing_transfers/' + id).then(success, fail);
        };
        this.appendOutgoingTransferOrder = function(outgoing_transfer_id, data, success, fail){
            $http.post('/api/outgoing_transfers/'+outgoing_transfer_id+'/outgoing_money_distributions', data).then(success, fail);
        };
        this.removeOutgoingTransferOrder = function(outgoing_transfer_id, order_id, success, fail){
            $http.delete('/api/outgoing_transfers/'+outgoing_transfer_id+'/outgoing_money_distributions/' + order_id).then(success, fail);
        };
        this.deleteOutgoingTransfer = function(transfer_id, success, fail){
            $http.delete('/api/outgoing_transfers/' + transfer_id).then(success, fail);
        };

        // Партнёры
        this.getPartners = function(page, query, config, success, fail){
            var path = '/api/partners?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.getPartnerDetails = function(id, success, fail){
            $http.get('/api/partners/' + id).then(success, fail);
        };
        this.updatePartner = function(id, data, success, fail){
            $http.put('/api/partners/' + id, data).then(success, fail);
        };
        this.createPartner = function(data, success, fail){
            $http.post('/api/partners/', data).then(success, fail);
        };

        // Представители партнёра
        this.createPerson = function(partner_id, data, success, fail){
            $http.post('/api/partners/' + partner_id + '/people', data).then(success, fail);
        };

        // Контакты
        this.getContacts = function(page, query, config, success, fail){
            var path = '/api/contacts?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.createContact = function(data, success, fail){
            $http.post('/api/contacts', data).then(success, fail);
        };
        this.getContactDetails = function(id, success, fail){
            $http.get('/api/contacts/' + id).then(success, fail);
        };
        this.updateContact = function(id, data, success, fail){
            $http.put('/api/contacts/' + id, data).then(success, fail);
        };

        // DispatchOrder
        this.getDispatchOrders = function(page, query, config, success, fail){
            var path = '/api/dispatch_orders?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.getDispatchOrderDetails = function(id, success, fail){
            $http.get('/api/dispatch_orders/' + id).then(success, fail);
        };
        this.updateDispatchOrder = function(id, data, success, fail){
            $http.put('/api/dispatch_orders/' + id, data).then(success, fail);
        };
        this.updateStatusDispatchOrder = function(id, data, success, fail){
            $http.put('/api/dispatch_orders/' + id + '/update_status', data).then(success, fail);
        };

        // ReceiveOrder
        this.getReceiveOrders = function(page, query, config, success, fail){
            var path = '/api/receive_orders?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.createReceiveOrder = function(data, success, fail){
            $http.post('/api/receive_orders/', data).then(success, fail);
        };
        this.getReceiveOrderDetails = function(id, success, fail){
            $http.get('/api/receive_orders/' + id).then(success, fail);
        };
        this.updateReceiveOrder = function(id, data, success, fail){
            $http.put('/api/receive_orders/' + id, data).then(success, fail);
        };
        this.getUnreceivedProducts = function(receive_order_id, query, config, success, fail){
            $http.get('/api/receive_orders/'+receive_order_id+'/unreceived_products?q=' + query, config).then(success, fail);
        };
        this.createReceiveOrderContents = function(receive_order_id, data, success, fail){
            $http.post('/api/receive_orders/'+receive_order_id+'/product_order_contents', data).then(success, fail);
        };
        this.updateReceiveOrderContents = function(receive_order_id, content_id, data, success, fail){
            $http.put('/api/receive_orders/'+receive_order_id+'/product_order_contents/'+content_id, data).then(success, fail);
        };
        this.deleteReceiveOrderContents = function(receive_order_id, content_id, success, fail){
            $http.delete('/api/receive_orders/'+receive_order_id+'/product_order_contents/' + content_id).then(success, fail)
        };
        this.deleteReceiveOrder = function(receive_order_id, success, fail){
            $http.delete('/api/receive_orders/' + receive_order_id).then(success, fail);
        };

        //Lead time
        this.getLeadTime = function(id, quantity, success, fail){
            var path = '/api/products/'+id+'/lead_time?quantity='+quantity;
            $http.get(path).then(success, fail);
        };
        //Files
        this.deleteFile = function(view, view_id, file_id, success, fail){
            $http.delete('/api/'+view+'/'+view_id+'/documents/' + file_id).then(success, fail);
        };
        this.deleteImage = function(view, view_id, file_id, success, fail){
            $http.delete('/api/'+view+'/'+view_id+'/image').then(success, fail);
        };

        // Pages
        this.getPages = function(page, query, config, success, fail){
            var path = '/api/pages?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        this.getPageDetails = function(id, success, fail){
            $http.get('/api/pages/' + id).then(success, fail);
        };

        // Articles
        this.getArticles = function(page, query, config, success, fail){
            var path = '/api/articles?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };

        // News
        this.getNews = function(page, query, config, success, fail){
            var path = '/api/news?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };

        this.signOut = function(){
            $http.delete('/users/sign_out').then(function(){
                window.location.reload();
            });
        };
        this.signIn = function(data, success, fail){
            $http.post('/users/sign_in', data).then(success, fail);
        };
        this.resetPassword = function(data, success, fail){
            $http.post('/users/password', data).then(success, fail);
        };
        this.getAbilities = function(success, fail){
            $http.get('/api/system_info').then(success, fail);
        };
    }]);

    module.factory('Abilities', ['serverApi', '$q', '$state', 'CanCan', 'User', function(serverApi, $q, $state, CanCan, User){
        var dfd = $q.defer(),
            s,
            p;

        var o = {
            get ready () {
                return dfd.promise;
            }
        };

        window.gon && setUserInfo();

        o.getGon = function(stateName, params){
            s = stateName;
            p = params;
            getInfo();
        };

        var getInfo = function(){
            serverApi.getAbilities(function(result){
                window.gon = result.data;
                CanCan.getAbility(window.gon);
                setUserInfo();
                dfd.resolve();
                $state.go(s, p);
            });
        };

        function setUserInfo(){
            User.username = window.gon.user.first_name + ' ' +window.gon.user.last_name;
            User.dfd.resolve();
        }
        return o;
    }]);

    /**
     * Subscribe to Rails Websocket server channels
     */
    module.service('CableApi', ['Abilities', function(Abilities) {
        var _this = this;

        window.gon ? getConsumer() : Abilities.ready.then(function(){
            getConsumer();
        });

        this.subscribe = function(channel, callbacks) {
            return _this.consumer.subscriptions.create(channel, callbacks);
        };

        function getConsumer (){
            _this.consumer = new Cable.Consumer(window.gon.websocket_url);
        }
    }]);
}());
