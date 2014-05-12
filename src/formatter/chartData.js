kc.ChartData = kity.createClass( 'ChartData', {
    base: kc.Data,
    
    format: function ( index ) {
        var origin = this.origin,
            queryPath = kity.Utils.queryPath;

        var i, j, k, all = [], data;

        var min = 0;
        var max = 100;

        var totalMap = {}, total, type, tmp;
        var series = origin.series[ index ];

        if( series ){

            for( type in series ){
                tmp = series[ type ];

                for(i = 0; i < tmp.length; i++){
                    data = tmp[i].data;
                    tmp[i].originData = kity.Utils.copy( data );
                    all = all.concat( data );
                }

            }


            if( !queryPath( 'chart.percentage', origin ) ){
                min = Math.min.apply( [], all );
                max = Math.max.apply( [], all );
            }
        }



        origin.rangeY = [min, max];

        var queryPath = kity.Utils.queryPath;

        var result = {
                chart : origin.chart,
                xAxis :  {
                    categories : queryPath( 'xAxis.categories', origin ) || [],
                    step : 1
                },

                yAxis : queryPath( 'yAxis', origin ) || {},

                plotOptions : origin.plotOptions || {},

                series : origin.series || [],
                rangeY : [min, max]

            };

        return result;
    }
} );