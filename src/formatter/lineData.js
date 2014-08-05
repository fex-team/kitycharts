var LineData = kc.LineData = kity.createClass( 'LineData', {
    base: kc.Data,
    format: function () {
        var origin = this.origin,
            queryPath = kity.Utils.queryPath;

        var i, j, k, all = [], seg;

        var min = 0;
        var max = 100;

        var totalMap = {}, total, str;

        if( origin.series ){
            for(i = 0; i < origin.series.length; i++){
                seg = origin.series[i].segments;

                for (j = 0; j < seg.length; j++) {
                    seg[ j ].originData = kity.Utils.copy( seg[ j ].data );
                    all = all.concat( seg[ j ].data );



                    for(k=0; k < seg[ j ].data.length; k++){
                        total = 0;

                        for(n=0; n < origin.series.length; n++){
                            str = j + '' + k;
                            if( str in totalMap ){
                                break;
                            }else{
                                total += origin.series[ n ].segments[ j ].data[ k ];
                                totalMap[ str ] = total;
                            }
                        }


                        // seg[ j ].data[ k ] = seg[ j ].data[ k ]/totalMap[ str ] * 100;

                    }


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

                yAxis : queryPath( 'yAxis', origin ),

                plotOptions : origin.plotOptions,

                series : origin.series || [],
                rangeY : [min, max]

            };

        return result;
    }
} );