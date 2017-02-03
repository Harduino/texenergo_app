

angular.module('teBuffer', []).component('teCopyToBuffer', {
    controller: function($timeout, $element) {
        var input = $element.find(".te-c-buffer-input"), btn = $element.find('.te-c-to-buffer-ico');
        var self = this;
        this.showTooltip = false;

        var copy = function() {
            var value = "",
                vals = $element.find("[te-buffer-value='']"),
                length = vals.length;

            vals.each(function(index, item){
                var name = item.nodeName,
                    method = (name === "INPUT" || name === "TEXTAREA" ? 'val' : 'html'),
                    separator = (length>1 && index !== length-1 ? " | " : "");

                value += $(item)[method]() + separator;
            });

            input.val(value);
            input.focus();
            input.select();

            document.execCommand('copy');
            btn.addClass('animate');
            self.showTooltip = true;

            $timeout(function(){
                btn.removeClass('animate');
                self.showTooltip = false;
            }, 820);
        };

        btn.click(copy);
        this.$onDestroy = () => btn.off("click", copy);
    },
    controllerAs: '$ctrl',
    templateUrl: 'app/layout/components/te-copy-to-buffer/te-copy-to-buffer.html',
    transclude : true
});
