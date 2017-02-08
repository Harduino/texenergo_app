/**
 * Created by Egor Lobanov on 05.12.15.
 */
(function(){

    var module = angular.module('app.layout');

    module.service('funcFactory', function(){
       this.showNotification = function(title, content, success){
           var c = !success && typeof content === 'object' ? Object.keys(content).map(function(item){
               return item + ' ' + content[item];
           }).join('\n') : content;
           $.smallBox({
               title: title,
               iconSmall: "fa fa-check fa-2x fadeInRight animated",
               content: '<i class="fa fa-edit"></i> <i>' + c + '</i>',
               color: success ? '#739E73' : '#C46A69',
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
               language_url: 'assets/js/langs/ru.js',
               menubar:false
           };
       };
    });

    module.factory('Abilities', ['serverApi', '$q', '$state', 'User', function(serverApi, $q, $state, User){
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
    module.service('CableApi', ['authService', '$q', function(authService, $q) {
        var _this = this,
              ws = window.APP_ENV.API_WS_BASE_URL,
              defer = $q.defer();

        Object.defineProperty(this, "ready", { 
              get: function () { 
                  return  defer.promise;
              } 
        }); 

        authService.tokenPromise.then((token)=>{
          if (token !== undefined) ws = ws + '?token=' + token;
          _this.consumer = new ActionCable.Consumer(ws);


          _this.subscribe = function(channel, callbacks) {
              return _this.consumer.subscriptions.create(channel, callbacks);
          };

          /**
           * Getting consumer subscription by channel name
           * @param channelName
           * @returns {*} - ActionCable subscription, or null if subscription not found.
           */
          _this.getSubscription = function(channelName){
              //find subscription
              const subscriptions = _this.consumer.subscriptions.subscriptions;

              for(var i= 0, il = subscriptions.length, subscription; i<il; i++){
                  subscription = subscriptions[i];

                  //check channel name into json string (identifier)
                  if(JSON.parse(subscription.identifier).channel === channelName){
                      return subscription;
                  }
              }
              return null;
          }
          //resolve promise when CableApi inited
          defer.resolve(_this);
        });
    }]);
}());
