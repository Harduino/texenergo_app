class CopyToBufferCtrl {
    constructor($timeout, $element) {
        let self = this;
        this.$timeout = $timeout;
        this.$element = $element;

        this.input = $element.find('.te-c-buffer-input');
        this.btn = $element.find('.te-c-to-buffer-ico');
        this.showTooltip = false;

        this.btn.click(this.copy.bind(this));
        this.$onDestroy = () => self.btn.off('click', this.copy.bind(this));
    }

    copy () {
        let value = '', values = this.$element.find('[te-buffer-value=""]');
        let self = this;

        values.each((index, item) => {
            let separator = index !== (values.length - 1) ? ' | ' : '';
            value += $(item)[['INPUT', 'TEXTAREA'].indexOf(item.nodeName) === -1 ? 'html' : 'val']() + separator;
        });

        this.input.val(value);
        this.input.focus();
        this.input.select();

        document.execCommand('copy');
        this.btn.addClass('animate');
        this.showTooltip = true;

        this.$timeout(() => {
            self.btn.removeClass('animate');
            self.showTooltip = false;
        }, 820);
    }
}

CopyToBufferCtrl.$inject = ['$timeout', '$element'];

angular.module('teBuffer', []).component('teCopyToBuffer', {
    controller: CopyToBufferCtrl,
    controllerAs: '$ctrl',
    templateUrl: 'app/layout/components/te-copy-to-buffer/te-copy-to-buffer.html',
    transclude : true
});
