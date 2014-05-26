(function(){

var LinePlots = kc.LinePlots = kity.createClass( 'LinePlots', {
    base: kc.LinearPlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
        this.chartType = 'line'; // 这一行争取去掉
        
        this.addElement( 'multilines', new kc.ElementList() );
        this.addElement( 'lineDots', new kc.ElementList() );
    },

    // registerUpdateRules: function () {
    //     return kity.Utils.extend( this.callBase(), {
    //         drawPlots: [ 'coordinate', 'config' ]
    //     } );
    // },
    // update: function ( config ) {
    //     var config = config || this.config;
    //     return this.drawLines( config );
    // },


} );


})();