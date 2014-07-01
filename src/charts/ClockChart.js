var ClockData = kc.ClockData = kity.createClass( 'ClockData', {
    base: kc.Data
} );
var ClockChart = kc.ClockChart = kity.createClass( 'ClockChart', {
    base: kc.Chart,
    constructor: function ( target, param ) {
        this.callBase( target, param );
        //add chart elements
        this.addElement( "clocks", new kc.ElementList() );
        this.setData( new kc.ClockData() );
    },
    renderClocks: function () {
        var clocks = this.getElement( "clocks" );
        var data = this.getData().format();
        var list = data.list;
        console.log( data );
        var colors = this.param.colors;
        for ( var i = 0; i < list.length; i++ ) {
            list[ i ].color = colors[ 0 ];
        }
        clocks.update( {
            elementClass: kc.Clock,
            list: list,
            animateDuration: 1000
        } );
    },
    update: function () {
        this.renderClocks();
    }
} );