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

        var _passport_scan_file,
            _person_photo_file;
        
        sc.addNewPerson = function(){
            var data  = {
                person: sc.newPerson
            };

            serverApi.createPerson(sc.partner.id, data, function(result){
                if(!result.data.errors){
                    funcFactory.showNotification('Представитель успешно добавлен', '', true);
                    sc.partner.people.push(result.data);
                    sc.clearPerson();
                    sendPersonFiles(result.data.id);
                } else {
                    funcFactory.showNotification('Не удалось создать представителя', result.data.errors);
                }
            });
        };

        function sendPersonFiles(person_id){
            var send = function(fieldName, file){
                var fd = new FormData();
                fd.append(fieldName, file);
                serverApi.sendPersonFile(sc.partner.id, person_id, fd, function(result){
                    console.log(result);
                });
            };
            _passport_scan_file && send('passport_scan_file', _passport_scan_file);
            _person_photo_file && send('person_photo_file', _person_photo_file);
        }

        sc.appendScanHandler = function(file){
            sc.passport_scan=file.name;
            _passport_scan_file = file;
        };

        sc.appendPersonPhotoHandler = function(file){
            sc.person_photo=file.name;
            _person_photo_file = file;
        };
    }]);
}());
