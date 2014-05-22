/**
 * @class Tooltip
 *
 * @param {ChartElement} target [Required]
 *        指定 tooltip 的目标，tooltip 的位置会根据该目标定位
 *
 * @param {ChartElement|String} content [Required]
 *        指定 tooltip 的内容，可以为一个 ChartElement 或者是一个 String
 *
 * @param {String|kity.Color} color
 *        指定 tooltip 文本的颜色
 *
 * @param {String|kity.Color} background
 *        指定 tooltip 的背景颜色，不指定则为透明
 *
 * @param {Number} padding
 *        就是 padding，默认值为 10
 *
 * @param {Number} borderRadius
 *        圆角大小，默认值为 0
 *
 * @param {String} at
 *        指定 tooltip 的渲染位置，允许取值为：
 *        | anchor  | 说明
 *        | 'left'  | tooltip 渲染在目标的左侧
 *        | 'right' | tooltip 渲染在目标的右侧
 *        | 'up'    | tooltip 渲染在目标的上方
 *        | 'down'  | tooltip 渲染在目标的下方
 */

( function ( kc, kity ) {

    var Vector = kity.Vector;

    var Tooltip = kc.Tooltip = kity.createClass( 'Tooltip', {
        base: kc.AnimatedChartElement,

        constructor: function ( param ) {

            this.callBase( kity.Utils.extend( {
                target: null,
                content: {
                    color: 'white'
                },
                contentClass: kc.Label,

                background: 'rgba(0,0,0,.8)',

                at: 'up',
                padding: [ 6, 12, 6, 12 ],
                borderRadius: 6,
                anchorSize: 6
            }, param ) );


            this.canvas.addShape( this.outline = new kity.Path() );

            this.addElement( 'content', this.contentElement = new this.param.contentClass() );

            this.contentElement.on( 'sizechanged', function () {

                var p = this.param;
                this.updateOutline( p.at, p.padding, p.borderRadius, p.anchorSize );

            }.bind( this ) );
        },

        registerUpdateRules: function () {
            return kity.Utils.extend( this.callBase(), {
                updateBackground: [ 'background' ],
                updateOutline: [ 'at', 'padding', 'borderRadius', 'anchorSize' ]
            } );
        },

        updateBackground: function ( bg ) {
            this.outline.fill( bg );
        },

        updateOutline: function ( at, padding, borderRadius, anchorSize ) {
            var contentElement = this.contentElement;
            var contentBox = contentElement.getBoundaryBox();

            if ( typeof ( padding ) == 'number' ) {
                padding = [ padding, padding, padding, padding ];
            }

            var p1 = new Vector( contentBox.x - padding[ 3 ], contentBox.y - padding[ 0 ] ),
                p2 = new Vector( contentBox.x + contentBox.width + padding[ 1 ], p1.y ),
                p3 = new Vector( p2.x, contentBox.y + contentBox.height + padding[ 2 ] ),
                p4 = new Vector( p1.x, p3.y );

            p1.rp = [ new Vector( p1.x, p1.y + borderRadius ), new Vector( p1.x + borderRadius, p1.y ) ];
            p2.rp = [ new Vector( p2.x - borderRadius, p2.y ), new Vector( p2.x, p2.y + borderRadius ) ];
            p3.rp = [ new Vector( p3.x, p3.y - borderRadius ), new Vector( p3.x - borderRadius, p3.y ) ];
            p4.rp = [ new Vector( p4.x + borderRadius, p4.y ), new Vector( p4.x, p4.y - borderRadius ) ];

            var pseq = {
                left: [ p2, p3, p4, p1 ],
                right: [ p4, p1, p2, p3 ],
                down: [ p1, p2, p3, p4 ],
                up: [ p3, p4, p1, p2 ]
            }[ at ];

            var d1 = pseq[ 0 ],
                d2 = pseq[ 1 ],
                d3 = pseq[ 2 ],
                d4 = pseq[ 3 ];

            var drawer = this.outline.getDrawer().clear();

            drawer.moveTo( d1.rp[ 1 ].x, d1.rp[ 1 ].y );

            if ( anchorSize > 0 && true ) {
                var side = Vector.fromPoints( d1, d2 ),
                    halfLength = side.length() / 2;
                var a1 = d1.add( side.normalize( halfLength - anchorSize ) ),
                    dt = side.rotate( -90 ).normalize().add( side.normalize() ),
                    a2 = a1.add( dt.multipy( anchorSize ) ),
                    a3 = a1.add( side.normalize( anchorSize * 2 ) );
                drawer.lineTo( a1.x, a1.y );
                drawer.lineTo( a2.x, a2.y );
                drawer.lineTo( a3.x, a3.y );
            }

            drawer.lineTo( d2.rp[ 0 ].x, d2.rp[ 0 ].y );
            drawer.carcTo( borderRadius, 0, 1, d2.rp[ 1 ].x, d2.rp[ 1 ].y );
            drawer.lineTo( d3.rp[ 0 ].x, d3.rp[ 0 ].y );
            drawer.carcTo( borderRadius, 0, 1, d3.rp[ 1 ].x, d3.rp[ 1 ].y );
            drawer.lineTo( d4.rp[ 0 ].x, d4.rp[ 0 ].y );
            drawer.carcTo( borderRadius, 0, 1, d4.rp[ 1 ].x, d4.rp[ 1 ].y );
            drawer.lineTo( d1.rp[ 0 ].x, d1.rp[ 0 ].y );
            drawer.carcTo( borderRadius, 0, 1, d1.rp[ 1 ].x, d1.rp[ 1 ].y );
            drawer.close();

            this.updatePosition();
        },

        updatePosition: function () {
            if ( this.param.target ) {
                this.setPosition( this.param.target.getInterestPoint() );
            }
        },

        getAnimatedParam: function () {
            return [ 'x', 'y' ];
        },

        show: function () {
            this.updatePosition();
            this.setVisible( true );
        },

        hide: function () {
            this.setVisible( false );
        }
    } );

    kity.extendClass( kc.ChartElement, {
        tooltip: function ( param ) {
            if ( this._tooltip ) {
                return this._tooltip.update( param );
            }
            param.target = this;
            var tooltip = new Tooltip( param );
            this.canvas.on( 'mouseover', tooltip.show.bind( tooltip ) );
            this.canvas.on( 'mouseout', tooltip.hide.bind( tooltip ) );
            this.canvas.container.addShape( tooltip.canvas );
            this._tooltip = tooltip;
        }
    } );

} )( kc, kity );