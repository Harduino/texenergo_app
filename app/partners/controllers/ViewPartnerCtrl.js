/**
 * Created by Egor Lobanov on 17.11.15.
 * Контроллер страницы "Партнер"
 */
(function(){

    angular.module('app.partners').controller('ViewPartnerCtrl',['$scope', '$state', 'serverApi', '$stateParams', 'funcFactory', '$http', function($scope, $state, serverApi, $stateParams, funcFactory, $http){
        var sc = $scope;
        
        sc.partner = {};
        
        sc.visual = {
            navButtsOptions:[{type:'back', callback:returnBack},{type:'edit', callback:editPartner}, {type:'files'}],
            chartOptions: {
                barColor:'rgb(103,135,155)',
                scaleColor:false,
                lineWidth:5,
                lineCap:'circle',
                size:50
            },
            titles: window.gon.index.Partner.objectTitle + ': '
        };
        
        sc.newPerson = {
        };

        serverApi.getPartnerDetails($stateParams.id, function(result){
            console.log(result.data);
            sc.partner = result.data;
            
            serverApi.getCustomerOrders(1, "-"+sc.partner.prefix+"-", {}, function(result){
                console.log("CustomerOrders: ", result);
                sc.partner.customerOrders = result.data;
            });
            
            serverApi.getDispatchOrders(1, "-"+sc.partner.prefix+"-", {}, function(result){
                console.log("DispatchOrders: ", result);
                sc.partner.dispatchOrders = result.data;
            });
        });
        
        function returnBack(){
            $state.go('app.partners',{});
        }
        
        function editPartner(){
            $state.go('app.partners.view.edit',{});
        }
        
        sc.createPerson = function(){
            $('#createPersonModal').modal('show');
        };
        
        sc.clearPerson = function(){
            sc.newPerson = {};
            sc.passport_scan = sc.person_photo= "";
        };
        
        sc.addNewPerson = function(){
//            var data  = {
//                person: sc.newPerson
//            };

            var fd = new FormData();
            fd.append('file', sc.newPerson.passport_scan);
            //delete sc.newPerson.passport_scan;
            fd.append('person', sc.newPerson);

            serverApi.createPerson(sc.partner.id, fd, function(result){
                if(!result.data.errors){
                    funcFactory.showNotification('Представитель успешно добавлен', '', true);
                    sc.partner.people.push(result.data);
                    sc.clearNewPartnerData();
                } else {
                    funcFactory.showNotification('Не удалось создать представителя', result.data.errors);
                }
            }, angular.noop, {
                transformRequest: angular.identity,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        };

        sc.appendScanHandler = function(file){
            sc.passport_scan=file.name;
            sc.newPerson.passport_scan = fd;
        };

        sc.appendPersonPhotoHandler = function(file){
            sc.person_photo=file.name;
            sc.newPerson.person_photo = file;
        };
    }]);
}());
