(function(){

var ScatterPlots = kc.ScatterPlots = kity.createClass( 'ScatterPlots', {
    base: kc.BasePlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
    },

    plotsAttrsInit : function(){
        this.chartType = 'scatter';
    },

    drawPlots: function ( coordinate, config ) {
        var series = config.series,
            opt = config.plotOptions.scatter,
            i, j, entry,
            valPoint, posPoint,
            circleList = [];

        var rMax = opt.radiusRange[1],
            rMin = opt.radiusRange[0];

        var vr = config.valueRange, same;
        var tmp = vr && vr[1] - vr[0];
        if( vr && tmp == 0 ){
            same = true;
        }

        if( vr && !same){
            ratio = ( rMax - rMin ) / tmp;
        }
        

        for( i = 0; i < series.length; i++ ){
            entry = series[ i ];

            for( j = 0; j < entry.data.length; j++ ){
                valPoint = entry.data[ j ];
                posPoint = coordinate.measurePoint( valPoint );
                var bind = {
                    x : valPoint[ 0 ],
                    y : valPoint[ 1 ],
                    label : entry.name,
                    position : {
                        x : posPoint[0],
                        y : posPoint[1]
                    }
                };

                var radius = opt.radius;
                if( vr ){
                    bind.value = valPoint[2] || 0;
                    if(same){
                        radius = ( rMax + rMin ) / 2; //如果值全部一样，则取中间值
                    }else{
                        radius = ratio * bind.value + rMin;
                    }
                }

                circleList.push({
                    strokeColor : '#888',
                    strokeWidth : 0,
                    color: this.getEntryColor( entry ),
                    radius: radius,
                    fxEasing: 'ease',
                    x : posPoint[0],
                    y : posPoint[1],
                    bind : bind
                });
            }
        }

        this.getPlotsElements().update({
            elementClass: kc.CircleDot,
            list: circleList,
            fx: config.enableAnimation
        });

    }

} );


})();