(function(){

var LinearPlots = kc.LinearPlots = kity.createClass( 'LinearPlots', {
    base: kc.BasePlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );

        this.lineDots = this.addElement( 'lineDots', new kc.ElementList() );
    },

    drawPlots: function ( coordinate, config ) {

        var series = config.series,
            opt = config.plotOptions,
            i, pointsArr = [], linesArr = [],
            line;

        var queryPath = kity.Utils.queryPath,
            offset = 0,
            lineColor,
            lineData
            ;
        this.dotArr = [];

        for (i = 0; i < series.length; i++) {

            line = series[ i ];
            line.positions = [];

            this.renderLineByData( line );
            
            pointsArr = this.array2points( line.data, offset );

            lineData = {
                line : line,
                currentData : line.data[ i ],
                currentLabel : config.xAxis.categories[ i ]
            };
            
            linesArr.push({
                    points     : pointsArr,
                    color      : this.getEntryColor( line ),
                    dash       : line.dash || null,
                    width      : this.getLineWidth(),
                    animatedDir: 'y',
                    defaultPos : coordinate.param.height,
                    factor     : +new Date,
                    bind       : lineData
                });

            line.positions = pointsArr;

            this.addLabels( line );

        }

        this.getPlotsElements().update({
            elementClass: kc.Polyline,
            list: linesArr,
            fx: config.animation.enabled
        });
        
        this.addDots();
    },

    renderLineByData : function( line ){
        // to be implemented
    },

    array2points : function( arr, offset ){
        var offset = offset || 0;
        var pointsArr = [], point;
        for (var j = 0; j < arr.length; j++) {
            point = this.coordinate.measurePoint( [j, arr[j]] );
            point[0] += offset;
                            
            pointsArr.push( point );
        }
        return pointsArr;
    },

    addLabels : function( line ){
        var opt = this.config.plotOptions;

        if( opt.label.enabled || opt[ this.chartType ].dot.enabled ){

            var tmpPos, dotParam, radius = 0, m;

            for (m = 0; m < line.positions.length; m++) {
                tmpPos = line.positions[ m ];

                if( opt[ this.chartType ].dot.enabled ){
                    radius = opt[ this.chartType ].dot.radius;
                }

                dotParam = {
                    color: this.getEntryColor( line ),
                    radius: radius,
                    x: tmpPos[0],
                    y: tmpPos[1]
                };

                if( opt.label.enabled ){

                    dotParam.label = {
                            margin: opt.label.text.margin,
                            color:  opt.label.text.color,
                            text: line.data[ m ],
                        };
                }

                this.dotArr.push(dotParam);
            }
            line.dots = this.dotArr;
        }

    },

    addDots : function(){
        var opt = this.config.plotOptions;
        if( opt.label.enabled || opt[ this.chartType ].dot.enabled ){
            var lineDots = this.getElement( 'lineDots' );
            lineDots.update({
                elementClass: kc.CircleDot,
                list: this.dotArr,
                fx: this.config.animation.enabled
            });
        }
    }

} );


})();