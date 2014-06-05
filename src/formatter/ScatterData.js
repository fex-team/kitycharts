kc.BaseScatterData = kity.createClass( 'BaseScatterData', {
    base: kc.Data,
    
    format: function () {
        var origin = this.origin,
            queryPath = kity.Utils.queryPath,
            minX = minY = 0,
            maxX = maxY = 100,
            minV = minV = 0;

        if( origin.series && origin.series.length > 0 ){
            var hasValue;
            var i, j, series = origin.series, entry,
                xArr = [], yArr = [], vArr = [], point;

            for( i = 0; i < series.length; i++ ){
                entry = series[ i ];
                entry.index = i;

                for( j = 0; j < entry.data.length; j++ ){
                    point = entry.data[ j ];
                    xArr.push( point[ 0 ] );
                    yArr.push( point[ 1 ] );
                    vArr.push( point[ 2 ] || 0 );
                    if( point.length >= 3 ){
                        hasValue = true;
                    }
                }

            }

            minX = Math.min.apply( [], xArr );
            maxX = Math.max.apply( [], xArr );
            minY = Math.min.apply( [], yArr );
            maxY = Math.max.apply( [], yArr );

            minV = Math.min.apply( [], vArr );
            maxV = Math.max.apply( [], vArr );
        }

        var result = {
                chart : origin.chart || { type : 'scatter' },
                xAxis :  queryPath( 'xAxis', origin ) || {},
                yAxis : queryPath( 'yAxis', origin ) || {},

                plotOptions : origin.plotOptions || {},

                series : origin.series || [],
                rangeX : [ minX, maxX ],
                rangeY : [ minY, maxY ]
            };

        result.valueRange = hasValue ? [ minV, maxV ] : null;
        return result;
    }
} );