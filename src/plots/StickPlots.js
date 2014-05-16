(function(){

var StickPlots = kc.StickPlots = kity.createClass( 'StickPlots', {
    base: kc.ChartElement,

    constructor: function ( coordinate, config, type ) {
        
        this.callBase();
        this.coordinate = coordinate;
        this.config = config;

        this.chartType = type || this.config.chart.type || 'column';
        this.isBar = this.chartType == 'bar';

        this.sticks = this.addElement( 'sticks', new kc.ElementList() );
    },

    update: function () {
        this.callBase();
        this.formattedData = this.drawBars( this.config, this.coordinate );
    },

    drawBars: function ( data, oxy ) {
        var config = this.config,
            opt = config.plotOptions;
        var rotateAngle,
            measureCategoryMethod,
            measureValueMethod;

        if( this.isBar ){
            config.yAxis.padding.bottom = config.xAxis.padding.left;
            rotateAngle = 90;
            measureCategoryMethod = 'measurePointY';
            measureValueMethod    = 'measurePointX';
        }else{
            rotateAngle = 0;
            measureCategoryMethod = 'measurePointX';
            measureValueMethod    = 'measurePointY';
        }


        var xRuler = oxy.xRuler,
            yRuler = oxy.yRuler;

        var series = data.series[ this.chartType ],
            i, j, k, m, yPos, point, pointsArr = [], linesArr = [], dir,
            stickData,
            stick;

        var tmp, valArr, posArr, stickList = [], posY, barParam,
            width = opt[ this.chartType ].width, left = 0, bottom = 0,
            distance = data.chart.mirror? 0 : width + opt[ this.chartType ].margin,
            offset;

        var isPercentage = config.yAxis.percentage;

        for (i = 0; i < series.length; i++) {

            stick = series[ i ];
            stick.values = [];
            stick.positions = [];

            stickData = isPercentage ? series[i].percentage : series[i].data;

            for (j = 0; j < stickData.length; j++) {

                tmp = stickData[ j ];

                valArr = [];
                posArr = [];
                posY = oxy[ measureCategoryMethod ]( j );

                left = (config.yAxis.groupCount - 1) * distance / 2;

                posArr[ j ] = oxy.measureValueRange( tmp, this.isBar? 'x' : 'y' );
                offset = isPercentage ? stick.percentageOffset : stick.offset;
                bottom = offset ? offset[ j ] : 0;
                dir = this.isBar ? 1 : -1;

                stickParam = {
                    // dir: -1,
                    offset : oxy.measureValueRange( bottom, this.isBar? 'x' : 'y' ) * dir,
                    color  : stick.color || config.color[ i ],
                    width  : width,
                    height : posArr[ j ] * dir,
                    rotate : rotateAngle
                };

                if( this.isBar ){
                    stickParam.x = oxy[ measureValueMethod ]( 0 );
                    stickParam.y = posY - left + distance * stick.groupIndex ;
                }else{
                    stickParam.x = posY - left + distance * stick.groupIndex ;
                    stickParam.y = oxy[ measureValueMethod ]( 0 );
                }

                stickList.unshift(stickParam);

                stick.values.push( valArr );
                stick.positions.push( {
                        x : posArr,
                        y : posY
                    } );

            }
            
        }

        function sum(arr){
            var sum = 0;
            for(var i = 0; i < arr.length; i++){
                sum += arr[i];
            }
            return sum;
        }

        this.sticks.update({
            elementClass: kc.Bar,
            list: stickList,
            fx: this.config.enableAnimation
        });

        return data;
    }

} );


})();