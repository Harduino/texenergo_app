class HotKeysCtrl {
    constructor($state) {
        var timeoutId;
        var buffer = '';

        // setTimeout(function() {}, 10);

        var state = $state;

        var handleBuffer = () => {
            console.log("buffer", buffer);
            if( buffer === "i" || buffer === 'ш'){
                searchFocus();
            } else if ( buffer === "зз" || buffer === 'pp' ) {
                if(state.current.name !== 'app.customer_orders') state.go('app.customer_orders', {});
            } else if ( buffer === "пп" || buffer === 'gg' ) {
                if(state.current.name !== 'app.partners') state.go('app.partners', {});
            } else if ( buffer === "кк" || buffer === 'rr' ) {
                if(state.current.name !== 'app.contacts') state.go('app.contacts', {});
            } else if (buffer.lastIndexOf('===') > 0) {
                console.log("I'd handle Bar Code scanner here");
            } else {
                buffer = '';
            }
        }

        var searchFocus = () => {
            angular.element("input#search-fld").focus();
        }

        angular.element(window).on('keydown', event => {
            console.log("key", event.key);
            const localName = ['input', 'textarea'];

            if(localName.indexOf(event.target.localName) == -1) {
                buffer += event.key;
                window.setTimeout(handleBuffer, 500);
            }
        });
    }
}

HotKeysCtrl.$inject = ['$state'];

angular.module('app.layout').component('hotKeys', {
    controller: HotKeysCtrl
});