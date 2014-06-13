(function(){

var BarChart = kc.BarChart = kity.createClass( 'BarChart', {
    base: kc.StickChart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        var plots = this.addElement( 'plots', new kc.BarPlots() );
        this.setPlots( plots );
    },

    getTooltipPosition : function( val ){

        return {
            x : this.coordinate.measurePointX( val ),
            y : this.currentStick.param.y
        };
        
    }

} );


})();