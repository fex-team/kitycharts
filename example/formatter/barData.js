var BarData = kc.BarData = kity.createClass( 'BarData', {
    base: kc.Data,
    format: function () {
        var origin = this.origin;
        
        var all = [], tmp, num;
        for(var i in origin.series){
            tmp = origin.series[ i ]
            
            for (var j = 0; j < tmp.data.length; j++) {
                num = tmp.data[j];
                all = all.concat( kity.Utils.isArray( num )? num : [num] );
            }

        }

        var min = Math.min.apply([], all) || 0;
        var max = Math.max.apply([], all) || 100;

        var axisType = 'yAxis', rangeType = 'rangeX';
        if( origin.chart.type != 'bar' ){
            axisType = 'xAxis';
            rangeType = 'rangeY';
        }

        var result = {
            chart : origin.chart,
            series : origin.series || []
        };

        result[ axisType ] = {
                    categories : origin.xAxis && origin.xAxis.categories || []
                };

        result[ rangeType ] = [min, max];

        return result;
    }
} );