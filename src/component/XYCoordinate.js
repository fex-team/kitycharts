/**
 * 直角坐标系
 * @param {Array} dataSet
 *        要显示在坐标系上的数据集（每个元素需要 x, y 数据）
 *
 * @param {Number} width
 *        坐标系要渲染的宽度
 *
 * @param {Number} height
 *        坐标系要渲染的高度
 */
var XYCoordinate = kc.XYCoordinate = kity.createClass( "XYCoordinate", ( function () {
    function defaultFormat( number, index ) {
        if ( number > 1000 ) {
            return number / 1000 + 'K';
        }
        number = ( ( number * 10 ) | 0 ) / 10;
        return number;
    }
    return {
        base: kc.Coordinate,
        constructor: function ( param ) {

            this.callBase( kity.Utils.extend( {
                dataSet: [],
                width: 300,
                height: 300,
                heading: 20,
                unitX: null,
                unitY: null,
                meshX: true,
                meshY: true,
                formatX: null,
                formatY: null,
                rangeX: null,
                rangeY: null
            }, param ) );

            this._initRulers();
            this._initElements();

        },
        _initRulers: function () {
            this.xRuler = new kc.Ruler();
            this.yRuler = new kc.Ruler();
        },
        _initElements: function () {
            this.addElement( 'xMesh', new kc.Mesh( {
                type: 'vertical'
            } ) );
            this.addElement( 'yMesh', new kc.Mesh( {
                type: 'horizon',
                dir: 1
            } ) );
            this.addElement( 'xCat', new kc.Categories( {
                at: 'bottom'
            } ) );
            this.addElement( 'yCat', new kc.Categories( {
                at: 'left'
            } ) );
            this.addElement( 'xAxis', new kc.Line( {
                color: '#999'
            } ) );
            this.addElement( 'yAxis', new kc.Line( {
                color: '#999'
            } ) );
            var arrowParam = {
                w: 0,
                h: 1,
                a: 7,
                b: 2,
                c: 3,
                d: 0,
                t: 0
            };
            this.canvas.addShape( this.xArrow = new kity.Arrow( arrowParam ).fill( '#999' ) );
            this.canvas.addShape( this.yArrow = new kity.Arrow( arrowParam ).fill( '#999' ) );
        },
        registerUpdateRules: function () {
            return kity.Utils.extend( this.callBase(), {
                updateAll: [ 'dataSet', 'width', 'height', 'heading', 'unitX', 'unitY', 'meshX', 'meshY', 'formatX', 'formatY', 'rangeX', 'rangeY' ]
            } );
        },
        getXRuler: function () {
            return this.xRuler;
        },
        getYRuler: function () {
            return this.yRuler;
        },
        updateAll: function ( dataSet, width, height, heading,
            unitX, unitY, meshX, meshY, formatX, formatY, rangeX, rangeY ) {
            var query = new kc.Query( dataSet ),

                xAxis = this.getElement( 'xAxis' ),
                yAxis = this.getElement( 'yAxis' ),

                xRuler = this.xRuler,
                yRuler = this.yRuler,

                xCat = this.getElement( 'xCat' ),
                yCat = this.getElement( 'yCat' ),
                xFormat = formatX || defaultFormat,
                yFormat = formatY || defaultFormat,

                xMesh = this.getElement( 'xMesh' ),
                yMesh = this.getElement( 'yMesh' ),

                xMin, yMin, xMax, yMax,

                xDur, yDur,

                xGrid, yGrid, xCount, yCount;

            var x0, y0;

            if ( rangeX && rangeY ) {

                xMin = rangeX[ 0 ];
                xMax = rangeX[ 1 ];
                yMin = rangeY[ 0 ];
                yMax = rangeY[ 1 ];
                xDur = xMax - xMin;
                yDur = yMax - yMin;

            } else {

                xMin = query.count() && query.min( 'x' ).x || 0;
                xMax = query.count() && query.max( 'x' ).x || 0;
                yMin = query.count() && query.min( 'y' ).y || 0;
                yMax = query.count() && query.max( 'y' ).y || 0;

                xDur = xMax - xMin;
                yDur = yMax - yMin;

                xDur = xDur || 40;
                yDur = yDur || 40;

                xMin -= xDur / 4;
                yMin -= yDur / 4;
                xMax += xDur / 4;
                yMax += yDur / 4;
            }

            xRuler.ref( xMin, xMax ).map( 0, width );
            yRuler.ref( yMin, yMax ).map( height, 0 );

            x0 = xRuler.measure( 0 );
            y0 = yRuler.measure( 0 );

            xCount = width / 60 | 0;
            yCount = height / 40 | 0;

            // calc grid
            xGrid = xRuler.gridByCount( xCount );
            yGrid = yRuler.gridByCount( yCount );

            // draw axix
            xAxis.update( {
                x1: 0,
                y1: height,
                x2: width,
                y2: height
            } );

            yAxis.update( {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: height
            } );

            this.xArrow.setTransform( new kity.Matrix().translate( width, height + 0.5 ) );
            this.yArrow.setTransform( new kity.Matrix().rotate( -90 ).translate( 0.5, 0 ) );

            xCat.update( {
                rules: xGrid.map,
                labels: xGrid.ref.map( xFormat ),
                y: height
            } );

            yCat.update( {
                rules: yGrid.map,
                labels: yGrid.ref.map( yFormat ),
                x: 0
            } );

            xMesh.update( {
                rules: xGrid.map,
                length: height - yGrid.map[ yGrid.map.length - 1 ],
                y: height
            } );

            yMesh.update( {
                rules: yGrid.map,
                length: xGrid.map[ xGrid.map.length - 1 ],
                x: 0,
                y: 0
            } );
        }
    };
} )() );