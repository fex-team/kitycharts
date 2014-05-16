var BarData = kc.BarData = kity.createClass( 'BarData', {
    base: kc.Data,
    format: function () {
        var origin = this.origin;

        var min = 0;
        var max = 100;

        var all = [], tmp, num, tmpNumArr, tmpTotal,
            i, j, k;
        for(i in origin.series){
            tmp = origin.series[ i ]
            tmp.originData = kity.Utils.copy( tmp.data );


            for (j = 0; j < tmp.data.length; j++) {
                num = tmp.data[ j ];
                tmpNumArr = kity.Utils.isArray( num )? num : [ num ];
                tmpTotal = kc.Tools.arraySum( tmpNumArr );
                all.push( tmpTotal );

                if( origin.chart.percentage ){
                    for (k = 0; k < tmpNumArr.length; k++) {
                        tmpNumArr[ k ] = tmpNumArr[ k ]/tmpTotal * 100;
                    }
                }

            }
        }

        if( !origin.chart.percentage ){
            min = Math.min.apply( [], all );
            max = Math.max.apply( [], all );
        }

        var result = {
            chart : origin.chart,
            series : origin.series || []
        };

        var axisType, rangeType;
        if( origin.chart.type == 'bar' ){
            axisType = 'yAxis';
            rangeType = 'rangeX';
            result.xAxis = origin.yAxis;
        }else{
            axisType = 'xAxis';
            rangeType = 'rangeY';
            result.yAxis = origin.yAxis;
        }

        result[ axisType ] = {
                    categories : origin.xAxis && origin.xAxis.categories || [],
                    step : origin.xAxis && origin.xAxis.step || 1
                };

        result[ rangeType ] = [min, max];

        return result;
    }
} );