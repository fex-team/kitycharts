( function ( kc, kity ) {
    var utlis = kity.Utils;
    utlis.copy = function(obj){
        if(typeof obj !== 'object') return obj;
        if(typeof obj === 'function') return null;
        return JSON.parse(JSON.stringify(obj));
    };

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
            if ( !this.fxEnabled() ) {
                return this.update( afterAnimated );
            }

            var canAnimated = this.getAnimatedParam(),
                beforeAnimated = this.param,
                beforeAnimatedCopy = utlis.copy( beforeAnimated ),
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
                setter: function ( target, param, timeline ) {
                    var progress = timeline.getValueProportion();
                    if(progress > 1) progress=1;
                    target.update( param, beforeAnimatedCopy, progress );
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