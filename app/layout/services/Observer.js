class Observer {
    constructor() {
        this.subscribers = {};
    }

    unsubscribe (eventName, callback) {
        if(this.subscribers.hasOwnProperty(eventName) && (this.subscribers[eventName].indexOf(callback) !== -1)) {
            this.subscribers[eventName].splice(this.subscribers[eventName].indexOf(callback), 1);
        }
    }

    subscribe (eventName, callback) {
        if(!this.subscribers.hasOwnProperty(eventName)) {
            this.subscribers[eventName] = [];
        }

        this.subscribers[eventName].push(callback);
    }

    notify(eventName, data) {
        if(this.subscribers.hasOwnProperty(eventName)) {
            this.subscribers[eventName].forEach(function(callback) {
                callback(data);
            });
        }
    }
}

angular.module('app.layout').service('Observer', Observer);
