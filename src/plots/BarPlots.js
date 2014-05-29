(function(){

var BarPlots = kc.BarPlots = kity.createClass( 'BarPlots', {
    base: kc.StickPlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
    },

    plotsAttrsInit : function(){
        this.chartType = 'bar';
        this.stickDir = 1;
        this.rotateAngle = 90;
        this.categoryAxis = 'y';
        this.valueAxis = 'x';
        this.measureCategoryMethod = 'measurePointY';
        this.measureValueMethod    = 'measurePointX';
    },


} );


})();