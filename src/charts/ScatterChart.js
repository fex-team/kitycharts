var ScatterData = kc.ScatterData = kity.createClass( 'ScatterData', {
    base: kc.Data,
    format: function () {
        var origin = this.origin;
        var isEmpty = !( 'data_record' in origin );
        return {
            data_dim: +origin.data_dim,
            data_average_x: isEmpty ? 0 : +origin.data_average_x * 100,
            data_average_y: isEmpty ? 0 : +origin.data_average_y * 100,
            unit_x: origin.unit_x,
            unit_y: origin.unit_y,
            data_record: origin.data_record && origin.data_record.map( function ( r ) {
                return {
                    x: +r.x * 100,
                    y: +r.y * 100,
                    label: r.label,
                    value: r.value,
                    percent: +r.percent * 100
                };
            } ) || []
        };
    }
} );



function appendUnit( unit ) {
    return function ( num ) {
        return ( ( num * 10 ) | 0 ) / 10 + ( unit || '' );
    };
}

var ScatterChart = kc.ScatterChart = kity.createClass( 'ScatterChart', {
    base: kc.Chart,

    constructor: function ( target, param ) {
        this.callBase( target, param );

        this.addElement( 'oxy', new kc.XYCoordinate() );
        this.addElement( "scatter", new kc.ElementList() );
        this.addElement( 'avg-x-line', new kc.Line( {
            color: '#f39488',
            dash: [ 2 ]
        } ) );
        this.addElement( 'avg-line', new kc.Line( {
            color: '#62a9dd',
            dash: [ 4 ]
        } ) );
        this.addElement( 'avg-y-line', new kc.Line( {
            color: '#f39488',
            dash: [ 2 ]
        } ) );
        this.addElement( 'avg-x-tip', new kc.Tooltip( {
            background: '#f39488',
            color: 'white',
            at: 'up',
            content: '',
            padding: [ 2, 10, 2, 10 ],
            anchorSize: 4
        } ) );
        this.addElement( 'avg-y-tip', new kc.Tooltip( {
            background: '#f39488',
            color: 'white',
            at: 'right',
            content: '',
            padding: [ 2, 10, 2, 10 ],
            anchorSize: 4
        } ) );
        
        this.firstDraw = true;
        this.setData( new kc.ScatterData() );
    },
    
    update: function () {
        var param = this.param,
            data = this.data.format(),
            oxy = this.drawOxy( param, data );
        this.drawAverage( param, data, oxy );
        this.drawScatter( param, data, oxy );
    },

    drawOxy: function ( param, data ) {
        var oxy = this.getElement( 'oxy' );

        oxy.update( {
            dataSet: data.data_record,
            width: this.getWidth() - 100,
            height: this.getHeight() - 50,
            x: 60,
            y: 20,
            formatX: appendUnit( data.unit_x ),
            formatY: appendUnit( data.unit_y )
        } );

        return oxy;
    },

    drawAverage: function ( param, data, oxy ) {

        var xRuler = oxy.getXRuler(),
            yRuler = oxy.getYRuler();

        var ax = oxy.param.x + xRuler.measure( data.data_average_x ),
            ay = oxy.param.y + yRuler.measure( data.data_average_y ),
            xLine = this.getElement( 'avg-x-line' ),
            yLine = this.getElement( 'avg-y-line' ),
            xTip = this.getElement( 'avg-x-tip' ),
            yTip = this.getElement( 'avg-y-tip' ),
            aLine = this.getElement( 'avg-line' );

        if ( 'data_average_x' in data ) {

            xLine.setVisible( true )
                .animate( {
                    x1: ax,
                    x2: ax,
                    y1: oxy.param.y + oxy.param.heading,
                    y2: oxy.param.y + oxy.param.height
                } );

            xTip.setVisible( true )
                .update( {
                    content: {
                        text: appendUnit( data.unit_x )( data.data_average_x ),
                        color: 'white'
                    }
                } )
                .animate( {
                    x: ax,
                    y: oxy.param.y + oxy.param.heading
                } );

        } else {

            xLine.setVisible( false );
            xTip.setVisible( false );

        }

        if ( 'data_average_y' in data ) {

            yLine.setVisible( true )
                .animate( {
                    x1: oxy.param.x,
                    x2: oxy.param.x + oxy.param.width - oxy.param.heading,
                    y1: ay,
                    y2: ay
                } );

            yTip.setVisible( true )
                .update( {
                    content: {
                        text: appendUnit( data.unit_y )( data.data_average_y ),
                        color: 'white',
                        at: 'right',
                        margin: 10
                    }
                } )
                .animate( {
                    x: oxy.param.x + oxy.param.width - oxy.param.heading,
                    y: ay
                } );

        } else {

            yLine.setVisible( false );
            yTip.setVisible( false );

        }

        if ( 'data_average_x' in data && 'data_average_y' in data ) {

            aLine.setVisible( true ).animate( {
                x1: oxy.param.x + xRuler.measure( 0 ),
                y1: oxy.param.y + yRuler.measure( 0 ),
                x2: ax,
                y2: ay,
                bound: {
                    x1: oxy.param.x,
                    y1: oxy.param.y,
                    x2: oxy.param.x + oxy.param.width,
                    y2: oxy.param.y + oxy.param.height
                }
            } );

        } else {

            aLine.setVisible( false );

        }
    },

    drawScatter: function ( param, data, oxy ) {
        var dim = +data.data_dim,
            query = new kc.Query( data.data_record ),
            scatter = this.getElement( 'scatter' ),
            xRuler = oxy.getXRuler(),
            yRuler = oxy.getYRuler(),
            minRadius, maxRadius, radiusRuler,
            minValue, maxValue,
            rooted;

        function sqrt( data ) {
            return Math.sqrt( data.value );
        }

        if ( dim > 2 ) {

            rooted = query.map( sqrt );

            minValue = rooted.min();
            maxValue = rooted.max();

            minRadius = 5;
            maxRadius = 40;

            radiusRuler = new kc.Ruler( minValue, maxValue )
                .map( minRadius, maxRadius );
        }

        scatter.update( {

            elementClass: {
                '2': kc.CircleDot,
                '3': kc.CircleDot,
                '4': kc.PieDot
            }[ dim ],

            list: query.map( function ( data ) {
                var radius = dim > 2 ? radiusRuler.measure( sqrt( data ) ) : 5;
                return {
                    // common params
                    x: oxy.x + xRuler.measure( data.x ),
                    y: oxy.y + yRuler.measure( data.y ),

                    labelText: data.label,

                    // param for CircleDot
                    radius: radius,
                    labelPosition: 'auto',

                    // param for PieDot
                    angel: -90,
                    innerRadius: radius,
                    outerRadius: radius + 6,
                    percent: data.percent,
                    showPercent: true
                };
            } ).list()
        } );
    }
} );