var HumanData = kc.HumanData = kity.createClass( 'HumanData', {
    base: kc.Data,
    format: function ( colors, chart ) {
        var list = [];
        var origin = this.origin;
        for ( var key in origin ) {
            var o = origin[ key ];
            o.x = 200 + ( list.length % 2 ) * 300;
            o.y = 50 + parseInt( list.length / 3 ) * 200;
            o.colors = colors;
            o.chart = chart;
            list.push( o );
        }
        return list;
    }
} );
var HumanChart = kc.HumanChart = kity.createClass( 'HumanChart', {
    base: kc.Chart,
    constructor: function ( target, param ) {
        this.callBase( target, param );
        //add chart elements
        this.addElement( "coffeecups", new kc.ElementList() );
        this.setData( new kc.HumanData() );
    },
    renderCoffee: function () {
        var coffeecups = this.getElement( 'coffeecups' );
        var data = this.getData().format( this.param.colors, this );
        coffeecups.update( {
            elementClass: kc.HumanBody,
            list: data,
            animateDuration: 1000
        } );
    },
    update: function () {
        this.renderCoffee();
    }
} );