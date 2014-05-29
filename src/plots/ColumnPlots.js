(function(){

var ColumnPlots = kc.ColumnPlots = kity.createClass( 'ColumnPlots', {
    base: kc.StickPlots,

    constructor: function ( coordinate, config ) {
        
        this.callBase();

    },

    plotsAttrsInit : function(){
        this.chartType = 'column';
        this.stickDir = -1;
        this.rotateAngle = 0;
        this.categoryAxis = 'x';
        this.valueAxis = 'y';
        this.measureCategoryMethod = 'measurePointX';
        this.measureValueMethod    = 'measurePointY';
    },


} );


})();