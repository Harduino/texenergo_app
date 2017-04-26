class HotKeysCtrl {
    constructor($state) {
        var timeoutId;
        var buffer = '';
        var state = $state;

        var handleBuffer = () => {
            if( buffer === "i" || buffer === 'ш'){
                searchFocus();
            } else if ( buffer === "зз" || buffer === 'pp' ) {
                if(state.current.name !== 'app.customer_orders') state.go('app.customer_orders', {});
            } else if ( buffer === "пп" || buffer === 'gg' ) {
                if(state.current.name !== 'app.partners') state.go('app.partners', {});
            } else if ( buffer === "кк" || buffer === 'rr' ) {
                if(state.current.name !== 'app.contacts') state.go('app.contacts', {});
            } else if ( buffer === "дд" || buffer === 'll' ) {
                if(state.current.name !== 'app.incoming_transfers') state.go('app.incoming_transfers', {});
            } else if ( buffer === "н" || buffer === "y") {
                angular.element("i.fa.fa-plus").click();
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