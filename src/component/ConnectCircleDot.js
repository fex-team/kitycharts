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
        this.on( "click", function ( e ) {
            selfparam.chart.highlightBrand( e );
        } );
        var me = this;
        var tooltip = document.createElement( 'div' );
        tooltip.setAttribute( 'class', 'tooltip' );
        this.on( "mouseenter", function ( e ) {
            var container = selfparam.chart.paper.container;
            container.appendChild( tooltip );
            console.log( selfparam );
            tooltip.innerHTML = '<h1>' + selfparam.label.text + '</h1>' +
                '<p><b>所属类别:</b>' + selfparam.brandclass + '</p>' +
                '<p class="percent"><b>占比：</b>类别中：' + selfparam.percent * 100 + '%' + '总体：' + ( selfparam.percentall || '无数据' ) + '</p>';
            tooltip.style.left = ( selfparam.x - selfparam.radius ) + 'px';
            tooltip.style.top = ( selfparam.y + selfparam.radius ) + 'px';

        } );
        this.on( 'mouseout', function ( e ) {
            var container = selfparam.chart.paper.container;
            if ( container.hasChildNodes( tooltip ) ) container.removeChild( tooltip );
        } );
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            'updateRadius': [ 'radius' ],
            'updateColor': [ 'color' ],
            'updateText': [ 'labelText' ]
        } );
    },
    updateText: function ( text, position ) {
        this.getElement( 'label' ).update( {
            text: text
        } );
    },

    updateRadius: function ( radius ) {
        this.circle.setRadius( radius );
    },

    updateColor: function ( color ) {
        this.circle.fill( color );
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
                //console.log( target.getElement( 'label' ) );
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
                            y1: Cy
                        } );
                    } else {
                        cl[ i ].line.update( {
                            x2: Cx,
                            y2: Cy
                        } );
                    }
                }
                var targetparam = target.param;
                var label = target.getElement( 'label' );
                if ( targetparam.mode === 'circle' ) {
                    label.update( {
                        'color': targetparam.color,
                    } );
                    var curRx = Cx - targetparam.Ox;
                    var curRy = Cy - targetparam.Oy;
                    var curR = Math.sqrt( ( curRx * curRx ) + ( curRy * curRy ) );
                    var cosDelta = curRx / curR;
                    var sinDelta = curRy / curR;
                    var transR = targetparam.R + targetparam.radius + label.canvas.getWidth() / 2 + 5;
                    label.canvas.setTransform(
                        new kity.Matrix()
                        .rotate( 180 * targetparam.sDelta / targetparam.total )
                        .translate( transR * cosDelta - curRx, transR * sinDelta - curRy )
                    );
                } else {
                    label.canvas.resetTransform();
                }
                //}
            }
        } );

        this.timeline = animator.start( this,
            duration || this.param.fxTiming || this.fxTiming || 2000,
            easing || this.param.fxEasing || this.fxEasing || 'ease',
            callback );
        //console.log( this.param );
        return this;
    }
} );