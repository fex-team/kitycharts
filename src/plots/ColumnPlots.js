(function(){

var ColumnPlots = kc.ColumnPlots = kity.createClass( 'ColumnPlots', {
    base: kc.StickPlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
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

    getStickLabelParam : function( height, text, config ){
        return {
            at: 'bottom',
            color: config.plotOptions.label.text.color, 
            text: text,
            x : 0,
            y : -height - config.plotOptions.label.text.margin
        };
    }

} );


})();