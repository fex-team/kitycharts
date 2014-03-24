function getCamelName( name ) {
    return name.replace( /_(\w)/ig, function ( match ) {
        return match[ 1 ].toUpperCase();
    } );
}

var ChartElement = kc.ChartElement = kity.createClass( 'ChartElement', {
    mixins: [ kc.EventHandler ],

    constructor: function ( param ) {

        this.canvas = new kity.Group();
        this.canvas.setAnchor( 0, 0 );

        this.visible = true;

        this.param = param || {};

        this.elements = {};

        this.callMixin();
    },

    addElement: function ( key, chartElement ) {
        this.elements[ key ] = chartElement;
        this.canvas.addShape( chartElement.canvas );
        chartElement.chart = this;
        return chartElement;
    },

    getElement: function ( key ) {
        return this.elements[ key ] || null;
    },

    removeElement: function ( key ) {
        var chartElement = this.elements[ key ];
        if ( chartElement ) {
            delete chartElement.chart;
            this.canvas.removeShape( chartElement.canvas );
            delete this.elements[ key ];
        }
    },

    setVisible: function ( value ) {
        if ( value !== undefined ) {
            this.visible = value;
            this.canvas.setStyle( {
                display: value ? 'inline' : 'none'
            } );
        }
        return this;
    },

    isVisible: function () {
        return this.visible;
    },

    setPosition: function ( x, y ) {
        if ( ( typeof ( x ) == 'object' ) && ( 'x' in x ) && ( 'y' in x ) ) {
            y = x.y || 0;
            x = x.x || 0;
        }
        x = x || 0;
        y = y || 0;
        var dx = x - ( this.x || 0 ),
            dy = y - ( this.y || 0 );
        this.x = x;
        this.y = y;
        this.canvas.translate( dx, dy );
    },

    getPosition: function () {
        return {
            x: this.param.x || 0,
            y: this.param.y || 0
        };
    },

    // 兴趣点表示这个元素的关键位置
    getInterestPoint: function () {
        return this.getPosition();
    },

    registerUpdateRules: function () {
        return {
            'setPosition': [ 'x', 'y' ],
            'setVisible': [ 'visible' ]
        };
    },

    updateByRule: function ( method, methodParams, param ) {
        var shouldCall, lastParam, i, k;
        lastParam = this.param;

        for ( i = 0; i < methodParams.length; i++ ) {
            k = methodParams[ i ];
            // 值没有改变的话，不更新
            if ( k in param && ( !this._firstUpdate || lastParam[ k ] != param[ k ] ) ) {
                shouldCall = true;
                break;
            }
        }

        if ( shouldCall ) {
            this[ method ].apply( this, methodParams.map( function ( name ) {
                return name in param ? param[ name ] : lastParam[ name ];
            } ) );
        }
    },

    update: function ( param ) {

        var key, rules, method, params, i, shouldCall, updated;

        // 没有被更新过，需要把所有参数都更新一遍，达到初始效果
        if ( !this._updateRules ) {
            this._updateRules = this.registerUpdateRules();
            param = kity.Utils.extend( this.param, param );
        }

        rules = this._updateRules;

        if ( !param ) {
            param = this.param;
        }

        updated = [];
        // 从更新规则中更新
        for ( method in rules ) {
            this.updateByRule( method, rules[ method ], param );
            updated = updated.concat( rules[ method ] );
        }


        if ( param && param != this.param ) {

            kity.Utils.extend( this.param, param );

        }

        // 更新子元素
        for ( key in param ) {
            if ( !~updated.indexOf( key ) && this.elements[ key ] ) {
                this.elements[ key ].update( param[ key ] );
            }
        }

        this._firstUpdate = this._firstUpdate || +new Date();
        this.trigger( 'update' );
        return this;
    },

    getBoundaryBox: function () {
        return this.canvas.getBoundaryBox();
    },

    getSize: function () {
        var box = this.getBoundaryBox();
        return {
            width: box.width,
            height: box.height
        };
    },

    flipX: function () {
        this.canvas.scale( -1, 1 );
    },

    flipY: function () {
        this.canvas.scale( 1, -1 );
    },

    getParam: function ( k ) {
        return this.param[ k ];
    },

    setParam: function ( k, v ) {
        this.param[ k ] = v;
    }
} );