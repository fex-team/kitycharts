var ChartElement = kc.ChartElement = kity.createClass('ChartElement', {
    constructor: function () {
        this.canvas = new kity.Group();
        this.visible = true;
    },
    setVisible: function(value) {
        if(value !== undefined) {
            this.visible = value;
            this.canvas.setStyle({
                display: value ? 'inline' : 'none'
            });
        }
    },
    isVisible: function() {
        return this.visible;
    }
});