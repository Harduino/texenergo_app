class HotKeysCtrl {
    constructor() {
        angular.element(window).on('keypress', event => {
            console.log("Event", event);
            console.log("keyCode", event.keyCode);
            console.log("charCode", event.charCode);
            console.log("target", event.target);
            const localName = ['input', 'textarea'];
            var keys = [105, 73, 1096, 1064]; // 105 'i'; 1096 'ш';
            if(keys.indexOf(event.keyCode) > -1 &&  localName.indexOf(event.target.localName) == -1){
                event.preventDefault();
                event.stopImmediatePropagation();
                angular.element("input#search-fld").focus();
            }
        });
    }
}

angular.module('app.layout').component('hotKeys', {
    controller: HotKeysCtrl
});
