/**
 * Created by Egor Lobanov on 04.10.16.
 */
(function(){

    var module = angular.module('app.api', []);
    /**
     * Service send requests to server and return response into callback function
     */
    module.service('serverApi', [ '$http', function($http){
        var o =  this;
        //get data of two dashboard tables
        o.getDashboard = function(success, fail){
            $http.get('/back/dashboard').then(success, fail);
        };

        //get current list of searched data
        o.getSearch = function(page, query, config, success, fail){
            var encoded = encodeURIComponent(query);
            $http.get('/api/products/search.json?term='+encoded+'&$skip='+(page*25)+'&$top=25', config || null).then(success, fail);
        };

        o.getSubSearch = function(query, config, success, fail){
            $http.get('/api/products/set_functor?term=' + query, config || null).then(success, fail);
        };
        o.getSearchFunctor = function(name, props, success, fail){
            $http.get('/api/products/search_functor?functor=' + name + props).then(success, fail);
        };

        // get product info
        o.getProduct = function(id, success, fail){
            $http.get('/api/products/'+id +'.json').then(success, fail);
        };
        o.updateProduct = function(id, data, success, fail){
            $http.put('/api/products/' + id, data).then(success, fail);
        };
        o.getProductPartnerLogs = function(id, success, fail){
            $http.get('/api/products/'+id +'/partner_logs.json').then(success, fail);
        };
        o.deleteProductPartnerLog = function(product_id, log_id, success, fail){
            $http.delete('/api/products/'+product_id+'/partner_logs/' + log_id).then(success, fail);
        };

        //Customer Orders
        o.getCustomerOrders = function(page, query, config, success, fail, partner_id){
            var path = '/api/customer_orders?page='+page + (query ? ('&q=' + query) : '') + (partner_id ? ('&partner_id=' + partner_id) : '');
            $http.get(path, config).then(success, fail);
        };
        o.createCustomerOrder = function(data, success, fail){
            $http.post('/api/customer_orders', data).then(success, fail);
        };
        o.deleteCustomerOrder = function(order_id, success, fail){
            $http.delete('/api/customer_orders/' + order_id).then(success, fail)
        };
        o.getCustomerOrderDetails = function(id, success, fail){
            $http.get('/api/customer_orders/' + id).then(success, fail);
        };
        o.updateCustomerOrder = function(id, data, success, fail){
            $http.put('/api/customer_orders/' + id, data).then(success, fail);
        };
        o.addCustomerOrderProduct = function(id, data, success, fail){
            $http.post('/api/customer_orders/'+id+'/customer_order_contents', data).then(success, fail);
        };
        o.updateCustomerOrderProduct = function(order_id, product_id, data, success, fail){
            $http.put('/api/customer_orders/'+order_id+'/customer_order_contents/' + product_id, data).then(success, fail);
        };
        o.removeCustomerOrderProduct = function(order_id, product_id, success, fail){
            $http.delete('/api/customer_orders/'+order_id+'/customer_order_contents/' + product_id).then(success);
        };
        o.getCustomerOrderLogs = function(id, success, fail){
            $http.get('/api/customer_orders/' + id + '/logs').then(success, fail);
        };
        o.sendCustomerOrderInvoice = function(id, success, fail){
            $http.put('/api/customer_orders/' + id + '/send_invoice').then(success, fail);
        };
        o.recalculateCustomerOrder = function(id, success, fail){
            $http.get('/api/customer_orders/' + id + '/recalculate').then(success, fail);
        };
        o.updateStatusCustomerOrder = function(id, data, success, fail){
            $http.put('/api/customer_orders/' + id + '/update_status', data).then(success, fail);
        };
        o.updateCommandCustomerOrder = function(id, data, success, fail){
            $http.put('/api/customer_orders/' + id + '/update_command', data).then(success, fail);
        };
        o.getRelatedOrdersOfCustomer = function(id, success, fail){
            $http.get('/api/customer_orders/' + id + '/trace').then(success, fail);
        };

        // Quotataion Orders
        o.getQuotationOrders = function(page, query, config, success, fail){
            var path = '/api/quotation_orders?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.createQuotationOrder = function(data, success, fail){
            $http.post('/api/quotation_orders/', data).then(success, fail);
        };
        o.deleteQuotationOrder = function(id, success, fail){
            $http.delete('/api/quotation_orders/'+id).then(success, fail);
        };
        o.getQuotationOrderDetails = function(id, success, fail){
            $http.get('/api/quotation_orders/' + id).then(success, fail);
        };
        o.updateQuotationOrder = function(id, data, success, fail){
            $http.put('/api/quotation_orders/' + id, data).then(success, fail);
        };

        // Supplier Orders
        o.getSupplierOrders = function(page, query, config, success, fail){
            var path = '/api/supplier_orders?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.createSupplierOrder = function(data, success, fail){
            $http.post('/api/supplier_orders', data).then(success, fail);
        };
        o.deleteSupplierOrder = function(id, success, fail){
            $http.delete('/api/supplier_orders/'+id).then(success, fail);
        };
        o.getSupplierOrderDetails = function(id, success, fail){
            $http.get('/api/supplier_orders/' + id).then(success, fail);
        };
        o.updateSupplierOrder = function(id, data, success, fail){
            $http.put('/api/supplier_orders/' + id, data).then(success, fail);
        };
        o.addSupplierOrderProduct = function(id, data, success, fail){
            $http.post('/api/supplier_orders/'+id+'/supplier_order_contents', data).then(success, fail);
        };
        o.updateSupplierOrderProduct = function(order_id, product_id, data, success, fail){
            $http.put('/api/supplier_orders/'+order_id+'/supplier_order_contents/' + product_id, data).then(success, fail);
        };
        o.removeSupplierOrderProduct = function(order_id, product_id, success, fail){
            $http.delete('/api/supplier_orders/'+order_id+'/supplier_order_contents/' + product_id).then(success);
        };
        o.automaticallyCreateSupplierOrders = function(success, fail){
            $http.post('/api/supplier_orders/mass_make').then(success, fail);
        };
        o.updateStatusSupplierOrder = function(id, data, success, fail){
            $http.put('/api/supplier_orders/' + id + '/update_status', data).then(success, fail);
        };
//        o.createSupplierOrderContent = function(id, data, success, fail){
//            $http.put('/api/supplier_orders/' + id + '/supplier_order_contents', data).then(success, fail);
//        };

        // Products' catalogues
        o.getCatalogues = function(page, query, config, success, fail){
            var path = '/api/catalogues?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.getCatalogueDetails = function(id, success, fail){
            $http.get('/api/catalogues/' + id).then(success, fail);
        };
        o.updateCatalogue = function(id, data, success, fail){
            $http.put('/api/catalogues/' + id, data).then(success, fail);
        };
        o.deleteCatalogue = function(id, success, fail){
            $http.delete('/api/catalogues/' + id).then(success, fail)
        };

        // Manufacturers
        o.getManufacturers = function(page, query, config, success, fail){
            var path = '/api/manufacturers?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.getManufacturerDetails = function(id, success, fail){
            $http.get('/api/manufacturers/' + id).then(success, fail);
        };
        o.updateManufacturer = function(id, data, success, fail){
            $http.put('/api/manufacturers/' + id, data).then(success, fail);
        };
        o.deleteManufacturer = function(id, success, fail){
            $http.delete('/api/manufacturers/' + id).then(success, fail)
        };

        // PDF Catalogues
        o.getPdfCatalogues = function(page,query, config, success, fail){
            var path = '/api/pdf_catalogues?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.getPdfCatalogueDetails = function(id, success, fail){
            $http.get('/api/pdf_catalogues/' + id).then(success, fail);
        };
        o.deletePdfCatalogue = function(id, success, fail){
            $http.delete('/api/pdf_catalogues/' + id).then(success, fail);
        };

        // Входящие платежи
        o.getIncomingTransfers = function(page, query, config, success, fail){
            var path = '/api/incoming_transfers?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.createIncomingTransfer = function(data, success, fail){
            $http.post('/api/incoming_transfers', data).then(success, fail);
        };
        o.getIncomingTransferDetails = function(id, success, fail){
            $http.get('/api/incoming_transfers/' + id).then(success, fail);
        };
        o.appendIncomingTransferOrder = function(incoming_transfer_id, data, success, fail){
            $http.post('/api/incoming_transfers/'+incoming_transfer_id+'/money_to_orders', data).then(success, fail);
        };
        o.removeIncomingTransferOrder = function(incoming_transfer_id, order_id, success, fail){
            $http.delete('/api/incoming_transfers/'+incoming_transfer_id+'/money_to_orders/' + order_id).then(success, fail);
        };
        o.deleteIncomingTransfer = function(transfer_id, success, fail){
            $http.delete('/api/incoming_transfers/' + transfer_id).then(success, fail);
        };
        o.getIncomingTransferLogs = function(id, success, fail){
            $http.get('/api/incoming_transfers/' + id + '/logs').then(success, fail);
        };

        // Исходящие платежи
        o.getOutgoingTransfers = function(page, query, config, success, fail, partner_id){
            var path = '/api/outgoing_transfers?page='+page + (query ? ('&q=' + query) : '') + (partner_id ? ('&partner_id=' + partner_id) : '');
            $http.get(path, config).then(success, fail);
        };
        o.createOutgoingTransfer = function(data, success, fail){
            $http.post('/api/outgoing_transfers', data).then(success, fail);
        };
        o.getOutgoingTransferDetails = function(id, success, fail){
            $http.get('/api/outgoing_transfers/' + id).then(success, fail);
        };
        o.appendOutgoingTransferOrder = function(outgoing_transfer_id, data, success, fail){
            $http.post('/api/outgoing_transfers/'+outgoing_transfer_id+'/outgoing_money_distributions', data).then(success, fail);
        };
        o.removeOutgoingTransferOrder = function(outgoing_transfer_id, order_id, success, fail){
            $http.delete('/api/outgoing_transfers/'+outgoing_transfer_id+'/outgoing_money_distributions/' + order_id).then(success, fail);
        };
        o.deleteOutgoingTransfer = function(transfer_id, success, fail){
            $http.delete('/api/outgoing_transfers/' + transfer_id).then(success, fail);
        };

        // Партнёры
        o.getPartners = function(page, query, config, success, fail){
            var path = '/api/partners?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.getPartnerDetails = function(id, success, fail){
            $http.get('/api/partners/' + id).then(success, fail);
        };
        o.updatePartner = function(id, data, success, fail){
            $http.put('/api/partners/' + id, data).then(success, fail);
        };
        o.createPartner = function(data, success, fail){
            $http.post('/api/partners/', data).then(success, fail);
        };
        o.getPartnerLogs = function(id, success, fail){
            $http.get('/api/partners/' + id + '/logs').then(success, fail);
        };

        // Представители партнёра
        o.createPerson = function(partner_id, data, success, fail, config){
            $http.post('/api/partners/' + partner_id + '/people', data, config).then(success, fail);
        };
        o.sendPersonFile = function(partner_id, person_id, data, success, fail){
            $http.put('/api/partners/'+partner_id+'/people/' + person_id, data, {
                transformRequest: angular.identity,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(success, fail);
        };

        o.createBankAccount = function(partner_id, data, success, fail){
            $http.post('/api/partners/' + partner_id + '/bank_accounts', data).then(success, fail);
        };

        o.updateBankAccount = function(partner_id, bank_account_id, data, success, fail){
            $http.put('/api/partners/' + partner_id + '/bank_accounts/' + bank_account_id, data).then(success, fail);
        };

        // Контакты
        o.getContacts = function(page, query, config, success, fail){
            var path = '/api/contacts?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.createContact = function(data, success, fail){
            $http.post('/api/contacts', data).then(success, fail);
        };
        o.getContactDetails = function(id, success, fail){
            $http.get('/api/contacts/' + id).then(success, fail);
        };
        o.updateContact = function(id, data, success, fail){
            $http.put('/api/contacts/' + id, data).then(success, fail);
        };

        // DispatchOrder
        o.getDispatchOrders = function(page, query, config, success, fail){
            var path = '/api/dispatch_orders?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.getDispatchOrderDetails = function(id, success, fail){
            $http.get('/api/dispatch_orders/' + id).then(success, fail);
        };
        o.updateDispatchOrder = function(id, data, success, fail){
            $http.put('/api/dispatch_orders/' + id, data).then(success, fail);
        };
        o.updateStatusDispatchOrder = function(id, data, success, fail){
            $http.put('/api/dispatch_orders/' + id + '/update_status', data).then(success, fail);
        };
        o.getDispatchOrderLogs = function(id, success, fail){
            $http.get('/api/dispatch_orders/' + id + '/logs').then(success, fail);
        };

        // ReceiveOrder
        o.getReceiveOrders = function(page, query, config, success, fail){
            var path = '/api/receive_orders?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.createReceiveOrder = function(data, success, fail){
            $http.post('/api/receive_orders/', data).then(success, fail);
        };
        o.getReceiveOrderDetails = function(id, success, fail){
            $http.get('/api/receive_orders/' + id).then(success, fail);
        };
        o.updateReceiveOrder = function(id, data, success, fail){
            $http.put('/api/receive_orders/' + id, data).then(success, fail);
        };
        o.getUnreceivedProducts = function(receive_order_id, query, config, success, fail){
            $http.get('/api/receive_orders/'+receive_order_id+'/unreceived_products?q=' + query, config).then(success, fail);
        };
        o.createReceiveOrderContents = function(receive_order_id, data, success, fail){
            $http.post('/api/receive_orders/'+receive_order_id+'/product_order_contents', data).then(success, fail);
        };
        o.updateReceiveOrderContents = function(receive_order_id, content_id, data, success, fail){
            $http.put('/api/receive_orders/'+receive_order_id+'/product_order_contents/'+content_id, data).then(success, fail);
        };
        o.deleteReceiveOrderContents = function(receive_order_id, content_id, success, fail){
            $http.delete('/api/receive_orders/'+receive_order_id+'/product_order_contents/' + content_id).then(success, fail)
        };
        o.deleteReceiveOrder = function(receive_order_id, success, fail){
            $http.delete('/api/receive_orders/' + receive_order_id).then(success, fail);
        };
        o.getReceiveOrderLogs = function(id, success, fail){
            $http.get('/api/receive_orders/' + id + '/logs').then(success, fail);
        };

        //Lead time
        o.getLeadTime = function(id, quantity, success, fail){
            var path = '/api/products/'+id+'/lead_time?quantity='+quantity;
            $http.get(path).then(success, fail);
        };
        //Files
        o.deleteFile = function(view, view_id, file_id, success, fail){
            $http.delete('/api/'+view+'/'+view_id+'/documents/' + file_id).then(success, fail);
        };
        o.deleteImage = function(view, view_id, file_id, success, fail){
            $http.delete('/api/'+view+'/'+view_id+'/image').then(success, fail);
        };

        o.signIn = function(data, success, fail){
            $http.post('/users/sign_in', data).then(success, fail);
        };
        o.resetPassword = function(data, success, fail){
            $http.post('/users/password', data).then(success, fail);
        };
        o.getAbilities = function(success, fail){
            $http.get('/api/system_info').then(success, fail);
        };

        // Logs
        o.getSearchLogs = function(page, query, config, success, fail){
            var path = '/api/logs/search?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };
        o.getParseLogs = function(page, query, config, success, fail){
            var path = '/api/logs/parse?page='+page + (query ? ('&q=' + query) : '');
            $http.get(path, config).then(success, fail);
        };

        o.validateViaDaData = function(type, data){
            var url = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/' + type;
            return $http.post(url, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept' : 'application/json',
                    'Authorization' : 'Token b9d1af0994c10d361ed1a354b0536f4f18ea099f'
                },
                withCredentials: false
            });
        }
    }]);
}());