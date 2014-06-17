//参数格式
// {
//             label: {
//                 at: 'bottom',
//                 color: 'black',
//                 text: null,
//             },
//             color: '#62a9dd',
//             radius: 0,
//             fxEasing: 'easeOutElastic'
// }
var ConnectCircleDot = kc.ConnectCircleDot = kity.createClass( "ConnectCircleDot", {

    base: kc.AnimatedChartElement,

    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            label: {
                at: 'bottom',
                color: 'black',
                text: null,
            },
            color: '#62a9dd',
            radius: 0,
            fxEasing: 'easeOutElastic'
        }, param ) );
        this.circle = new kity.Circle();
        var selfparam = this.param;
        this.canvas.addShapes( [ this.circle ] );
        this.addElement( 'label', new kc.Label() );
        var label = this.getElement( 'label' );
        this.on( "click", function ( e ) {
            selfparam.chart.highlightBrand( e );
        } );
        var me = this;
        var tooltip = document.createElement( 'div' );
        tooltip.setAttribute( 'class', 'tooltip' );
        this.on( "mouseover", function ( e ) {
            me.hover();
            var container = selfparam.chart.paper.container;
            container.appendChild( tooltip );
            tooltip.innerHTML = '<h1>' + selfparam.label.text + '</h1>';
            if ( selfparam.tags && selfparam.tags.length !== 0 ) {
                var tags = selfparam.tags;
                for ( var i = 0; i < tags.length; i++ ) {
                    tooltip.innerHTML += '<p><b style="color:#006dbe">' + tags[ i ].name + ':&nbsp;</b>' + tags[ i ].value + '</p>'
                }
            } else {
                tooltip.innerHTML += '<p><b style="color:#006dbe">所属类别：</b>' + selfparam.brandclass + '</p>';
            }
            tooltip.style.left = ( selfparam.x - selfparam.radius ) + 'px';
            tooltip.style.top = ( selfparam.y + selfparam.radius ) + 'px';
        } );
        this.on( 'mouseout', function ( e ) {
            me.hover( false );
            var container = selfparam.chart.paper.container;
            try {
                container.removeChild( tooltip );
            } catch ( error ) {

            }
        } );
    },
    hover: function ( ishover ) {
        if ( this.param.ishighlight ) return false;
        var selfparam = this.param;
        var label = this.getElement( 'label' );
        if ( ishover === undefined || ishover ) {
            this.circle.stroke( new kity.Pen( new kity.Color( this.param.color ).dec( 'l', 10 ), 2 ) );
            label.canvas.setOpacity( 1 );
        } else {
            this.circle.stroke( 0 );
            if ( selfparam.radius < 10 && selfparam.mode !== 'circle' ) {
                label.canvas.setOpacity( 0 );
            }
        }
    },
    highlight: function ( ishighlight ) {
        var label = this.getElement( 'label' );
        var selfparam = this.param;
        if ( ishighlight === undefined || ishighlight ) {
            selfparam.ishighlight = true;
            this.circle.stroke( new kity.Pen( new kity.Color( this.param.color ).dec( 'l', 10 ), 2 ) );
            label.canvas.setOpacity( 1 );
        } else {
            selfparam.ishighlight = false;
            this.circle.stroke( 0 );
            if ( selfparam.radius < 10 && selfparam.mode !== 'circle' ) {
                label.canvas.setOpacity( 0 );
            }
        }
    },
    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            'updateRadius': [ 'radius' ],
            'updateColor': [ 'color' ],
            'updateText': [ 'text' ]
        } );
    },
    updateText: function ( text, position ) {
        var label = this.getElement( 'label' );
        label.update( {
            text: text
        } );
    },

    updateRadius: function ( radius ) {
        this.circle.setRadius( radius );
    },

    updateColor: function ( color ) {
        //this.circle.fill( color );
        this.circle.fill( new kity.Color( color ) );
    },
    getAnimatedParam: function () {
        return [ 'radius' ];
    },
    animate: function ( afterAnimated, duration, easing, callback ) {
        //return this.update( afterAnimated );
        if ( !this.fxEnabled() ) {
            return this.update( afterAnimated );
        }

        var canAnimated = this.getAnimatedParam(),
            beforeAnimated = this.param,
            beginParam = {},
            finishParam = {},
            staticParam = {},
            animator;
        canAnimated.push( 'x' );
        canAnimated.push( 'y' );

        for ( var p in afterAnimated ) {
            if ( p in beforeAnimated && ~canAnimated.indexOf( p ) ) {
                beginParam[ p ] = beforeAnimated[ p ];
                finishParam[ p ] = afterAnimated[ p ];
            } else {
                staticParam[ p ] = afterAnimated[ p ];
            }
        }

        this.update( staticParam );

        animator = new kity.Animator( {
            beginValue: beginParam,
            finishValue: finishParam,
            setter: function ( target, param ) {
                target.update( param );
                var finish = true;
                for ( var k in param ) {
                    if ( param[ k ] !== finishParam[ k ] ) {
                        finish = false;
                    }
                }
                //if ( param.x || param.y ) {
                var cl = target.param.connectLines;
                var Cx = param.x || target.x;
                var Cy = param.y || target.y;
                for ( var i = 0; i < cl.length; i++ ) {
                    if ( cl[ i ].position === 'start' ) {
                        cl[ i ].line.update( {
                            x1: Cx,
                            y1: Cy,
                            cx: ( ( finish && beforeAnimated.mode === 'circle' ) ? beforeAnimated.cx : Cx ),
                            cy: ( ( finish && beforeAnimated.mode === 'circle' ) ? beforeAnimated.cy : Cy )
                        } );
                    } else {
                        cl[ i ].line.update( {
                            x2: Cx,
                            y2: Cy,
                            cx: ( ( finish && beforeAnimated.mode === 'circle' ) ? beforeAnimated.cx : Cx ),
                            cy: ( ( finish && beforeAnimated.mode === 'circle' ) ? beforeAnimated.cy : Cy )
                        } );
                    }
                }
                var targetparam = target.param;
                var label = target.getElement( 'label' );
                var fontSize = targetparam.originradius * 0.8;
                //console.log( beforeAnimated.radius );
                //label.text.setScale( 0.9, 0.8 );
                if ( fontSize < 2 ) {
                    fontSize = 2;
                };
                label.text.setFontSize( fontSize );

                if ( targetparam.mode === 'circle' ) {
                    label.update( {
                        'color': targetparam.color,
                    } );
                    label.canvas.setOpacity( 1 );
                    var curRx = Cx - targetparam.Ox;
                    var curRy = Cy - targetparam.Oy;
                    var curR = Math.sqrt( ( curRx * curRx ) + ( curRy * curRy ) );
                    var cosDelta = curRx / curR;
                    var sinDelta = curRy / curR;
                    var rotate = 180 * targetparam.sDelta / targetparam.total;
                    if ( rotate >= 90 && rotate <= 270 ) {
                        label.canvas.setRotate( rotate + 180 );
                        label.text.setTextAnchor( 'end' );
                    } else {
                        label.canvas.setRotate( rotate );
                        label.text.setTextAnchor( 'left' );
                    }
                    label.canvas.setTranslate( ( targetparam.R + 20 ) * cosDelta - curRx, ( targetparam.R + 20 ) * sinDelta - curRy );
                } else {
                    label.text.setTextAnchor( 'middle' );
                    label.canvas.setTranslate( 0, 0 );
                    label.canvas.setRotate( 0 );
                    if ( afterAnimated.radius < 10 ) {
                        label.canvas.setOpacity( 0 );
                    } else {
                        label.canvas.setOpacity( 1 );
                    }
                }
                //}
            }
        } );
        if ( this.timeline ) this.timeline.stop();
        this.timeline = animator.start( this,
            duration || this.param.fxTiming || this.fxTiming || 2000,
            easing || this.param.fxEasing || this.fxEasing || 'ease',
            callback );
        //console.log( this.param );
        return this;
    }
} );