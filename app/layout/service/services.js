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
            _this.consumer = new ActionCable.Consumer(window.gon.websocket_url);
        }
    }]);
}());
