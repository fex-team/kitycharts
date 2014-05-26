(function(kity, window) {

/**
 * @build
 */

var exports = exports || window;

var kc = {};

kc.version = '1.0.1';

kc.fx = true;

exports.kc = kc;

/**
 * @author techird
 *
 * @description
 * 工具方法，将一个数对齐到其所在的指定长度的整数区间端点上
 *
 * @param  {Number} value 要对齐的数字
 * @param  {Number} mod   区间的长度
 * @param  {Number} dir   对齐的端点类型，left - 对齐到区间左端，right - 对齐到区间右端。其他的取值会对齐到较近的一段。
 *
 * @return {Number}       对齐后的值
 *
 * @example
 *     kc.align(3.5, 2, 'left')   ==  2  // 命中的区间是 [2, 4]
 *     kc.align(3.5, 2, 'right')  ==  4  // 命中的区间是 [2, 4]
 *     kc.align(-5.5, 4, 'left')  == -8  // 命中的区间是 [-8, -4]
 *     kc.align(-5.5, 4, 'right') == -4  // 命中的区间是 [-8, -4]
 *     kc.align(6.7, 5)           ==  5  // 命中的区间是 [5, 10]
 *     kc.align(8.8, 5)           == 10  // 命中的区间是 [5, 10]
 */
kc.align = function ( value, mod, dir ) {
    var left = value > 0 ?
        value - value % mod :
        value - value % mod - mod,
        right = left + mod;
    return dir == 'left' ? left :
        ( dir == 'right' ? right : (
        value - left < right - value ? left : right ) );
};

/**
 * @author techird
 *
 * 对 v1 和 v2 对每个元素进行深度同步运算，返回运算的结果
 *
 * @param  {Object|Number} v1
 * @param  {Object|Number} v2
 * @param  {Function}      op 运算方法
 *
 * @return {Object|Number}
 *
 * @example
 *     var v1 = { a: 12, b: 14 },
 *         v2 = { a: 32, b: 66 };
 *     var v = kc.parallel( v1, v2, function(v1, v2) {
 *         return v1 + v2;
 *     } );
 *
 *     v.a == 44;
 *     v.b == 80;
 */
kc.parallel = function parallel( v1, v2, op ) {
    var value, n;

    if ( v1 && v2 && typeof ( v1 ) == 'object' && typeof ( v2 ) == 'object' ) {
        value = {};
        for ( n in v1 ) {
            if ( v1.hasOwnProperty( n ) && v2.hasOwnProperty( n ) ) {
                value[ n ] = parallel( v1[ n ], v2[ n ], op );
            }
        }
        return value;
    }

    return op( v1, v2 );
};

/**
 * @author techird
 *
 * 返回支持并行操作的方法
 *
 * @param  {Function} op 原始方法
 * @return {Function}    支持并行操作的方法
 */
kc.parallelize = function ( op ) {
    return function ( v1, v2 ) {
        return kc.parallel( v1, v2, op );
    };
};

var Query = kc.Query = kity.createClass( 'Query', ( function () {

    function fieldMapper( field ) {
        return function ( x ) {
            return x[ field ];
        };
    }

    function guessMapper( fn ) {
        switch ( typeof ( fn ) ) {
        case 'string':
            return fieldMapper( fn );
        case 'function':
            return fn;
        default:
            return function ( x ) {
                return x;
            };
        }
    }

    return {

        constructor: function ( dataSet ) {
            this.dataSet = dataSet;
        },

        where: function ( condition ) {
            var success = [],
                data, i;
            for ( i = 0; i < this.dataSet.length; i++ ) {
                data = this.dataSet[ i ];
                if ( condition.call( data, data, i ) ) {
                    success.push( data );
                }
            }
            return new Query( success );
        },

        count: function ( condition ) {
            if ( condition ) {
                return this.where( condition ).count();
            }
            return this.dataSet.length;
        },

        map: function ( mapper ) {
            var mapped = [],
                data, i;
            mapper = guessMapper( mapper );
            for ( i = 0; i < this.dataSet.length; i++ ) {
                data = this.dataSet[ i ];
                mapped.push( mapper.call( this, data, i ) );
            }

            return new Query( mapped );
        },

        max: function ( mapper ) {
            var maxData = null,
                data, i, maxValue, value;
            
            mapper = guessMapper( mapper );

            for ( i = 0; i < this.dataSet.length; i++ ) {
                data = this.dataSet[ i ];
                value = mapper.call( data, data, i );
                if ( maxData === null || value > maxValue ) {
                    maxData = data;
                    maxValue = value;
                }
            }

            return maxData;
        },

        min: function ( mapper ) {
            mapper = guessMapper( mapper );
            return this.max( function ( data, i ) {
                return -mapper.call( data, data, i );
            } );
        },

        sum: function ( mapper ) {
            var sum = 0,
                data, i, value;

            mapper = guessMapper( mapper );
            
            for ( i = 0; i < this.dataSet.length; i++ ) {
                data = this.dataSet[ i ];
                value = mapper.call( data, data, i );
                sum += value;
            }

            return sum;
        },

        average: function () {
            return this.sum() / this.count();
        },

        list: function () {
            return this.dataSet;
        },

        groupBy : function( field ){
            var data = {}, tmp = {}, i, j, val,
                dataSet = this.dataSet;

            var mapper = guessMapper( mapper );

            var arr = this.distinct( field ),
                f;

            for( i in arr ){
                f = arr[ i ];
                data[ f ] = [];

                for( j = 0; j < dataSet.length; j++ ){
                    if( f == dataSet[ j ][ field ] ){
                        val = mapper.call( dataSet[ j ], dataSet[ j ], field );
                        data[ f ].push( val );
                    }
                }

            }

            return data;
        },

        distinct : function( field ){
            var tmp = {}, arr = [];
            for( i = 0; i < this.dataSet.length; i++ ){
                tmp[ this.dataSet[ i ][ field ] ] = 1;
            }

            for( i in tmp ){
                arr.push( i );
            }

            return arr;
        },

        select : function( fields ){
            fields = typeof fields === 'string'? [ fields ] : fields;

            var arr = [], tmp = {}, i, j, field;

            for( i = 0; i < this.dataSet.length; i++ ){
                
                tmp = {};
                for (j = 0; j < fields.length; j++) {
                    field = fields[ j ];
                    tmp[ field ] = this.dataSet[ i ][ field ]
                }
                arr.push( tmp );
            }

            return new Query( arr );
        }

    };
    
} )() );

var Ruler = kc.Ruler = kity.createClass( 'Ruler', {
    constructor: function ( from, to ) {
        this.ref_grid = [];
        this.map_grid = [];
        this.ref( from, to );
        this.map( from, to );
    },

    ref: function ( from, to ) {
        if ( !arguments.length ) return this._ref;
        this._ref = {
            from: +from,
            to: +to,
            dur: +to - +from
        };
        return this;
    },

    map: function ( from, to ) {
        if ( !arguments.length ) return this._map;
        this._map = {
            from: +from,
            to: +to,
            dur: +to - +from
        };
        return this;
    },

    reverse: function () {
        var ref = this._ref,
            map = this._map;
        return new Ruler( map.from, map.to ).map( ref.from, ref.to );
    },

    measure: function ( value ) {
        // 强烈鄙视 JS 除零不报错，气死劳资了 —— techird
        if ( this._ref.dur === 0 ) return 0;
        var ref = this._ref,
            map = this._map;

        return map.from + ( value - ref.from ) / ref.dur * map.dur;
    },

    grid: function ( start, step, alignRef ) {
        var ref = this._ref,
            map = this._map,
            ref_grid = [],
            map_grid = [],
            current;

        for ( current = start; current < ref.to + step; current += step ) {
            ref_grid.push( current );
        }

        this.ref_grid = ref_grid;

        if(alignRef){
            this.ref( ref_grid[0], ref_grid[ref_grid.length-1] );
        }

        for ( var i = 0; i < ref_grid.length; i++ ) {
            map_grid.push( this.measure( ref_grid[i] ) );
        }
        
        this.map_grid = map_grid;

        return {
            ref: ref_grid,
            map: map_grid
        };
    },

    gridBySize: function ( size ) {
        var ref = this._ref;
        var start = kc.sugar.snap( ref.from, size, 'right' );
        return this.grid( start, size );
    },

    // find a good mod
    fagm: function ( count ) {
        var dur = this._ref.dur,
            sdur = dur / count,
            adjust = 1;

        while(sdur > 100) {
            sdur /= 10;
            adjust *= 10;
        }

        while(sdur < 10) {
            sdur *= 10;
            adjust /= 10;
        }

        return (sdur | 0) * adjust;
    },

    align : function ( value, mod, dir ) {
        var left = value > 0 ?
            value - value % mod :
            value - value % mod - mod,
            right = left + mod;
        return dir == 'left' ? left :
            ( dir == 'right' ? right : (
            value - left < right - value ? left : right ) );
    },

    gridByCount: function ( count, mod, alignRef, start) {
        mod = mod || this.fagm( count );
        var ref = this._ref;
        start = kity.Utils.isNumber( start )? start : this.align( ref.from, mod, 'left' );
        var size = mod;
        while ( size * count < ref.dur ) size += mod;
        return this.grid( start, size, alignRef );
    },

    gridByCategories : function( count ){
        var ref_grid = [],
            map_grid = [],
            i;
        for (i = 0; i < count; i++) {
            ref_grid.push( i );
        }

        this.ref_grid = ref_grid;

        for (i = 0; i < ref_grid.length; i++) {
            map_grid.push( this.measure( ref_grid[i] ) );
        }

        this.map_grid = map_grid;

        return {
            ref: ref_grid,
            map: map_grid
        };
    },

    checkOverflow: function ( value ) {
        if ( value < this._ref.from ) {
            return -1;
        }
        if ( value > this._ref.to ) {
            return 1;
        }
        return 0;
    },

    leanTo: function( num, type ){
        var grid = type == 'map'? this.map_grid : this.ref_grid;
        if( !grid || grid.length == 0 ) return null;

        if( grid.length == 1 ){
            return {
                value: grid[ 0 ],
                index: 0
            }
        }

        var first = grid[ 0 ];
        if( num < first ){
            return {
                value: first,
                index: 0
            }
        }

        var last = grid[ grid.length-1 ];
        if( num > last ){
            return {
                value: last,
                index: grid.length-1
            }
        }

        var mod = grid[1] - grid[0];
        var result = this.align( num, mod );
        var index = Math.round( result/mod );

        return {
            value: result,
            index: index
        }
    }
} );

Ruler.from = function ( from ) {
    return {
        to: function ( to ) {
            return new Ruler( from, to );
        }
    };
};

/**
 * @author techird
 *
 * 将坐标对齐至能绘制清晰的线条的位置
 *
 * @param  {Number|Point} p
 *         原始坐标位置（数字或点）
 * @return {Number|Point}
 *         修正后的坐标位置
 */
kc.sharpen = function ( p ) {
    if ( typeof ( p ) == 'number' ) return ( p | 0 ) + 0.5;
    if ( 'x' in p && 'y' in p ) return {
        x: ( p.x | 0 ) + 0.5,
        y: ( p.y | 0 ) + 0.5
    };
};

kc.Tools = {
    arraySum : function( arr ){
        var sum = 0;
        for(var i = 0; i < arr.length; i++){
            sum += arr[i];
        }
        return sum;
    }
};

var ChartEvent = kc.ChartEvent = kity.createClass( "ChartEvent", {
    constructor: function ( target, kityEvent ) {
        if ( kityEvent ) {
            this.kityEvent = kityEvent;
        }
        this.target = target;
    },

    getTargetChartElement: function() {
    	var shape = this.kityEvent.targetShape;

    	while(shape && !shape.host) {
    		shape = shape.container;
    	}

    	return shape.host;
    }
} );

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
        trigger: function ( e, p ) {
            if ( ~DOMEvents.indexOf( e ) && this.canvas ) {
                this.canvas.fire( e, p );
            } else {
                this._fire( e, p );
            }
        },
        _fire: function ( eve, p ) {
            var me = this;
            var e;
            if ( typeof eve === 'string' ) {
                e = new kc.ChartEvent( me );
                e.name = eve;
            } else {
                e = eve;
            }
            e.data = p;
            var _callbacks = me._eventCallbacks[ e.name ];
            if ( !_callbacks ) {
                return false;
            }
            for ( var i = 0; i < _callbacks.length; i++ ) {
                _callbacks[ i ].call( me, e );
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

var Data = kc.Data = kity.createClass( 'Data', {

    mixins: [ kc.EventHandler ],

    constructor: function ( origin ) {
        this.origin = origin || {};
        this.callMixin();
    },

    format: function () {
        return this.origin;
    },

    /**
     * 更新指定路径的数据，会覆盖或新增到当前的数据中，并且触发 update 事件
     *
     * @param  {plain} delta  要更新的路径
     *
     * @example
     *
     * data.update({
     *     female: {
     *         value: 10,
     *         color: 'blue'
     *     },
     *     male: {
     *         value: 13,
     *         color: 'red'
     *     }
     * });
     *
     */
    update: function ( delta ) {
        this.origin = kity.Utils.extend( this.origin, delta );
        this.trigger( 'update' );
    },

    clear: function () {
        this.origin = {};
        this.trigger( 'update' );
    }

    // getStandard: function () {
    //     return this.format( this.origin );
    // }
} );

function getCamelName( name ) {
    return name.replace( /_(\w)/ig, function ( match ) {
        return match[ 1 ].toUpperCase();
    } );
}

var ChartElement = kc.ChartElement = kity.createClass( 'ChartElement', {
    mixins: [ kc.EventHandler ],

    constructor: function ( param ) {

        this.canvas = new kity.Group();
        this.canvas.host = this;

        this.visible = true;

        this.param = param || {};
        //挂载数据在图形上，交互的时候通过container获取
        this._bindData();

        this.elements = {};

        this.callMixin();
    },

    addElement: function ( key, chartElement ) {
        this.elements[ key ] = chartElement;
        this.canvas.addShape( chartElement.canvas );
        chartElement.container = this;
        return chartElement;
    },

    getElement: function ( key ) {
        return this.elements[ key ] || null;
    },

    removeElement: function ( key ) {
        var chartElement = this.elements[ key ];
        if ( chartElement ) {
            delete chartElement.container;
            this.canvas.removeShape( chartElement.canvas );
            delete this.elements[ key ];
        } else if ( key === undefined ) {
            for ( var k in this.elements ) {
                chartElement = this.elements[ k ];
                delete chartElement.container;
                this.canvas.removeShape( chartElement.canvas );
                delete this.elements[ k ];
            }
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
            'setOpacity': [ 'opacity' ],
            'setVisible': [ 'visible' ]
        };
    },

    updateByRule: function ( method, methodParams, param, animatedBeginValueCopy, progress ) {
        var shouldCall, lastParam, i, k;
        lastParam = this.param;


        for ( i = 0; i < methodParams.length; i++ ) {
            k = methodParams[ i ];
            // 值没有改变的话，不更新
            if ( k in param && ( !this._firstUpdate || lastParam[ k ] !== param[ k ] ) ) { //用!=符号， "" == 0为true
                shouldCall = true;
                break;
            }
        }

        if ( shouldCall ) {
            var currentParam = methodParams.map( function ( name ) {
                return name in param ? param[ name ] : lastParam[ name ];
            } );

            currentParam = currentParam.concat( [ animatedBeginValueCopy, progress ] );
            this[ method ].apply( this, currentParam );
        }
    },

    update: function ( param, animatedBeginValueCopy, progress ) {

        var key, rules, method, params, i, shouldCall, updated;

        // 挂载数据在图形上
        this._bindData();

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
            this.updateByRule( method, rules[ method ], param, animatedBeginValueCopy, progress );
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
    },

    setOpacity: function ( opacity ) {
        this.canvas.setOpacity( opacity );
    },

    _bindData: function () {
        if ( this.param.bind ) {
            this.canvas.bind = this.param.bind;
        }
    },

    setBindData: function ( val ) {
        this.canvas.bind = val;
    },

    getBindData: function () {
        return this.canvas.bind;
    },

    getPaper: function(){
        var tmp = this.canvas;
        while( tmp && tmp.container ){
            tmp = tmp.container;
            if( tmp instanceof kity.Paper ){
                break;
            }
        }
        return tmp;
    }
} );

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

var Chart = kc.Chart = kity.createClass( 'Chart', {
    base: kc.AnimatedChartElement,
    constructor: function ( target, param ) { //传入render目标
        this.callBase( param );
        this.setData( {} );

        if ( typeof ( target ) == 'string' ) {
            target = document.getElementById( target );
        }
        target.setAttribute( 'onselectstart', 'return false' );
        
        this.paper = new kity.Paper( target );
        this.paper.addShape( this.canvas );
        
        this.container = target;
        target.paper = this.paper;
    },
    getWidth: function () {
        return this.paper.getContainer().clientWidth;
    },
    getHeight: function () {
        return this.paper.getContainer().clientHeight;
    },
    setData: function ( data ) {
        if ( this._dataBind ) {
            this.data.off( 'update', this._dataBind );
        }
        this.data = data instanceof kc.Data ? data : new kc.Data( data );
        this.data.on( 'update', this._dataBind = ( function () {
            this.update();
        } ).bind( this ) );
    },
    getData: function () {
        return this.data;
    },
    update: function ( param ) {
        var data = this.data.format();
        this.callBase( param, data );
    }
} );

/**
 * @build
 */

var Arrow = kity.Arrow = kity.createClass( 'Arrow', {
    base: kity.Path,
    constructor: function ( opt ) {
        this.callBase();
        this.option = kity.Utils.extend( {
            w: 100,
            h: 20,
            a: 40,
            b: 20,
            c: 20,
            d: 20,
            t: 0
        }, opt );
        this.draw();
    },
    draw: function ( opt ) {
        opt = this.option = kity.Utils.extend( this.option, opt );

        var w = opt.w,
            h = opt.h,
            hh = h / 2,
            a = opt.a,
            b = opt.b,
            c = opt.c,
            d = opt.d,
            t = opt.t;
        var p0 = [ 0, -hh ],
            p1 = [ w, -hh ],
            p2 = [ w - b, -hh - c ],
            p3,
            p4 = [ w + a, 0 ],
            p5 = [ d, 0 ];

        switch ( t ) {
        case 0:
            p3 = p2;
            break;
        case 1:
            p3 = [ w + a - b - b * hh / c, -hh - c ];
            break;
        case 2:
            // have bug with that
            var x = w - b - 0.5 * c * ( b * h + a * c ) / ( b * b + c * c );
            var y = c * ( x - w - a ) / b;
            p3 = [ x, y ];
            break;
        case 3:
            p3 = [ w - b, -c * ( a + b ) / b ];
            break;
        default:
            if ( t instanceof Array ) {
                p3 = [ p2[ 0 ] + t[ 0 ], p2[ 1 ] + t[ 1 ] ];
            }
        }
        // x 轴镜像
        function m( p ) {
            return [ p[ 0 ], -p[ 1 ] ];
        }
        var pp0 = m( p0 ),
            pp1 = m( p1 ),
            pp2 = m( p2 ),
            pp3 = m( p3 );
        var path = [];
        path.push( [ 'M', p0 ] );
        path.push( [ 'L', p1 ] );
        path.push( [ 'L', p2 ] );
        path.push( [ 'L', p3 ] );
        path.push( [ 'L', p4 ] );
        path.push( [ 'L', pp3 ] );
        path.push( [ 'L', pp2 ] );
        path.push( [ 'L', pp1 ] );
        path.push( [ 'L', pp0 ] );
        path.push( [ 'L', p5 ] );
        path.push( [ 'L', p0 ] );
        path.push( 'z' );
        this.setPathData( path );
    }
} );

/**
 * @build
 */

var Pie = kity.Pie = kity.createClass( "Pie", {
    base: kity.Path,
    constructor: function ( outerRadius, pieAngle, startAngle, innerRadius ) {
        this.callBase();
        this.outerRadius = outerRadius || 100;
        this.pieAngle = pieAngle || 90;
        this.startAngle = startAngle || 0;
        this.innerRadius = innerRadius || 0;
        this.draw();
    },
    draw: function () {
        var d = this.getDrawer().clear();
        var r = this.innerRadius,
            R = this.outerRadius,
            sa = this.startAngle,
            pa = this.pieAngle;

        if(pa > 0 && pa % 360 === 0) pa = 359.99;
        if(pa < 0 && pa % 360 === 0) pa = -359.99;

        var p1 = kity.Point.fromPolar( r, sa ),
            p2 = kity.Point.fromPolar( R, sa ),
            p3 = kity.Point.fromPolar( R, sa + pa % 360 ),
            p4 = kity.Point.fromPolar( r, sa + pa % 360 );
        var largeFlag = Math.abs( pa ) > 180 ? 1 : 0;
        var sweepFlag = pa > 0 ? 1 : 0;

        d.moveTo( p1.x, p1.y );
        d.lineTo( p2.x, p2.y );
        d.carcTo( R, largeFlag, sweepFlag, p3.x, p3.y );
        d.lineTo( p4.x, p4.y );
        d.carcTo( r, largeFlag, sweepFlag ? 0 : 1, p1.x, p1.y );
        d.close();
    }
} );

/**
 * @build
 */

var RegularPolygon = kity.RegularPolygon = kity.createClass( 'RegularPolygon', ( function () {
    function p2o( length, angle ) {
        return [ length * Math.cos( angle ), -length * Math.sin( angle ) ];
    }
    return {
        base: kity.Path,
        constructor: function ( side, radius ) {
            this.callBase();
            this.radius = radius || 100;
            this.side = Math.max( side || 3, 3 );
            this.draw();
        },
        draw: function () {
            var r = this.radius,
                n = this.side,
                s = Math.PI * 2 / n;
            var path = [];
            path.push( [ 'M', p2o( r,  Math.PI / 2 ) ] );
            for ( var i = 1; i <= n; i++ ) {
                path.push( [ 'L', p2o( r, s * i + Math.PI / 2 ) ] );
            }
            path.push( 'z' );
            this.setPathData( path );
        }
    };
} )() );

/**
 * @build
 */

var Star = kity.Star = kity.createClass( 'Star', ( function () {
    function p2o( length, angle ) {
        return [ length * Math.cos( angle ), -length * Math.sin( angle ) ];
    }
    /**
     * @see http://www.jdawiseman.com/papers/easymath/surds_star_inner_radius.html
     */
    var defaultRatioForStar = {
        '3': 0.2, // yy
        '5': 0.38196601125,
        '6': 0.57735026919,
        '8': 0.541196100146,
        '10': 0.726542528005,
        '12': 0.707106781187
    };
    return {
        base: kity.Path,
        constructor: function ( vertex, outerRadius, innerRadius, innerOffset, angleOffset ) {
            this.callBase();
            this.vertex = vertex || 3;
            this.outerRadius = outerRadius || 100;
            this.innerRadius = innerRadius || this.outerRadius * (defaultRatioForStar[this.vertex] || 0.5);
            this.innerOffset = innerOffset || {
                x: 0,
                y: 0
            };
            this.angleOffset = angleOffset || 0;
            this.angleOffset = this.angleOffset;
            this.draw();
        },
        draw: function () {
            var innerRadius = this.innerRadius,
                outerRadius = this.outerRadius,
                vertex = this.vertex,
                innerOffset = this.innerOffset,
                angleStep = Math.PI / vertex,
                angleOffset = Math.PI * this.angleOffset / 180;
            var path = [],
                i, p, HPI = Math.PI / 2;
            path.push( [ 'M', p2o( outerRadius, HPI ) ] );
            for ( i = 1; i <= vertex * 2; i++ ) {
                if ( i % 2 ) {
                    p = p2o( innerRadius, angleStep * i + HPI + angleOffset );
                    p[0] += innerOffset.x;
                    p[1] += innerOffset.y;
                } else {
                    p = p2o( outerRadius, angleStep * i + HPI );
                }

                path.push( [ 'L', p ] );
            }
            path.push( 'z' );
            this.setPathData( path );
        }
    };
} )() );

// {
//             x1: 0,
//             y1: 0,
//             x2: 100,
//             y2: 0,
//             bound: null,
//             width: 1,
//             color: 'black',
//             dash: null
//         }
var Line = kc.Line = kity.createClass( "Line", {
    base: kc.AnimatedChartElement,
    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            x1: 0,
            y1: 0,
            x2: 100,
            y2: 0,
            bound: null,
            width: 1,
            color: 'black',
            dash: null
        }, param ) );
        this.line = new kity.Path();
        this.canvas.addShape( this.line );
    },

    getAnimatedParam: function () {
        return [ 'x1', 'y1', 'x2', 'y2', 'width' ];
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            draw: [ 'x1', 'y1', 'x2', 'y2', 'bound' ],
            stroke: [ 'color', 'width', 'dash' ]
        } );
    },

    draw: function ( x1, y1, x2, y2, bound ) {
        var drawer = this.line.getDrawer(),
            s = kc.sharpen;

        if ( bound ) {
            bound = this.boundTo( x1, y1, x2, y2, bound );
        }
        bound = bound || [
            [ x1, y1 ],
            [ x2, y2 ]
        ];
        drawer.clear();
        drawer.moveTo( s( bound[ 0 ][ 0 ] ), s( bound[ 0 ][ 1 ] ) );
        drawer.lineTo( s( bound[ 1 ][ 0 ] ), s( bound[ 1 ][ 1 ] ) );

    },

    stroke: function ( color, width, dash ) {
        var pen = new kity.Pen();
        pen.setWidth( width );
        pen.setColor( color );
        if ( dash ) {
            pen.setDashArray( dash );
        }
        this.line.stroke( pen );
    },

    boundTo: function ( x1, y1, x2, y2, bound ) {
        var b = bound,
            bx1 = b.x1,
            by1 = b.y1,
            bx2 = b.x2,
            by2 = b.y2,
            k, kk, bx1y, bx2y, by1x, by2x;

        function inRange( x, a, b ) {
            return ( a <= x && x <= b ) || ( a >= x && x >= b );
        }

        if ( x1 == x2 ) {
            return [ [ x1, b.y1 ], [ x2, b.y2 ] ];
        }
        if ( y1 == y2 ) {
            return [ [ b.x1, y1 ], [ b.x2, y2 ] ];
        }

        k = ( x1 - x2 ) / ( y1 - y2 );
        kk = 1 / k;
        bx1y = kk * ( bx1 - x1 ) + y1;
        bx2y = kk * ( bx2 - x1 ) + y1;
        by1x = k * ( by1 - y1 ) + x1;
        by2x = k * ( by2 - y1 ) + x1;

        var inc = [];
        if ( inRange( bx1y, by1, by2 ) ) {
            inc.push( [ bx1, bx1y ] );
        }
        if ( inRange( bx2y, by1, by2 ) ) {
            inc.push( [ bx2, bx2y ] );
        }
        if ( inRange( by1x, bx1, bx2 ) ) {
            inc.push( [ by1x, by1 ] );
        }
        if ( inRange( by2x, bx1, bx2 ) ) {
            inc.push( [ by2x, by2 ] );
        }
        if ( inc.length > 1 ) {
            return inc;
        }
    }
} );

// {
//     points: [
//         [0, 0],
//         [100, 100],
//         [100, 200]
//     ],
//     width: 1,
//     color: 'black',
//     dash: null
// }
var Polyline = kc.Polyline = kity.createClass( "Polyline", {
    base: kc.AnimatedChartElement,
    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            points: [
                [0, 0],
                [0, 0]
            ],
            width: 3,
            color: 'black',
            dash: null,
            animatedDir : 'y',
            factor: 0
        }, param ) );

        this.polyline = new kity.Path();
        this.canvas.addShape( this.polyline );
    },

    getAnimatedParam: function () {
        return [ 'factor' ];
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            draw: [ 'points', 'factor' ],
            stroke: [ 'color', 'width', 'dash' ]
        } );
    },

    parsePoint : function(index, pos, points){
        if(points && points[index]){
            return points[index][pos];
        }else{
            return 0;
        }
    },

    draw: function ( points, factor, animatedBeginValueCopy, progress ) {
        var drawer = this.polyline.getDrawer(),
            s = kc.sharpen;

        if( points.length > 0 ){
            drawer.clear();
            var dir = this.param.animatedDir,
                xDir = (dir == undefined || dir == 'x'),
                yDir = (dir == undefined || dir == 'y');


            if( animatedBeginValueCopy ){
                var prevPoints = animatedBeginValueCopy.points;
                var firstPointX = this.parsePoint(0, 0, prevPoints);
                var firstPointY = this.parsePoint(0, 1, prevPoints);
                var pointX, pointY;
                drawer.moveTo(
                    xDir ? s( (points[ 0 ][ 0 ] - firstPointX) * progress + firstPointX ) : s( points[ 0 ][ 0 ]),
                    yDir ? s( (points[ 0 ][ 1 ] - firstPointY) * progress + firstPointY ) : s( points[ 0 ][ 1 ])
                );

                for (var i = 1; i < points.length; i++) {
                    if(xDir) pointX = this.parsePoint(i, 0, prevPoints);
                    if(yDir) pointY = this.parsePoint(i, 1, prevPoints);
                    drawer.lineTo(
                        xDir ? s( (points[ i ][ 0 ] - pointX) * progress + pointX ) : s( points[ i ][ 0 ]),
                        yDir ? s( (points[ i ][ 1 ] - pointY) * progress + pointY ) : s( points[ i ][ 1 ])
                    );
                }

            }else{
                drawer.moveTo( s( points[ 0 ][ 0 ] ), s( points[ 0 ][ 1 ] ) );
                for (var i = 1; i < points.length; i++) {
                    drawer.lineTo( s( points[ i ][ 0 ] ), s( points[ i ][ 1 ] ) );
                }
            }
        }
    },

    stroke: function ( color, width, dash ) {
        var pen = new kity.Pen();
        pen.setWidth( width );
        pen.setColor( color );
        if ( dash ) {
            pen.setDashArray( dash );
        }
        this.polyline.stroke( pen );
    }

} );

// {
//             x1: 0,
//             y1: 0,
//             x2: 100,
//             y2: 0,
//             bound: null,
//             width: 1,
//             color: 'black',
//             dash: null
//         }
var ConnectLine = kc.ConnectLine = kity.createClass( "ConnectLine", {
    base: kc.ChartElement,
    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            x1: 0,
            y1: 0,
            x2: 100,
            y2: 0,
            bound: null,
            width: 1,
            color: 'black',
            dash: null
        }, param ) );
        this.line = new kity.Path();
        this.canvas.addShape( this.line );
    },
    getAnimatedParam: function () {
        return [ 'x1', 'y1', 'x2', 'y2', 'width' ];
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            draw: [ 'x1', 'y1', 'x2', 'y2', 'bound' ],
            stroke: [ 'color', 'width', 'dash' ]
        } );
    },

    draw: function ( x1, y1, x2, y2, bound ) {
        var drawer = this.line.getDrawer(),
            s = kc.sharpen;

        if ( bound ) {
            bound = this.boundTo( x1, y1, x2, y2, bound );
        }
        bound = bound || [
            [ x1, y1 ],
            [ x2, y2 ]
        ];
        drawer.clear();
        drawer.moveTo( s( bound[ 0 ][ 0 ] ), s( bound[ 0 ][ 1 ] ) );
        drawer.lineTo( s( bound[ 1 ][ 0 ] ), s( bound[ 1 ][ 1 ] ) );

    },

    stroke: function ( color, width, dash ) {
        var pen = new kity.Pen();
        pen.setWidth( width );
        pen.setColor( color );
        if ( dash ) {
            pen.setDashArray( dash );
        }
        this.line.stroke( pen );
    },

    boundTo: function ( x1, y1, x2, y2, bound ) {
        var b = bound,
            bx1 = b.x1,
            by1 = b.y1,
            bx2 = b.x2,
            by2 = b.y2,
            k, kk, bx1y, bx2y, by1x, by2x;

        function inRange( x, a, b ) {
            return ( a <= x && x <= b ) || ( a >= x && x >= b );
        }

        if ( x1 == x2 ) {
            return [ [ x1, b.y1 ], [ x2, b.y2 ] ];
        }
        if ( y1 == y2 ) {
            return [ [ b.x1, y1 ], [ b.x2, y2 ] ];
        }

        k = ( x1 - x2 ) / ( y1 - y2 );
        kk = 1 / k;
        bx1y = kk * ( bx1 - x1 ) + y1;
        bx2y = kk * ( bx2 - x1 ) + y1;
        by1x = k * ( by1 - y1 ) + x1;
        by2x = k * ( by2 - y1 ) + x1;

        var inc = [];
        if ( inRange( bx1y, by1, by2 ) ) {
            inc.push( [ bx1, bx1y ] );
        }
        if ( inRange( bx2y, by1, by2 ) ) {
            inc.push( [ bx2, bx2y ] );
        }
        if ( inRange( by1x, bx1, bx2 ) ) {
            inc.push( [ by1x, by1 ] );
        }
        if ( inRange( by2x, bx1, bx2 ) ) {
            inc.push( [ by2x, by2 ] );
        }
        if ( inc.length > 1 ) {
            return inc;
        }
    }
} );

var Bezier = kc.Bezier = kity.createClass( "Bezier", {
    base: kc.ChartElement,
    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            x1: 0,
            x2: 0,
            y1: 0,
            y2: 0,
            cx: 0,
            cy: 0,
            width: 1,
            color: 'black',
        }, param ) );
        var p = this.param;
        this.line = new kity.Path();
        this.canvas.addShape( this.line );
    },

    getAnimatedParam: function () {
        return [ 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'width' ];
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            draw: [ 'x1', 'y1', 'x2', 'y2', 'cx', 'cy' ],
            stroke: [ 'color', 'width', 'dash' ]
        } );
    },

    draw: function ( x1, y1, x2, y2, cx, cy ) {
        if ( x1 && y1 && x2 && y2 && cx && cy ) {
            this.line.getDrawer().clear().moveTo( x1, y1 ).bezierTo( cx, cy, cx, cy, x2, y2 );
        }
    },

    stroke: function ( color, width, dash ) {
        var pen = new kity.Pen();
        pen.setWidth( width );
        pen.setColor( color );
        if ( dash ) {
            pen.setDashArray( dash );
        }
        this.line.stroke( pen );
    }
} );

/**
 * 表示标签
 * @param {string} text
 *        标签的文本
 *
 * @param {string} at
 *        标签文本的位置，是指相对于标签本身坐标的方向
 *        允许取值为：center（默认）、left、right、up、down
 *
 * @param {int} margin
 *        文本离标签坐标在指定方向上的距离
 *
 * @param {Plain} style
 *        文本的样式（CSS）
 *
 * @param {int} color
 *        文本颜色
 */
var Label = kc.Label = kity.createClass( "Label", {

    base: kc.AnimatedChartElement,

    constructor: function ( param ) {
        this.callBase( {
            text: '',
            at: 'center',
            margin: 0,
            style: {
                family: 'Arial'
            },
            color: 'black',
            rotate: 0
        } );

        this.text = new kity.Text().setStyle( {
            'font-size': 12,
            'family': 'Arial'
        } );
        this.canvas.addShape( this.text );
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            'updateText': [ 'text' ],
            'updateAnchor': [ 'at', 'margin', 'rotate' ],
            'updateColor': [ 'color' ],
            'updateStyle': [ 'style' ]
        } );
    },

    getAnimatedParam: function () {
        return [];
    },

    updateText: function ( text ) {
        this.text.setContent( text );
        this.updateSize();

        // 文本更新需要更新位置
        this.updateAnchor( this.param.at, this.param.margin, this.param.rotate );
    },

    updateSize: function () {
        this.size = 0;
        this.size = this.getSize();
        this.trigger( 'sizechanged' );
    },

    getSize: function () {
        return this.size || this.callBase();
    },

    updateStyle: function ( style ) {
        this.text.setStyle( style );
        this.updateSize();
        this.updateAnchor( this.param.at, this.param.margin, this.param.rotate );
    },

    updateAnchor: function ( at, margin, rotate ) {
        var hh = this.size.height / 2;
        switch ( at ) {
        case 'left':
            this.text.setTextAnchor( 'end' ).setPosition( margin, hh / 1.5 );
            break;
        case 'right':
            this.text.setTextAnchor( 'start' ).setPosition( margin, hh / 1.5 );
            break;
        case 'up':
        case 'top':
            this.text.setTextAnchor( 'middle' ).setPosition( 0, hh - margin );
            break;
        case 'down':
        case 'bottom':
            var anchor = 'middle';
            if ( rotate != 0 ) anchor = 'end';
            this.text.setTextAnchor( anchor ).setPosition( 0, hh + margin );
            break;
        default:
            this.text.setTextAnchor( 'middle' ).setPosition( 0, hh * 0.75 );
        }

        if ( rotate != 0 ) this.text.setRotate( rotate );
    },

    updateColor: function ( color ) {
        this.text.fill( color );
    }

} );

/**
 *
 * @class Bar
 *
 * @param {int} dir
 *        指 Bar 的方向要冲下还是冲上，-1 是冲上（默认），1 是冲下
 *
 * @param {Number} width [Animatable]
 *        指实例的宽度
 *
 * @param {Number} height [Animatable]
 *        指实例的高度
 *        animatable: true
 *
 * @param {Number} offset [Animatable]
 *        指实例的位置
 *        animatable: true
 *
 * @param {kity.Color|String} [Animatable]
 *        指实例的颜色
 *        animatable: true
 */

( function ( kity, kc ) {

    var Bar = kc.Bar = kity.createClass( "Bar", {
        base: kc.AnimatedChartElement,

        constructor: function ( param ) {
            this.callBase( kity.Utils.extend( {
                dir: -1,
                offset: 0,
                color: '#000',
                width: 10,
                height: 0,
                rotate: 0
            }, param ) );
            this.rect = new kity.Path();
            this.canvas.addShape( this.rect );
        },

        registerUpdateRules: function () {
            return kity.Utils.extend( this.callBase(), {
                draw: [ 'width', 'height', 'dir', 'offset', 'rotate' ],
                fill: [ 'color' ]
            } );
        },

        getAnimatedParam: function () {
            return [ 'width', 'height', 'offset']; //color暂时去掉color
        },

        fill: function ( color ) {
            this.rect.fill( color );
        },

        draw: function ( width, height, dir, offset, rotate ) {

            var ww = width / 2;

            var seq = [];

            seq.push( 'M', -ww, -offset );
            seq.push( 'L', -ww, -offset + dir * height );
            seq.push( 'L',  ww, -offset + dir * height );
            seq.push( 'L',  ww, -offset );
            seq.push( 'L',  ww, -offset );
            seq.push( 'Z' );

            this.rect.setPathData( seq ).setRotate( rotate );

            this.interestPoint = {
                x: 0,
                y: dir * height
            };
        },

        getInterestPoint: function () {
            return this.canvas.getTransform().transformPoint( this.interestPoint );
        }
    } );
} )( kity, kc );

/**
 * @build
 * @require base/ChartElement.js
 */

/* abstract */
var Coordinate = kc.Coordinate = kity.createClass( "Coordinate", ( function () {
	return {
        base: kc.ChartElement,
	};
} )() );

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

            this.xArrow.setTranslate( width, height + 0.5 );
            this.yArrow.setRotate( -90 ).setTranslate( 0.5, 0 );

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
var CategoryCoordinate = kc.CategoryCoordinate = kity.createClass( "CategoryCoordinate", ( function () {
    function defaultFormat( number, index ) {
        if ( number > 1000 ) {
            return number / 1000 + 'K';
        }
        number = ( ( number * 10 ) | 0 ) / 10;
        return number;
    }

    var arrowParam = {
        w: 0,
        h: 1,
        a: 7,
        b: 2,
        c: 3,
        d: 0,
        t: 0
    };

    var componentsIniter = {
        "xMesh" : function(){
            this.addElement( 'xMesh', new kc.Mesh( {
                type: 'vertical'
            } ) );
        },
        "yMesh" : function(){
            this.addElement( 'yMesh', new kc.Mesh( {
                type: 'horizon',
                dir: 1
            } ) );
        },
        "xCat" : function(){
            this.addElement( 'xCat', new kc.Categories( {
                at: 'bottom',
                rotate: this.param.xLabelRotate
            } ) );
        },
        "yCat" : function(){
            this.addElement( 'yCat', new kc.Categories( {
                at: 'left',
                rotate: this.param.yLabelRotate
            } ) );
        },
        "xAxis" : function(){
            this.addElement( 'xAxis', new kc.Line( {
                color: '#999'
            } ) );
            
            if( this.param.xAxisArrow )
                this.canvas.addShape( this.xArrow = new kity.Arrow( arrowParam ).fill( '#999' ) );
        },
        "yAxis" : function(){
            this.addElement( 'yAxis', new kc.Line( {
                color: '#999'
            } ) );

            if( this.param.yAxisArrow )
                this.canvas.addShape( this.yArrow = new kity.Arrow( arrowParam ).fill( '#999' ) );
        }
    };

    return {
        base: kc.Coordinate,
        constructor: function ( param ) {

            var mix = kity.Utils.extend({

                dataSet: [],
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 90,
                    left: 100
                },
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 0,
                    left: 0
                },

                unitX: null,
                unitY: null,
                meshX: true,
                meshY: true,
                formatX: null,
                formatY: null,
                rangeX: null,
                rangeY: null,
                minX: null,
                minY: null,
                xLabelsAt: null,
                yLabelsAt: null,
                labelMargin: 10,
                xAxisArrow: null,
                yAxisArrow: null,
                xLabelRotate: 0,
                yLabelRotate: 0
            }, param );

            mix.x = mix.margin.left;
            mix.y = mix.margin.top;

            this.callBase(  mix );

            this._initRulers();
            this._initElements();

        },
        _initRulers: function () {
            this.xRuler = new kc.Ruler();
            this.yRuler = new kc.Ruler();
        },
        _initElements: function () {
            var func, components;
            components = this.param.components = (this.param.components === undefined)? ["xMesh", "yMesh", "xCat", "yCat", "xAxis", "yAxis"] : this.param.components;
            
            this._processComponents( componentsIniter );

        },
        registerUpdateRules: function () {
            return kity.Utils.extend( this.callBase(), {
                'updateAll': [ 
                    'dataSet',
                    'margin',
                    'padding',
                    'unitX',
                    'unitY',
                    'meshX',
                    'meshY',
                    'formatX',
                    'formatY',
                    'rangeX',
                    'rangeY',
                    'minX',
                    'minY',
                    'xLabelsAt',
                    'yLabelsAt',
                    'labelMargin',
                    'xAxisArrow',
                    'yAxisArrow',
                    'xLabelRotate',
                    'yLabelRotate'
                ]
            } );
        },
        getXRuler: function () {
            return this.xRuler;
        },
        getYRuler: function () {
            return this.yRuler;
        },

        _processComponents : function( composer ){
            var com;
            for( com in this.param.components ){
                func = composer[ this.param.components[ com ] ];
                func && func.bind(this)();
            }
        },

        getXLabels : function(){
            return this.xLabels;
        },

        getYLabels : function(){
            return this.yLabels;
        },

        measurePoint : function( point ){
            var p = this.param;
            var x = this.xRuler.measure(point[0]) + p.margin.left,
                y = this.yRuler.measure(point[1]) + p.margin.top + p.padding.top;
            return [ x, y ];
        },

        measurePointX : function( x ){
            return this.xRuler.measure(x) + this.param.margin.left;
        },

        measurePointY : function( y ){
            return this.yRuler.measure(y) + this.param.margin.top + this.param.padding.top;
        },

        measureValueRange : function( val, type ){
            var method = type == 'x'? 'measurePointX' : 'measurePointY';
            return  this[ method ]( val ) - this[ method ]( 0 );
        },

        updateAll: function (
                dataSet,
                margin,
                padding,
                unitX,
                unitY,
                meshX,
                meshY,
                formatX,
                formatY,
                rangeX,
                rangeY,
                minX,
                minY,
                xLabelsAt,
                yLabelsAt,
                labelMargin,
                xAxisArrow,
                yAxisArrow,
                xLabelRotate,
                yLabelRotate
            ) {

            var width = this.container.getWidth() - margin.left - margin.right,
                height = this.container.getHeight() - margin.top - margin.bottom;

            var xCategories = dataSet.xAxis && dataSet.xAxis.categories;
            var yCategories = dataSet.yAxis && dataSet.yAxis.categories;

            var xFormat = formatX || defaultFormat,
                yFormat = formatY || defaultFormat;

            var xRuler = this.xRuler, xMin, xMax, xGrid, xCount;
            var yRuler = this.yRuler, yMin, yMax, yGrid, yCount;

            if( xCategories ){
                rangeX = [0, xCategories.length-1];
            }
            xMin = kity.Utils.isNumber( minX )? minX : rangeX[ 0 ];
            xMax = rangeX[ 1 ];

            if( yCategories ){
                rangeY = [0, yCategories.length-1];
            }
            yMin = kity.Utils.isNumber( minY )? minY : rangeY[ 0 ];
            yMax = rangeY[ 1 ]; 


            xRuler.ref( xMin, xMax ).map( padding.left, width - padding.right );
            if(xCategories){
                xGrid = xRuler.gridByCategories( xCategories.length );
            }else{
                xCount = width / 60 | 0;
                xGrid = xRuler.gridByCount( xCount, null, true, minX );
            }
            
            yRuler.ref( yMin, yMax ).map( height - padding.top - padding.bottom, 0 );
            if(yCategories){
                yGrid = yRuler.gridByCategories( yCategories.length );
            }else{
                yCount = height / 40 | 0;
                yGrid = yRuler.gridByCount( yCount, null, true, minY );
            }
            
            for (var i = 0; i < yGrid.map.length; i++) {
                yGrid.map[i] = yGrid.map[i] + padding.top;
            }

            var xAxis = this.getElement( 'xAxis' ),
                yAxis = this.getElement( 'yAxis' ),
                xCat  = this.getElement( 'xCat' ),
                yCat  = this.getElement( 'yCat' ),
                xMesh = this.getElement( 'xMesh' ),
                yMesh = this.getElement( 'yMesh' );

            xAxis && xAxis.update( {
                x1: 0,
                y1: height,
                x2: width,
                y2: height
            } );

            yAxis && yAxis.update( {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: height
            } );

            var xLabels = xCategories ? xCategories : xGrid.ref.map( xFormat );
            if(xCat){
                xCat.update( {
                    rules: xGrid.map,
                    labels: xLabels,
                    y: height,
                    step: dataSet.xAxis && dataSet.xAxis.step || 1,
                    at : xLabelsAt || 'bottom'
                } );
            }
            if(xCategories){
                this.xLabels = xLabels;
            }

            var yLabels = yCategories ? yCategories : yGrid.ref.map( yFormat );
            if(yCat){
                margin = yLabelsAt == 'right'? xRuler._map.to + labelMargin : labelMargin;

                yCat.update( {
                    rules: yGrid.map,
                    labels: yLabels,
                    x: 0,
                    step: dataSet.yAxis && dataSet.yAxis.step || 1,
                    at : yLabelsAt || 'left',
                    margin : margin
                } );
            }
            if(yCategories){
                this.yLabels = yLabels;
            }

            xMesh && xMesh.update( {
                rules: xGrid.map,
                length: height - yGrid.map[ yGrid.map.length - 1 ],
                y: height,
                step: dataSet.xAxis && dataSet.xAxis.step || 1
            } );

            yMesh && yMesh.update( {
                rules: yGrid.map,
                length: xGrid.map[ xGrid.map.length - 1 ],
                x: 0,
                y: 0,
                step: dataSet.yAxis && dataSet.yAxis.step || 1
            } );

            this.xArrow && this.xArrow.setTranslate( width, height + 0.5 );
            this.yArrow && this.yArrow.setRotate( -90 ).setTranslate( 0.5, 0 );
        }
    };
} )() );



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
                    element.animate( list[ index ] );
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
            element.canvas.setOpacity( 0 ).fadeIn( 500, 'ease' );
        }
    },
    shrink: function ( size ) {
        var removed = this.elementList.splice( -size );
        while ( removed.length ) {
            this.canvas.removeShape( removed.pop().canvas );
        }
    }
} );



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
                    color: '#888'
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

/**
 * 具有一个扇环的单点类型
 *
 * @param {String} label
 *        标签显示的文本
 *
 * @param {String} labelColor
 *        标签的颜色
 *
 * @param {String} labelPosition
 *        标签出现的位置，允许取值为：inside, left, top, right, bottom, auto
 *
 * @param {Number} pieInnerRadius
 *        半径大小
 *
 * @param {Number} pieOuterRadius
 *        扇环的大小
 *
 * @param {Number} pieAngle
 *        扇环的角度
 *
 * @param {Number} piePercent
 *        扇环的长度，取值为 0 - 100，100 表示整个圆
 *
 * @param {String} pieBackground
 *        扇环的背景颜色
 *
 * @param {String} pieColor
 *        扇环的颜色
 *
 * @param {Float} collapsed
 *        圆环的折叠率，为 0 不折叠，并且显示标签；为 1 折叠成一个半径为 2 的小圆点；大于 0 标签不显示
 */
var PieDot = kc.PieDot = kity.createClass( "PieDot", {

	base: kc.AnimatedChartElement,

	constructor: function ( param ) {
		this.callBase( kity.Utils.extend( {
			labelText: null,
			labelColor: '#62a9dd',
			labelPosition: 'inside',

			innerRadius: 0,
			outerRadius: 0,
			angle: 0,
			percent: 0,
			showPercent: true,
			collapsed: 0,

			background: '#ccc',
			color: '#62a9dd'
		}, param ) );

		this.bPie = new kity.Pie();
		this.fPie = new kity.Pie();

		this.canvas.addShapes( [ this.bPie, this.fPie ] );
		this.addElement( 'label', new kc.Label() );
		this.addElement( 'plabel', new kc.Label() );
	},

	registerUpdateRules: function () {
		return kity.Utils.extend( this.callBase(), {
			updatePies: [ 'innerRadius', 'outerRadius', 'angle', 'percent', 'collapsed' ],
			updatePiesColor: [ 'color', 'background' ],
			updateLabel: [ 'labelText', 'labelColor', 'labelPosition', 'outerRadius', 'showPercent', 'collapsed' ],
			updatePercentLabel: [ 'labelColor', 'innerRadius', 'outerRadius', 'percent', 'showPercent', 'collapsed' ]
		} );
	},

	getAnimatedParam: function () {
		return [ 'labelColor', 'innerRadius', 'outerRadius',
			'angle', 'percent', 'collapsed' ];
	},

	updatePiesColor: function ( color, bg ) {
		this.fPie.fill( color );
		this.bPie.fill( bg );
	},

	updatePies: function ( innerRadius, outerRadius, angle, percent, collapsed ) {
		var pieLength = percent / 100,
			collapsedRadius = 3.5;

		innerRadius *= ( 1 - collapsed );
		outerRadius = collapsedRadius + ( outerRadius - collapsedRadius ) * ( 1 - collapsed );

		this.bPie.innerRadius = this.fPie.innerRadius = innerRadius;
		this.bPie.outerRadius = this.fPie.outerRadius = outerRadius;
		this.bPie.startAngle = this.fPie.startAngle = angle;


		this.bPie.pieAngle = -360 * ( 1 - pieLength );
		this.fPie.pieAngle = 360 * pieLength;

		this.bPie.draw();
		this.fPie.draw();
	},

	updateLabel: function ( labelText, labelColor, labelPosition, outerRadius, showPercent, collapsed ) {
		if ( collapsed < 1 ) {
			this.getElement( 'label' ).update( {
				visible: true,
				opacity: 1 - collapsed,
				text: labelText,
				color: labelColor,
				at: showPercent ? 'bottom' : labelPosition,
				margin: outerRadius + 10
			} );
		}
	},

	updatePercentLabel: function ( labelColor, innerRadius, outerRadius, percent, showPercent, collapsed ) {
		var plabel = this.getElement( 'plabel' );

		if ( showPercent && collapsed < 1) {
			var labelWidth = plabel.getSize().width;
			plabel.update( {
				visible: true,
				opacity: 1 - collapsed,
				at: labelWidth < innerRadius * 1.8 ? 'center' : 'top',
				color: labelColor,
				margin: outerRadius + 10,
				text: ( percent | 0 ) + '%'
			} );
		}
	}
} );

/**
 * 具有一个扇环的单点类型
 *
 * @param {String} label
 *        标签显示的文本
 *
 * @param {String} labelColor
 *        标签的颜色
 *
 * @param {String} labelPosition
 *        标签出现的位置，允许取值为：inside, left, top, right, bottom, auto
 *
 * @param {Number} pieInnerRadius
 *        半径大小
 *
 * @param {Number} pieOuterRadius
 *        扇环的大小
 *
 * @param {Number} pieAngle
 *        扇环的角度
 *
 * @param {String} pieColor
 *        扇环的颜色
 */
var Pie = kc.Pie = kity.createClass( "Pie", {

	base: kc.AnimatedChartElement,

	constructor: function ( param ) {
		this.callBase( kity.Utils.extend( {
			labelText: null,
			labelColor: '#62a9dd',
			labelPosition: 'inside',

			connectLineWidth: 1,
			connectLineColor: '#62a9dd',

			innerRadius: 0,
			outerRadius: 0,
			startAngle: 0,
			pieAngle: 0,

			strokeWidth: 1,
			strokeColor: '#FFF',

			color: '#62a9dd'
		}, param ) );

		this.pie = new kity.Pie();

		this.canvas.addShape( this.pie );
		this.label = this.addElement( 'label', new kc.Label() );
		this.connectLine = this.addElement( 'connectLine', new kc.Line() );
	},

	registerUpdateRules: function () {
		return kity.Utils.extend( this.callBase(), {
			updatePies: [ 'innerRadius', 'outerRadius', 'startAngle', 'pieAngle', 'strokeWidth', 'strokeColor' ],
			updatePiesColor: [ 'color' ],
			updateLabel: [ 'labelText', 'labelColor', 'labelPosition', 'outerRadius', 'startAngle', 'pieAngle' ],
			updateConnectLine: [ 'labelText', 'connectLineWidth', 'connectLineColor', 'labelPosition', 'innerRadius', 'outerRadius', 'startAngle', 'pieAngle' ]
		} );
	},

	getAnimatedParam: function () {
		return [ 'startAngle', 'pieAngle' ];
	},

	updatePiesColor: function ( color ) {
		this.pie.fill( color );
	},

	updatePies: function ( innerRadius, outerRadius, startAngle, pieAngle, strokeWidth, strokeColor ) {

		this.pie.innerRadius = innerRadius;
		this.pie.outerRadius = outerRadius;
		this.pie.startAngle = startAngle;
		this.pie.pieAngle = pieAngle;
		this.pie.draw();

        var pen = new kity.Pen();
        pen.setWidth( strokeWidth );
        pen.setColor( strokeColor );
		this.pie.stroke( pen );

	},

	updateLabel: function ( labelText, labelColor, labelPosition, outerRadius, startAngle, pieAngle ) {

		var r = labelPosition == 'inside' ? outerRadius - 30 : outerRadius + 50;
		var a = (startAngle + pieAngle / 2) / 180 * Math.PI;

		this.label.setVisible( true );
		this.label.update( {
			text: labelText,
			color: labelColor,
			at: 'bottom',
			margin: 0,
			x : r * Math.cos( a ),
			y : r * Math.sin( a )
		} );

	},

	updateConnectLine: function( labelText, connectLineWidth, connectLineColor, labelPosition, innerRadius, outerRadius, startAngle, pieAngle ){
		if( labelPosition != 'outside' || !labelText ) return;

		var r = outerRadius + 30;
		var a = (startAngle + pieAngle / 2) / 180 * Math.PI;

		this.connectLine.update({
            x1: (innerRadius + 2) * Math.cos( a ),
            y1: (innerRadius + 2) * Math.sin( a ),
            x2: r * Math.cos( a ),
            y2: r * Math.sin( a ),
            width: connectLineWidth,
            color: connectLineColor
		});

	}

} );

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
var CircleDot = kc.CircleDot = kity.createClass( "CircleDot", {

    base: kc.AnimatedChartElement,

    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            label: {
                at: 'bottom',
                color: 'black',
                text: null,
            },
            strokeColor : '#FFF',
            strokeWidth : 0,
            color: '#62a9dd',
            radius: 0,
            fxEasing: 'easeOutElastic',
            y : 0
        }, param ) );

        this.circle = new kity.Circle();

        this.canvas.addShapes( [ this.circle ] );
        this.addElement( 'label', new kc.Label() );
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            'updateRadius': [ 'radius' ],
            'updateStyle': [ 'color', 'strokeColor', 'strokeWidth' ],
            'updateText': [ 'labelText' ]
        } );
    },
    updateText: function ( labelText ) {
        this.getElement( 'label' ).update( {
            text: labelText
        } );
    },

    updateRadius: function ( radius ) {
        this.circle.setRadius( radius );
    },

    updateStyle: function ( color, strokeColor, strokeWidth ) {
        var pen = new kity.Pen();

        pen.setWidth( strokeWidth );
        pen.setColor( strokeColor );

        this.circle.stroke( pen );
        this.circle.fill( color );
    },

    getAnimatedParam: function () {
        return [ 'radius', 'y' ];
    }
} );

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
            me.hightlight();
            var container = selfparam.chart.paper.container;
            container.appendChild( tooltip );
            if ( selfparam.mode !== 'circle' ) label.canvas.setOpacity( 1 );
            tooltip.innerHTML = '<h1>' + selfparam.label.text + '</h1>' +
                '<p><b style="color:#006dbe">所属类别：</b>' + selfparam.brandclass + '</p>' +
                '<p class="percent"><b style="color:#006dbe">占比：</b> 类别中：' + selfparam.percent * 100 + '%；' + '总体：' + ( selfparam.percentall || '0' ) + '</p>';
            tooltip.style.left = ( selfparam.x - selfparam.radius ) + 'px';
            tooltip.style.top = ( selfparam.y + selfparam.radius ) + 'px';

        } );
        this.on( 'mouseout', function ( e ) {
            me.hightlight( false );
            if ( selfparam.radius < 20 && selfparam.mode !== 'circle' ) {
                label.canvas.setOpacity( 0 );
            }
            var container = selfparam.chart.paper.container;
            try {
                container.removeChild( tooltip );
            } catch ( error ) {

            }
        } );
    },
    hightlight: function ( ishighlight ) {
        if ( ishighlight === undefined || ishighlight ) {
            this.circle.stroke( new kity.Pen( new kity.Color( this.param.color ).dec( 'l', 10 ), 2 ) );
        } else {
            this.circle.stroke( 0 );
        }
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
                label.text.setStyle( {
                    'font-size': targetparam.percent * 25
                } );
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
                    var transR = targetparam.R + targetparam.radius + label.canvas.getWidth() / 2 + 20;
                    label.canvas.setRotate( 180 * targetparam.sDelta / targetparam.total );
                    label.canvas.setTranslate( transR * cosDelta - curRx, transR * sinDelta - curRy );
                } else {
                    label.canvas.setTranslate( 0, 0 );
                    label.canvas.setRotate( 0 );
                    if ( afterAnimated.radius < 15 ) {
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

/**
 * 网格绘制
 * @param {int} dir
 *        网格绘制方向，为 -1 则向上绘制，为 1 则向下绘制
 *
 * @param {int} height
 *        每个网格线的高度
 *
 * @param {int} width
 *        网格线的粗细
 *
 * @param {int} color
 *        网格线的颜色
 *
 * @param {Array} rules
 *        每个网格线的位置
 */
var Mesh = kc.Mesh = kity.createClass( "Mesh", {

    base: kc.ChartElement,

    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            type: 'vertical',
            dir: -1,
            length: 0,
            width: 1,
            color: '#CCC',
            rules: [],
            dash: [ 2, 2 ],
            step: 1,
            fx: true
        }, param ) );
        this.addElement( 'lines', new kc.ElementList( {
            elementClass: kc.Line,
            list: []
        } ) );
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            'updateRules': [ 'rules', 'type', 'dir', 'length', 'step' ],
            'updateLines': [ 'width', 'color', 'dash' ]
        } );
    },

    updateRules: function ( rules, type, dir, length, step ) {

        var i, rule, list=[], tmp;

        // step == 0 不绘制
        for (var i = 0; i < rules.length; i += step) {
            rule = rules[i];
            if ( type == 'vertical' ) {
                tmp = {
                    x1: rule,
                    x2: rule,
                    y1: 0,
                    y2: dir * length,
                };
            } else {
                tmp = {
                    x1: 0,
                    x2: dir * length,
                    y1: rule,
                    y2: rule,
                };
            }

            list.push(tmp);
        };

        this.getElement( 'lines' ).update( {
            list: list
        } );
    },

    updateLines: function ( width, color, dash ) {
        this.getElement( 'lines' ).update( {
            common: {
                width: width,
                color: color,
                dash: dash
            }
        } );
    }
} );

/**
 * 在一个序列上渲染文字
 *
 * @param {String} at
 *        序列方向，支持 'left'|'bottom'
 *
 * @param {Array} rules
 *        刻度位置，由小到大排序
 *
 * @param {Array} labels
 *        刻度文本，要求和 rules 有同样的长度，一一对应
 *
 * @param {String} color
 *        文字颜色
 */
var Categories = kc.Categories = kity.createClass( 'Categories', {

	base: kc.ChartElement,

	constructor: function ( param ) {
		this.callBase( kity.Utils.extend( {
			at: 'bottom',
			rules: [],
			labels: [],
			color: 'black',
			margin: 10,
			step: 1,
			rotate: 0
		}, param ) );

		this.addElement( 'labels', new kc.ElementList( {
			elementClass: kc.Label
		} ) );
	},

	registerUpdateRules: function () {
		return kity.Utils.extend( this.callBase(), {
			'updateCategories': [ 'rules', 'labels', 'at', 'margin', 'rotate', 'step' ],
			'updateColor': 'color',
			'updateCommon': 'common'
		} );
	},

	updateCategories: function ( rules, labels, at, margin, rotate, step ) {
		var i, rule, x, y, list = [];

		// step == 0 不绘制
		for (i = 0; i < rules.length; i += step) {
			rule = rules[i];
			if ( at == 'left' ) {
				x = -margin;
				y = rule;
			} else if ( at == 'bottom' ) {
				x = rule;
				y = margin;
			} else if ( at == 'right' ) {
				x = margin;
				y = rule;
			} 

			list.push({
				x: x,
				y: y,
				at: at,
				rotate: rotate,
				text: labels[ i ]
			});
		}

		this.getElement( 'labels' ).update( {
			list: list,
			fx: true
		} );
	},

	updateColor: function ( color ) {
		this.getElement( 'labels' ).update( {
			common: {
				color: color
			}
		} );
	}
} );

/**
 * Marquee for chart
 * @type {[type]}
 */
var Marquee = kc.Marquee = kity.createClass( "Marquee", {
    mixins: [ kc.EventHandler ],
    constructor: function ( chart ) {
        var paper = chart.paper;
        if ( !chart.paper ) return;
        this.bind( paper );
        this.callMixin();
    },
    bind: function ( paper ) {
        var rect = new kity.Rect().fill( 'rgba(240,240,255, 0.3)' ).stroke( '#aaf' );
        var startPosition = null,
            currentPosition, delta, activated = false;
        var me = this;

        function start( e ) {
            if ( startPosition !== null ) return end( e );
            startPosition = kc.sharpen( e.getPosition() );
            rect.setPosition( startPosition.x, startPosition.y );
            paper.on( 'mousemove', move );
        }

        function move( e ) {
            currentPosition = e.getPosition();
            delta = kity.Vector.fromPoints( startPosition, currentPosition );
            if ( delta.length() > 10 ) {
                activated = true;
                paper.addShape( rect );
                rect.setSize( delta.x | 0, delta.y | 0 );
            }
        }

        function end( e ) {
            if ( activated ) {
                me.trigger( 'marquee', {
                    start: startPosition,
                    end: currentPosition,
                    size: {
                        width: delta.x,
                        height: delta.y
                    }
                } );
            }
            activated = false;
            startPosition = null;
            paper.removeShape( rect );
            paper.off( 'mousemove', move );
        }

        paper.on( 'mousedown', start );
        paper.on( 'mouseup', end );
    }
} );

/**
 * 具有一个扇环的单点类型
 *
 * @param {String} label
 *        标签显示的文本
 *
 * @param {String} labelColor
 *        标签的颜色
 *
 * @param {String} labelPosition
 *        标签出现的位置，允许取值为：inside, left, top, right, bottom, auto
 *
 * @param {Number} pieInnerRadius
 *        半径大小
 *
 * @param {Number} pieOuterRadius
 *        扇环的大小
 *
 * @param {Number} pieAngle
 *        扇环的角度
 *
 * @param {String} pieColor
 *        扇环的颜色
 */
var Rectage = kc.Rectage = kity.createClass( "Rectage", {

    base: kc.AnimatedChartElement,

    constructor: function ( param ) {
        this.callBase( kity.Utils.extend( {
            x : 0,
            y : 0,
            width : 0,
            height : 0,
            color : 'rgba( 255, 255, 255, 0 )',
            
            strokeWidth : 0,
            strokeColor : '#888',

            labelText : null,
            labelColor : 'red',
            labelX : 5,
            labelY : 5

        }, param ) );

        this.rect = new kity.Rect();

        this.canvas.addShape( this.rect );
        this.label = this.addElement( 'label', new kc.Label() );
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            drawRect: [ 'width', 'height', 'color' ],
            stroke: [ 'strokeWidth', 'strokeColor' ],
            drawText: [ 'labelText', 'labelColor', 'labelX', 'labelY', 'width', 'height' ]
        } );
    },

    getAnimatedParam: function () {
        return [ 'width', 'height' ];
    },

    drawRect: function ( width, height, color ) {
        this.rect.setSize( width, height );
        this.rect.fill( color );
    },

    stroke: function ( strokeWidth, strokeColor ) {
        var pen = new kity.Pen();
        pen.setWidth( strokeWidth );
        pen.setColor( strokeColor );

        this.rect.stroke( pen );
    },

    drawText: function ( labelText, labelColor, labelX, labelY, width, height ) {

        this.label.setVisible( true );
        this.label.update({
            text: labelText,
            color: labelColor,
            at: 'bottom',
            x : labelX,
            y : labelY
        });

        if( width > 0 ){
            var textWidth = this.label.getSize().width;
            var con = textWidth > width;

            this.label.text.setRotate( con ? -90 : 0 );
            this.label.direction = con ? 'vertical' : 'horizon';

            // this.textFilter = new kity.ProjectionFilter( 0, 1, 1 );
            // this.textFilter.setColor( "rgba( 255, 0, 0, 1 )" );
            // var paper = this.getPaper();
            // paper.addResource( this.textFilter );
            // this.label.text.applyFilter( this.textFilter );

            if( textWidth > width && textWidth > height ){
                this.label.setVisible( false );
            }

        }
    },


} );

kc.Config = {};

kc.Config.chart = {

    color : [
        'rgb(31, 119, 180)',
        'rgb(174, 199, 232)',
        'rgb(255, 127, 14)',
        'rgb(255, 187, 120)',
        'green'
    ],

    finalColor: 'rgb(255, 187, 120)',

    xAxis : {
        categories : [],

        ticks: {
            enabled : true,
            dash : null,
            value: 0,
            width: 1,
            color: '#808080'
        },

        axis : {
            enabled : true,
            arrow : true
        },

        label : {
            enabled : true,
            rotate : 0
        },

        padding : {
            left : 0,
            right : 20
        },

        margin : {
            left : 40,
            right : 10
        }
    },

    yAxis : {
        categories : [],

        ticks: {
            enabled : true,
            dash : null,
            value: 0,
            width: 1,
            color: '#808080'
        },

        axis : {
            enabled : true,
            arrow : true
        },

        label : {
            enabled : true,
            rotate : 0
        },

        padding : {
            top: 20,
            bottom : 0
        },

        margin : {
            top : 20,
            bottom : 40
        }

    },

    plotOptions : {

        label : {
            enabled : false,
            text : {
                color : '#333',
                margin : -15
            }
        }

    },

    interaction : {

        indicatrix : {
            enabled : false,
            color : '#BBB',
            width : 1,
            dash : [ 4, 2 ],
        },

        hover : {
            enabled : false,
            circle : {
                radius : 4,
                stroke : {
                    width : 2,
                    color : '#FFF'
                }
            }
        }

    },

    enableAnimation : true
};

kc.Config.bar = {

    plotOptions : {

        bar : {
            width : 8,
            margin: 1
        }

    }

};

kc.Config.column = {

    plotOptions : {

        column : {
            width : 8,
            margin: 1
        }

    },

};

kc.Config.line = {

    plotOptions : {

        line : {
            width : 2,
            dash : [ 2 ],

	        dot : {
	        	enabled : true,
	            radius : 3
	        }

        }

    }
    
};

kc.Config.area = {

    plotOptions : {

        area : {
            width : 2,
            dash : null,

	        dot : {
	        	enabled : true,
	            radius : 3
	        },

            fill : {
                grandientStopOpacity : 0.5
            }

        }

    }
    
};

var ChartsConfig = kc.ChartsConfig = {

    defaultConfigs : {

        chart  : kc.Config.chart,
        area   : kc.Config.area,
        line   : kc.Config.line,
        bar    : kc.Config.bar,
        column : kc.Config.column

    },

    init : function(){
        var chart = this.defaultConfigs.chart;
        for( var i in this.defaultConfigs ){
            if( i !== 'chart' ){
                chart = kity.Utils.deepExtend( chart, this.defaultConfigs[ i ] );
            }
        }

        return kity.Utils.copy( chart );
    },

    setCoordinateConf : function( conf, index ) {
        var reuslt = {
                dataSet: conf,
            },
            components = [];

        var xAxis = conf.xAxis,
            yAxis = conf.yAxis,
            tmp;

        // 组件
        xAxis.axis.enabled  && components.push( 'xAxis' );
        xAxis.ticks.enabled && components.push( 'xMesh' );
        xAxis.label.enabled && components.push( 'xCat' );
        yAxis.axis.enabled  && components.push( 'yAxis' );
        yAxis.ticks.enabled && components.push( 'yMesh' );
        yAxis.label.enabled && components.push( 'yCat' );
        reuslt.components = components;

        // 外部空隙
        var xm = xAxis.margin,
            ym = yAxis.margin;
        reuslt.margin = {
            left   : xm.left || 0,
            right  : xm.right || 0,
            top    : ym.top || 0,
            bottom : ym.bottom || 0
        };

        // 内部空隙
        var xp = xAxis.padding,
            yp = yAxis.padding;
        reuslt.padding = {
            left   : xp.left || 0,
            right  : xp.right || 0,
            top    : yp.top || 0,
            bottom : yp.bottom || 0
        };

        // 指定刻度最小值
        var minX = kity.Utils.queryPath('xAxis.min', conf);
        if( kity.Utils.isNumber( minX ) ){
            reuslt['minX'] = minX;
        }
        var minY = kity.Utils.queryPath('yAxis.min', conf);
        if( kity.Utils.isNumber( minY ) ){
            reuslt['minY'] = minY;
        }

        // 指定范围
        conf.rangeX && (reuslt.rangeX = conf.rangeX);
        conf.rangeY && (reuslt.rangeY = conf.rangeY);

        // label位置
        reuslt.yLabelsAt = yAxis.label.at || ( index > 0 ? "right" : "left" );
        reuslt.labelMargin = yAxis.label.margin || 10;

        // categories 判断
        if( yAxis.inverted ){
            conf.yAxis.categories = conf.xAxis.categories;
            delete( conf.xAxis.categories );
        }else{
            delete( conf.yAxis.categories );
        }


        reuslt.xLabelRotate = xAxis.label.rotate;
        reuslt.yLabelRotate = yAxis.label.rotate;

        return reuslt;
    }
    
};

kc.ChartData = kity.createClass( 'ChartData', {
    base: kc.Data,
    
    format: function ( index ) {
        var origin = this.origin,
            queryPath = kity.Utils.queryPath;

        var i, j, k, all = [], data;

        var min = 0;
        var max = 100;

        var totalMap = {}, total, type, tmp;
        var series = origin.series[ index ];
        var _time = '_' + (+new Date);
        var categoriesLength = queryPath('xAxis.categories.length', origin);
        var isPercentage = queryPath( 'yAxis.' + index + '.percentage', origin ),
            isStacked = queryPath( 'yAxis.' + index + '.stacked', origin );
        var obj = {}, group, groupName, seriesGroup = {};
        var tmpLevel, tmpGroup, groupIndex = 0, sumObj, entry;

        if( series ){

            for( type in series ){
                tmp = series[ type ];

                obj = {};
                seriesGroup = {};

                for( i = 0; i < tmp.length; i++ ){
                    tmp[i].group = isStacked ? ( tmp[i].group || _time ) : i;
                    group = tmp[i].group;
                    obj[ group ] = obj[ group ] || [];
                    obj[ group ].push( tmp[ i ].data );

                    seriesGroup[ group ] = seriesGroup[ group ] || [];
                    seriesGroup[ group ].push( tmp[ i ] );
                }

                groupIndex = 0;
                for( groupName in obj ){
                    sumObj = stackSum( obj[ groupName ], categoriesLength );
                    tmpLevel = sumObj.offset;
                    tmpGroup = seriesGroup[ groupName ];

                    for( j = 0; j < tmpGroup.length; j++ ){
                        entry = tmpGroup[ j ];
                        entry.indexInGroup = j;
                        entry.offset = tmpLevel[ j ];
                        entry.allOffset = tmpLevel;
                        entry.sum = tmpLevel[ obj[ groupName ].length ];
                        entry.groupIndex = groupIndex;
                        entry.percentage = sumObj.percentage[ j ];
                        entry.percentageOffset = sumObj.percentageOffsetLevel[ j ];
                        entry.allPercentageOffset = sumObj.percentageOffsetLevel;

                    }
                    groupIndex++;
                }

                origin.yAxis[ index ].groupCount = groupIndex

                for(i = 0; i < tmp.length; i++){
                    // tmp[i].originData = kity.Utils.copy( tmp[i].data );
                    data = isStacked || isPercentage ? tmp[i].sum : tmp[i].data;
                    all = all.concat( data );
                }
                
            }

            if( !isPercentage ){
                min = all.length > 0 ? Math.min.apply( [], all ) : 0;
                max = all.length > 0 ? Math.max.apply( [], all ) : 100;
            }
        }
        

        function stackSum( arr, length ){
            var i, j, k, tmpSum = 0, sum = [], offsetLevel = {}, percentage = [], percentageOffsetLevel = {}, tmpPer = [], start = [];
            for( i = 0; i < length; i++ ){
                start.push( 0 );
                tmpSum = 0;

                for( j = 0; j < arr.length; j++ ){
                    tmpSum += ( arr[ j ][ i ] || 0 );
                    offsetLevel[ j+1 ] = offsetLevel[ j+1 ] || [];
                    offsetLevel[ j+1 ][ i ] = tmpSum;
                }
                sum.push( tmpSum );

                tmpPer = [];
                for( k = 0; k < arr.length; k++ ){
                    percentage[ k ] = percentage[ k ] || [];
                    percentage[ k ][ i ] = arr[ k ][ i ] / tmpSum * 100;


                    percentageOffsetLevel[ k+1 ] = percentageOffsetLevel[ k+1 ] || [];
                    percentageOffsetLevel[ k+1 ][ i ] = offsetLevel[ k+1 ][ i ] / tmpSum * 100;
                }
                
            }

            offsetLevel[ 0 ] = percentageOffsetLevel[ 0 ] = start;

            return {
                    offset : offsetLevel,
                    percentageOffsetLevel : percentageOffsetLevel,
                    percentage : percentage
                };
        }


        var result = {
                chart : origin.chart,
                xAxis :  {
                    categories : queryPath( 'xAxis.categories', origin ) || [],
                    step : queryPath( 'xAxis.step', origin ) || 1
                },

                yAxis : queryPath( 'yAxis', origin ) || {},

                plotOptions : origin.plotOptions || {},

                series : origin.series || [],
                rangeY : [min, max],
                rangeX : [min, max]
            };

        return result;
    }
} );

kc.PieData = kity.createClass( 'PieData', {
    base: kc.Data,
    
    format: function ( index ) {
        var origin = this.origin,
            queryPath = kity.Utils.queryPath;

        var i, j, k, all = [], data;
        var series = origin.series;

        if( series ){

            for( i = 0; i < series.length; i++ ){
                getPercent( series[ i ].data );
            }
            
        }
        

        function getPercent( arr ){
            var i, sum = 0, arr, percent = [], angle = [], offset = [];

            for( i = 0; i < arr.length; i++ ){
                offset.push( sum );
                sum += ( arr[ i ].value || arr[ i ] );
            }

            var val, tmp, obj, offsetAngle = 0;
            for( i = 0; i < arr.length; i++ ){
                val = arr[ i ].value || arr[ i ];
                obj = arr[ i ] = kity.Utils.isObject( arr[ i ] ) ? arr[ i ] : {};

                obj.percent = tmp = val / sum;
                obj.angle = tmp * 360;
                obj.offsetAngle = offsetAngle;

                offsetAngle += obj.angle;
            }

            return arr;
        }


        var result = {
                chart : origin.chart,
                xAxis :  {
                    categories : queryPath( 'xAxis.categories', origin ) || [],
                    step : queryPath( 'xAxis.step', origin ) || 1
                },

                yAxis : queryPath( 'yAxis', origin ) || {},

                plotOptions : origin.plotOptions || {},

                series : origin.series || []
            };

        return result;
    }
} );

kc.TreemapData = kity.createClass( 'TreemapData', (function(){

    var ratio = 0.5 * (1 + Math.sqrt(5));
    var mode = "squarify";

    function setAttr( node ){
        if( !node.parent ){
            node.depth = 0;
            node.index = 0;
            node.weightStart = 0;
            node.weight = 1;
        }

        var sum = 0, func = arguments.callee, childWeight = 0;
        if( node.children && node.children.length > 0 ){

            childWeight = node.weight / node.children.length;

            node.children.forEach(function( n, i ){
                n.parent = node;
                n.depth = node.depth + 1;
                n.index = i;
                n.weightStart = n.parent.weightStart + i * childWeight;
                n.weight = childWeight;
                sum += func( n );
            });
        }else{
            node.depth = node.parent.depth + 1;
            return node.value || 0;
        }

        node.value = sum;
        return sum;
    }

    function scale(children, k) {
        var i = -1, child, area;

        while (++i < children.length) {
            child = children[i];
            area = child.value * (k < 0 ? 0 : k);
            child.area = isNaN(area) || area <= 0 ? 0 : area; // 给节点添加area属性
        }

    }

    function squarify( node ) {

        var children = node.children;
        if (children && children.length) {

            var rect = { x: node.x, y: node.y, dx: node.dx, dy: node.dy },
                row = [],
                remaining = children.slice(), // copy-on-write
                child,
                best = Infinity, // the best row score so far
                score, // the current row score
                u = mode === "slice" ? rect.dx
                : mode === "dice" ? rect.dy
                : mode === "slice-dice" ? node.depth & 1 ? rect.dy : rect.dx
                : Math.min(rect.dx, rect.dy), // initial orientation
                n;

            scale(remaining, rect.dx * rect.dy / node.value);
            row.area = 0;

            while ((n = remaining.length) > 0) {
                row.push(child = remaining[n - 1]);
                row.area += child.area;
                if (mode !== "squarify" || (score = worst(row, u)) <= best) { // continue with this orientation
                    remaining.pop();
                    best = score;
                } else { // abort, and try a different orientation
                    row.area -= row.pop().area;
                    position(row, u, rect, false);
                    u = Math.min(rect.dx, rect.dy);
                    row.length = row.area = 0;
                    best = Infinity;
                }
            }

            if (row.length) {
                position(row, u, rect, true);
                row.length = row.area = 0;
            }
            children.forEach( arguments.callee );

        }
    }

    function getRect( node ) {
        return { x: node.x, y: node.y, dx: node.dx, dy: node.dy };
    }

    function worst( row, u ) {
        var s = row.area,
            r,
            rmax = 0,
            rmin = Infinity,
            i = -1,
            n = row.length;

        while (++i < n) {
            if (!(r = row[i].area)) continue;
            if (r < rmin) rmin = r;
            if (r > rmax) rmax = r;
        }

        s *= s;
        u *= u;

        return s ? Math.max((u * rmax * ratio) / s, s / (u * rmin * ratio)) : Infinity;
    }

    function position( row, u, rect, flush ){
        var i = -1,
            n = row.length,
            x = rect.x,
            y = rect.y,
            round = Math.round,
            v = u ? round(row.area / u) : 0,
            o;

        if (u == rect.dx) { // horizontal subdivision
            if (flush || v > rect.dy) v = rect.dy; // over+underflow

            while (++i < n) {
                o = row[i];
                o.x = x;
                o.y = y;
                o.dy = v;
                x += o.dx = Math.min(rect.x + rect.dx - x, v ? round(o.area / v) : 0);
            }

            o.z = true;
            o.dx += rect.x + rect.dx - x; // rounding error
            rect.y += v;
            rect.dy -= v;

        } else { // vertical subdivision

            if (flush || v > rect.dx) v = rect.dx; // over+underflow
            while (++i < n) {
                o = row[i];
                o.x = x;
                o.y = y;
                o.dx = v;
                y += o.dy = Math.min(rect.y + rect.dy - y, v ? round(o.area / v) : 0);
            }
            o.z = false;
            o.dy += rect.y + rect.dy - y; // rounding error
            rect.x += v;
            rect.dx -= v;
        }
    }

    function setMode( m ){
        mode = m;
    }

    return {

        base: kc.Data,

        format: function ( width, height, mode ) {
            setMode( mode );

            var root = this.origin;
            
            if( !(( 'name' in root ) && ( 'value' in root || 'children' in root )) ) return null;

            setAttr( root );

            root.x = 0;
            root.y = 0;
            root.dx = width;
            root.dy = height;

            scale([root], root.dx * root.dy / root.value);
            squarify( root );

            return root;
        }
    }

})());  



(function(){

var LinearPlots = kc.LinearPlots = kity.createClass( 'LinearPlots', {
    base: kc.ChartElement,

    constructor: function ( coordinate, config ) {
        this.callBase();
        this.param.coordinate = this.coordinate = coordinate;
        this.param.config = this.config = config;
    },

    // update: function ( config ) {
    //     var config = config || this.config;
    //     return this.drawPlots( config );
    // },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            drawPlots: [ 'coordinate', 'config' ]
        } );
    },

    drawPlots: function ( coordinate, config ) {
        var oxy = this.coordinate;
        var xRuler = oxy.xRuler,
            yRuler = oxy.yRuler;

        var config = this.config,
            series = config.series[ this.chartType ],
            opt = this.config.plotOptions,
            i, j, k, m, yPos, point, pointsArr = [], linesArr = [], dotArr = [],
            lineData,
            line;

        var queryPath = kity.Utils.queryPath;
        for (i = 0; i < series.length; i++) {

            line = series[i];
            line.values = [];
            line.positions = [];


            var offset = 0;
            var lineColor = this._getEntryColor( line, i );

            if( this.chartType == 'area' ){
                
                if( config.yAxis.stacked ){
                    var p = config.yAxis.percentage;
                    var offsetType = p ? 'percentageOffset' : 'offset';
                    var allOffsetType = p ? 'allPercentageOffset' : 'allOffset';

                    var arr1 = this._array2points( line[ offsetType ], offset );
                    var arr2 = this._array2points( kity.Utils.copy( line[ allOffsetType ][ line.indexInGroup + 1 ] ), offset ).reverse();

                    pointsArr = arr1.concat( arr2 );

                }else{
                    pointsArr = this._array2points( line.data, offset );
                    var areaPointArr = kity.Utils.copy( pointsArr );
                    var x0 = oxy.measurePointX( 0 ),
                        y0 = oxy.measurePointY( oxy.yRuler._ref.from );

                    areaPointArr = areaPointArr.concat([
                        [ pointsArr[ pointsArr.length-1 ][ 0 ], y0],
                        [ x0, y0 ],
                    ]);
                    pointsArr = areaPointArr;
                }   

                this._drawPolygon.bind(this)( pointsArr, line, i );
                
            }
            
            pointsArr = this._array2points( line.data, offset );
            
            var lineWidth = this.chartType == 'area'? opt.area.stroke.width : opt.line.width;

            linesArr.push({
                    points : pointsArr,
                    color : lineColor,
                    dash : line.dash || null,
                    width: lineWidth,
                    defaultPos : oxy.param.height,
                    factor : +new Date
                });

            line.values = line.data;
            line.positions = pointsArr;

            
            if( opt.label.enabled || opt[ this.chartType ].dot.enabled ){

                var tmpPos, dotParam, radius = 0;

                for (m = 0; m < line.positions.length; m++) {
                    tmpPos = line.positions[ m ];

                    if( opt[ this.chartType ].dot.enabled ){
                        radius = opt[ this.chartType ].dot.radius;
                    }

                    dotParam = {
                        color: lineColor,
                        radius: radius,
                        x: tmpPos[0],
                        y: tmpPos[1]
                    };

                    if( opt.label.enabled ){

                        dotParam.label = {
                                margin: opt.label.text.margin,
                                color:  opt.label.text.color,
                                text: line.values[ m ],
                            };
                    }

                    dotArr.push(dotParam);
                }
                line.dots = dotArr;
            }

        }

        this.getElement( 'multilines' ).update({
            elementClass: kc.Polyline,
            list: linesArr,
            fx: config.enableAnimation
        });
        
        if( opt.label.enabled || opt[ this.chartType ].dot.enabled ){
            var lineDots = this.getElement( 'lineDots' );
            lineDots.update({
                elementClass: kc.CircleDot,
                list: dotArr,
                fx: config.enableAnimation
            });
        }

        return config;
    },

    _array2points : function( lineData, offset ){
        var offset = offset || 0;
        var pointsArr = [];
        for (j = 0; j < lineData.length; j++) {
            point = this.coordinate.measurePoint( [j, lineData[j]] );
            point[0] += offset;
                            
            pointsArr.push( point );
        }
        return pointsArr;
    },

    _getEntryColor : function( entry, i ){
         return entry.color || this.config.color[ i ] || this.config.finalColor;
    }

} );


})();

(function(){

var LinePlots = kc.LinePlots = kity.createClass( 'LinePlots', {
    base: kc.LinearPlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
        this.chartType = 'line'; // 这一行争取去掉
        
        this.addElement( 'multilines', new kc.ElementList() );
        this.addElement( 'lineDots', new kc.ElementList() );
    },

    // registerUpdateRules: function () {
    //     return kity.Utils.extend( this.callBase(), {
    //         drawPlots: [ 'coordinate', 'config' ]
    //     } );
    // },
    // update: function ( config ) {
    //     var config = config || this.config;
    //     return this.drawLines( config );
    // },


} );


})();

(function(){

var AreaPlots = kc.AreaPlots = kity.createClass( 'AreaPlots', {
    base: kc.LinearPlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
        this.chartType = 'area'; // 这一行争取去掉
        
        this.addElement( 'multilines', new kc.ElementList() );
        this.addElement( 'lineDots', new kc.ElementList() );
    },

    // registerUpdateRules: function () {
    //     return kity.Utils.extend( this.callBase(), {
    //         drawPlots: [ 'coordinate', 'config' ]
    //     } );
    // },
    // update: function ( config ) {
    //     var config = config || this.config;
    //     return this.drawLines( config );
    // },

    _drawPolygon : function ( pointArr, entry, i ){
        var area = new kity.Polygon(pointArr),
            paper = this.container.paper,
            color = this._getEntryColor( entry, i ),
            fill, opacity;

        var self = this;
        if( kity.Utils.isNumber( opacity = this.config.plotOptions.area.fill.opacity ) ){
            fill = new kity.Color( color ).set( 'a', opacity );
        }else{
            fill = new kity.LinearGradientBrush().pipe( function() {
                this.addStop( 0, color );
                this.addStop( 1, color, self.config.plotOptions.area.fill.grandientStopOpacity );
                this.setStartPosition(0, 0);
                this.setEndPosition(0, 1);
                paper.addResource( this );
            })
        }

        area.fill( fill );

        this.canvas.addShape(area); 
    }

} );


})();

(function(){

var PiePlots = kc.PiePlots = kity.createClass( 'PiePlots', {
    base: kc.ChartElement,

    constructor: function ( config ) {
        this.callBase( config );
        this.chartType = 'pie'; // 这一行争取去掉
        this.param.config = config;
        
        this.pies = this.addElement( 'pies', new kc.ElementList() );
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            drawPies: [ 'config' ]
        } );
    },

    drawPies : function ( config ){

        var list = [], series = config.series,
            radius = 80, increment = 40;

        for( var i = 0 ; i < series.length; i++ ){

            series[ i ].data.map(function( entry, j ){

                list.push({

                    labelText: entry.angle > 10 ? entry.name : null,
                    labelColor: i == 0 ? '#FFF' : '#888',
                    labelPosition: i == 0 ? 'inside' : 'outside',

                    connectLineWidth: 1,
                    connectLineColor: entry.color,

                    innerRadius : i == 0 ? 0 : (radius  + ( i - 1 ) * increment),
                    outerRadius : radius + increment * i,
                    startAngle : entry.offsetAngle - 90,
                    pieAngle: entry.angle,

                    color: entry.color,

                    x : 250,
                    y : 260

                });

            });

        }

        this.pies.update({
            elementClass : kc.Pie,
            list : list,
            fx : true
        });

    }

} );


})();

(function(){

var StickPlots = kc.StickPlots = kity.createClass( 'StickPlots', {
    base: kc.ChartElement,

    constructor: function ( coordinate, config, type ) {
        
        this.callBase();
        this.coordinate = coordinate;
        this.config = config;

        this.chartType = type || this.config.chart.type || 'column';
        this.isBar = this.chartType == 'bar';

        this.sticks = this.addElement( 'sticks', new kc.ElementList() );
    },

    update: function () {
        this.callBase();
        this.formattedData = this.drawBars( this.config, this.coordinate );
    },

    drawBars: function ( data, oxy ) {
        var config = this.config,
            opt = config.plotOptions;
        var rotateAngle,
            measureCategoryMethod,
            measureValueMethod;

        if( this.isBar ){
            config.yAxis.padding.bottom = config.xAxis.padding.left;
            rotateAngle = 90;
            measureCategoryMethod = 'measurePointY';
            measureValueMethod    = 'measurePointX';
        }else{
            rotateAngle = 0;
            measureCategoryMethod = 'measurePointX';
            measureValueMethod    = 'measurePointY';
        }


        var xRuler = oxy.xRuler,
            yRuler = oxy.yRuler;

        var series = data.series[ this.chartType ],
            i, j, k, m, yPos, point, pointsArr = [], linesArr = [], dir,
            stickData,
            stick;

        var tmp, valArr, posArr, stickList = [], posY, barParam,
            width = opt[ this.chartType ].width, left = 0, bottom = 0,
            distance = data.chart.mirror? 0 : width + opt[ this.chartType ].margin,
            offset;

        var isPercentage = config.yAxis.percentage;

        for (i = 0; i < series.length; i++) {

            stick = series[ i ];
            stick.values = [];
            stick.positions = [];

            stickData = isPercentage ? series[i].percentage : series[i].data;

            for (j = 0; j < stickData.length; j++) {

                tmp = stickData[ j ];

                valArr = [];
                posArr = [];
                posY = oxy[ measureCategoryMethod ]( j );

                left = (config.yAxis.groupCount - 1) * distance / 2;

                posArr[ j ] = oxy.measureValueRange( tmp, this.isBar? 'x' : 'y' );
                offset = isPercentage ? stick.percentageOffset : stick.offset;
                bottom = offset ? offset[ j ] : 0;
                dir = this.isBar ? 1 : -1;

                stickParam = {
                    // dir: -1,
                    offset : oxy.measureValueRange( bottom, this.isBar? 'x' : 'y' ) * dir,
                    color  : stick.color || config.color[ i ],
                    width  : width,
                    height : posArr[ j ] * dir,
                    rotate : rotateAngle
                };

                if( this.isBar ){
                    stickParam.x = oxy[ measureValueMethod ]( 0 );
                    stickParam.y = posY - left + distance * stick.groupIndex ;
                }else{
                    stickParam.x = posY - left + distance * stick.groupIndex ;
                    stickParam.y = oxy[ measureValueMethod ]( 0 );
                }

                stickList.unshift(stickParam);

                stick.values.push( valArr );
                stick.positions.push( {
                        x : posArr,
                        y : posY
                    } );

            }
            
        }

        function sum(arr){
            var sum = 0;
            for(var i = 0; i < arr.length; i++){
                sum += arr[i];
            }
            return sum;
        }

        this.sticks.update({
            elementClass: kc.Bar,
            list: stickList,
            fx: this.config.enableAnimation
        });

        return data;
    }

} );


})();

var ScatterData = kc.ScatterData = kity.createClass( 'ScatterData', {
    base: kc.Data,
    format: function () {
        var origin = this.origin;
        var isEmpty = !( 'data_record' in origin );
        var data_record = origin.data_record && origin.data_record.map( function ( r ) {
            return {
                x: +r.x * 100,
                y: +r.y * 100,
                label: r.label,
                value: r.value,
                percent: +r.percent * 100
            };
        } ) || [];

        var query = new kc.Query( data_record );

        var xMin, xMax, xDur;
        xMin = query.count() && query.min( 'x' ).x || 0;
        xMax = query.count() && query.max( 'x' ).x || 0;
        xDur = xMax - xMin;
        xDur = xDur || 40;
        xMin -= xDur / 4;
        xMax += xDur / 4;

        var yMin, yMax, yDur;
        yMin = query.count() && query.min( 'y' ).y || 0;
        yMax = query.count() && query.max( 'y' ).y || 0;
        yDur = yMax - yMin;
        yDur = yDur || 40;
        yMin -= yDur / 4;
        yMax += yDur / 4;

        return {
            data_dim: +origin.data_dim,
            data_average_x: isEmpty ? 0 : +origin.data_average_x * 100,
            data_average_y: isEmpty ? 0 : +origin.data_average_y * 100,
            unit_x: origin.unit_x,
            unit_y: origin.unit_y,
            data_record: data_record,
            rangeX: [ xMin, xMax ],
            rangeY: [ yMin, yMax ]
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

        this.addElement( 'oxy', new kc.CategoryCoordinate() );
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

        this.marquee = new kc.Marquee( this );
        this.setData( new kc.ScatterData() );

        this.initMarqueeZoom();
    },

    initMarqueeZoom: function () {
        var me = this;
        var zoomStack = [];

        function inRange( x, a, b ) {
            return ( a <= x && x <= b ) || ( a >= x && x >= b );
        }

        function getPointInRange( data, rulerX, rulerY, left, right, top, bottom ) {
            var count = 0;
            data = data.data_record;

            left = rulerX.measure( left );
            right = rulerX.measure( right );
            top = rulerY.measure( top );
            bottom = rulerY.measure( bottom );

            for ( var i = 0; i < data.length; i++ ) {
                if ( inRange( data[ i ].x, left, right ) && inRange( data[ i ].y, bottom, top ) ) {
                    count++;
                }
            }
            return count;
        }

        function updateRange( oxy, range, param, data ) {
            oxy.update( range );
            me.drawAverage( param, data, oxy );
            me.drawScatter( param, data, oxy );
        }

        this.marquee.on( 'marquee', function ( e ) {
            var ed = e.data,
                start = ed.start,
                end = ed.end,
                param = me.param,
                data = me.data.format(),
                oxy = me.getElement( 'oxy' ),
                rulerX = oxy.getXRuler().reverse(),
                rulerY = oxy.getYRuler().reverse(),
                left = Math.min( start.x, end.x ) - oxy.x,
                right = Math.max( start.x, end.x ) - oxy.x,
                top = Math.min( start.y, end.y ) - oxy.y,
                bottom = Math.max( start.y, end.y ) - oxy.y;

            if ( getPointInRange( data, rulerX, rulerY, left, right, top, bottom ) < 2 ) return;

            zoomStack.push( {
                rangeX: oxy.param.rangeX,
                rangeY: oxy.param.rangeY
            } );

            var range = {
                rangeX: [ rulerX.measure( left ), rulerX.measure( right ) ],
                rangeY: [ rulerY.measure( bottom ), rulerY.measure( top ) ]
            };

            updateRange( oxy, range, param, data );
        } );

        this.paper.on( 'dblclick', function () {
            var oxy = me.getElement( 'oxy' ),
                param = me.param,
                data = me.data.format(),
                range = zoomStack[ zoomStack.length - 1 ];
            if ( range ) {
                updateRange( oxy, range, param, data );
            }
            if ( zoomStack.length ) zoomStack.pop();
        } );
    },

    update: function () {
        var param = this.param,
            data = this.data.format(),
            oxy = this.drawOxy( param, data );

        this.drawAverage( param, data, oxy );
        this.drawScatter( param, data, oxy );
    },

    enableCollapse: function ( value ) {
        this.param.enableCollapse = value;
        this.update();
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
            formatY: appendUnit( data.unit_y ),
            rangeX: data.rangeX,
            rangeY: data.rangeY
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
                    y1: oxy.param.y + oxy.param.labelMargin,
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
                    y: oxy.param.y + oxy.param.labelMargin
                } );

        } else {

            xLine.setVisible( false );
            xTip.setVisible( false );

        }

        if ( 'data_average_y' in data ) {

            yLine.setVisible( true )
                .animate( {
                    x1: oxy.param.x,
                    x2: oxy.param.x + oxy.param.width - oxy.param.labelMargin,
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
                    x: oxy.param.x + oxy.param.width - oxy.param.labelMargin * 3,
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

        var list = query.map( function ( data ) {
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
                showPercent: true,

                collapsed: 0
            };
        } ).list();

        function isOverlap( c1, c2, tolerance ) {
            var r1 = c1.outerRadius || c1.radius,
                r2 = c2.outerRadius || c2.radius,
                dd = r1 + r2 + tolerance,
                dx = c1.x - c2.x,
                dy = c1.y - c2.y;
            return dx * dx + dy * dy < dd * dd;
        }

        list.sort( function ( y, x ) {
            return ( x.outerRadius || x.radius ) - ( y.outerRadius || y.radius );
        } );

        if ( dim > 2 && param.enableCollapse ) {
            var i, j;
            for ( i = 0; i < list.length; i++ ) {
                if ( list[ i ].collapsed ) continue;
                for ( j = i + 1; j < list.length; j++ ) {
                    if ( list[ j ].collapsed ) continue;
                    if ( isOverlap( list[ i ], list[ j ], 30 ) ) {
                        list[ j ].collapsed = 1;
                    }
                }
            }
        }

        scatter.update( {

            elementClass: {
                '2': kc.CircleDot,
                '3': kc.CircleDot,
                '4': kc.PieDot
            }[ dim ],

            list: list
        } );
    }
} );

var ForceData = kc.ForceData = kity.createClass( 'ForceData', {
	base: kc.Data,
	format: function () {
		var origin = this.origin;
		var brandSet = {};
		var brandList = [];
		var connectList = [];
		var classList = [];
		for ( var key in origin ) {
			var d = origin[ key ];
			if ( !brandSet[ d.brand ] ) {
				brandSet[ d.brand ] = {
					id: brandList.length
				};
				brandList.push( {
					brand: d.brand,
					brandclass: d.brandclass,
					percent: d.percent,
					percentall: d.percentall && ( d.percentall * 100 + '%' ),
					connects: []
				} );
			}
			connectList.push( {
				brand: d.brand,
				relatedbrand: d.relatedbrand,
				relation: d.relation
			} );
			if ( classList.indexOf( d.brandclass ) === -1 ) {
				classList.push( d.brandclass );
			}
		}
		for ( var i = 0; i < connectList.length; i++ ) {
			var brandId = brandSet[ connectList[ i ].brand ].id;
			var relatedbrandId = brandSet[ connectList[ i ].relatedbrand ] && brandSet[ connectList[ i ].relatedbrand ].id;
			if ( !relatedbrandId ) continue;
			var connects = brandList[ brandId ].connects;
			connects.push( {
				brand: brandId,
				relatedbrand: relatedbrandId,
				relatedbrandname: connectList[ i ].relatedbrand,
				relation: connectList[ i ].relation
			} );
		}
		var brandTop = brandList[ 0 ];
		for ( var x = 0; x < brandList.length; x++ ) {
			if ( brandList[ x ].percent > brandTop.percent ) {
				brandTop = brandList[ x ];
			}
		}
		return {
			brandTop: brandTop,
			brandList: brandList,
			classList: classList
		};
	}
} );
var ForceChart = kc.ForceChart = kity.createClass( 'ForceChart', {
	base: kc.Chart,
	constructor: function ( target, param ) {
		var me = this;
		this.callBase( target, param );
		//add chart elements
		this.addElement( "connects", new kc.ElementList() );
		this.addElement( "scatter", new kc.ElementList() );
		this.setData( new kc.ForceData() );
		console.log( this.canvas );
		this.canvas.container.on( "click", function ( e ) {
			if ( e.targetShape === me.canvas.container ) {
				me.highlightBrand();
			}
		} );
	},
	highlightBrand: function ( e ) {
		var scatter = this.getElement( "scatter" );
		var connects = this.getElement( "connects" );
		var elList = scatter.elementList;
		var cntList = connects.elements;
		var clickedbrands = [],
			clickedbrandConnects = [];
		if ( e === undefined ) {
			for ( var c = 0; c < elList.length; c++ ) {
				elList[ c ].canvas.setOpacity( 1 );
				elList[ c ].update( {
					stroke: 0
				} );
			}
			for ( var k in cntList ) {
				cntList[ k ].canvas.setOpacity( 1 );
				var oWidth = cntList[ k ].param.originwidth;
				cntList[ k ].update( {
					width: oWidth
				} );
			}
			return false;
		} else if ( typeof e === "number" ) {
			for ( var n = 0; n < elList.length; n++ ) {
				if ( parseInt( elList[ n ].param.brandclass ) === e ) {
					clickedbrands.push( elList[ n ].param );
					clickedbrandConnects = clickedbrandConnects.concat( elList[ n ].param.connectLines );
				}
			}
		} else {
			clickedbrands = [ e.target.param ];
			clickedbrandConnects = e.target.param.connectLines;
		}
		var checkrelate = function ( brand ) {
			for ( var s = 0; s < clickedbrands.length; s++ ) {
				var cnts = clickedbrands[ s ].connects;
				for ( var s1 = 0; s1 < cnts.length; s1++ ) {
					if ( brand === cnts[ s1 ].relatedbrandname ) return true;
				}
			}
			return false;
		};
		var checkclicked = function ( brand ) {
			for ( var s = 0; s < clickedbrands.length; s++ ) {
				if ( brand === clickedbrands[ s ].brand ) return true;
			}
			return false;
		};
		for ( var i = 0; i < elList.length; i++ ) {
			var b = elList[ i ].param.brand;
			if ( checkclicked( b ) ) {
				elList[ i ].canvas.setOpacity( 1 );
			} else if ( checkrelate( b ) ) {
				if ( typeof e === 'number' )
					elList[ i ].canvas.setOpacity( 0.3 );
				else
					elList[ i ].canvas.setOpacity( 1 );
			} else {
				if ( typeof e === 'number' )
					elList[ i ].canvas.setOpacity( 0 );
				else
					elList[ i ].canvas.setOpacity( 0.3 );
			}
		}
		//设置连线的透明度
		for ( var key in cntList ) {
			cntList[ key ].canvas.setOpacity( 0 );
		}
		for ( var j = 0; j < clickedbrandConnects.length; j++ ) {
			var curLine = clickedbrandConnects[ j ].line;
			curLine.canvas.setOpacity( 1 );
			if ( typeof e !== 'number' )
				curLine.update( {
					width: curLine.param.highlightwidth
				} );
		}
	},
	renderLegend: function () {
		var data = this.data.format();
		var target = document.getElementById( this.param.legendTarget );
		var colors = this.param.colors;
		var cList = data.classList;
		var items = [];
		for ( var i = 0; i < cList.length; i++ ) {
			var legend = '<li value="' + cList[ i ] + '"><div class="color-block" style="background:' + colors[ i ] + '"></div><span class="c-name">' + cList[ i ] + '</span><span class="c-name-highlight" style="color:' + colors[ i ] + '">' + cList[ i ] + '</span></li>';
			items.push( legend );
		}
		target.innerHTML = items.join( "" );
	},
	adjustScatter: function () {
		var mode = this.param.mode;
		var scatter = this.getElement( 'scatter' );
		var connects = this.getElement( 'connects' );
		var data = this.data.format();
		var param = this.param;
		var colors = ( function () {
			var c = {};
			var cList = data.classList;
			for ( var i = 0; i < cList.length; i++ ) {
				var color = param.colors[ i ];
				c[ cList[ i ] ] = color;
			}
			return c;
		} )();
		var list = data.brandList;
		var paperWidth = this.getWidth();
		var paperHeight = this.getHeight();
		var Ox = paperWidth / 2;
		var Oy = paperHeight / 2;
		var brandTop = data.brandTop;
		//计算全图半径
		var R = ( Ox < Oy ? Ox : Oy ) - 50;
		//初始化圆的尺寸
		for ( var i = 0; i < list.length; i++ ) {
			list[ i ].color = colors[ list[ i ].brandclass ];
			list[ i ].radius = list[ i ].percent * 40;
			list[ i ].label = {
				text: list[ i ].brand,
				color: 'black'
			};
			list[ i ].connectLines = [];
			list[ i ].fxEasing = null;
			list[ i ].mode = mode;
			list[ i ].Ox = Ox;
			list[ i ].Oy = Oy;
			list[ i ].R = R;
			list[ i ].chart = this;
			list[ i ].fontSize = 20;
		}
		connects.removeElement();
		for ( var n = 0; n < list.length; n++ ) {
			var source = list[ n ];
			var sourceConnects = source.connects;
			for ( var n1 = 0; n1 < sourceConnects.length; n1++ ) {
				var rbrand = sourceConnects[ n1 ].relatedbrand;
				if ( sourceConnects[ n1 ].relation > 0 && rbrand > n ) {
					var cnt;
					cnt = new kc.Bezier( {
						x1: source.x,
						y1: source.y,
						x2: list[ rbrand ].x,
						y2: list[ rbrand ].y,
						cx: list[ rbrand ].cx,
						cy: list[ rbrand ].cy,
						color: source.color,
						originwidth: sourceConnects[ n1 ].relation / 300,
						width: sourceConnects[ n1 ].relation / 300,
						highlightwidth: ( sourceConnects[ n1 ].relation / 150 < 0.5 ? 0.5 : sourceConnects[ n1 ].relation / 150 )
					} );
					connects.addElement(
						'cnt' + n + n1, cnt
					);
					source.connectLines.push( {
						position: 'start',
						line: cnt
					} );
					list[ rbrand ].connectLines.push( {
						position: 'end',
						line: cnt
					} );
				}
			}
		}
		if ( mode === 'circle' ) {
			var total = 0;
			for ( var j = 0; j < list.length; j++ ) {
				total += list[ j ].radius;
			}
			var sDelta = 0;
			for ( var j1 = 0; j1 < list.length; j1++ ) {
				sDelta += list[ j1 ].radius;
				list[ j1 ].x = R * Math.cos( sDelta * Math.PI / total ) + Ox;
				list[ j1 ].y = R * Math.sin( sDelta * Math.PI / total ) + Oy;
				list[ j1 ].cx = R * 0.2 * Math.cos( sDelta * Math.PI / total ) + Ox;
				list[ j1 ].cy = R * 0.2 * Math.sin( sDelta * Math.PI / total ) + Oy;
				list[ j1 ].sDelta = sDelta;
				list[ j1 ].total = total;
				list[ j1 ].mode = 'circle';
				sDelta += list[ j1 ].radius;
			}
		} else {
			brandTop.x = Ox;
			brandTop.y = Oy;
			var total = 0;
			for ( var j3 = 0; j3 < list.length; j3++ ) {
				if ( list[ j3 ] !== brandTop ) total += list[ j3 ].radius;
			}
			var sDelta = 0;
			for ( var j4 = 0; j4 < list.length; j4++ ) {
				if ( list[ j4 ] === brandTop ) continue;
				sDelta += list[ j4 ].radius;
				list[ j4 ].x = R * Math.cos( sDelta * Math.PI / total ) + Ox;
				list[ j4 ].y = R * Math.sin( sDelta * Math.PI / total ) + Oy;
				list[ j4 ].cx = R * 0.2 * Math.cos( sDelta * Math.PI / total ) + Ox;
				list[ j4 ].cy = R * 0.2 * Math.sin( sDelta * Math.PI / total ) + Oy;
				list[ j4 ].sDelta = sDelta;
				list[ j4 ].total = total;
				sDelta += list[ j4 ].radius;
			}
			//取向量的模
			var mod = function ( x, y ) {
				return Math.sqrt( x * x + y * y );
			};
			//调整力导向的位置
			var setPos = function () {
				var K = 5;
				for ( var t = 0; t < 2; t++ ) {
					for ( var k = 0; k < list.length; k++ ) {
						var source = list[ k ];
						if ( source === brandTop ) continue; //固定中心
						var connects = source.connects;
						var Fx = 0,
							Fy = 0;
						for ( var k1 = 0; k1 < connects.length; k1++ ) {
							var connect = connects[ k1 ];
							var target = list[ connect.relatedbrand ];
							var fx = target.x - source.x;
							var fy = target.y - source.y;
							var m = mod( fx, fy );
							if ( m === 0 ) continue;
							fx = fx * connect.relation / m;
							fy = fy * connect.relation / m;
							Fx += fx;
							Fy += fy;
						}
						var historyX = source.x;
						var historyY = source.y;

						source.x += Fx / K;
						source.y += Fy / K;
						//防止溢出边界
						if ( source.x < source.radius ) {
							source.x = source.radius;
						}
						if ( source.x > ( paperWidth - source.radius ) ) {
							source.x = paperWidth - source.radius;
						}
						if ( source.y < source.radius ) {
							source.y = source.radius;
						}
						if ( source.y > ( paperHeight - source.radius ) ) {
							source.y = paperHeight - source.radius;
						}
						//防止重叠
						for ( var c = 0; c < list.length; c++ ) {
							if ( c !== k ) {
								var dx = list[ c ].x - source.x;
								var dy = list[ c ].y - source.y;
								var d = Math.sqrt( dx * dx + dy * dy );
								if ( d < list[ c ].radius + source.radius ) {
									source.x = historyX;
									source.y = historyY;
									break;
								}
							}
						}
					}
				}
			};
			setPos();
		}
		scatter.update( {
			elementClass: kc.ConnectCircleDot,
			list: list
		} );
	},
	update: function ( args ) {
		for ( var key in args ) {
			this.param[ key ] = args[ key ];
		}
		this.adjustScatter();
		this.renderLegend();
	}
} );

(function(exports){

var BaseCharts = exports.BaseCharts = kc.BaseCharts = kity.createClass( 'BaseCharts', {
    base : kc.Chart,

    constructor: function ( target, config ) {
        this.callBase( target );

        var papers = this.container.children;
        if( papers.length > 0 ){
            var tmp = papers[ papers.length - 1 ];
            this.container.innerHTML = '';
            this.container.appendChild( tmp );
        }

        var p = $( this.container ).css('position');
        if( !~(['absolute', 'relative'].indexOf( p )) ){
            $( this.container ).css('position', 'relative');
        }

        this.setData( new kc.ChartData( config ) );
        this._update( config );
        this._bindAction();
        this._addLegend();
    },

    _update : function( config ){

        // config 融合 处理

        var base = kc.ChartsConfig.init();
        var yAxisTmpl = base.yAxis;
        this.config = kity.Utils.deepExtend( base, config );


        // 读取yAxis配置
        var i, 
            yAxis =  config.yAxis,
            base, current, coordConf, tmpConf,
            oxy,
            yAxis = kity.Utils.isObject( yAxis ) ? [ yAxis ] : yAxis,
            series = config.series,
            type;

        // 遍历生成多个坐标轴
        this.linesArrayData = [];
        for( i = 0; i < this.config.yAxis.length; i++ ){

            current = this.data.format( i );
            tmpConf = kity.Utils.deepExtend( base, current );


            tmpConf = kity.Utils.copy( tmpConf );
            tmpConf.yAxis = kity.Utils.deepExtend( yAxisTmpl, yAxis[ i ] );
            
            coordConf = kc.ChartsConfig.setCoordinateConf( tmpConf, i );
            oxy = this.coordinate = this.addElement( 'oxy_' + i, new kc.CategoryCoordinate( coordConf ) );
            oxy.update();


            // 处理图表类型 series
            for( type in series[ i ] ){
                tmpConf.series = series[ i ];
                switch( type ) {
                    case 'area':
                        var a = this.addElement( 'AreaPlots_' + i, new kc.AreaPlots( oxy, tmpConf ) );
                        a.update();
                        break;
                    case 'line':
                        var l = this.addElement( 'LinePlots_' + i, new kc.LinePlots( oxy, tmpConf ) );
                        l.update();
                        break;
                    case 'bar':
                    case 'column':
                        this.addElement( 'BarPlots_' + i, new kc.StickPlots( oxy, tmpConf, type ) ).update();
                        break;
                    default:
                        break;
                }
            }

        }

        this.hoverDots = this.addElement( 'hoverDots', new kc.ElementList() );
    },

    _bindAction : function(){
        var self = this;
        this.currentIndex = 0;
        this.circleArr = [];

        this.paper.on( 'mousemove', function (ev) {
            if( !self.config.interaction.hover.enabled ) return;

            var oxy = self.coordinate;
            if(!oxy) return;

            var param = oxy.param,
                data = self.formattedData;
            var oev = ev.originEvent;
            var x = oev.offsetX;
            var y = oev.offsetY;
            var i;
            
            var reuslt = oxy.xRuler.leanTo( x - oxy.param.margin.left, 'map' );

            var maxLength = 0;
            var lenArr = [], tmpL, lines = self.linesArrayData;
            for (i = 0; i < lines.length; i++) {
                tmpL = lines[i].positions.length;
                if( tmpL > maxLength ){
                    maxLength = tmpL;
                }
            }

            if( !reuslt || reuslt.index > maxLength ) return;

            var pX = reuslt.value + oxy.param.margin.left;

            var pY = 0;
            var index = reuslt.index, tmpPos;

            self.circleArr = [];
            for (i = 0; i < lines.length; i++) {
                tmpPos = lines[i].positions[index];
                if(tmpPos){
                    pY = tmpPos[1];
                }else{
                    pX = pY = -100;
                }

                self.circleArr.push({
                    color: '#FFF',
                    radius: 2,
                    strokeWidth : 2,
                    strokeColor : lines[i].color || self.config.color[ i ] || self.config.finalColor,
                    bind : lines[ i ].data[ index ],
                    index : index,
                    x : pX,
                    y : pY
                });
            }
            self.currentPX = pX;

            self.hoverDots.update({
                elementClass : kc.CircleDot,
                list : self.circleArr,
                fx : false
            });

            self.currentIndex = index;

            if( self.config.onCircleHover){
                var info = {
                    posX : pX,
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.margin.left,
                    marginTop : oxy.param.margin.top,
                    data : data
                };
                self.config.onCircleHover( info );
            }
        } );

        this.paper.on('click', function(ev){
            var oxy = self.coordinate;
            if(!oxy) return;

            if( self.config.onCircleClick && (ev.targetShape.lineData || Math.abs(self.currentPX - ev.originEvent.offsetX) < 10) ){
                var target = ev.targetShape,
                    index = self.currentIndex;

                var values = [], tmp;
                for( var i = 0; i < self.linesArrayData.length; i++ ){
                    tmp = self.linesArrayData[ i ];
                    values[ i ] = {
                        name : tmp.name,
                        value : tmp.data[ index ]
                    };
                }

                var info = {
                    circle : target,
                    position : target.container.host.getPosition(),
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.margin.left,
                    marginTop : oxy.param.margin.top,
                    values : values,
                    value : ev.targetShape.container.bind
                };

                if( target.lineData ){
                    info.value = target.lineData.values[ index ];
                }

                self.config.onCircleClick( info );
            }
        });
    },

    _addLegend : function(){
        var series = this.config.series,
            i, j, type, entries, entry, label, color, tmp;

        var legend = $('<div></div>').css({
            position : 'absolute',
            bottom : '0',
            left : this.config.xAxis.margin.left + 'px',
            height : '26px',
            lineHeight : '26px'
        }).appendTo( this.container );

        for ( i = 0; i < series.length; i++ ) {
            
            for( type in series[ i ] ){
                entries = series[ i ][ type ];
                
                for ( j = 0; j < entries.length; j++ ) {
                    entry = entries[ j ];

                    label = entry.name;
                    color = entry.color || this.config.color[ j ] || this.config.finalColor;

                    tmp = $('<div></div>').css({
                        marginRight : '20px',
                        display : 'inline-block'
                    }).appendTo( legend );

                    $('<div class="kitycharts-legend-color"></div>').css({
                        width : '12px',
                        height : '12px',
                        backgroundColor : color,
                        display : 'inline-block',
                        marginRight : '5px',
                        position: 'relative',
                        top: '1px'
                    }).appendTo( tmp );

                    $('<div class="kitycharts-legend-label">' + label + '</div>').css({
                        fontSize : '10px',
                        display : 'inline-block'
                    }).appendTo( tmp );

                }

            }

        }


    }

} );


})( window );

(function(exports){

var PieCharts = exports.PieCharts = kc.PieCharts = kity.createClass( 'PieCharts', {
    base : kc.Chart,

    constructor: function ( target, config ) {
        this.callBase( target );

        this.setData( new kc.PieData( config ) );

        this._update( config );
        this._bindAction();
        this._addLegend();
    },

    _update : function( config ){

        // config 融合 处理

        var base = kc.ChartsConfig.init();
        var yAxisTmpl = base.yAxis;
        this.config = kity.Utils.deepExtend( base, config );


        // 读取yAxis配置
        var i, 
            yAxis =  config.yAxis,
            base, current, coordConf, tmpConf,
            oxy,
            yAxis = kity.Utils.isObject( yAxis ) ? [ yAxis ] : yAxis,
            series = config.series,
            type;

        // 遍历生成多个坐标轴
        current = this.data.format( i );
        tmpConf = kity.Utils.deepExtend( base, current );

        tmpConf = kity.Utils.copy( tmpConf );
        tmpConf.yAxis = kity.Utils.deepExtend( yAxisTmpl, yAxis[ i ] );
        
        
        // 处理图表类型 series
        var p = this.addElement( 'PiePlots', new kc.PiePlots( tmpConf ) );
        p.update();


        this.hoverDots = this.addElement( 'hoverDots', new kc.ElementList() );
    },

    _bindAction : function(){

    },

    _addLegend : function(){
        var series = this.config.series,
            i, j, type, entries, entry, label, color, tmp;

        var legend = $('<div></div>').css({
            position : 'absolute',
            bottom : '0',
            left : this.config.xAxis.margin.left + 'px',
            height : '26px',
            lineHeight : '26px'
        }).appendTo( this.container );

        for ( i = 0; i < series.length; i++ ) {
            
            for( type in series[ i ] ){
                entries = series[ i ][ type ];
                
                for ( j = 0; j < entries.length; j++ ) {
                    entry = entries[ j ];

                    label = entry.name;
                    color = entry.color || this.config.color[ j ] || this.config.finalColor;

                    tmp = $('<div></div>').css({
                        marginRight : '20px',
                        display : 'inline-block'
                    }).appendTo( legend );

                    $('<div class="kitycharts-legend-color"></div>').css({
                        width : '12px',
                        height : '12px',
                        backgroundColor : color,
                        display : 'inline-block',
                        marginRight : '5px',
                        position: 'relative',
                        top: '1px'
                    }).appendTo( tmp );

                    $('<div class="kitycharts-legend-label">' + label + '</div>').css({
                        fontSize : '10px',
                        display : 'inline-block'
                    }).appendTo( tmp );

                }

            }

        }


    }

} );


})( window );

(function(exports){

var rects = [];
function getRects( node ){
    if( node.children && node.children.length > 0 ){
        node.children.forEach(function(n, i){
            getRects( n );
        });
    }else{
        rects.push( node );
    }
    return rects;
}

function getParents( node, callback ){
    var tmp = node;
    callback && callback( tmp );
    while( tmp.parent ){
        tmp = tmp.parent;
        callback && callback( tmp );
    }

}

var Treemap = exports.Treemap = kc.Treemap = kity.createClass( 'Treemap', {
    base : kc.Chart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        this.setData( new kc.TreemapData( param ) );
        this.rects = this.addElement( 'rects', new kc.ElementList() );

        this.tip = this.addElement( 'tip', new kc.Tooltip( {
            background: '#FFF',
            at: 'up',
            padding: [ 10, 20, 10, 20 ],
            borderRadius : 3,
            anchorSize: 4
        } ) );

        var filter = new kity.ProjectionFilter( 2, 1, 1 );
        filter.setColor( "rgba( 0, 0, 0, 0.3 )" );
        this.paper.addResource( filter );
        this.tip.canvas.applyFilter( filter );

        this._bindAction();
    },

    update : function( param ){

        this.param = kity.Utils.extend( this.param, param )

        var data = this.data.format( this.param.width, this.param.height, this.param.mode || 'squarify' );
        
        if( data ){
            var list = [];
            rects = [];
            getRects( data ).forEach(function( node, i ){
                var str = [];
                getParents( node, function( n ){
                    str.push( n.name );
                } )
                str = str.reverse().join(' > ');

                var color = new kity.Color(255,204,191);
                color.set('h', node.parent.weightStart * 200);
                color.set('s', 80);
                color.set('l', 75);

                list.push({
                    x : node.x,
                    y : node.y,
                    width : node.dx,
                    height : node.dy,
                    color : color,
                    labelText : node.name,
                    labelColor : '#000',
                    strokeWidth : 1,
                    strokeColor : '#FFF',
                    labelX : node.dx/2,
                    labelY : node.dy/2,
                    bind : str
                });
            });

            this.rects.update({
                elementClass : kc.Rectage,
                list : list,
                fx : true
            });

        }

    },

    _bindAction : function(){
        var self = this;
        var prev, rect, timer;
        this.on( 'mousemove', function(ev){

            clearTimeout( timer );

            timer = setTimeout(function(){
                var rect = ev.getTargetChartElement();
                rect = rect.text ? rect.container : rect;
                var data = rect.getBindData();
                if( data ){

                    if( prev == rect ){
                        return;
                    }

                    prev = rect;

                    var fontSize = rect.label.direction == 'horizon' ?  rect.label.text.getHeight() : rect.label.text.getWidth();

                    self.tip
                        .setVisible( true )
                        .update( {
                            content: {
                                text: data,
                                color: '#555'
                            }
                        } );


                    var rectPos = rect.getPosition();
                    var rectSize = rect.getSize();
                    var rectCenter = {
                        x : rectPos.x + rectSize.width / 2,
                        y : rectPos.y + rectSize.height / 2
                    };

                    var paperWidth = self.paper.getWidth();
                    var tipPos = self.tip.getPosition();
                    var tipSize = self.tip.getSize();

                    var at = 'up';
                    var posX = 0, posY = 0;
                    var gap = fontSize;

                    posY = rectCenter.y - tipSize.height / 2 - gap;

                    if( rectCenter.x + tipSize.width / 2 > paperWidth ){
                        at = 'left';
                        posX = rectCenter.x - tipSize.width / 2 - gap;
                        posY = rectCenter.y;
                    }else if( rectCenter.x - tipSize.width / 2 < 0 ){
                        at = 'right';
                        posX = rectCenter.x + tipSize.width / 2 + gap;
                        posY = rectCenter.y;
                    }else{
                        posX = rectCenter.x;
                    }

                    if( rectCenter.y - tipSize.height - gap < 0 ){
                        at = 'down';
                        posY = rectCenter.y + tipSize.height / 2 + gap;
                    }

                    self.tip
                        .update({
                            at : at
                        }).animate({
                            x: posX,
                            y: posY
                        }, 200);
                }
            }, 100);

            
        });
    }

} );


})( window );

(function(exports){

var KityCharts = exports.KityCharts = kc.KityCharts = kity.createClass( 'KityCharts', {
    base : kc.Chart,

    constructor: function ( target, config ) {
        this.callBase( target );

        var papers = this.container.children;
        if( papers.length > 0 ){
            var tmp = papers[ papers.length - 1 ];
            this.container.innerHTML = '';
            this.container.appendChild( tmp );
        }

        var p = $( this.container ).css('position');
        if( !~(['absolute', 'relative'].indexOf( p )) ){
            $( this.container ).css('position', 'relative');
        }

        this.setData( new kc.ChartData( config ) );
        this._update( config );
        this._bindAction();
        this._addLegend();
    },

    _update : function( config ){

        // config 融合 处理

        var base = kc.ChartsConfig.init();
        var yAxisTmpl = base.yAxis;
        this.config = kity.Utils.deepExtend( base, config );


        // 读取yAxis配置
        var i, 
            yAxis =  config.yAxis,
            base, current, coordConf, tmpConf,
            oxy,
            yAxis = kity.Utils.isObject( yAxis ) ? [ yAxis ] : yAxis,
            series = config.series,
            type;

        // 遍历生成多个坐标轴
        this.linesArrayData = [];
        for( i = 0; i < this.config.yAxis.length; i++ ){

            current = this.data.format( i );
            tmpConf = kity.Utils.deepExtend( base, current );


            tmpConf = kity.Utils.copy( tmpConf );
            tmpConf.yAxis = kity.Utils.deepExtend( yAxisTmpl, yAxis[ i ] );
            
            coordConf = kc.ChartsConfig.setCoordinateConf( tmpConf, i );
            oxy = this.coordinate = this.addElement( 'oxy_' + i, new kc.CategoryCoordinate( coordConf ) );
            oxy.update();

            // 处理图表类型 series
            for( type in series[ i ] ){
                tmpConf.series = series[ i ];
                switch( type ) {
                    case 'line':
                    case 'area':
                        var lineData = this.addElement( 'LinePlots_' + i, new kc.LinearPlots( oxy, tmpConf, type ) ).update();
                        // lineData.series.line && lineData.series.line.length > 1 && (this.linesArrayData = this.linesArrayData.concat( lineData.series.line ) );
                        break;
                    case 'bar':
                    case 'column':
                        this.addElement( 'BarPlots_' + i, new kc.StickPlots( oxy, tmpConf, type ) ).update();
                        break;
                    default:
                        break;
                }
            }

        }

        this.hoverDots = this.addElement( 'hoverDots', new kc.ElementList() );
    },

    _bindAction : function(){
        var self = this;
        this.currentIndex = 0;
        this.circleArr = [];

        this.paper.on( 'mousemove', function (ev) {
            if( !self.config.interaction.hover.enabled ) return;

            var oxy = self.coordinate;
            if(!oxy) return;

            var param = oxy.param,
                data = self.formattedData;
            var oev = ev.originEvent;
            var x = oev.offsetX;
            var y = oev.offsetY;
            var i;
            
            var reuslt = oxy.xRuler.leanTo( x - oxy.param.margin.left, 'map' );

            var maxLength = 0;
            var lenArr = [], tmpL, lines = self.linesArrayData;
            for (i = 0; i < lines.length; i++) {
                tmpL = lines[i].positions.length;
                if( tmpL > maxLength ){
                    maxLength = tmpL;
                }
            }

            if( !reuslt || reuslt.index > maxLength ) return;

            var pX = reuslt.value + oxy.param.margin.left;

            var pY = 0;
            var index = reuslt.index, tmpPos;

            self.circleArr = [];
            for (i = 0; i < lines.length; i++) {
                tmpPos = lines[i].positions[index];
                if(tmpPos){
                    pY = tmpPos[1];
                }else{
                    pX = pY = -100;
                }

                self.circleArr.push({
                    color: '#FFF',
                    radius: 2,
                    strokeWidth : 2,
                    strokeColor : lines[i].color || self.config.color[ i ] || self.config.finalColor,
                    bind : lines[ i ].data[ index ],
                    index : index,
                    x : pX,
                    y : pY
                });
            }
            self.currentPX = pX;

            self.hoverDots.update({
                elementClass : kc.CircleDot,
                list : self.circleArr,
                fx : false
            });

            self.currentIndex = index;

            if( self.config.onCircleHover){
                var info = {
                    posX : pX,
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.margin.left,
                    marginTop : oxy.param.margin.top,
                    data : data
                };
                self.config.onCircleHover( info );
            }
        } );

        this.paper.on('click', function(ev){
            var oxy = self.coordinate;
            if(!oxy) return;

            if( self.config.onCircleClick && (ev.targetShape.lineData || Math.abs(self.currentPX - ev.originEvent.offsetX) < 10) ){
                var target = ev.targetShape,
                    index = self.currentIndex;

                var values = [], tmp;
                for( var i = 0; i < self.linesArrayData.length; i++ ){
                    tmp = self.linesArrayData[ i ];
                    values[ i ] = {
                        name : tmp.name,
                        value : tmp.data[ index ]
                    };
                }

                var info = {
                    circle : target,
                    position : target.container.host.getPosition(),
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.margin.left,
                    marginTop : oxy.param.margin.top,
                    values : values,
                    value : ev.targetShape.container.bind
                };

                if( target.lineData ){
                    info.value = target.lineData.values[ index ];
                }

                self.config.onCircleClick( info );
            }
        });
    },

    _addLegend : function(){
        var series = this.config.series,
            i, j, type, entries, entry, label, color, tmp;

        var legend = $('<div></div>').css({
            position : 'absolute',
            bottom : '0',
            left : this.config.xAxis.margin.left + 'px',
            height : '26px',
            lineHeight : '26px'
        }).appendTo( this.container );

        for ( i = 0; i < series.length; i++ ) {
            
            for( type in series[ i ] ){
                entries = series[ i ][ type ];
                
                for ( j = 0; j < entries.length; j++ ) {
                    entry = entries[ j ];

                    label = entry.name;
                    color = entry.color || this.config.color[ j ] || this.config.finalColor;

                    tmp = $('<div></div>').css({
                        marginRight : '20px',
                        display : 'inline-block'
                    }).appendTo( legend );

                    $('<div class="kitycharts-legend-color"></div>').css({
                        width : '12px',
                        height : '12px',
                        backgroundColor : color,
                        display : 'inline-block',
                        marginRight : '5px',
                        position: 'relative',
                        top: '1px'
                    }).appendTo( tmp );

                    $('<div class="kitycharts-legend-label">' + label + '</div>').css({
                        fontSize : '10px',
                        display : 'inline-block'
                    }).appendTo( tmp );

                }

            }

        }


    }

} );

KityCharts = kity.Utils.extend( KityCharts, kc );

})( window );

})(kity, window);