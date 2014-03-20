var EventHandler = kc.EventHandler = kity.createClass( 'EventHandler', ( function () {

    var DOMEvents = 'click dblclick mousedown contextmenu mouseup mouseout mouseover mouseenter mouseleave mousemove mousewheel touchstart touchmove touchend'.split( ' ' );

    function wrapCallback( callback, context ) {
        return function ( e ) {
            callback.call( context, new kc.ChartEvent( context, e ) );
        };
    }

    return {

        constructor: function () {
            this._initEvents();
        },
        on: function ( e, callback ) {
            var _eventCallbacks = this._eventCallbacks;
            var eList = e.split( " " );
            for ( var i = 0; i < eList.length; i++ ) {
                var _arr = _eventCallbacks[ eList[ i ] ];
                if ( !_arr ) {
                    _eventCallbacks[ eList[ i ] ] = [];
                }
                if ( ~DOMEvents.indexOf( eList[ i ] ) && this.canvas ) {
                    this.canvas.on( eList[ i ], wrapCallback( callback, this ) );
                } else {
                    _eventCallbacks[ eList[ i ] ].push( callback );
                }
            }
        },
        off: function ( e, callback ) {

        },
        trigger: function ( e ) {
            if ( ~DOMEvents.indexOf( e ) && this.canvas ) {
                this.canvas.fire( e );
            } else {
                this._fire( e );
            }
        },
        _fire: function ( eve ) {
            var me = this;
            var e;
            if ( typeof eve === 'string' ) {
                e = new kc.ChartEvent( me );
                e.name = eve;
            } else {
                e = eve;
            }
            var _callbacks = me._eventCallbacks[ e.name ];
            if ( !_callbacks ) {
                return false;
            }
            for ( var i = 0; i < _callbacks.length; i++ ) {
                _callbacks[ i ]( e );
            }
        },
        _initEvents: function () {
            this._eventCallbacks = {};
        },
        _resetEvents: function () {
            this._bindEvents();
        }
    };
} )() );