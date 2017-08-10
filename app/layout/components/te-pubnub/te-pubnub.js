class PubnubCtrl {
    constructor($timeout, $element, Pubnub, funcFactory) {
        this.$timeout = $timeout;
        this.$element = $element;

        var profile = JSON.parse(localStorage.getItem("ngStorage-profile"));

        if (profile !== undefined && profile.user_metadata !== undefined && profile.user_metadata.contact_id !== undefined) {
          var pubnub_contact_id = JSON.parse(localStorage.getItem("ngStorage-profile")).user_metadata.contact_id;
          var pubnub_key = localStorage.getItem("ngStorage-id_token").replace(/\"/g,"");

          var pubnub_conf = {uuid: pubnub_contact_id, authKey: pubnub_key, ssl: true};
          if(window.location.host.match(/localhost|127\.0\.0\.1/) == null) {
              pubnub_conf.publishKey = 'pub-c-4a35e53c-9bb6-4467-921e-7f2148def73b';
              pubnub_conf.subscribeKey = 'sub-c-4acef304-d658-11e6-978a-02ee2ddab7fe';
          } else {
              pubnub_conf.publishKey = 'pub-c-e1fc03e0-e503-44c2-ba4f-045f476dfb83';
              pubnub_conf.subscribeKey = 'sub-c-8504018a-f369-11e6-889a-02ee2ddab7fe';
          }

          this.pubnub = Pubnub.init(pubnub_conf);

          Pubnub.addListener({
            status: function(statusEvent) {
                if (statusEvent.category === "PNConnectedCategory") {
                    console.log("pubnub addListener status");
                }
            },
            message: function(obj) {
              funcFactory.showNotification("Сообщение", obj.message.message, true);
              console.log("New Message!!", obj);
            },
            presence: function(presenceEvent) {
                console.log('presenceEvent.action', presenceEvent.action) // online status events
                console.log('presenceEvent.timestamp', presenceEvent.timestamp) // timestamp on the event is occurred
                console.log('presenceEvent.uuid', presenceEvent.uuid) // uuid of the user
                console.log('presenceEvent.occupancy', presenceEvent.occupancy) // current number of users online
            }
          });

          Pubnub.subscribe({
              channels: [ 'notifications-' +  pubnub_contact_id ],
              withPresence: true
          });
        }
    }
}

PubnubCtrl.$inject = ['$timeout', '$element', 'Pubnub', 'funcFactory'];

angular.module('app.layout').component('tePubnub', {
    controller: PubnubCtrl,
    controllerAs: 'pubnubCtrl',
    transclude : true
});


// // Pubnub.publish({
// //     channel: 'myChannel',
// //     message: 'Hello!'
// //   }, function(status, response){
// //         console.log("publish status", status);
// //         console.log("publish response", response);
// // });
