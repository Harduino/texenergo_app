class CopyToBufferCtrl {
    constructor($timeout, $element) {
        this.$timeout = $timeout;
        this.$element = $element;

        this.input = $element.find('.te-c-buffer-input');
        this.showTooltip = false;
    }

    copy () {
        let copiedText = '', values = this.$element.find('[te-buffer-value=""]');
        let self = this;

        values.each((index, item) => {
            let separator = index !== (values.length - 1) ? ' | ' : '';
            copiedText += $(item)[['INPUT', 'TEXTAREA'].indexOf(item.nodeName) === -1 ? 'html' : 'val']() + separator;
        });

        this.input.val(copiedText);
        this.input.focus();
        this.input.select();

        document.execCommand('copy');
        this.showTooltip = true;
        this.$timeout(() => self.showTooltip = false, 820);
    }
}

CopyToBufferCtrl.$inject = ['$timeout', '$element'];

angular.module('teBuffer', []).component('teCopyToBuffer', {
    controller: CopyToBufferCtrl,
    controllerAs: '$ctrl',
    templateUrl: 'app/layout/components/te-copy-to-buffer/te-copy-to-buffer.html',
    transclude : true
});
