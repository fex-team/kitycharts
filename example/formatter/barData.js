var BarData = kc.BarData = kity.createClass( 'BarData', {
    base: kc.Data,
    format: function () {
        var origin = this.origin;
        
        var all = [], tmp, num;
        for(var i in origin.series){
            tmp = origin.series[ i ]
            
            for (var j = 0; j < tmp.data.length; j++) {
                num = tmp.data[j];
                all.push( sum( kity.Utils.isArray( num )? num : [num] ) );
            }
        }

        function sum(arr){
            var sum = 0;
            for(var i = 0; i < arr.length; i++){
                sum += arr[i];
            }
            return sum;
        }

        var min = Math.min.apply([], all) || 0;
        var max = Math.max.apply([], all) || 100;

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