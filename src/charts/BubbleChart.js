var BubbleData = kc.BubbleData = kity.createClass( 'BubbleData', {
    base: kc.Data,
    format: function ( colors, chart ) {
        return origin;
    }
} );
var BubbleChart = kc.BubbleChart = kity.createClass( 'BubbleChart', {
    base: kc.Chart,
    constructor: function ( target, param ) {
        this.callBase( target, param );
        //add chart elements
        this.addElement( "bubbles", new kc.ElementList() );
        this.addElement( "grid", new kc.ElementList() );
        this.setData( new kc.BubbleData() );
    },
    renderBubble: function () {

    },
    update: function () {
        this.renderBubble();
    }
} );