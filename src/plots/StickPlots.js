(function(){

function sum( arr ){
    var sum = 0;
    for(var i = 0; i < arr.length; i++){
        sum += arr[i];
    }
    return sum;
}

var StickPlots = kc.StickPlots = kity.createClass( 'StickPlots', {
    base: kc.BasePlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
    },

    drawPlots: function ( coordinate, config ) {
        var oxy = coordinate,
            opt = config.plotOptions
            ;
        
        rotateAngle = this.rotateAngle;
        measureCategoryMethod = this.measureCategoryMethod;
        measureValueMethod = this.measureValueMethod;
        dir = this.stickDir;


        var xRuler = oxy.xRuler,
            yRuler = oxy.yRuler;

        var series = config.series,
            i, j, k, m, yPos, point, pointsArr = [], linesArr = [], dir,
            stickData,
            stick;

        var tmp, stickList = [], posCategory, posValues, posValue,
            width = opt[ this.chartType ].width, left = 0, bottom = 0,
            distance = config.chart.mirror? 0 : width + opt[ this.chartType ].margin,
            offset;

        var isPercentage = config.yAxis.percentage;

        for (i = 0; i < series.length; i++) {

            stick = series[ i ];
            // stick.positions = [];

            stickData = isPercentage ? series[i].percentage : series[i].data;

            // posValues = [];
            for (j = 0; j < stickData.length; j++) {

                tmp = stickData[ j ];

                
                posCategory = oxy[ measureCategoryMethod ]( j );

                left = (config.yAxis.groupCount - 1) * distance / 2;

                // posValues[ j ] = oxy.measureValueRange( tmp, this.valueAxis );
                posValue = oxy.measureValueRange( tmp, this.valueAxis );
                offset = isPercentage ? stick.percentageOffset : stick.offset;
                bottom = offset ? offset[ j ] : 0;

                stickParam = {
                    // dir: -1,
                    offset : oxy.measureValueRange( bottom, this.valueAxis ) * dir,
                    color  : this.getEntryColor( stick ),
                    width  : width,
                    height : posValue * dir,
                    rotate : rotateAngle,
                    bind : {
                        data : tmp,
                        indexInSeries : i,
                        indexInCategories : j
                    }
                };

                stickParam[ this.valueAxis ] = oxy[ measureValueMethod ]( 0 );
                stickParam[ this.categoryAxis ] = posCategory - left + distance * stick.groupIndex;

                stickList.unshift(stickParam);

                // stick.positions.push( {
                //         x : posCategory,
                //         y : posValues
                //     } );

            }
            
        }

        this.getPlotsElements().update({
            elementClass: kc.Bar,
            list: stickList,
            fx: config.enableAnimation
        });

        return config;
    }

} );


})();