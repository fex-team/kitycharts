( function ( kc, kity ) {
    var utlis = kity.Utils;
    kc.AnimatedChartElement = kity.createClass( "AnimatedChartElement", {
        base: kc.ChartElement,

        getAnimatedParam: function () {
            throw new Error( '请实现接口: getAnimatedParam()' );
        },

        fxEnabled: function () {
            return kc.fx && this.param.fx != 'off';
        },

        stop: function () {
            if ( this.timeline ) {
                this.timeline.stop();
            }
            return this;
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
                }
            } );

            this.timeline = animator.start( this,
                duration || this.param.fxTiming || this.fxTiming || 500,
            easing || this.param.fxEasing || this.fxEasing || 'ease',
                callback );

            return this;
        }
    } );

} )( kc, kity );