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

        return {
                yAxis  : {
                    categories : origin.yAxis && origin.yAxis.categories || []
                },
                series : origin.series || [],
                rangeX : [min, max]
            };
    }
} );