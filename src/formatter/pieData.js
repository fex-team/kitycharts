kc.PieData = kity.createClass( 'PieData', {
    base: kc.Data,
    
    format: function () {
        var origin = this.origin,
            queryPath = kity.Utils.queryPath;

        var i, j, k, all = [], data;
        var series = origin.series;

        if( series ){

            for( i = 0; i < series.length; i++ ){
                series[ i ].index = i;
                getPercent( series[ i ].data );
            }
            
        }
        
        function getPercent( arr ){
            var i, sum = 0, arr, percent = [], angle = [], offset = [];

            for( i = 0; i < arr.length; i++ ){
                offset.push( sum );
                sum += ( arr[ i ].value || arr[ i ] );
            }

            var val, tmp, obj, offsetAngle = 0;
            for( i = 0; i < arr.length; i++ ){
                val = arr[ i ].value || arr[ i ];
                obj = arr[ i ] = kity.Utils.isObject( arr[ i ] ) ? arr[ i ] : {};

                obj.percent = tmp = val / sum;
                obj.angle = tmp * 360;
                obj.offsetAngle = offsetAngle;
                obj.index = i;

                offsetAngle += obj.angle;
            }

            return arr;
        }

        var result = {
                chart : origin.chart,
                xAxis :  {
                    categories : queryPath( 'xAxis.categories', origin ) || [],
                    step : queryPath( 'xAxis.step', origin ) || 1
                },

                yAxis : queryPath( 'yAxis', origin ) || {},

                plotOptions : origin.plotOptions || {},

                series : origin.series || []
            };

        return result;
    }
} );