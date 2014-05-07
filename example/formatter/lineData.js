var LineData = kc.LineData = kity.createClass( 'LineData', {
    base: kc.Data,
    format: function () {
        var origin = this.origin;
        
        var tmp, series = [], xAxis = [], min = 0, max = 100;

        var pvReal, adPvReal, pvPred, adPvPred;

        var yDim = origin.y_dim;

        if( yDim && yDim.length > 0 ){
            for(var i = 0; i < yDim.length; i++){
                tmp = yDim[ i ];

                pvReal = tmp['pv']&&tmp['pv']['real']||[];
                adPvReal = tmp['adPv']&&tmp['adPv']['real']||[];
                pvPred = JSON.parse( JSON.stringify( tmp['pv']['pred']||[] ));
                adPvPred = JSON.parse( JSON.stringify( tmp['adPv']&&tmp['adPv']['pred']||[] ));

                pvPred.unshift( pvReal[ pvReal.length - 1 ] || 0 );
                adPvPred.unshift( adPvReal[ adPvReal.length - 1 ] || 0);

                series = series.concat([
                    {
                        "name": tmp["label"] + "-pv",
                        "segments" : [
                            {
                                "dash" : null,
                                "data" : pvReal
                            },
                            {
                                "dash" : [2],
                                "data" : pvPred
                            }
                        ]
                    },
                    {
                        "name": tmp["label"] + "-adPv",
                        "segments" : [
                            {
                                "dash" : null,
                                "data" : adPvReal
                            },
                            {
                                "dash" : [2],
                                "data" : adPvPred
                            }
                        ]
                    }
                ]);
            }

            var all = [], tmp;
            for(var i in series){
                tmp = series[ i ]
                if( tmp.segments && tmp.segments.length > 0 ){
                    for (var j = 0; j < tmp.segments.length; j++) {
                        all = all.concat( tmp.segments[j].data );
                    }
                }else{
                    all = all.concat( origin.series[ i ].data );
                }
            }

            var min = Math.min.apply([], all) || 0;
            var max = Math.max.apply([], all) || 100;
        }

        return {
            xAxis :  {
                categories : origin.x_dim || [],
                step : origin.x_dim ? Math.floor( origin.x_dim.length/10 ) : 10
            },
            // yAxis :  {
            //     categories : yAxis || [],
            //     step : 10
            // },
            series : series || [],
            rangeY : [min, max]
        };
    }
} );