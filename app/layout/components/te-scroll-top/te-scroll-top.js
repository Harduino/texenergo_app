class ScrollTopCtrl {
    constructor() {
        this.block = $(this.selector || window);
        this.block.scroll(this.setVisibility.bind(this));

        let self = this;
        this.$onDestroy = () => self.block.off('scroll', self.setVisibility.bind(self));
    }

    scrollTop () {
        this.block.scrollTop(0);
    }

    setVisibility () {
        this.visible = this.block.scrollTop() >= 2 * this.block.outerHeight();
    }
}

angular.module('app.layout').component('teScrollTop', {
    bindings: {selector: '@', buttonClass: '@'},
    controller: ScrollTopCtrl,
    controllerAs: '$ctrl',
    templateUrl: 'app/layout/components/te-scroll-top/te-scroll-top.html'
});
