/**
 * Created by Egor Lobanov on 02.10.16.
 * Focus on product search using i as hotkey, if user currently not in the input.
 */
(function(){
    angular.module('app.layout').directive('hotSearchKey', [function(){
        return {
            restrict: "A",
            link: function(sc, element){

                const localName = ['input', 'textarea'];
                var keys = [105, 73, 1096, 1064];

                angular.element(window).on('keypress', keyPress);

                function keyPress (event){
                    if(keys.indexOf(event.keyCode) > -1 &&  localName.indexOf(event.target.localName) == -1){
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        element.focus();
                    }
                }

                sc.$on('$destroy', function(){
                    angular.element(window).off('keypress', keyPress);
                });
            }
        }
    }]);
}());