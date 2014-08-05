var CoffeeData = kc.CoffeeData = kity.createClass( 'CoffeeData', {
    base: kc.Data,
    format: function ( colors, chart ) {
        var list = [];
        var origin = this.origin;
        for ( var key in origin ) {
            var o = origin[ key ];
            o.x = 20 + ( list.length % 3 ) * 300;
            o.y = 50 + parseInt( list.length / 3 ) * 200;
            o.colors = colors;
            o.chart = chart;
            list.push( o );
        }
        return list;
    }
} );
var CoffeeChart = kc.CoffeeChart = kity.createClass( 'CoffeeChart', {
    base: kc.Chart,
    constructor: function ( target, param ) {
        this.callBase( target, param );
        //add chart elements
        this.addElement( "coffeecups", new kc.ElementList() );
        this.setData( new kc.CoffeeData() );
    },
    renderCoffee: function () {
        var coffeecups = this.getElement( 'coffeecups' );
        var data = this.getData().format( this.param.colors, this );
        coffeecups.update( {
            elementClass: kc.CoffeeCup,
            list: data,
            animateDuration: 1000
        } );
    },
    update: function () {
        this.renderCoffee();
    }
} );