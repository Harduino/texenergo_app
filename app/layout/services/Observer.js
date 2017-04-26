class Observer {
    constructor() {
        this.subscribers = {};
    }

    notify(eventName, data) {
        if(this.subscribers.hasOwnProperty(eventName)) {
            this.subscribers[eventName].forEach(callback => callback(data));
        }
    }

    subscribe (eventName, callback) {
        if(!this.subscribers.hasOwnProperty(eventName)) {
            this.subscribers[eventName] = [];
        }

        this.subscribers[eventName].push(callback);
    }

    unsubscribe (eventName, callback) {
        if(this.subscribers.hasOwnProperty(eventName) && (this.subscribers[eventName].indexOf(callback) !== -1)) {
            this.subscribers[eventName].splice(this.subscribers[eventName].indexOf(callback), 1);
        }
    }
}

angular.module('app.layout').service('Observer', Observer);
