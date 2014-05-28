var ElementList = kc.ElementList = kity.createClass( "ElementList", {
    base: kc.ChartElement,
    constructor: function ( param ) {
        // param
        this.callBase( kity.Utils.extend( {
            list: [],
            fx: true,
            common: {}
        }, param ) );

        this.elementList = [];
        this.updateClass( this.param.elementClass );
        this.fxTimers = [];
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            updateClass: [ 'elementClass' ],
            updateCommon: [ 'common' ],
            updateList: [ 'list' ]
        } );
    },

    updateCommon: function ( common ) {
        this.elementList.forEach( function ( element ) {
            element.update( common );
        } );
    },

    updateList: function ( list ) {
        var me = this;
        var elementList = this.elementList,
            growth = list.length - elementList.length,
            fx = kc.fx && this.param.fx,
            delay = 0,
            delayBase = 300 / list.length,
            fxTimers = this.fxTimers;

        this.adjust( growth );

        while ( fxTimers.length ) {
            clearTimeout( this.fxTimers.pop() );
        }

        elementList.forEach( function ( element, index ) {

            if ( fx && ( 'animate' in element ) ) {
                fxTimers.push( setTimeout( function () {
                    element.animate( list[ index ], me.param.animateDuration || 300 );
                }, delay ) );

                delay += Math.random() * delayBase;

            } else {

                element.update( list[ index ] );

            }

        } );
    },

    updateClass: function ( elementClass ) {
        if ( !elementClass || this.elementClass == elementClass ) return;
        this.elementClass = elementClass;
        this.shrink( this.elementList.lenght );
    },

    adjust: function ( growth ) {
        if ( growth > 0 ) {
            this.grow( growth );
        } else if ( growth < 0 ) {
            this.shrink( -growth );
        }
    },

    grow: function ( size ) {
        var element;
        while ( size-- ) {
            element = new this.elementClass();
            element.container = this;
            this.canvas.addShape( element.canvas );
            this.elementList.push( element );
            element.update( this.param.common );
            if ( this.param.fx ) {
                element.canvas.setOpacity( 0 ).fadeIn( 500, 'ease' );
            } else {
                element.canvas.setOpacity( 1 );
            }
        }
    },

    shrink: function ( size ) {
        var removed = this.elementList.splice( -size );
        while ( removed.length ) {
            this.canvas.removeShape( removed.pop().canvas );
        }
    },

    find: function ( id ) {
        for ( var i = 0, ii = this.elementList.length; i < ii; i++ ) {
            if ( this.elementList[ i ].param.id == id ) return this.elementList[ i ];
        }
    }
} );