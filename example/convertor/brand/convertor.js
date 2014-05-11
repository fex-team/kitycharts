/*

id: 3
brand_id: 3
week_id: 10
industry_name: "汽车"


content: 38520
impress: 1.14699

involve: 1.58736
asso: 0.538815
attention: 167775

---------一下的属性待处理

brand_name: "上海汽车—MG"

asset: 77.7578381968469
store: 44182.0525503159
connect: 143496.854501364

start_date: "2014-01-06"
end_date: "2014-01-12"

*/

function convert2Standard( origin ) {
    
    var data = {},
        assetArr = [],
        storeArr = [],
        connectArr = []
        ;

    var result = new kc.Query( origin.data );

    var groupByBrandId = result.groupBy( 'brand_id' );
    var i, j;

    var series = [], tmpData;

    for( i in groupByBrandId ){

        tmpData = [];
        for (j = 0; j < groupByBrandId[ i ].length; j++) {
            tmpData.push( groupByBrandId[ i ][ j ].asset );
        }

        series.push({
            name : groupByBrandId[ i ][ 0 ].brand_name,
            segments : [{
                data : tmpData
            }]
        });
    }

    var categories = result.select('start_date').distinct('start_date');


    var standard = {

        xAxis : {
            categories : categories
        },

        yAxis : {
            plot : {
                
            }
        },

        series : series
    };

    //**
    standard.series = series.slice( 0, 3 );
    standard.series[0].color = '#8dc960';
    standard.series[1].color = '#fa8f94';
    standard.series[2].color = '#92bdf4';
    //**

    return standard;
}



