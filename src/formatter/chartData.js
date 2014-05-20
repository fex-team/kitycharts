kc.ChartData = kity.createClass( 'ChartData', {
    base: kc.Data,
    
    format: function ( index ) {
        var queryPath = kity.Utils.queryPath;
        var origin = this.origin,
            queryPath = kity.Utils.queryPath;

        var i, j, k, all = [], data;

        var min = 0;
        var max = 100;

        var totalMap = {}, total, type, tmp;
        var series = origin.series[ index ];
        var _time = '_' + (+new Date);
        var categoriesLength = queryPath('xAxis.categories.length', origin);
        var isPercentage = queryPath( 'yAxis.' + index + '.percentage', origin ),
            isStacked = queryPath( 'yAxis.' + index + '.stacked', origin );
        var obj = {}, group, groupName, seriesGroup = {};
        var tmpLevel, tmpGroup, groupIndex = 0, sumObj, entry;

        if( series ){

            for( type in series ){
                tmp = series[ type ];

                obj = {};
                seriesGroup = {};

                for( i = 0; i < tmp.length; i++ ){
                    tmp[i].group = isStacked ? ( tmp[i].group || _time ) : i;
                    group = tmp[i].group;
                    obj[ group ] = obj[ group ] || [];
                    obj[ group ].push( tmp[ i ].data );

                    seriesGroup[ group ] = seriesGroup[ group ] || [];
                    seriesGroup[ group ].push( tmp[ i ] );
                }

                groupIndex = 0;
                for( groupName in obj ){
                    sumObj = stackSum( obj[ groupName ], categoriesLength );
                    tmpLevel = sumObj.offset;
                    tmpGroup = seriesGroup[ groupName ];

                    for( j = 0; j < tmpGroup.length; j++ ){
                        entry = tmpGroup[ j ];
                        entry.indexInGroup = j;
                        entry.offset = tmpLevel[ j ];
                        entry.allOffset = tmpLevel;
                        entry.sum = tmpLevel[ obj[ groupName ].length ];
                        entry.groupIndex = groupIndex;
                        entry.percentage = sumObj.percentage[ j ];
                        entry.percentageOffset = sumObj.percentageOffsetLevel[ j ];
                        entry.allPercentageOffset = sumObj.percentageOffsetLevel;

                    }
                    groupIndex++;
                }

                origin.yAxis[ index ].groupCount = groupIndex

                for(i = 0; i < tmp.length; i++){
                    // tmp[i].originData = kity.Utils.copy( tmp[i].data );
                    data = isStacked || isPercentage ? tmp[i].sum : tmp[i].data;
                    all = all.concat( data );
                }
                
            }

            if( !isPercentage ){
                min = all.length > 0 ? Math.min.apply( [], all ) : 0;
                max = all.length > 0 ? Math.max.apply( [], all ) : 100;
            }
        }
        

        function stackSum( arr, length ){
            var i, j, k, tmpSum = 0, sum = [], offsetLevel = {}, percentage = [], percentageOffsetLevel = {}, tmpPer = [], start = [];
            for( i = 0; i < length; i++ ){
                start.push( 0 );
                tmpSum = 0;

                for( j = 0; j < arr.length; j++ ){
                    tmpSum += ( arr[ j ][ i ] || 0 );
                    offsetLevel[ j+1 ] = offsetLevel[ j+1 ] || [];
                    offsetLevel[ j+1 ][ i ] = tmpSum;
                }
                sum.push( tmpSum );

                tmpPer = [];
                for( k = 0; k < arr.length; k++ ){
                    percentage[ k ] = percentage[ k ] || [];
                    percentage[ k ][ i ] = arr[ k ][ i ] / tmpSum * 100;


                    percentageOffsetLevel[ k+1 ] = percentageOffsetLevel[ k+1 ] || [];
                    percentageOffsetLevel[ k+1 ][ i ] = offsetLevel[ k+1 ][ i ] / tmpSum * 100;
                }
                
            }

            offsetLevel[ 0 ] = percentageOffsetLevel[ 0 ] = start;

            return {
                    offset : offsetLevel,
                    percentageOffsetLevel : percentageOffsetLevel,
                    percentage : percentage
                };
        }


        var result = {
                chart : origin.chart,
                xAxis :  {
                    categories : queryPath( 'xAxis.categories', origin ) || [],
                    step : queryPath( 'xAxis.step', origin ) || 1
                },

                yAxis : queryPath( 'yAxis', origin ) || {},

                plotOptions : origin.plotOptions || {},

                series : origin.series || [],
                rangeY : [min, max],
                rangeX : [min, max]
            };

        return result;
    }
} );