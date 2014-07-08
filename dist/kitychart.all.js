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
    },
    reset: function ( data ) {
        this.origin = data;
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

var elementUUID = 0;

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
        if ( arguments.length === 1 ) {
            chartElement = key;
            key = 'ChartElement_' + elementUUID++;
        }

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
        if ( this.param.bind !== undefined ) {
            this.canvas.bind = this.param.bind;
        }
    },

    setBindData: function ( val ) {
        this.canvas.bind = val;
    },

    getBindData: function () {
        return this.canvas.bind;
    },

    getPaper: function () {
        var tmp = this.canvas;
        while ( tmp && tmp.container ) {
            tmp = tmp.container;
            if ( tmp instanceof kity.Paper ) {
                break;
            }
        }
        return tmp;
    }
} );

( function ( kc, kity ) {

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
                beforeAnimatedCopy = kity.Utils.copy( beforeAnimated ),
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
                    if ( progress > 1 ) progress = 1;
                    target.update( param, beforeAnimatedCopy, progress );
                }
            } );

            if ( this.timeline ) this.timeline.stop();

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
        if (this.updateChart) {
            this.updateChart(this.param, data);
        }
    }
} );

var ConfigHandler = kc.ConfigHandler = kity.createClass( 'ConfigHandler', {

    constructor: function ( config ) {
        // this.config = config || {};
    },

    getConfig: function () {
        return this.config;
    },

    /*
     * path形式为"plotOptions.label.text", 即访问this.config.plotOptions.label.text
     */
    getOption: function ( path ) {
        return kity.Utils.queryPath( path, this.config );
    },

    /*
     * path同getOption参数path
     */
    setOption: function ( path, value ) {

        var arr = path.split('.');
        arr.unshift('config');
        var  i = 1, p, cur, exp;

        while(i < arr.length){
            cur = arr[i];
            p = getPath( i-1, arr );
            if( !eval('"' + cur + '" in this.' + p ) ){ //属性不存在
                exp = 'this.' + p + '.' + cur + ' = ' + (i == arr.length-1 ? 'value' : '{}');
            }else{ //属性存在
                exp = 'this.' + p + '.' + cur + ' = value';
            }
            eval( exp );

            i++
        }

        function getPath( index, arr ){
            var p = [];
            for(var i=0; i<=index; i++){
                p.push( arr[i] );
            }
            return p.join('.');
        }


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
                [ 0, 0 ],
                [ 0, 0 ]
            ],
            width: 3,
            color: 'black',
            dash: null,
            animatedDir: 'y',
            fxEasing: 'ease',
            factor: 0,
            close: false,
            fill: null
        }, param ) );

        this.polyline = new kity.Path();
        this.canvas.addShape( this.polyline );
    },

    getAnimatedParam: function () {
        return [ 'factor' ];
    },

    registerUpdateRules: function () {
        return kity.Utils.extend( this.callBase(), {
            draw: [ 'points', 'factor', 'close', 'fill' ],
            stroke: [ 'color', 'width', 'dash' ]
        } );
    },

    parsePoint: function ( index, pos, points ) {
        if ( points && points[ index ] ) {
            return points[ index ][ pos ];
        } else {
            return 0;
        }
    },

    draw: function ( points, factor, close, fill, animatedBeginValueCopy, progress ) {
        var drawer = this.polyline.getDrawer(),
            s = kc.sharpen;

        if ( points.length > 0 ) {
            drawer.clear();
            var dir = this.param.animatedDir,
                xDir, yDir;
            ( dir == 'x' || dir == 'both' ) && ( xDir = true );
            ( dir == 'y' || dir == 'both' ) && ( yDir = true );

            if ( animatedBeginValueCopy ) {
                var prevPoints = animatedBeginValueCopy.points;
                var firstPointX = this.parsePoint( 0, 0, prevPoints );
                var firstPointY = this.parsePoint( 0, 1, prevPoints );
                var pointX, pointY;
                drawer.moveTo(
                    xDir ? s( ( points[ 0 ][ 0 ] - firstPointX ) * progress + firstPointX ) : s( points[ 0 ][ 0 ] ),
                    yDir ? s( ( points[ 0 ][ 1 ] - firstPointY ) * progress + firstPointY ) : s( points[ 0 ][ 1 ] )
                );

                for ( var i = 1; i < points.length; i++ ) {
                    if ( xDir ) pointX = this.parsePoint( i, 0, prevPoints );
                    if ( yDir ) pointY = this.parsePoint( i, 1, prevPoints );
                    drawer.lineTo(
                        xDir ? s( ( points[ i ][ 0 ] - pointX ) * progress + pointX ) : s( points[ i ][ 0 ] ),
                        yDir ? s( ( points[ i ][ 1 ] - pointY ) * progress + pointY ) : s( points[ i ][ 1 ] )
                    );
                }

            } else {
                drawer.moveTo( s( points[ 0 ][ 0 ] ), s( points[ 0 ][ 1 ] ) );
                for ( var i = 1; i < points.length; i++ ) {
                    drawer.lineTo( s( points[ i ][ 0 ] ), s( points[ i ][ 1 ] ) );
                }
            }
            if ( close ) {
                drawer.close();
                this.polyline.fill( fill );
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
            return [
                [ x1, b.y1 ],
                [ x2, b.y2 ]
            ];
        }
        if ( y1 == y2 ) {
            return [
                [ b.x1, y1 ],
                [ b.x2, y2 ]
            ];
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
        this.callBase( kity.Utils.extend( {
            text: '',
            at: 'center',
            margin: 0,
            style: {
                family: 'Arial'
            },
            color: 'black',
            rotate: 0
        }, param ) );
        this.text = new kity.Text().setFont( {
            'size': 12,
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
            if ( rotate !== 0 ) anchor = 'end';
            this.text.setTextAnchor( anchor ).setPosition( 0, hh + margin );
            break;
        default:
            this.text.setTextAnchor( 'middle' ).setPosition( 0, hh * 0.75 );
        }

        if ( rotate !== 0 ) this.text.setRotate( rotate );
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
                rotate: 0,
                label: {
                    at: 'bottom',
                    color: 'black',
                    text: null,
                }
            }, param ) );
            this.rect = new kity.Path();
            this.canvas.addShape( this.rect );
            this.addElement( 'label', new kc.Label() );
        },

        registerUpdateRules: function () {
            return kity.Utils.extend( this.callBase(), {
                draw: [ 'width', 'height', 'dir', 'offset', 'rotate' ],
                fill: [ 'color' ],
                // updateText: [ 'labelText' ]
            } );
        },

        getAnimatedParam: function () {
            return [ 'width', 'height', 'offset']; //color暂时去掉color
        },

        // updateText: function ( labelText ) {
        //     this.getElement( 'label' ).update( {
        //         text: labelText
        //     } ).setRotate( rotate );
        // },

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

    var allComponents = [ "xMesh", "yMesh", "xCat", "yCat", "xAxis", "yAxis" ];

    var componentsIniter = {
        "xMesh" : function(){
            !this.getElement( 'xMesh') && this.addElement( 'xMesh', new kc.Mesh( {
                type: 'vertical'
            } ) );
        },
        "yMesh" : function(){
            !this.getElement( 'yMesh') && this.addElement( 'yMesh', new kc.Mesh( {
                type: 'horizon',
                dir: 1
            } ) );
        },
        "xCat" : function(){
            !this.getElement( 'xCat') && this.addElement( 'xCat', new kc.Categories( {
                at: 'bottom',
                rotate: this.param.xLabelRotate
            } ) );
        },
        "yCat" : function(){
            !this.getElement( 'yCat') && this.addElement( 'yCat', new kc.Categories( {
                at: 'left',
                rotate: this.param.yLabelRotate
            } ) );
        },
        "xAxis" : function(){
            !this.getElement( 'xAxis') && this.addElement( 'xAxis', new kc.Line( {
                color: '#999'
            } ) );
            
            if( this.param.xAxisArrow && !this.xArrow )
                this.canvas.addShape( this.xArrow = new kity.Arrow( arrowParam ).fill( '#999' ) );
        },
        "yAxis" : function(){
            !this.getElement( 'yAxis') && this.addElement( 'yAxis', new kc.Line( {
                color: '#999'
            } ) );

            if( this.param.yAxisArrow && !this.yArrow )
                this.canvas.addShape( this.yArrow = new kity.Arrow( arrowParam ).fill( '#999' ) );
        }
    };

    return {
        base: kc.Coordinate,
        constructor: function ( param ) {

            var mix = kity.Utils.extend({
                components : null,
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
                rangeX: [ 0, 100 ],
                rangeY: [ 0, 100 ],
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

            this.callBase( mix );

            this._initRulers();
            // this._initElements();

        },
        _initRulers: function () {
            this.xRuler = new kc.Ruler();
            this.yRuler = new kc.Ruler();
        },
        _initElements: function (components) {
            components = ( !components )? allComponents : components;
            this._processComponents( components );
        },
        registerUpdateRules: function () {
            return kity.Utils.extend( this.callBase(), {
                'updateAll': [ 
                    'components',
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

        _processComponents : function(components){
            var i, key;
            for( i in allComponents ){
                key = allComponents[ i ];
                if( ~components.indexOf( key ) ){
                    func = componentsIniter[ key ];
                    func && func.bind(this)();
                }else{
                    this.removeElement( key );
                }
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
                components,
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

            this._initElements( components );

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
                length: height,
                y: height,
                step: dataSet.xAxis && dataSet.xAxis.step || 1
            } );

            yMesh && yMesh.update( {
                rules: yGrid.map,
                length: width, //xGrid.map[ xGrid.map.length - 1 ],
                x: 0,
                y: 0,
                step: dataSet.yAxis && dataSet.yAxis.step || 1
            } );

            this.xArrow && this.xArrow.setTranslate( width, height + 0.5 );
            this.yArrow && this.yArrow.setRotate( -90 ).setTranslate( 0.5, 0 );
        },

        setCoordinateConf : function( conf ) {
            var reuslt = {},
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
            reuslt.yLabelsAt = yAxis.label.at || "left";
            reuslt.labelMargin = yAxis.label.margin || 10;

            reuslt.xLabelRotate = xAxis.label.rotate;
            reuslt.yLabelRotate = yAxis.label.rotate;

            reuslt.x = kity.Utils.queryPath('xAxis.margin.left', conf) || 0;
            reuslt.y = kity.Utils.queryPath('yAxis.margin.top', conf) || 0;


            var confCopy = kity.Utils.copy( conf );

            // categories 判断
            if( confCopy.yAxis.inverted ){
                confCopy.yAxis.categories = confCopy.xAxis.categories;
                delete( confCopy.xAxis.categories );

                reuslt['minX'] = minY;
                delete reuslt['minY'];
                
            }else{
                delete( confCopy.yAxis.categories );
            }

            reuslt.dataSet = confCopy;
            return reuslt;
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

    getElementList: function () {
        return this.elementList;
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

        var count = elementList.length,
            fill = 0,
            me = this;

        function checkFinish() {
            if ( fill == count ) {
                me.trigger( 'listupdatefinish' );
            }
        }
        elementList.forEach( function ( element, index ) {

            if ( fx && ( 'animate' in element ) ) {
                fxTimers.push( setTimeout( function () {
                    element.animate( list[ index ], me.param.animateDuration || 300 ).timeline.on( 'finish', function () {
                        fill++;
                        checkFinish();
                    } );
                }, delay ) );

                delay += Math.random() * delayBase;

            } else {

                fill++;
                checkFinish();
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
		// this.pie.bringTop();

		var pen = new kity.Pen();
		pen.setWidth( strokeWidth );
		pen.setColor( strokeColor );
		this.pie.stroke( pen );

	},

	updateLabel: function ( labelText, labelColor, labelPosition, outerRadius, startAngle, pieAngle ) {
		if( labelPosition == 'none' ) return;

		var r = labelPosition == 'inside' ? outerRadius - 30 : outerRadius + 50;
		var a = ( startAngle + pieAngle / 2 ) / 180 * Math.PI;

		this.label.setVisible( true );
		this.label.update( {
			text: labelText,
			color: labelColor,
			at: 'bottom',
			margin: 0,
			x: r * Math.cos( a ),
			y: r * Math.sin( a )
		} );

	},

	updateConnectLine: function ( labelText, connectLineWidth, connectLineColor, labelPosition, innerRadius, outerRadius, startAngle, pieAngle ) {
		if ( labelPosition != 'outside' || !labelText ) return;

		var r = outerRadius + 30;
		var a = ( startAngle + pieAngle / 2 ) / 180 * Math.PI;

		this.connectLine.update( {
			x1: ( innerRadius + 2 ) * Math.cos( a ),
			y1: ( innerRadius + 2 ) * Math.sin( a ),
			x2: r * Math.cos( a ),
			y2: r * Math.sin( a ),
			width: connectLineWidth,
			color: connectLineColor
		} );

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
            strokeColor: '#FFF',
            strokeWidth: 0,
            color: '#62a9dd',
            radius: 0,
            fxEasing: 'ease',
            x: 0,
            y: 0
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
                text: null
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
                if ( fontSize < 12 ) {
                    fontSize = 12;
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
 * @class MapBlock
 * 
 * 表示一个地图的区域
 *
 * @param {String} path 改区域的路径数据
 * @param {Number} scale 绘制的缩放比例
 * @param {kity.Color} color 区域填充的颜色
 */
var MapBlock = kity.createClass('MapBlock', {

    base: kc.AnimatedChartElement,

    constructor: function(param) {
        this.callBase(kity.Utils.extend({
            scale: 1,
            color: new kity.Color('#EEE'),
            stroke: '#888',
            path: null
        }), param);

        this._shape = new kity.Path();
        this.canvas.addShape(this._shape);
    },

    getAnimatedParam: function() {
        return ['scale', 'color'];
    },

    registerUpdateRules: function() {
        return kity.Utils.extend(this.callBase(), {
            draw: ['path', 'scale'],
            fill: ['color', 'stroke']
        });
    },

    draw: function(path, scale) {
        if (!path) return;
        var scaledPath = new kity.Matrix().scale(scale).transformPath(path);
        this._shape.setPathData(scaledPath);
    },

    fill: function(color, stroke) {
        this._shape.fill(color).stroke(stroke, 1);
    }
});

/**
 * @class Map
 * 
 * 表示一个地图的组件
 *
 * @param {Number} width 地图的宽度
 * @param {Number} height 地图的高度
 * @param {Number} data 地图的数据
 *
 *
 * @method findBlockById(id)
 *     通过地图块的 id 来获取一个地图块
 *
 * @method findBlockByEvent(e)
 *     通过一个事件来获取跟事件相关的地图块
 * 
 */
var Map = kc.Map = kity.createClass( 'Map', {
    base: kc.ChartElement,

    constructor: function ( param, data ) {
        this.callBase( kity.Utils.extend( {
            width: data.width,
            height: data.height
        }, param ) );

        this._data = data || Map.CHINA_MAP;

        this._blocks = new kc.ElementList({
            elementClass: MapBlock
        });

        this.addElement('blocks', this._blocks);

        var me = this;
    },

    registerUpdateRules: function() {
        return kity.Utils.extend(this.callBase(), {
            resize: ['width', 'height']
        });
    },

    resize: function(width, height) {
        var renderRatio = width / height,
            dataRatio = this._data.width / this._data.height,
            scale;

        if (renderRatio > dataRatio) {
            height = width / dataRatio;
            scale = height / this._data.height;
        }
        else {
            width = height * dataRatio;
            scale = width / this._data.width;
        }

        var list = [];

        for (var id in this._data.blocks) {
            if (this._data.blocks.hasOwnProperty(id)) {
                list.push({
                    id: id,
                    path: this._data.blocks[id],
                    scale: scale
                });
            }
        }

        this._blocks.update({
            list: list,
            fx: false
        });
        this._lngRuler = new kc.Ruler().ref(this._data.lng[0], this._data.lng[1]).map(0, width);
        this._latRuler = new kc.Ruler().ref(this._data.lat[1], this._data.lat[0]).map(0, height);
        this._xRuler = this._lngRuler.reverse();
        this._yRuler = this._latRuler.reverse();
        this.renderWidth = width;
        this.renderHeight = height;
    },

    findBlockById: function(id) {
        return this._blocks.find(id);
    },

    findBlockByEvent: function(e) {
        var shape = e.targetShape;
        while (shape && !shape.host) {
            if (shape.host instanceof MapBlock) return shape.host;
            shape = shape.container;
        }
        return null;
    }

} );

Map.CHINA = {
    width: 565,
    height: 475,
    lng: [73.66, 135.05],
    lat: [3.86, 53.55],
    blocks: {
        heilongjiang: 'M464.838,96.639l6.787-1.19l2.854,5.241l4.285,3.095l2.856-1.188h2.386l4.285-2.501l3.094,3.094l2.024,0.357l5.357-2.023l3.813,2.023l1.666,4.288h2.857l1.43,1.904l3.689,4.049l1.426-0.833l-0.594-5.12l2.026-1.432l2.854,5.716l2.621,1.074l2.858,3.212l2.021-0.357l0.836-1.427l4.523-5.12l2.022,1.428l1.43-2.022l1.431,2.619l4.283,1.429h2.86l2.07,0.088l-1.238-2.113l-0.598-6.906l-5.115-7.978l2.855-2.857l2.616-4.883h9.646l1.785-1.665l-0.597-3.69l2.025-3.691l-0.596-2.024l0.832-3.451l-0.236-17.742l2.855-5.715l-3.214-3.692l0.595-2.261l-1.427-2.024l-3.69,1.429l-4.289,4.884l-4.283,2.023l-4.289,5.951l-10.598,3.692l-4.879-3.692l0.594-2.262l-2.5-3.689l-1.191-3.811l-4.047-0.239l-7.145-3.69l-2.859,1.071l-3.33-1.667l-4.887,0.834l-4.283-1.429l-2.621-3.69l-2.498-2.857l-0.951-2.857l-3.334-3.452l-2.026-3.099l-4.644-6.31l-1.428-3.69l-5.119-6.548l-1.432-3.454l-6.549-3.216l-4.287,1.429l-3.689-0.833l-8.336-1.668l-11.07,3.932l-2.024,1.786l2.262,3.096l-2.856,7.499l0.834,0.835l4.881,3.096l2.621-4.286l4.524,2.856l-0.235,2.022l1.664,5.119l2.854,3.218l5.717,0.833l1.668-1.787l3.451-0.477l6.547-5.476l8.576,6.31l-2.858,11.669l0.594,8.333v5.119l-2.26,1.191l-0.238,13.335l-0.597-0.476l-2.26-2.858h-1.192l-0.595,1.073c0,0-8.797,13.044-7.146,10.596c1.652-2.448-3.451,4.523-3.451,4.523l0.357,1.428l7.145,4.886l3.926-1.071l0.599,1.071l-0.834,1.189l-3.689,1.667l-0.359,3.214L464.838,96.639z',
        jilin: 'M544.896,113.042l-2.07-0.088h-2.858l-4.285-1.431l-1.43-2.619l-1.431,2.024l-2.022-1.428l-4.523,5.12l-0.834,1.427l-2.022,0.357l-2.859-3.214l-2.621-1.072l-2.854-5.715l-2.027,1.431l0.594,5.12l-1.426,0.833l-3.689-4.05l-1.432-1.903h-2.854l-1.666-4.288l-3.813-2.023l-5.354,2.023l-2.025-0.357l-3.098-3.094l-4.285,2.5h-2.383l-2.857,1.191l-4.285-3.096l-2.854-5.24l-6.787,1.189l-2.621,3.099l-0.238,3.45l-7.502-2.023l-1.074,2.381l0.601,1.667l3.928,2.859v4.046l0.594,3.929l2.265,3.456l0.356,3.095l1.666,1.191l5.717-5.479l5.953,7.502v4.288l3.213,1.667l0.238-1.431l4.885,1.431l3.451,4.046l1.666-1.784l0.357-1.074l8.217,11.075l0.594,4.286l4.527,5.239l0.592,4.761l4.051-2.499l3.689-10.598l1.67-0.595l4.047,2.263l6.549-0.834l2.26-2.024l-3.092-4.763l0.832-1.191c0,0,7.84-2.611,6.072-2.022c-1.766,0.588,2.5-4.883,2.5-4.883l3.215-1.428l0.238-4.766l0.832-3.212l1.785-0.596l1.668,1.789l1.668,1.426l4.287-5.715l1.188-4.288L544.896,113.042z',
        liaoning: 'M491.15,173.2l6.783-10.002l4.287-4.881l-0.595-4.763l-4.524-5.239l-0.594-4.286l-8.216-11.075l-0.358,1.074l-1.666,1.786l-3.453-4.05l-4.883-1.429l-0.236,1.429v2.264l-2.022,2.022l-4.047,4.05H467.1l-1.666,2.856h-1.789l-3.094,3.096h-1.787l-3.691,3.691l-2.262,0.596l-4.881,7.5l-3.096-4.644l-3.453-2.262l-1.666,1.667l1.903,10.002l-1.666,3.453l-1.668,5.12l4.763,3.215l2.621,0.238l3.45,4.881l2.5-1.429c0,0,2.857-2.881,4.05-4.882c1.192-2.002,4.049-6.788,4.049-6.788l6.787-1.429l4.287,4.286l-3.099,6.787l-4.049,6.311l3.688,2.62l-0.233,3.098l-2.857,2.855l0.597,1.19l4.881-2.619l7.143-9.407l10.836-6.072L491.15,173.2z',
        hebei: 'M413.04,235.229l0.357-1.426l-1.783-3.453l6.902-12.5c0,0,8.725-7.9,6.313-5.718c-2.411,2.185,4.523-1.188,4.523-1.188l4.268-5.423l-1.647-1.125l-1.56-3.907l-3.319,1.286l-5.479-1.428l-0.237-1.428l-0.238-9.17l3.69-1.667l-0.419-1.563l-0.177-0.104l0.81-3.557l-5.094,2.128l0.832,1.905l0.178,1.424l0.18,1.433l-2.857,1.19l-1.785,1.667l-3.692-1.071l-4.881,0.834l-0.832-2.264l0.594-4.287l3.693-4.286l0.831-4.88l3.691-3.691l6.666,3.454h1.668l1.189,4.762l1.905,0.95l0.953,3.1l-0.356,2.024l4.047,2.854l0.594,2.264l3.338,1.428l8.332-4.523v-2.621l4.883-7.143l-3.45-4.881l-2.621-0.238l-4.763-3.218l1.668-5.118l-7.387-0.595l-3.213-4.765l0.357-2.619l-6.31-6.906l-4.051,2.026l-3.451,3.452l1.191,2.62l-0.834,1.667l-4.882,0.237l-2.264,2.022l-2.022-0.835l-2.021,2.026l-4.527,3.453l-2.024-1.43v-4.644l-1.666-0.832l-2.619,1.189l-3.096,6.547l-1.189,6.311l3.689,6.19l3.215,2.858v5.24l1.904,4.286l-0.834,4.764l-4.884,3.213l-2.26,7.382l4.049,4.645l2.857,5.717l-1.785,2.857l-0.477,3.928l-1.787,2.619l-0.834,2.859l2.621,3.446l11.43,1.431l4.524-1.787L413.04,235.229z',
        shandong: 'M425.661,252.611l0.597-2.856l2.5-1.069l4.645,3.927h1.433l4.284-0.476l2.5-2.022l3.453,2.856l1.429-2.62l0.356-1.43l2.857-1.667l0.834-3.45l2.854-0.595l7.98-13.454l-1.429-2.264l1.429-1.427l1.666,0.595l2.619-1.429l1.432-3.094l6.545-6.073l5.121-1.666l2.381-2.266l-0.592-4.88l-3.457-0.355l-7.738,0.952l-5.356-2.62l-3.216,0.596l-7.977,10.239l-2.262,1.429l-5.117-2.263l-0.359-2.619l-1.069-4.523l-2.859-1.669l-4.643,1.073l-2.882-1.971l-4.266,5.423l-4.523,1.188c0,0-8.514,7.798-6.313,5.718c2.201-2.081-6.902,12.5-6.902,12.5l1.783,3.45l-0.357,1.431v1.666l0.957,1.429l2.261-1.669l3.69-0.834l-10.002,11.074v2.621l2.023,0.596l4.524,3.93l7.146-0.835L425.661,252.611z',
        jiangsu: 'M483.646,282.616l-1.426,4.286l-1.898,2.251l-3.225,3.824l-4.879-0.835l-3.929-2.383l-2.383,1.19l-8.571-0.832l-0.238-3.454l-4.287-2.856l-1.428-2.618l2.02-2.264v-1.665v-2.267l5.121-0.594l0.24-2.023l-1.666-2.263l-2.621-0.355l-1.666,2.854l-4.287-0.831l-1.188-2.263l-2.857-1.666l0.955-6.074l-0.598-1.072l-2.859,0.479l-2.021-1.667l-5.118-1.429l-2.861-2.857l-6.307-2.621l0.592-2.856l2.5-1.069l4.645,3.927h1.433l4.284-0.476l2.5-2.022l3.453,2.856l1.427-2.62l0.358-1.43l2.857-1.667l0.834-3.45l2.854-0.597l7.148,4.881c0,0,3.365,0.754,5.117,2.025c1.754,1.271,9.766,16.313,9.766,16.313l-0.357,1.666l6.548,3.095l1.784,2.859l3.099,1.429l1.428,2.855l-2.023,0.951l-3.334-1.188h-4.645l-4.287-1.432l-1.666,1.432l3.932,1.188l3.813,1.669L483.646,282.616z',
        zhejiang: 'M483.793,336.063l-6.455,2.276l-3.693-3.69l-2.498,3.215h-4.049l-1.666-3.454l-2.023-5.118l-3.692-0.596l-4.047-7.501l-2.619-3.69l1.903-1.818l0.716-0.685c0,0,6.241-8.84,4.286-6.07c-1.954,2.769-0.239-4.882-0.239-4.882l1.43-1.906l3.336-0.594l0.951-1.43l-1.189-2.263l1.666-2.382v-4.524l2.384-1.189l3.928,2.382l4.879,0.835l3.225-3.824l3.998,3.332l-1.744,1.324l-2.021,3.096l-3.217,0.952l-1.074,0.833l3.098,1.666l5.715-2.499l9.406,3.929l0.953,7.979h-3.809l-0.24,2.382l2.024,3.332l-1.784,2.024l2.022,3.214l-3.096,3.69l-1.43-1.787l-4.644,11.788L483.793,336.063z',
        anhui: 'M423.637,253.208l2.024-0.597l6.312,2.621c0,0,1.768,2.299,2.861,2.856c1.092,0.557,5.118,1.43,5.118,1.43l2.021,1.667l2.858-0.479l0.599,1.072l-0.957,6.074l2.858,1.666l1.189,2.263l4.287,0.831l1.666-2.854l2.621,0.356l1.666,2.265l-0.24,2.021l-5.121,0.596v2.264v1.665l-2.021,2.265l1.43,2.618l4.287,2.856l0.237,3.454l8.572,0.832v4.525l-1.666,2.381l1.191,2.263l-0.951,1.43l-3.338,0.594l-1.428,1.906l0.235,4.882l-4.285,6.072l-0.715,0.683l-2.381-2.111H446.5l-2.498-2.855l-4.884,4.761l-1.786-0.834l2.026-3.69l-0.24-1.188l-1.786-0.479l-5.718,3.099l-5.356-10.241l1.666-3.214l-0.595-1.071l-2.858-0.952l-4.76-2.858l1.903-3.928l2.855-1.43l0.598-3.214l-1.07-5.716l-0.596-0.479l-2.856,2.86c0,0-5.978-4.647-4.287-3.453c1.69,1.192-3.217-4.049-3.217-4.049l3.217-2.261l0.834-4.05l2.021-1.431l-0.354-5.359l1.43-1.188l2.619,1.787l1.664,2.26l3.453-2.26l1.192-1.434l-0.598-2.617l-4.049-2.263L423.637,253.208z',
        henan: 'M371.131,276.068l9.405,8.336l7.742,1.665l7.144-1.072l2.262,1.072l2.5-1.43l1.783,1.787l0.834,2.856l3.455,1.905h4.524l3.451,2.857l3.098-1.428l2.382,1.428l1.903-3.929l2.855-1.43l0.598-3.216l-1.07-5.715l-0.596-0.479l-2.856,2.86l-4.287-3.453l-3.218-4.049l3.218-2.263l0.834-4.048l2.021-1.431l-0.354-5.359l1.43-1.188l2.619,1.787l1.664,2.26l3.455-2.26l1.19-1.434l-0.598-2.617l-4.049-2.263l-0.834-2.619l-7.142,0.835l-4.524-3.93l-2.021-0.596v-2.621l10-11.074l-3.69,0.834l-2.261,1.669l-0.957-1.429v-1.666l-1.663-0.6l-4.525,1.785l-11.43-1.428l-0.597,9.408c0,0-6.604,5.169-5.479,4.287c1.129-0.884-7.381,1.429-7.381,1.429l-10.359,7.142l-8.215,2.264v1.43l7.738,11.666L371.131,276.068L371.131,276.068z',
        shanxi: 'M363.393,259.519l8.217-2.265l10.357-7.142l7.381-1.431l5.477-4.287l0.599-9.405l-2.623-3.449l0.836-2.856l1.787-2.619l0.477-3.929l1.785-2.86l-2.859-5.713l-4.047-4.645l2.262-7.383l4.886-3.212l0.83-4.765l-1.904-4.286v-5.242l-3.215-2.854l-7.381,3.809l-1.191-1.189l-3.93,2.855l-3.213-0.235l-6.312,9.048h-1.906l-3.452,2.858l0.237,4.046l-1.67,3.452l-0.594,4.525l-3.096,4.884l3.334,6.905l-1.07,3.929l-2.619,4.286c0,0,4.146,18.996,3.689,16.903s-2.498,8.81-2.498,8.81L363.393,259.519z',
        shaanxi: 'M363.393,259.519l-1.428-3.454l2.498-8.81l-3.689-16.903c0,0,3.262-5.777,2.619-4.286c-0.646,1.49,1.07-3.929,1.07-3.929l-3.334-6.905l3.096-4.884l0.594-4.525l1.67-3.452l-0.238-4.046l-1.432-1.074l-2.26,2.502l-6.072,0.356l-3.096,4.526l0.236,2.62l-0.593,1.665l-2.502,0.834l-9.406,13.454l-1.19-0.836l-2.617-0.594l-5.359,0.359l-1.789,2.499l-0.233,5.478l0.834,1.667l9.166,4.637l4.883,3.099l0.832,2.855l-2.619,3.691l1.431,4.286l-0.835,2.021l-6.784,0.6l-1.433,0.835l0.478,1.188v1.904l-5.355,0.596l-2.856-1.428h-3.691l-0.596,0.832l0.596,2.026l-1.789,2.022l-0.592,2.261l3.451,2.861l-2.5,5.117l1.071,2.619l-0.237,1.191h-4.052l-2.854,1.429l2.262,3.098l-1.43,4.048l2.383,0.478l0.238,2.617l2.021,0.237l7.386-1.427l1.43,0.593l0.354,2.025l3.099,0.835l6.547,3.216l3.69-1.434l8.097,2.857l1.666,2.26l4.051-0.829l-0.596-4.288l-0.834-1.191l0.834-3.451l4.286-2.021l1.068-1.668l-2.26-0.837l-2.5-0.593l-2.619-2.62l1.189-1.068h8.571h1.908l1.189,0.83l2.616-2.022v-3.454l-7.737-11.668L363.393,259.519L363.393,259.519z',
        gansu: 'M196.462,200.108l-1.43-16.55l0.836-3.453l4.879-2.262c0,0,5.209-5.03,6.903-5.717c1.696-0.686,10.6-4.285,10.6-4.285l4.285-2.025v-4.047l1.905-2.262l1.788,0.237l7.144,1.192l-0.358,3.095l1.43,4.88l-0.834,7.978l6.072,8.929l3.097,2.026l4.883-3.812h10.237l2.623,0.953l1.429,2.264l-1.193,2.499l-5.714,4.645l0.597,2.261l6.549,4.882h2.618l0.834,1.07l-0.596,2.025l4.05,3.217l9.404,1.429l4.525-1.19l5.718-5.719l6.903,0.598l2.855,4.287l-1.664,3.929l0.475,2.382l-3.688,2.263l-1.668,2.024l0.596,4.763l6.545,4.646l2.875-0.653l7.725,9.458l1.668,7.145l-0.834,3.451l5.357,2.859v2.26l4.883,1.192h1.426v-4.05l3.693-0.595l0.951-4.763l-2.619-2.026l-2.025-2.021l0.834-9.166l2.023-1.071l3.453,1.43l1.432-0.598l0.834,1.667l9.166,4.639l4.883,3.1l0.832,2.856l-2.619,3.691l1.431,4.285l-0.834,2.021l-6.785,0.6l-1.433,0.833l0.478,1.191v1.903l-5.355,0.594l-2.856-1.428h-3.691l-0.596,0.834l0.596,2.024l-1.789,2.023l-0.592,2.262l3.449,2.857l-2.498,5.119l1.072,2.622l-0.238,1.188h-4.051l-2.854,1.435l2.26,3.091l-1.428,4.051l-4.287,1.07l0.357,2.023l-1.189,1.428l-7.383-0.596l-2.854-2.021l-0.601-4.525l-1.664-1.669l-2.62,1.669l-4.523-4.521l-3.455-2.385l-0.354-3.335l-1.074-2.619h-1.787l-7.144,3.096l0.356,3.454h-2.618l-4.287-4.288l-4.525-0.593l-1.786-2.499l1.431-2.86l2.617,2.5l3.097,0.954l2.62-2.025v-4.881l2.857-2.62l2.265-2.263l-1.073-2.856l5.716-4.522l0.832-7.147l-2.619-3.688l-1.429-6.071l-7.144-9.405l-3.692,1.431l-5.118-4.524l-6.907-4.287l-2.856-6.905l-5.359,2.023l-9.999-6.309l-4.883,2.616l-7.501-1.188l-5.714,3.452l-3.691,0.237l-5.715-3.451l-3.93-2.265L196.462,200.108z',
        hubei: 'M356.486,329.29l1.787-4.048l5.119-4.287l4.881,2.026l3.096-2.026l-2.621-3.093l1.429-1.433l13.219,0.836l4.525,3.097l2.264,1.425l3.451-2.26l2.619-0.833l0.596,3.093h1.904l1.43-2.021l2.856-2.86l1.431,2.027v4.049l1.19,1.667l2.619,0.594l2.855-2.854l4.287-1.433l7.979-7.381l3.691,0.236l4.522-1.428l-5.358-10.24l1.668-3.214l-0.593-1.071l-2.862-0.952l-4.761-2.858l-2.381-1.427l-3.098,1.427l-3.451-2.854h-4.524l-3.455-1.907l-0.83-2.856l-1.787-1.786l-2.5,1.428L395.421,285c0,0-9.509,0.927-7.146,1.071c2.363,0.146-7.736-1.666-7.736-1.666l-9.407-8.334l-2.619,2.023l-1.188-0.831h-1.907h-8.572l-1.189,1.068l2.619,2.62l2.5,0.593l2.26,0.837l-1.067,1.668l-4.287,2.021l-0.834,3.451l0.834,1.191l0.596,4.288l2.5,0.238l2.619,3.452l1.07,6.548l-0.832,2.262l-1.666-0.594l-4.883,3.812l-8.336,1.429l-2.261,2.263l1.783,2.262l0.24,4.882l2.262,0.598L356.486,329.29z',
        jiangxi: 'M408.279,325.242l3.336,6.549l0.355,3.452l-1.785,3.454l-2.502,2.024l-0.594,6.188l0.832,0.955l1.43-0.596l0.834,0.596v3.927l1.785,4.647l2.026,0.831l0.234,6.789l-1.193,4.642l1.193,2.021l2.266,2.265l5.474-1.429l1.071,2.022l-1.665,2.263l-2.859,4.287v1.07l1.67,1.192l11.43-4.525l4.047,2.263l1.191-1.19l-1.191-2.499l0.281-1.663l1.742-10.365l1.67-2.62l0.832-2.854l2.025-4.286l-1.072-1.668l0.238-3.691l4.881-5.475l-0.355-3.691l3.213-5.478l3.095,0.834l6.311-4.524l1.193-2.263l-4.049-7.501l-2.619-3.69l1.901-1.818l-2.381-2.111H446.5l-2.5-2.855l-4.884,4.762l-1.784-0.835l2.024-3.69l-0.24-1.188l-1.784-0.479l-5.716,3.099l-4.524,1.429l-3.689-0.238c0,0-9.709,9.669-7.979,7.381c1.731-2.287-4.287,1.433-4.287,1.433L408.279,325.242z',
        fujian: 'M435.945,374.779c0,0,2.881-12.508,1.742-10.365c-1.137,2.144,1.672-2.62,1.672-2.62l0.83-2.854l2.023-4.286l-1.072-1.668l0.24-3.691l4.881-5.475l-0.357-3.691l3.215-5.478l3.095,0.834l6.311-4.524l1.193-2.26l3.69,0.593l2.025,5.118l1.666,3.454h4.047l2.498-3.215l3.693,3.69l6.454-2.276l-4.069,9.776l-2.385-1.192l-1.666,0.835l-0.238,0.954l2.262,2.501l-0.598,8.929l0.598,2.859l-0.598,0.834l-2.617-0.599l-1.668,1.667l1.191,2.384l-3.214,3.095l0.595,1.189l-3.097,1.665l0.478,2.264l-1.072,1.191h-4.285l-2.264,2.025l-0.357,0.832l2.023,1.428l-2.26,3.452l-2.859,3.691l-1.189-0.356l-3.1,3.216l-3.447-7.502l-3.098-3.929l-2.023,0.24l-1.43-1.072L435.945,374.779z',
        hunan: 'M408.279,325.242l-2.619-0.594l-1.188-1.667v-4.05l-1.43-2.026l-2.857,2.86l-1.43,2.023h-1.904l-0.594-3.096l-2.621,0.833l-3.451,2.263l-2.264-1.428c0,0-2.666-2.521-4.525-3.097c-1.857-0.576-13.217-0.832-13.217-0.832l-1.43,1.429l2.62,3.093l-3.096,2.026l-4.883-2.026l-5.117,4.287l-1.787,4.05c0,0-0.19,6.479,0.357,9.405c0.551,2.926,2.5,10.002,2.5,10.002l-5.717,6.31l0.596,0.833l5.121-1.428l1.785,2.263l-1.429,7.144l2.857,5.121l2.856,0.832l2.857-3.931l1.43,3.099l0.834-0.238l4.523-4.288l1.191,0.24l2.021-1.073l3.693,1.073v4.048l2.856,0.595l-0.832,3.929l-2.623,4.29l-1.188,3.688h1.188l3.103-2.854l2.617,5.713l2.021-1.43h2.264l2.263-1.666v-3.45l1.188-1.072l2.859,0.235l4.879,2.264l0.834-1.667l-1.188-2.023l0.354-1.429l3.098-2.619l5.478,1.428l3.096-1.906l-1.193-2.021l1.193-4.642l-0.234-6.789l-2.026-0.831l-1.785-4.647v-3.927l-0.834-0.596l-1.43,0.596l-0.832-0.955l0.594-6.188l2.502-2.024l1.785-3.454l-0.355-3.452L408.279,325.242z',
        guizhou: 'M313.622,349.296l-1.666,4.761l-2.856,0.951l-6.313-0.951l-1.43,1.429l-3.453-1.07l-3.094,4.286l1.428,1.43v2.856l1.431,2.501l6.309-1.906l1.908,1.667l-2.859,12.027l3.81,3.689l-1.188,6.907l3.688,0.238l4.051-3.695l1.668,1.073l7.737,3.216l1.429-0.832l0.235-2.622l1.433-1.429l10.955-7.144l1.903,2.265l6.668,2.021l3.689-4.883l1.668,1.192h2.619v-1.432l3.453-1.189v-1.071l1.43-1.428l0.832,0.237l3.453-3.452l-2.857-5.123l1.429-7.142l-1.785-2.263l-5.121,1.428l-0.596-0.834l5.717-6.309l-2.5-10.001l-3.81,2.855l-3.334-3.45l-3.215-4.29l-0.24-2.619l-2.26-0.477l-2.621,0.834l-4.287-2.024l-2.022,4.883l-3.691,0.239l-2.619,4.049l-1.666-0.834l-2.623,0.834l-3.928-2.266l-3.213,3.69v1.668l6.312,3.453l1.426,2.621c0,0-6.094,2.245-4.523,1.667C322.1,348.955,313.622,349.296,313.622,349.296z',
        sichuan: 'M279.33,280.95l1.788-4.05l-2.025-2.261l-0.357-3.454l7.145-3.096h1.787l1.069,2.619l0.357,3.336l3.455,2.384l4.522,4.521l2.621-1.669l1.664,1.669l0.6,4.525l2.855,2.021l7.383,0.599l1.189-1.431l-0.357-2.023l4.287-1.07l2.381,0.478l0.238,2.617l2.024,0.237l7.382-1.427l1.43,0.593l0.354,2.026l3.099,0.834l6.549,3.214v7.47l-3.932,1.059l-1.351,7.671l-5.346,3.72l-1.014,5.811l-4.564-2.092l-5.58,2.092l-0.231,4.416l-0.464,4.53l6.507,4.07l2.28,6.977l-2.623,0.833l-3.928-2.263l-3.213,3.691v1.666l6.311,3.452l1.427,2.62l-4.523,1.666l-6.904-0.238l-0.831-2.855l-2.621-0.954l-4.285,2.623l-2.859-1.429l-0.238-3.694l-1.43-1.786v-1.903l-4.047-0.952l-1.072,1.188l0.599,2.858l-3.215,1.431l-0.836,2.021l0.836,2.504l-7.146,8.334l1.191,9.764l-3.453,2.855l-1.666-1.784l-6.906,4.049l-2.621-1.431l-10.001-19.17l-3.931-2.854l-3.216-0.835l-1.428-2.623l1.787-2.854l-2.857-2.264l-3.455,2.858l-3.45,0.595l-2.264-10.359l-0.597-2.499c0,0-2.04-22.568-0.594-16.55c1.446,6.017-3.099-8.336-3.099-8.336l2.267-1.665l-6.55-12.027l-7.977-6.311l1.069-3.692l0.953-1.188l11.669-1.666l7.738,2.262l4.523-1.431l1.785,2.859l5.717,5.715l4.524-0.833v-3.453l1.191-2.266l4.522-1.783l1.667,2.856l2.621-1.903l3.689,0.478v-0.241H279.33z',
        yunnan: 'M313.622,349.296l-0.836-2.858l-2.618-0.954l-4.283,2.622l-2.859-1.432l-0.238-3.688l-1.43-1.79v-1.903l-4.049-0.952l-1.07,1.188l0.599,2.859l-3.217,1.43l-0.834,2.021l0.834,2.5l-7.146,8.336l1.191,9.766l-3.453,2.854l-1.666-1.784l-6.907,4.048l-2.618-1.431c0,0-11.535-22.106-10.002-19.172c1.533,2.938-3.931-2.854-3.931-2.854l-3.213-0.834l-1.432-2.619l1.787-2.859l-2.857-2.263l-3.455,2.859l-3.451,0.598l-2.263-10.363l-0.596-2.499l-3.454,4.286l-1.427,0.831l0.356,6.551l-0.834,1.431h-1.784l-1.43-1.431l-1.667,2.026l1.667,7.381h2.024l1.667,1.19c0,0,0.468,2.396,0.594,4.521c0.125,2.125-0.833,15.719-0.833,15.719l-10.837,9.766l-0.594,3.689l-2.024,1.787l-0.238,1.903l1.669,4.643l-1.431,3.454l0.834,0.478l5.478-1.433l7.738-0.476l-0.834,3.098l1.431,2.857l0.475,4.287l0.955,1.426l4.524,0.243l2.024,1.425l-2.264,2.856l-0.356,3.453l-1.667,4.05l1.068,1.43l2.86,0.238l4.881,1.784l-0.593,1.667l3.212,4.881h4.524l5.716-3.213l1.786,0.952v1.906l0.832,2.856l1.432,1.429l3.092-0.477l1.192,0.834l1.072-1.192v-4.525l-1.906-8.333l1.431-2.5h4.762h1.192l2.62-3.213l6.783,2.261l2.858-2.503l1.431,1.432l2.858-1.786l2.615,2.618h1.073l0.953-1.428l2.261-2.263l1.073,0.833l3.213-0.595l3.099-2.502l2.619-3.811l3.688-0.831l2.023,2.021l1.43-4.048l2.857-0.235l1.069-0.834l0.957-3.691l-1.192-2.023l-9.765-1.785l-1.668-2.857h-2.854h-2.619l-1.906-3.097l0.24-1.665l1.188-6.907l-3.809-3.689l2.859-12.027l-1.908-1.667l-6.309,1.906l-1.431-2.501v-2.856l-1.428-1.43l3.094-4.286l3.453,1.07l1.43-1.429l6.313,0.951l2.856-0.951L313.622,349.296z',
        qinghai: 'M153.954,234.989l4.523,1.667l7.742-2.617l-1.193-1.429h-2.021l-0.834-2.259l0.594-2.024l3.692-1.668l2.617-4.286l-7.977-6.548l-0.356-6.906c0,0,2.08-2.545,3.689-2.856c1.609-0.313,26.317-5.119,26.317-5.119l1.783-1.428l3.931,0.594l13.215,3.095l3.93,2.265l5.714,3.451l3.692-0.237l5.714-3.452l7.501,1.188l4.882-2.616l9.999,6.309l5.36-2.023l2.856,6.903l6.907,4.286l5.119,4.527l3.691-1.431l7.146,9.405l1.426,6.071l2.619,3.688l-0.832,7.146l-5.715,4.524l1.073,2.856l-2.265,2.263l-2.856,2.62v4.879l-2.621,2.027l-3.097-0.954l-2.617-2.5l-1.431,2.859l1.787,2.499l4.524,0.594l4.287,4.288h2.618l2.024,2.265l-1.787,4.046v0.239l-3.688-0.479l-2.621,1.905l-1.666-2.856l-4.524,1.785l-1.19,2.264v3.451l-4.524,0.836l-5.715-5.716l-1.787-2.856l-4.524,1.428l-7.738-2.262l-11.67,1.666l-0.952,1.189l-1.071,3.69l-2.263,1.43l0.238,3.692l-6.906,8.931l-11.43-2.383l-0.833-4.285l-7.146-5.718l-15.717-2.498l-6.786-1.19l-2.621-0.238l-5.953-4.883l-12.384-2.857l-8.57-16.551l-0.238-4.642l3.451-1.672v-5.117l2.502-6.313l-2.858-2.856L153.954,234.989z',
        hainan: 'M385.895,447.523l-5.119,8.93v3.929l-10.238,8.336l-10.598-3.689l-2.025-7.501l0.597-3.454c0,0,8.074-8.075,5.715-5.716c-2.357,2.358,2.025-1.665,2.025-1.665l9.403-1.668l4.289-0.358l1.426-1.666l3.103,0.832L385.895,447.523z',
        shanghai: 'M484.32,292.485l-3.998-3.332c0,0,0.867-0.375,1.898-2.251c1.031-1.875,1.426-4.286,1.426-4.286l4.287,1.788l2.027,2.854l-1.433,2.024L484.32,292.485z',
        chongqing: 'M318.986,317.871l5.58-2.092l4.564,2.092l1.014-5.811l5.346-3.72l1.351-7.671l3.932-1.059v-7.47l3.689-1.432l8.096,2.857l1.666,2.26l4.051-0.829l2.5,0.238l2.619,3.452l1.07,6.548l-0.832,2.262l-1.666-0.594c0,0-3.072,3.501-4.884,3.812c-1.809,0.311-8.336,1.429-8.336,1.429l-2.26,2.263l1.783,2.262l0.24,4.883l2.262,0.597l5.715,7.142l0.357,9.407l-3.218,2.412l-0.592,0.445l-3.334-3.451l-3.215-4.29l-0.24-2.619l-2.26-0.476l-2.621,0.834l-4.287-2.025l-2.022,4.883l-3.691,0.239l-2.619,4.049l-1.666-0.834l-2.28-6.977l-6.507-4.07L318.986,317.871z',
        tianjin: 'M430.413,200.491c0,0-1.832,1.672-3.319,1.284c-1.49-0.388-5.479-1.428-5.479-1.428l-0.237-1.429l-0.238-9.169l3.69-1.667l-0.596-1.666l0.81-3.557l0.385-1.683l1.901,0.95l0.953,3.098l-0.356,2.022l4.047,2.858l0.594,2.263l-2.379,1.668l-0.834,3.809L430.413,200.491z',
        beijing: 'M421.139,189.75l-0.357-2.856l-0.832-1.905l5.095-2.126l0.381-1.683l-1.189-4.767h-1.668l-6.666-3.449l-3.69,3.69c0,0-1.125,6.585-0.832,4.88c0.289-1.704-3.693,4.288-3.693,4.288l-0.594,4.286l0.832,2.263l4.881-0.834l3.693,1.071l1.784-1.667L421.139,189.75z',
        ningxia: 'M329.934,230.111l0.24-5.476l1.785-2.499l-0.832-2.62l-9.168-3.454l0.594-3.691l2.858-4.049l-1.786-6.19l-0.835-0.952l-5.954,4.049l-2.855,9.168l-0.953,6.31l-4.762,3.93l-2.859,1.189l-3.438,0.779c0,0,9.184,11.236,7.729,9.458c-1.455-1.78,1.664,7.146,1.664,7.146l-0.834,3.449l5.357,2.859v2.262l4.881,1.19h1.43v-4.048l3.691-0.597l0.951-4.763l-2.619-2.026l-2.023-2.021l0.832-9.163l2.023-1.073l3.453,1.43L329.934,230.111z',
        neimongol: 'M301.969,226.604l3.438-0.779l2.859-1.188l4.762-3.932l0.953-6.31l2.855-9.168l5.954-4.048l0.835,0.951l1.786,6.19l-2.858,4.049l-0.594,3.691l9.168,3.453l0.832,2.621l5.358-0.359l2.617,0.596l1.191,0.834l9.405-13.454l2.502-0.835l0.593-1.664l-0.236-2.623l3.096-4.523l6.072-0.358l2.262-2.5l1.431,1.074l3.452-2.86h1.904l6.312-9.046l3.215,0.235l3.93-2.855l1.191,1.189l7.381-3.809l-3.689-6.193l1.189-6.311l3.096-6.549l2.619-1.188l1.666,0.832v4.644l2.025,1.43l4.526-3.453l2.021-2.026l2.022,0.835l2.265-2.025l4.881-0.234l0.834-1.667l-1.191-2.622l3.453-3.452l4.049-2.024l6.31,6.908l-0.355,2.618l3.213,4.763l7.385,0.595l1.666-3.453l-1.903-10.002l1.666-1.667l3.453,2.262l3.096,4.644l4.881-7.5l2.264-0.596l3.689-3.692h1.787l3.094-3.095h1.787l1.666-2.856h4.527l4.047-4.051l2.021-2.021v-2.264l-3.213-1.667v-4.286l-5.953-7.502l-5.717,5.478l-1.666-1.19l-0.357-3.096l-2.264-3.453l-0.594-3.931v-4.046l-3.928-2.858l-0.601-1.667l1.074-2.382l7.502,2.022l0.238-3.452l2.621-3.099l-1.789-1.666l0.358-3.214l3.689-1.667l0.834-1.19l-0.598-1.07l-3.927,1.07l-7.145-4.882l-0.357-1.43l3.453-4.524l7.146-10.597l0.594-1.072h1.193l2.26,2.858l0.596,0.479l0.238-13.336l2.26-1.191v-5.121l-0.594-8.333l2.858-11.668l-8.575-6.312l-6.548,5.478l-3.45,0.476l-1.668,1.786l-5.718-0.832l-2.854-3.215l-1.664-5.122l0.236-2.021l-4.525-2.858l-2.621,4.289l-4.881-3.096l-0.834-0.835l2.856-7.5L433.4,7.223h-2.024l-5.119,3.688l-4.285,6.311l1.668,1.071l3.211,0.359l2.504,6.548l-1.43,2.618l-2.502,3.689l-4.644,17.147l1.785,2.856l-1.428,2.498l-10.599,7.742l-5.713-1.071l-3.215-1.191l-0.479,1.667l-4.642,18.577l-2.264,2.378l1.191,3.335l2.854,2.382l4.764-2.623l7.74,0.598l2.26-3.692l4.052-0.951l7.737,2.856l9.408,9.765v2.023l-2.024,1.429l-10.836,0.599l-3.691,2.854l-2.857-0.355l-2.022,3.214l-5.121,1.07l-3.457,5.12l-0.592,3.81l-7.379,4.763l-4.646,0.598l-5.119,6.904l-4.883,2.859l-9.408-2.025l-3.092-1.431l-3.692,3.694l-1.785,6.548l5.119,7.501l-3.335,3.451l-4.643,2.859c0,0-8.422,10.638-6.787,8.571c1.637-2.064-6.619,3.36-8.93,3.93c-2.31,0.568-14.525,1.429-14.525,1.429l-2.264-0.237l-16.906,7.144l-7.742,4.881l-2.262-1.19l-0.83-2.262l-10.36-0.597l-11.909-3.688l-3.211-3.69l-17.385-2.025l-3.217,1.43l-21.072-2.022l-0.358,3.095l1.43,4.883l-0.834,7.976l6.073,8.929l3.096,2.026l4.883-3.812h10.237l2.623,0.953l1.426,2.262l-1.19,2.5l-5.714,4.646l0.597,2.261l6.549,4.88h2.618l0.834,1.072l-0.596,2.023l4.05,3.217l9.403,1.429l4.527-1.19l5.716-5.719l6.903,0.598l2.857,4.289l-1.664,3.926l0.473,2.382l-3.688,2.263l-1.668,2.024l0.596,4.76l6.545,4.647L301.969,226.604z',
        guangxi: 'M305.646,387.87l3.688,0.241l4.051-3.694l1.668,1.072l7.737,3.216l1.429-0.835l0.235-2.619l1.433-1.429l10.955-7.145l1.903,2.266l6.668,2.021l3.691-4.883l1.666,1.192h2.619v-1.431l3.453-1.192v-1.069l1.43-1.428l0.832,0.236l3.453-3.451l2.856,0.832l2.857-3.931l1.432,3.099l0.832-0.238l4.525-4.288l1.188,0.24l2.021-1.073l3.693,1.073v4.048l2.856,0.595l-0.832,3.929l-2.623,4.29l-1.188,3.688h1.188l3.101-2.854l2.616,5.713l2.025-1.43h2.26l1.666,5.717l-1.666,2.383l0.24,2.5l-5.119,6.547l0.355,6.905l-6.668,5.12l-0.476,4.285l-3.809,1.787l0.354,2.5l-3.694,0.831l-2.853,4.646l-7.502,1.071l-3.93-2.856l-4.049-1.669l-4.049,4.05l-4.158,0.241l-4.058,0.234c0,0-10.996-6.139-9.168-5.119c1.828,1.021-1.666-4.526-1.666-4.526l2.261-4.646l-2.617-1.902h-3.455l-0.832-0.952l-3.691,0.952l-3.692-2.62l1.432-4.048l2.855-0.235l1.069-0.834l0.957-3.69l-1.192-2.024l-9.765-1.785l-1.668-2.856h-2.854h-2.619l-1.906-3.099L305.646,387.87z',
        xinjiang: 'M153.889,69.508l2.327-0.014l-1.428,4.525l2.025,2.38l0.236,1.666l4.525,4.524l1.191,3.453l5.953,0.357l2.62,2.265h1.429l3.453,7.379l3.451,8.931l-1.784,5.357l0.358,2.025l-3.215,5.477l0.833,4.286l11.192,4.763l12.025,1.788l12.503,8.571l4.049,1.429l0.237,2.261l2.619,5.478l2.619,7.146l3.333,5.953l-1.903,2.263v4.047l-4.286,2.026l-10.596,4.284l-6.907,5.719l-4.881,2.26l-0.834,3.453l1.43,16.55l-3.931-0.596l-1.783,1.431l-26.315,5.119l-3.691,2.856l0.358,6.906l7.978,6.548l-2.62,4.286l-3.69,1.668l-0.597,2.024l0.835,2.259h2.021l1.192,1.429l-7.738,2.617l-4.525-1.667l-2.382-1.424h-5.715l-10.24-4.642h-6.546l-5.121,1.428h-5.714l-8.931,4.879l-7.143-0.834l-7.145,2.5l-5.956-1.907l-3.689-3.211l-9.525-1.427l-6.191,4.28l-3.452-1.425l-2.858-2.263l-6.907-1.667l-1.07-1.189l-2.857-0.237l-9.782,5.945l-10.037-1.25l-0.822-0.359l1.113-8.623l-4.524-1.191l-9.406-6.902l-2.62-0.241l-2.023-4.525l1.427-4.643l-0.477-2.26l-3.451-2.266l-1.192-2.26l-7.143-4.049v-1.189l3.452-1.431l2.023,1.19l2.025-2.025l-0.598-6.785l0.598-5.716l-4.646-4.642l-3.095,0.833l-1.189-3.336l1.785-3.452l-0.952-3.214l3.038-2.749l1.248-1.182v-2.618l4.285-2.024l4.286-0.833l3.811-1.429l3.099,0.832l2.26-0.832l0.833,0.595l0.356,2.859l2.022,0.832l4.765-0.238c0,0,3.566-4.729,5.478-6.073c1.911-1.346,11.19,2.381,11.19,2.381l5.717-4.048l16.552-3.689l1.069-2.264l1.43-6.31l4.643-3.69h1.433v-1.906l0.236-15.836l0.833-3.212l-4.521-1.668l-0.24-1.191l4.762-1.428l12.384-1.073l1.905,2.501l4.287,0.952l1.192,0.239l1.665-2.262l-2.265-2.263l9.169-18.574l1.431-0.953l8.335,4.047h3.689l1.667,2.264l7.979-2.502l2.023-13.212l3.452-2.265l4.048-0.238l2.859-3.452l1.071-3.454l2.263-1.191L153.889,69.508z',
        xizang: 'M152.525,339.529l6.787,0.834l2.265,3.216l1.189,0.477l10.239-1.904l0.594-1.787l2.023-1.07l4.884-4.05l4.285-0.594l3.93-2.501l7.74-4.286l0.832,1.428l5.716,1.904l8.334-4.285l2.618,1.787l-2.379,3.452l0.952,0.833h3.332l0.359,1.427l-2.857,5.121l0.833,0.834h1.666l8.336,2.265l3.691-3.099l5.478,4.289l1.667-2.026l1.43,1.431h1.784l0.834-1.431l-0.356-6.549l1.429-0.835l3.451-4.284l-0.594-16.549l-3.099-8.337l2.265-1.665l-6.548-12.027l-7.979-6.311l-2.26,1.43l0.238,3.692l-6.908,8.931l-11.428-2.384l-0.833-4.286l-7.146-5.716l-15.717-2.498l-6.787-1.188l-2.619-0.241l-5.952-4.883l-12.385-2.857l-8.57-16.551l-0.238-4.642l3.451-1.672v-5.117l2.502-6.311l-2.858-2.858l3.811-3.095l-2.383-1.425h-5.716l-10.238-4.644h-6.549l-5.118,1.43h-5.715l-8.931,4.879l-7.144-0.834l-7.146,2.5l-5.954-1.906l-3.688-3.212l-9.526-1.427l-6.192,4.28l-3.45-1.425l-2.859-2.263l-6.908-1.667l-1.065-1.189l-2.857-0.237l-9.782,5.945l-10.412-1.297l2.428,4.398l2.68,1.995l-0.821,3.842l-0.231,3.758l0.256,2.672l0,0l-0.193,3.208l3.451,3.454l0.239,4.884l-1.072,1.907l-5.119,0.591l-2.621-2.854l-2.619,0.355l-0.476,2.265l1.428,3.688l0.479,2.62v3.333l-0.833,2.381l0.354,1.909l3.336,0.356l1.785,3.094l7.739,6.071v1.906l5.716,6.311l1.902,2.262l1.79,0.595l3.451-3.451l3.096,2.856c0,0,15.395,13.684,13.098,11.193c-2.297-2.491,2.381,5.715,2.381,5.715h2.859l1.667-1.665l1.426,1.428v5.117l7.741,4.287l1.667-0.357l1.191,4.287l6.548,3.81l0.238,2.501l1.188,0.835l5.717-0.24h3.098l4.644,3.457l10.24-0.359l5.476-0.239l1.428,2.265l-1.188,4.883l1.427,1.664l5.715-4.761l7.146-5.239l5.12,0.95L152.525,339.529z',
        guangdong: 'M391.37,382.632l2.265-1.666v-3.45l1.188-1.072l2.859,0.235l4.879,2.264l0.834-1.667l-1.188-2.025l0.354-1.427l3.098-2.619l5.478,1.427l3.096-1.905l2.264,2.265l5.478-1.429l1.07,2.021l-1.666,2.264l-2.859,4.288v1.069l1.67,1.192l11.43-4.525l4.048,2.264l1.19-1.191l-1.19-2.499l0.28-1.663l7.459,1.663l1.431,1.072l2.022-0.24l3.094,3.929l3.451,7.502l-2.26,1.667l-2.023,3.689l-1.786,0.596l-1.664,3.455l-5.716,2.854l-2.266-1.188l-1.426,2.382v0.833h-1.787h-3.098l-2.857,2.023l-2.021-1.188l-2.5,1.663l-6.314,2.619l-5.121-4.05l-0.354,3.217l1.788,4.882l-4.646,1.904l-2.498,3.452l-4.887,1.191l-2.617,1.073h-5.119c0,0-0.869,2.545-3.453,3.452c-2.584,0.904-9.168,3.213-9.168,3.213l-4.522,3.098l-2.265,2.263l4.287,6.903l-2.856,2.501l-3.451-0.238l-4.053-7.381l0.954-5.238v-2.501l2.854-4.646l3.695-0.831l-0.355-2.501l3.809-1.785l0.476-4.288l6.668-5.119l-0.355-6.905l5.119-6.547l-0.24-2.5l1.666-2.381L391.37,382.632z',
        hongkong: 'M417.745,409.005l3.394,0.773l3.453-2.558l1.666,4.582c0,0-5.521,2.673-3.691,1.785c1.828-0.884-4.641-0.355-4.641-0.355l-0.834-3.454L417.745,409.005z',
        taiwan: 'M505.438,371.203l-3.217,19.169l-1.664,6.07v5.123l-1.43,1.427l-3.451-5.119l-3.693-2.858l-3.215-8.571c0,0-0.451-5.62,0.357-7.74c0.809-2.118,5.356-14.05,5.356-14.05l6.313-5.357l4.051,1.904L505.438,371.203z',
        macau: 'M412.032,413.183l-0.96,1.752c0,0,0.889,0.883,3.98,1.086s5.995-0.493,5.995-0.493L410.032,420.183z'
    },
    names: {
        heilongjiang: '黑龙江',
        jilin: '吉林',
        liaoning: '辽宁',
        hebei: '河北',
        shandong: '山东',
        jiangsu: '江苏',
        zhejiang: '浙江',
        anhui: '安徽',
        henan: '河南',
        shanxi: '山西',
        shaanxi: '陕西',
        gansu: '甘肃',
        hubei: '湖北',
        jiangxi: '江西',
        fujian: '福建',
        hunan: '湖南',
        guizhou: '贵州',
        sichuan: '四川',
        yunnan: '云南',
        qinghai: '青海',
        hainan: '海南',
        shanghai: '上海',
        chongqing: '重庆',
        tianjin: '天津',
        beijing: '北京',
        ningxia: '宁夏',
        neimongol: '内蒙古',
        guangxi: '广西',
        xinjiang: '新疆',
        xizang: '西藏',
        guangdong: '广东',
        hongkong: '香港',
        taiwan: '台湾',
        macau: '澳门'
    }
};

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
var CoffeeCup = kc.CoffeeCup = kity.createClass( "CoffeeCup", {

	base: kc.AnimatedChartElement,

	constructor: function ( param ) {
		var me = this;
		this.callBase( kity.Utils.extend( {}, param ) );
		//咖啡杯的路径数据
		var cupPath = "M184.158,118c0.519-1,0.606-1.575,0.842-1.741c16.145-11.406,22.017-28.092,22.454-46.841 c0.484-20.817,0.146-41.737,0.06-62.565C207.504,4.595,206.792,3,206.405,0H49.425c-1.923,1-3.806,1.529-5.775,1.795 C19.513,5.055,4.265,31.251,13.763,53.713c5.667,13.402,15.804,21.458,30.418,23.689c1.966,0.3,5.022,1.589,5.423,2.96 C53.962,95.245,60.549,109,74.142,118H0c0.696,5,2.934,7.513,7.985,6.847c6.871-0.906,13.14,0.395,18.539,5.164 c1.049,0.927,3.08,0.987,4.658,0.988c62.818,0.048,125.637,0.028,188.455-0.025c1.751-0.001,3.8-0.201,5.203-1.098 c6.733-4.303,14.007-5.675,21.859-4.731c5.234,0.629,7.416-2.145,8.657-7.145H184.158z M48,68.811 c-14,1.584-28.313-12.144-28.832-27.518C18.583,23.984,32,9.46,48,10.169V68.811z";
		this.callBase( kity.Utils.extend( {}, param ) );
		this.cup = new kity.Path();
		this.cup.setPathData( cupPath ).fill( 'black' );
		this.canvas.addShape( this.cup );
		this.name = new kity.Text().setTextAnchor( 'middle' ).translate( 128, 160 );
		this.canvas.addShape( this.name );
		this.stack = new kity.Group();
		this.canvas.addShape( this.stack.translate( 54, 6 ) );
		var clipPath = "M123.893,104.331c0.478-0.884,0.558-1.392,0.775-1.539c14.871-10.084,20.279-24.838,20.681-41.415 c0.446-18.406,0.135-36.902,0.055-55.317c-0.009-1.997-0.665-3.407-1.02-6.06H0.097L0,71.053 c4.014,13.159,10.043,25.321,22.562,33.278";
		var innerPath = new kity.Path().translate( 2, 0 ).setPathData( clipPath );
		this.inner = new kity.Clip();
		this.inner.addShape( innerPath );
		this.ripple = new kity.Path();
		this.on( 'mouseover', function ( e ) {
			this.canvas.addShape( this.ripple );
			var d = this.ripple.getDrawer();
			var stacktop = this.stacktop;
			var fill = stacktop.getAttr( 'fill' );
			this.ripple.fill( fill );
			me.chart.showTip( this._name );
		} );
		this.on( 'mouseout', function ( e ) {
			//this.ripple.remove();
		} );
	},
	registerUpdateRules: function () {
		return kity.Utils.extend( this.callBase(), {
			'updateAll': [ 'name', 'constituent', 'colors', 'chart' ]
		} );
	},
	updateAll: function ( name, constituent, colors, chart ) {
		this.chart = chart;
		this._name = name;
		chart.paper.addResource( this.inner );
		this.name.setContent( name );
		var stack = this.stack.clear();
		var deep = 105,
			width = 148;
		var count = 0;
		var totalpercent = 0;
		var height, color, t;
		for ( var i = 0; i <= constituent.length; i++ ) {
			if ( i === constituent.length ) {
				if ( totalpercent === 1 ) {
					break;
				} else {
					height = 110 - count;
					color = 'white';
					t = null;
				}
			} else {
				var con = constituent[ i ];
				totalpercent += con.percent;
				height = deep * con.percent;
				color = colors[ con.name ];
				t = new kity.Text( con.name ).setTextAnchor( 'middle' );
			}
			var transY = deep - height - count;
			var s = new kity.Rect().setWidth( width ).setHeight( height ).translate( 0, transY ).fill( color );
			stack.addShape( s );
			if ( i === 0 ) {
				this.stacktop = s; //记录最顶端的那个
			}
			if ( t ) {
				this.canvas.addShape( t );

				t.translate( 128, transY + height / 2 + t.getHeight() / 2 );
			}
			count += height;
		}
		//console.log( stack.clipWith );
		stack.clipWith( this.inner );
	},
	getAnimatedParam: function () {
		return [ 'x', 'y' ];
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
var HumanBody = kc.HumanBody = kity.createClass( "HumanBody", {

	base: kc.AnimatedChartElement,

	constructor: function ( param ) {
		var me = this;
		this.callBase( kity.Utils.extend( {}, param ) );
		//人体形状的路径数据
		var humanPath = "M66.413,33.82c2.6,1.759,3.775,2.555,6.02,4.074c-0.221-4.084,0.163-7.574-0.687-10.731 c-2.526-9.384,2.467-15.395,8.937-20.505c14.121-11.152,34.932-7.864,45.479,6.643c2.721,3.742,3,7.56,2.479,11.795 c-0.444,3.614-0.723,7.248-1.154,11.684c2.097-0.919,3.472-1.522,5.275-2.312c0,4.585,0.4,9.021-0.151,13.335 c-0.326,2.554-0.553,6.413-5.302,5.525c-0.53-0.099-1.872,1.786-2.111,2.905c-0.965,4.521-1.493,9.136-2.474,13.653 c-0.944,4.346,0.265,7.521,4.233,9.575c7.675,3.972,15.365,7.914,23.033,11.898c7.36,3.824,14.772,7.556,22.032,11.561 c9.874,5.447,13.075,14.752,13.179,25.185c0.079,7.958-1.065,15.92-1.353,23.892c-0.109,3.026,0.101,6.285,1.119,9.092 c4.399,12.131,9.725,23.955,13.54,36.255c2.009,6.477,2.267,13.713,2.161,20.588c-0.283,18.276-1.366,36.538-1.795,54.814 c-0.304,12.969,0.372,25.969-0.201,38.92c-0.453,10.237-5.577,18.637-13.128,25.502c-0.479,0.435-1.146,0.985-1.701,0.959 c-2.936-0.136-5.865-0.439-8.671-0.673c0.251-1.819,0.525-3.806,0.973-7.058c2.4-1.206,6.13-3.08,9.859-4.955 c-0.195-0.511-0.39-1.021-0.586-1.532c-2.306,0.183-4.612,0.366-6.918,0.549c-0.205-0.457-0.41-0.914-0.615-1.371 c1.955-0.884,3.865-1.891,5.875-2.625c3.389-1.238,5.049-3.582,5.143-7.149c0.085-3.239-1.221-5.312-5.345-6.175 c0.116,2.008,0.735,3.779,0.176,5.02c-0.997,2.212-2.705,4.102-4.116,6.127c-1.257-1.891-3.433-3.707-3.593-5.687 c-0.438-5.4-0.282-10.891,0.166-16.302c0.208-2.522,0.959-5.62,2.63-7.29c5.995-5.994,5.243-12.997,3.539-20.005 c-2.586-10.633-5.25-21.289-8.713-31.657c-3.596-10.767-4.07-21.79-4.842-32.897c-0.277-3.987-1.84-7.93-3.12-11.793 c-2.285-6.892-4.801-13.708-7.489-21.317c-0.862,2.708-1.534,4.943-2.283,7.153c-4.001,11.807-4.052,23.682-0.663,35.624 c0.091,0.32,0.24,0.659,0.209,0.973c-1.442,14.409,5.484,27.423,6.892,41.345c3.542,35.037,8.394,70.166,2.219,105.271 c-3.278,18.636-2.016,37.122-1.539,55.668c0.233,9.072,2.728,18.063,3.714,27.143c1.57,14.464-2.845,27.95-7.448,41.368 c-4.04,11.778-7.763,23.669-11.998,35.375c-5.436,15.028-1.417,28.913,4.459,42.67c0.652,1.526,1.584,2.932,2.235,4.458 c1.7,3.987,0.135,6.995-4.086,8.035c-6.125,1.51-12.156,3.955-18.645,1.669c-0.47-0.166-1.2,0.494-1.834,0.691 c-6.931,2.153-12.139-1.66-11.791-8.767c0.25-5.1,1.108-10.19,1.075-15.281c-0.063-9.783,2.329-19.017,4.953-28.329 c4.528-16.069,3.204-32.394,0.006-48.421c-2.435-12.204-0.727-23.608,2.384-35.345c1.464-5.523,1.434-11.851,0.451-17.532 c-2.542-14.689-6.193-29.184-8.972-43.837c-1.015-5.35-1.316-10.953-1.064-16.4c0.427-9.241-3.676-17.412-5.217-26.132 c-2.395-13.552-3.91-27.276-5.334-40.976c-0.891-8.569-1.148-9.101-9.8-7.17c-1.027,10.624-1.735,21.39-3.21,32.05 c-1.065,7.699-2.208,15.622-4.995,22.793c-4.456,11.469-1.873,23.401-3.939,34.931c-1.781,9.943-3.381,19.939-5.711,29.758 c-3.19,13.444-7.071,26.645-1.148,40.406c4.289,9.965,2.039,20.306,0.319,30.429c-3.169,18.655-2.725,36.903,3.116,55.158 c2.277,7.116,1.999,15.059,2.796,22.635c0.343,3.262,0.211,6.587,0.724,9.815c1.297,8.168-3.682,12.616-11.642,10.764 c-3.183-0.74-6.739,0.29-10.047-0.118c-4.374-0.539-8.879-1.202-12.879-2.882c-1.277-0.536-2.072-4.754-1.467-6.811 c2.88-9.798,6.648-19.342,9.366-29.179c0.858-3.104-0.042-6.994-1.028-10.256c-3.98-13.172-7.389-26.627-12.707-39.262 c-9.768-23.208-10.398-46.621-5.621-70.91c1.613-8.201,0.407-16.921,0.962-25.372c0.882-13.419-2.03-26.457-3.308-39.667 c-2.487-25.721-3.424-51.413,1.652-77.051c1.5-7.576,1.091-15.524,1.659-23.294c0.144-1.974,0.384-4.035,1.087-5.86 c6.23-16.181,4.655-33.63,8.015-50.317c1.232-6.122-2.224-13.206-3.635-19.831c-0.409-1.919-1.143-3.77-2.145-6.994 c-0.775,2.368-1.111,3.51-1.52,4.624c-2.5,6.821-5.335,13.542-7.405,20.491c-1.208,4.055-1.713,8.48-1.651,12.726 c0.227,15.451-5.006,29.676-9.081,44.218c-2.274,8.115-3.818,16.482-4.97,24.835c-0.379,2.747,0.772,6.373,2.501,8.608 c3.952,5.106,5.574,10.332,4.373,16.718c-0.469,2.494,0.621,5.25,0.379,7.828c-0.232,2.467-1.162,4.901-2.082,7.232 c-0.124,0.315-2.703,0.283-2.905-0.158c-1.012-2.205-1.667-4.585-2.326-6.937c-0.249-0.888-0.173-1.866-0.249-2.845 c-5.567,1.234-7.43,7.23-3.246,10.779c2.443,2.072,5.86,2.994,8.839,4.434c-0.104,0.396-0.207,0.791-0.311,1.187 c-2.241,0-4.481,0-6.722,0c-0.186,0.529-0.371,1.058-0.557,1.587c1.991,0.958,4.198,1.636,5.908,2.958 c1.534,1.186,7.224,0.073,3.337,5.104c-0.33,0.427,1.254,2.334,1.952,3.56c-8.428,2.195-16.162-1.858-20.203-11.677 c-2.098-5.098-3.479-10.821-3.678-16.316c-0.866-23.94-1.129-47.9-1.722-71.851c-0.21-8.482-1.177-16.968-0.957-25.43 c0.143-5.516,1.157-11.209,2.913-16.443c4.053-12.082,9.574-23.72,12.928-35.969c1.657-6.053,0.034-13.073-0.463-19.629 c-0.632-8.346-0.804-16.475,2.335-24.559c2.39-6.158,6.39-10.329,12.001-13.31c13.191-7.008,26.442-13.908,39.559-21.053 c9.679-5.273,9.916-6.244,6.937-17.06c-0.527-1.914-0.815-3.898-1.134-5.862c-0.435-2.671,0.935-6.697-4.532-5.383 c-0.528,0.127-2.271-2.393-2.49-3.83C67.346,45.224,67.036,40.28,66.413,33.82z";
		this.callBase( kity.Utils.extend( {}, param ) );
		this.name = new kity.Text().setTextAnchor( 'middle' ).translate( 128, 160 );
		this.canvas.addShape( this.name );
		this.stack = new kity.Group();
		this.canvas.addShape( this.stack.translate( -2, 0 ) );
		//var clipPath = "M123.893,104.331c0.478-0.884,0.558-1.392,0.775-1.539c14.871-10.084,20.279-24.838,20.681-41.415 c0.446-18.406,0.135-36.902,0.055-55.317c-0.009-1.997-0.665-3.407-1.02-6.06H0.097L0,71.053 c4.014,13.159,10.043,25.321,22.562,33.278";
		var innerPath = new kity.Path().translate( 2, 0 ).setPathData( humanPath );
		this.inner = new kity.Clip();
		this.inner.addShape( innerPath );
		this.ripple = new kity.Path();
	},
	registerUpdateRules: function () {
		return kity.Utils.extend( this.callBase(), {
			'updateAll': [ 'name', 'constituent', 'colors', 'chart' ]
		} );
	},
	updateAll: function ( name, constituent, colors, chart ) {
		this.chart = chart;
		this._name = name;
		chart.paper.addResource( this.inner );
		this.name.setContent( name );
		var stack = this.stack.clear();
		var deep = 582,
			width = 203;
		var count = 0;
		var totalpercent = 0;
		var height, color, t;
		for ( var i = 0; i <= constituent.length; i++ ) {
			if ( i === constituent.length ) {
				if ( totalpercent === 1 ) {
					break;
				} else {
					height = 220 - count;
					color = 'white';
					t = null;
				}
			} else {
				var con = constituent[ i ];
				totalpercent += con.percent;
				height = deep * con.percent;
				color = colors[ con.name ];
				t = new kity.Text( parseInt( con.percent * 100 ) + '%' + con.name );
			}
			var transY = deep - height - count;
			var s = new kity.Rect().setWidth( width ).setHeight( height ).translate( 0, transY ).fill( color );
			stack.addShape( s );
			if ( i === 0 ) {
				this.stacktop = s; //记录最顶端的那个
			}
			if ( t ) {
				this.canvas.addShape( t );
				t.translate( width, transY + height / 2 + t.getHeight() / 2 ).fill( 'white' );
			}
			count += height;
		}
		//console.log( stack.clipWith );
		stack.clipWith( this.inner );
	},
	getAnimatedParam: function () {
		return [ 'x', 'y' ];
	}
} );

var AxisLine = kc.AxisLine = kity.createClass( "AxisLine", {
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
            draw: [ 'x1', 'y1', 'x2', 'y2', 'bound', 'max', 'divide' ],
            stroke: [ 'color', 'width', 'dash' ]
        } );
    },

    draw: function ( x1, y1, x2, y2, bound, max, divide ) {
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
        if ( max ) {
            //计算最大值的数量级
            var oom = Math.log( max ) / Math.log( 10 );
            var oomV = Math.floor( oom );
            //根据数量级和max的值决定分隔情况
            var base = Math.pow( 10, oomV );
            var n = max / base;
            var part = n / 5;
            // console.log( part );
            // console.log( max, oom, upper );
        } else {
            var length = y2 - y1;
            var space = length / ( divide - 1 );
            for ( var i = 0; i < divide; i++ ) {
                var bd = [
                    [ x1 - 5, y1 + space * i ],
                    [ x1, y1 + space * i ]
                ];
                drawer.moveTo( s( bd[ 0 ][ 0 ] ), s( bd[ 0 ][ 1 ] ) );
                drawer.lineTo( s( bd[ 1 ][ 0 ] ), s( bd[ 1 ][ 1 ] ) );
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
            return [
                [ x1, b.y1 ],
                [ x2, b.y2 ]
            ];
        }
        if ( y1 == y2 ) {
            return [
                [ b.x1, y1 ],
                [ b.x2, y2 ]
            ];
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

kc.ChartsConfig = (function(){

    var _configs = {};

    function add( key, val ){
        _configs[key] = val;
    }

    function remove( key ){
        delete _configs[key];
    }

    function init( type ){
        var base = kity.Utils.copy(_configs.base), mix;

        if( type in _configs ){
            return kity.Utils.deepExtend( base, _configs[ type ] );
        }else{
            return  base;
        }
    }

    return {
        add : add,
        init : init
    }

})();

kc.ChartsConfig.add('base', {
    color : [
        'rgb(31, 119, 180)',
        'rgb(174, 199, 232)',
        'rgb(255, 127, 14)',
        'rgb(255, 187, 120)',
        'green'
    ],

    finalColor: 'rgb(255, 187, 120)',

    xAxis : {

        ticks: {
            enabled : true,
            dash : null,
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
            left : 80,
            right : 50
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
            bottom : 60
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

    legend : {
        enabled : true,
        level : 'entry'
    },

    enableAnimation : true
});


kc.ChartsConfig.add('bar', {

	yAxis : {
		padding : {
			bottom : 30,
			top : 30
		},
		inverted : true,
		min : 0
	},

    plotOptions : {

        bar : {
            width : 25,
            margin: 0
        }

    }
    
});


kc.ChartsConfig.add('column', {

    xAxis: {
        margin : {
            right : 60,
            left : 60
        },

        padding : {
            left : 40,
            right : 40
        }
    },

    yAxis: {
        min : 0,
        padding : {
            top : 0,
            bottom : 0
        }
    },

    plotOptions : {

        column : {
            width : 8,
            margin: 1
        }

    }
    
});


kc.ChartsConfig.add('line', {

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
    
});


kc.ChartsConfig.add('area', {

    plotOptions : {

        area : {
            width : 2,
            dash : null,

            label : {
                enabled : true,
                radius : 3
            },

            fill : {
                grandientStopOpacity : 0.5
            }

        }

    }
    
});


kc.ChartsConfig.add('pie', {

    plotOptions : {

        pie: {
            center: {
                x : 200,
                y : 200
            },
            stroke : {
                width : 1,
                color : '#FFF'
            },
            innerRadius : 40,
            outerRadius : 80,
            incrementRadius : 30
        }

    }
    
});

kc.ChartsConfig.add('scatter', {

    plotOptions : {

        scatter : {
            radius : 5,
            radiusRange : [ 1, 10 ]
        }
        
    }
    
});

kc.ChartData = kity.createClass( 'ChartData', {
    base: kc.Data,
    
    format: function () {
        var origin = this.origin,
            queryPath = kity.Utils.queryPath;

        var i, j, k, all = [], data;

        var min = 0;
        var max = 100;

        var totalMap = {}, total, tmp;
        var series = origin.series;
        var _time = '_' + (+new Date);
        var categoriesLength = queryPath('xAxis.categories.length', origin) || queryPath('yAxis.categories.length', origin);
        var isPercentage = queryPath( 'yAxis.percentage', origin ),
            isStacked = queryPath( 'yAxis.stacked', origin );
        var obj = {}, group, groupName, seriesGroup = {};
        var tmpLevel, tmpGroup, groupIndex = 0, sumObj, entry;

        if( series ){

            tmp = series;

            obj = {};
            seriesGroup = {};

            for( i = 0; i < tmp.length; i++ ){
                tmp[i].index = i;
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
                    entry.groupIndex = groupIndex;

                    entry.offset = tmpLevel[ j ];
                    entry.allOffset = tmpLevel;
                    entry.sum = tmpLevel[ obj[ groupName ].length ];
                    entry.percentage = sumObj.percentage[ j ];
                    entry.percentageOffset = sumObj.percentageOffsetLevel[ j ];
                    entry.allPercentageOffset = sumObj.percentageOffsetLevel;

                }
                groupIndex++;
            }

            origin.yAxis = origin.yAxis || {};
            origin.yAxis.groupCount = groupIndex;

            for(i = 0; i < tmp.length; i++){
                // tmp[i].originData = kity.Utils.copy( tmp[i].data );
                data = isStacked || isPercentage ? tmp[i].sum : tmp[i].data;
                all = all.concat( data );
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
                chart : origin.chart || 'line',
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

kc.BaseScatterData = kity.createClass( 'BaseScatterData', {
    base: kc.Data,
    
    format: function () {
        var origin = this.origin,
            queryPath = kity.Utils.queryPath,
            minX = minY = 0,
            maxX = maxY = 100,
            minV = minV = 0;

        if( origin.series && origin.series.length > 0 ){
            var hasValue;
            var i, j, series = origin.series, entry,
                xArr = [], yArr = [], vArr = [], point;

            for( i = 0; i < series.length; i++ ){
                entry = series[ i ];
                entry.index = i;

                for( j = 0; j < entry.data.length; j++ ){
                    point = entry.data[ j ];
                    xArr.push( point[ 0 ] );
                    yArr.push( point[ 1 ] );
                    vArr.push( point[ 2 ] || 0 );
                    if( point.length >= 3 ){
                        hasValue = true;
                    }
                }

            }

            minX = Math.min.apply( [], xArr );
            maxX = Math.max.apply( [], xArr );
            minY = Math.min.apply( [], yArr );
            maxY = Math.max.apply( [], yArr );

            minV = Math.min.apply( [], vArr );
            maxV = Math.max.apply( [], vArr );
        }

        var result = {
                chart : origin.chart || { type : 'scatter' },
                xAxis :  queryPath( 'xAxis', origin ) || {},
                yAxis : queryPath( 'yAxis', origin ) || {},

                plotOptions : origin.plotOptions || {},

                series : origin.series || [],
                rangeX : [ minX, maxX ],
                rangeY : [ minY, maxY ]
            };

        result.valueRange = hasValue ? [ minV, maxV ] : null;
        return result;
    }
} );

kc.PieData = kity.createClass( 'PieData', {
    base: kc.Data,
    
    format: function () {
        var origin = this.origin,
            queryPath = kity.Utils.queryPath;

        var i, j, k, all = [], data;
        var series = origin.series;

        if( series ){

            for( i = 0; i < series.length; i++ ){
                series[ i ].index = i;
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
                obj.index = i;

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

kc.SunData = kity.createClass( 'SunData', (function(){

    function getPrevWeight( parent, index ){
        var sum = 0;
        for (var i = 0; i < index; i++) {
            sum += parent.children[ i ].weight;
        }
        return sum;
    }

    function setAttr( node ){
        if( !node.parent ){
            node.depth = 0;
            node.index = 0;
        }

        var sum = 0, func = arguments.callee;

        if( node.children && node.children.length > 0 ){

            if( node.value ){
                sum += node.value;
            }
            node.children.forEach(function( n, i ){
                n.parent = node;
                n.depth = node.depth + 1;
                n.index = i;
                
                if( !node.value ){
                    sum += func( n );
                }else{
                    func( n );
                }
            });

        }else{
            node.depth = node.parent.depth + 1;
            return node.value || 0;
        }

        node.value = node.value || sum;
        return sum;
    }

    function setWeight( node ){
        if( !node.parent ){
            node.weightStart = 0;
            node.weight = 1;
        }

        var func = arguments.callee, unitWeight = 0, prevWeight = 0;

        unitWeight = node.weight / node.value;

        if( node.children && node.children.length > 0 ){

            node.children.forEach(function( n, i ){
                prevWeight = getPrevWeight( node, i );
                n.weight = unitWeight * n.value;
                n.weightStart = n.parent.weightStart + prevWeight;
                
                func( n );
            });

        }

    }

    return {
        base: kc.Data,
        
        format: function () {
            var root = this.origin;

            if( !root.value && !root.children ){
                return null;
            }

            var sum = setAttr( root );
            setWeight( root );
            return root;
        }

    };

})() );

kc.TreemapData = kity.createClass( 'TreemapData', (function(){

    var ratio = 0.5 * (1 + Math.sqrt(5));
    var mode = "squarify";

    function getPrevWeight( parent, index ){
        var sum = 0;
        for (var i = 0; i < index; i++) {
            sum += parent.children[ i ].weight;
        }
        return sum;
    }

    function setAttr( node ){
        if( !node.parent ){
            node.depth = 0;
            node.index = 0;
        }

        var sum = 0, func = arguments.callee;

        if( node.children && node.children.length > 0 ){

            if( node.value ){
                sum += node.value;
            }
            node.children.forEach(function( n, i ){
                n.parent = node;
                n.depth = node.depth + 1;
                n.index = i;
                
                if( !node.value ){
                    sum += func( n );
                }else{
                    func( n );
                }
            });

        }else{
            node.depth = node.parent.depth + 1;
            return node.value || 0;
        }

        node.value = node.value || sum;
        return sum;
    }

    function setWeight( node ){
        if( !node.parent ){
            node.weightStart = 0;
            node.weight = 1;
        }

        var func = arguments.callee, unitWeight = 0, prevWeight = 0;

        unitWeight = node.weight / node.value;

        if( node.children && node.children.length > 0 ){

            node.children.forEach(function( n, i ){
                prevWeight = getPrevWeight( node, i );
                n.weight = unitWeight * n.value;
                n.weightStart = n.parent.weightStart + prevWeight;
                
                func( n );
            });

        }

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
            setWeight( root );

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

var PiePlots = kc.PiePlots = kity.createClass( 'PiePlots', {
    base: kc.ChartElement,

    constructor: function ( config ) {
        this.callBase( config );
        this.chartType = 'pie'; // 这一行争取去掉
        this.config = config || {};
        
        this.pies = this.addElement( 'pies', new kc.ElementList() );
    },

    update: function ( config ) {
        this.config = kity.Utils.extend( this.config, config );
        this.drawPlots( this.config );
    },

    getEntryColor : function( entry ){
         return entry.color || this.config.color[ entry.index ] || this.config.finalColor;
    },

    getLabelColor : function( isCenter ){
        var opt = this.config.plotOptions,
            lpos = opt.pie.labelPosition,
            text = opt.label.text;
        
        return lpos == 'outside' ? text.color : isCenter ? '#FFF' : text.color;
    },

    drawPlots : function ( config ){
        var self = this;
        var list = [], series = config.series, opt = config.plotOptions,
            outer = opt.pie.outerRadius,
            inner = opt.pie.innerRadius,
            increment = opt.pie.incrementRadius
            lpos = opt.pie.labelPosition;

        for( var i = 0 ; i < series.length; i++ ){

            series[ i ].data.map(function( entry, j ){

                list.push({

                    labelText: opt.label.enabled && entry.angle > 10 ? entry.name : null,
                    labelColor: self.getLabelColor( i == 0 ),
                    labelPosition: lpos ? lpos : i == 0 ? 'inside' : 'none',

                    connectLineWidth: 1,
                    connectLineColor: self.getEntryColor( entry ),

                    innerRadius : i == 0 ? inner : (outer  + ( i - 1 ) * increment),
                    outerRadius : outer + increment * i,
                    startAngle : entry.offsetAngle - 90,
                    pieAngle: entry.angle,

                    strokeWidth : opt.pie.stroke.width,
                    strokeColor : opt.pie.stroke.color,

                    color: self.getEntryColor( entry ),

                    x : opt.pie.center.x,
                    y : opt.pie.center.y

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

var BasePlots = kc.BasePlots = kity.createClass( 'BasePlots', {
    base: kc.ChartElement,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
        this.coordinate = coordinate;
        this.config = config || {};

        this.plotsElements = this.addElement( 'plotsElements', new kc.ElementList() );

        this.plotsAttrsInit();
    },

    getPlotsElements : function(){
        return this.plotsElements;
    },

    getEntryColor : function( entry ){
         return entry.color || this.config.color[ entry.index ] || this.config.finalColor;
    },

    update: function ( coordinate, config ) {
        this.coordinate = coordinate || this.coordinate;
        this.config = kity.Utils.extend( this.config, config );

        this.drawPlots( this.coordinate, this.config );
    },

} );


})();

(function(){

function sum( arr ){
    var sum = 0;
    for(var i = 0; i < arr.length; i++){
        sum += arr[i];
    }
    return sum;
}

var StickPlots = kc.StickPlots = kity.createClass( 'StickPlots', {
    base: kc.BasePlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
    },

    drawPlots: function ( coordinate, config ) {
        var oxy = coordinate,
            opt = config.plotOptions
            ;

        rotateAngle = this.rotateAngle;
        measureCategoryMethod = this.measureCategoryMethod;
        measureValueMethod = this.measureValueMethod;
        dir = this.stickDir;


        var xRuler = oxy.xRuler,
            yRuler = oxy.yRuler;

        var series = config.series,
            i, j, k, m, yPos, point, pointsArr = [], linesArr = [], dir,
            stickData,
            stick;

        var tmp, stickList = [], posCategory, posValues, posValue,
            width = opt[ this.chartType ].width, left = 0, bottom = 0,
            distance = config.chart.mirror? 0 : width + opt[ this.chartType ].margin,
            offset, height, label;

        var isPercentage = config.yAxis.percentage;

        for (i = 0; i < series.length; i++) {

            stick = series[ i ];

            stickData = isPercentage ? series[i].percentage : series[i].data;

            for (j = 0; j < stickData.length; j++) {

                tmp = stickData[ j ];

                posCategory = oxy[ measureCategoryMethod ]( j );

                left = (config.yAxis.groupCount - 1) * distance / 2;

                posValue = oxy.measureValueRange( tmp, this.valueAxis );
                offset = isPercentage ? stick.percentageOffset : stick.offset;
                bottom = offset ? offset[ j ] : 0;

                height = posValue * dir;
                stickParam = {
                    // dir: -1,
                    offset : oxy.measureValueRange( bottom, this.valueAxis ) * dir,
                    color  : this.getEntryColor( stick ),
                    width  : width,
                    height : height,
                    rotate : rotateAngle,
                    bind : {
                        data : tmp,
                        indexInSeries : i,
                        indexInCategories : j
                    }
                };

                if( opt.label.enabled )
                    stickParam.label = this.getStickLabelParam( height, tmp, config );;

                stickParam[ this.valueAxis ] = oxy[ measureValueMethod ]( 0 );
                stickParam[ this.categoryAxis ] = posCategory - left + distance * stick.groupIndex;

                stickList.unshift(stickParam);


            }
            
        }

        this.getPlotsElements().update({
            elementClass: kc.Bar,
            list: stickList,
            fx: config.enableAnimation
        });

        return config;
    }

} );


})();

(function(){

var ColumnPlots = kc.ColumnPlots = kity.createClass( 'ColumnPlots', {
    base: kc.StickPlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
    },

    plotsAttrsInit : function(){
        this.chartType = 'column';
        this.stickDir = -1;
        this.rotateAngle = 0;
        this.categoryAxis = 'x';
        this.valueAxis = 'y';
        this.measureCategoryMethod = 'measurePointX';
        this.measureValueMethod    = 'measurePointY';
    },

    getStickLabelParam : function( height, text, config ){
        return {
            at: 'bottom',
            color: config.plotOptions.label.text.color, 
            text: text,
            x : 0,
            y : -height - config.plotOptions.label.text.margin
        };
    }

} );


})();

(function(){

var BarPlots = kc.BarPlots = kity.createClass( 'BarPlots', {
    base: kc.StickPlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
    },

    plotsAttrsInit : function(){
        this.chartType = 'bar';
        this.stickDir = 1;
        this.rotateAngle = 90;
        this.categoryAxis = 'y';
        this.valueAxis = 'x';
        this.measureCategoryMethod = 'measurePointY';
        this.measureValueMethod    = 'measurePointX';
    },

    getStickLabelParam : function( height, text, config ){
        return {
            at: 'right',
            color: config.plotOptions.label.text.color, 
            text: text,
            x : height + config.plotOptions.label.text.margin,
            y : 0
        };
    }

} );


})();

(function(){

var LinearPlots = kc.LinearPlots = kity.createClass( 'LinearPlots', {
    base: kc.BasePlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );

        this.lineDots = this.addElement( 'lineDots', new kc.ElementList() );
    },

    drawPlots: function ( coordinate, config ) {

        var series = config.series,
            opt = config.plotOptions,
            i, pointsArr = [], linesArr = [],
            line;

        var queryPath = kity.Utils.queryPath,
            offset = 0,
            lineColor,
            lineData
            ;
        this.dotArr = [];

        for (i = 0; i < series.length; i++) {

            line = series[ i ];
            line.positions = [];

            this.renderLineByData( line );
            
            pointsArr = this.array2points( line.data, offset );

            lineData = {
                line : line,
                currentData : line.data[ i ],
                currentLabel : config.xAxis.categories[ i ]
            };
            
            linesArr.push({
                    points     : pointsArr,
                    color      : this.getEntryColor( line ),
                    dash       : line.dash || null,
                    width      : this.getLineWidth(),
                    defaultPos : coordinate.param.height,
                    factor     : +new Date,
                    bind       : lineData
                });

            line.positions = pointsArr;

            this.addLabels( line );

        }

        this.getPlotsElements().update({
            elementClass: kc.Polyline,
            list: linesArr,
            fx: config.enableAnimation
        });
        
        this.addDots();
    },

    renderLineByData : function( line ){
        // to be implemented
    },

    array2points : function( arr, offset ){
        var offset = offset || 0;
        var pointsArr = [], point;
        for (var j = 0; j < arr.length; j++) {
            point = this.coordinate.measurePoint( [j, arr[j]] );
            point[0] += offset;
                            
            pointsArr.push( point );
        }
        return pointsArr;
    },

    addLabels : function( line ){
        var opt = this.config.plotOptions;

        if( opt.label.enabled || opt[ this.chartType ].dot.enabled ){

            var tmpPos, dotParam, radius = 0, m;

            for (m = 0; m < line.positions.length; m++) {
                tmpPos = line.positions[ m ];

                if( opt[ this.chartType ].dot.enabled ){
                    radius = opt[ this.chartType ].dot.radius;
                }

                dotParam = {
                    color: this.getEntryColor( line ),
                    radius: radius,
                    x: tmpPos[0],
                    y: tmpPos[1]
                };

                if( opt.label.enabled ){

                    dotParam.label = {
                            margin: opt.label.text.margin,
                            color:  opt.label.text.color,
                            text: line.data[ m ],
                        };
                }

                this.dotArr.push(dotParam);
            }
            line.dots = this.dotArr;
        }

    },

    addDots : function(){
        var opt = this.config.plotOptions;
        if( opt.label.enabled || opt[ this.chartType ].dot.enabled ){
            var lineDots = this.getElement( 'lineDots' );
            lineDots.update({
                elementClass: kc.CircleDot,
                list: this.dotArr,
                fx: this.config.enableAnimation
            });
        }
    }

} );


})();

(function(){

var LinePlots = kc.LinePlots = kity.createClass( 'LinePlots', {
    base: kc.LinearPlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
    },

    plotsAttrsInit : function(){
        this.chartType = 'line';
    },

    getLineWidth : function(){
        return this.config.plotOptions.line.width;
    }

} );


})();

(function(){

var AreaPlots = kc.AreaPlots = kity.createClass( 'AreaPlots', {

    base: kc.LinearPlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
    },

    plotsAttrsInit : function(){
        this.chartType = 'area';
    },

    getLineWidth : function(){
        return this.config.plotOptions.area.stroke.width;
    },

    areas : [],

    renderLineByData : function( line ){
            
        if( this.config.yAxis.stacked ){

            var p = this.config.yAxis.percentage;
            var offsetType = p ? 'percentageOffset' : 'offset';
            var allOffsetType = p ? 'allPercentageOffset' : 'allOffset';

            var arr1 = this.array2points( line[ offsetType ], line.offsetX || 0 );
            var arr2 = this.array2points( kity.Utils.copy( line[ allOffsetType ][ line.indexInGroup + 1 ] ), offset ).reverse();

            pointsArr = arr1.concat( arr2 );

        }else{

            pointsArr = this.array2points( line.data, line.offsetX || 0 );
            var areaPointArr = kity.Utils.copy( pointsArr );
            var oxy = this.coordinate;
            var x0 = oxy.measurePointX( 0 ),
                y0 = oxy.measurePointY( oxy.yRuler._ref.from );

            areaPointArr = areaPointArr.concat([
                [ pointsArr[ pointsArr.length-1 ][ 0 ], y0 ],
                [ x0, y0 ]
            ]);
            pointsArr = areaPointArr;
        }   

        for(var i in this.areas){
            this.canvas.removeShape( this.areas[ i ] );
        }

        var area = this.drawPolygon( pointsArr, line );
        this.areas.push( area );
    },

    drawPolygon : function ( pointArr, entry ){
        var area = new kity.Polygon(pointArr),
            paper = this.container.paper,
            color = this.getEntryColor( entry ),
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

        return area;
    }

} );


})();

(function(){

var ScatterPlots = kc.ScatterPlots = kity.createClass( 'ScatterPlots', {
    base: kc.BasePlots,

    constructor: function ( coordinate, config ) {
        this.callBase( coordinate, config );
    },

    plotsAttrsInit : function(){
        this.chartType = 'scatter';
    },

    drawPlots: function ( coordinate, config ) {
        var series = config.series,
            opt = config.plotOptions.scatter,
            i, j, entry,
            valPoint, posPoint,
            circleList = [];

        var rMax = opt.radiusRange[1],
            rMin = opt.radiusRange[0];

        var vr = config.valueRange, same;
        var tmp = vr && vr[1] - vr[0];
        if( vr && tmp == 0 ){
            same = true;
        }

        if( vr && !same){
            ratio = ( rMax - rMin ) / tmp;
        }
        

        for( i = 0; i < series.length; i++ ){
            entry = series[ i ];

            for( j = 0; j < entry.data.length; j++ ){
                valPoint = entry.data[ j ];
                posPoint = coordinate.measurePoint( valPoint );
                var bind = {
                    x : valPoint[ 0 ],
                    y : valPoint[ 1 ],
                    label : entry.name,
                    position : {
                        x : posPoint[0],
                        y : posPoint[1]
                    }
                };

                var radius = opt.radius;
                if( vr ){
                    bind.value = valPoint[2] || 0;
                    if(same){
                        radius = ( rMax + rMin ) / 2; //如果值全部一样，则取中间值
                    }else{
                        radius = ratio * bind.value + rMin;
                    }
                }

                circleList.push({
                    strokeColor : '#888',
                    strokeWidth : 0,
                    color: this.getEntryColor( entry ),
                    radius: radius,
                    fxEasing: 'ease',
                    x : posPoint[0],
                    y : posPoint[1],
                    bind : bind
                });
            }
        }

        this.getPlotsElements().update({
            elementClass: kc.CircleDot,
            list: circleList,
            fx: config.enableAnimation
        });

    }

} );


})();

(function(){

var BaseChart = kc.BaseChart = kity.createClass( 'BaseChart', {

    mixins : [ kc.ConfigHandler ],

    base: kc.Chart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        this.config = this.param;

        this.callMixin();

        this.bindAction();
        this.initTooltip();

    },

    setConfig : function( param, formatter ){

        var config = kity.Utils.deepExtend( this.config, param ),
            base = kc.ChartsConfig.init( this.chartType || '' ),
            data, coordConf;

        this.config = kity.Utils.deepExtend( base, config ),
        this.setData( new formatter( this.config ) );

        data = this.data.format();
        this.config = kity.Utils.deepExtend( this.config, data );

    },

    update : function( param ){
        var DataFormatter = arguments[ 1 ] || kc.ChartData;
        this.setConfig( param, DataFormatter );
        
        coordConf = this.coordinate.setCoordinateConf( this.config );
        this.coordinate.update( coordConf );
        this.getPlots().update( this.coordinate, this.config );

        this.getOption('legend.enabled') && this.addLegend();
    },

    getPlots : function(){
        return this.plots;
    },

    setPlots : function( plots ){
        this.plots = plots;
    },

    getXOffset : function(){
        var oxy = this.coordinate,
            ox = oxy.param.padding.left + oxy.param.margin.left;
        return ox;
    },

    isOutOfXRange : function( x ){
        var ox = this.getXOffset( x ),
            oxy = this.coordinate;
        return x - ox < oxy.param.padding.left || x - ox + oxy.param.padding.left > oxy.xRuler.map_grid[ oxy.xRuler.map_grid.length-1 ];
    },

    getChartElementByShape : function( shape ){
        return shape.container.host;
    },

    getXInfoByPosX : function( x ){
        var ox = this.getXOffset(), oxy = this.coordinate;

        if( oxy.xRuler.map_grid.length == 0 ){
            return {
                index : 0,
                posX : 0
            };      
        }

        var result = oxy.xRuler.leanTo( x - ox , 'map' );
        result.value += oxy.param.padding.left;

        return {
            index : result.index,
            posX : result.value
        };
    },

    bindAction : function(){
        var self = this;
        this.currentIndex = -1;

        this.paper.on( 'mousemove', function( ev ) {
            self.onmousemove && self.onmousemove( ev );
        } );

        this.paper.on('click', function(ev){
            var oxy = self.coordinate;
            if(!oxy) return;

            self.onclick && self.onclick( ev );

        });
    },

    getEntryColor : function( entry ){
         return entry.color || this.config.color[ entry.index ] || this.config.finalColor;
    },

    initTooltip : function(){
        var container = $(this.container);
        if( !~(['absolute', 'relative']).indexOf( container.css('position') ) ){
            container.css('position', 'relative');
        }

        this.tooltip = $('<div></div>').appendTo( container ).css({
            position : 'absolute',
            // border : '#888 1px solid',
            boxShadow : '0px 1px 5px rgba(0,0,0,0.3)',
            borderRadius : '4px',
            backgroundColor : '#FFF',
            color : '#888',
            padding : '6px 10px',
            left : '-1000px',
            marginLeft : '10px',
            fontSize : '10px',
            lineHeight : '16px'
        });

    },

    updateTooltip : function( text, x, y ){
        this.tooltip.html( text );
        var tw = this.tooltip[0].clientWidth;
        if( x + tw > $( this.container ).width() ){
            x -= tw + 15;
        }

        this.tooltip.clearQueue().animate({
            left : x,
            top : y
        }, 100);

    },

    getTooltip : function(){
        return this.tooltip;
    },

    addLegend : function(){
        var series = this.config.series || [],
            i, j, entry, label, color, tmp, dataEntry;

        this.legend && this.legend.remove();
        this.legend = $('<div></div>').css({
            position : 'absolute',
            bottom : '10px',
            right : '30px',
            height : '26px',
            lineHeight : '26px'
        }).appendTo( this.container );

        var labelArr = [], colorArr = [];
        for ( i = 0; i < series.length; i++ ) {
            
            entry = series[ i ];
            
            if( this.config.legend.level == 'data' ){
                for (var i = 0; i < entry.data.length; i++) {
                    dataEntry = entry.data[ i ];
                    labelArr.push( dataEntry.name );
                    colorArr.push( this.getEntryColor( dataEntry ) );
                }
            }else{
                label = entry.name;
                color = this.getEntryColor( entry );

                labelArr.push(label);
                colorArr.push(color);
            }



        }

        var self = this;

        labelArr.forEach(function(label, i){
           tmp = $('<div></div>').css({
                marginRight : '20px',
                display : 'inline-block'
            }).appendTo( self.legend );

            $('<div class="kitycharts-legend-color"></div>').css({
                width : '12px',
                height : '12px',
                backgroundColor : colorArr[i],
                display : 'inline-block',
                marginRight : '5px',
                position: 'relative',
                top: '1px'
            }).appendTo( tmp );

            $('<div class="kitycharts-legend-label">' + label + '</div>').css({
                fontSize : '10px',
                display : 'inline-block'
            }).appendTo( tmp );
        });

    }

} );


})();

(function(){

var StickChart = kc.StickChart = kity.createClass( 'StickChart', {
    base: kc.BaseChart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        this.setData( new kc.ChartData( param ) );
        this.coordinate = this.addElement( 'oxy', new kc.CategoryCoordinate() );
    },

    isStick : function( ele ){
    	return ele instanceof kc.Bar;
    },

    onmousemove : function( ev ){
    	this.currentStick;
    	this.currentStickParam;

    	var ele = this.getChartElementByShape( ev.targetShape );

    	if( this.isStick( ele ) ){

    		if( this.currentStick != ele ){
				this.onMouseOut( ele );
    		}else{
    			this.onMouseIn( ele );
    		}

    	}else{
			this.onMouseOut( ele );
    	}

    },

    getPosXByIndex : function( index ){
    	return this.coordinate.measurePointX( index );
    },

    getPosYByValue : function( val ){
    	return this.coordinate.measurePointY( val );
    },

    onMouseIn : function( ele ){
    	var color = new kity.Color( ele.param.color );
    	color.set( 'a', 0.7 );

	    ele.update({
			color : color.toRGBA()
		});

		var bind = ele.getBindData();

		this.processHover( bind );
    },

    onMouseOut : function( ele ){
		this.currentStickParam && this.currentStick.update({
			color : this.currentStickParam.color
		});

		if( this.isStick( ele ) ){
			this.currentStick = ele;
			this.currentStickParam = kity.Utils.copy( ele.param );
		}
    },

    processHover : function( bind ){
    	if( this.currentMark == bind.indexInSeries + bind.indexInCategories ) return;
    	this.currentMark = bind.indexInSeries + bind.indexInCategories
    	this.callHover( bind );
    },

    callHover : function( bind ){
    	var onStickHover = this.config.interaction.onStickHover;

        if( typeof onStickHover == 'function' ){
            onStickHover.call( this, bind, this.currentStick );
        }else if( onStickHover !== null ){
        	this.defaultCallHover( bind );
        }
    },

    defaultCallHover : function( bind ){
    	var sum = this.config.series[ bind.indexInSeries ].sum[ bind.indexInCategories ];
    	var html = this.setTooltipContent( bind );
        var p = this.getTooltipPosition( sum );
    	this.updateTooltip( html, p.x, p.y );
    },

    setTooltipContent : function( bind ){
    	var j = bind.indexInSeries, i = bind.indexInCategories
    	var series = this.config.series;
    	var categories = this.config.xAxis.categories;
    	var html = '<div style="font-weight:bold">' + categories[ i ] + '</div>';
    	html += '<div>' + series[ j ].name + ' : ' + series[ j ].data[ i ] + '</div>';
    	html += '<div> Total : ' + series[ j ].sum[ i ] + '</div>';

    	return html;
    },

} );


})();

(function(){

var ColumnChart = kc.ColumnChart = kity.createClass( 'ColumnChart', {
    base: kc.StickChart,

    constructor: function ( target, param ) {
        this.chartType = 'column';
        this.callBase( target, param );
        var plots = this.addElement( 'plots', new kc.ColumnPlots() );
        this.setPlots( plots );
    },

    getTooltipPosition : function( val ){

        return {
            x : this.currentStick.param.x,
            y : this.coordinate.measurePointY( val )
        };

    }
} );


})();

(function(){

var BarChart = kc.BarChart = kity.createClass( 'BarChart', {
    base: kc.StickChart,

    constructor: function ( target, param ) {
        this.chartType = 'bar';
        this.callBase( target, param );
        var plots = this.addElement( 'plots', new kc.BarPlots() );
        this.setPlots( plots );
    },

    getTooltipPosition : function( val ){

        return {
            x : this.coordinate.measurePointX( val ),
            y : this.currentStick.param.y
        };
        
    }

} );


})();

(function(){

var LinearChart = kc.LinearChart = kity.createClass( 'LinearChart', {
    base: kc.BaseChart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        this.hoverDots = this.addElement( 'hoverDots', new kc.ElementList() );
        this.setData( new kc.ChartData( param ) );
        this.coordinate = this.addElement( 'oxy', new kc.CategoryCoordinate() );
    },

    onmousemove : function( ev ){
        var oxy = this.coordinate,
            param = oxy.param,
            oev = ev.originEvent,
            x = oev.offsetX,
            y = oev.offsetY,
            i,
            self = this,
            maxLength = 0,
            lenArr = [],
            tmpL,
            lines = self.config.series;;
        
        if( self.isOutOfXRange( x ) ) return;

        var result = self.getXInfoByPosX( x );

        if( !lines || lines.length == 0 || !lines[0].positions ) return;

        for (i = 0; i < lines.length; i++) {
            tmpL = lines[i].positions.length;
            if( tmpL > maxLength ){
                maxLength = tmpL;
            }
        }

        if( !result || result.index > maxLength ) return;

        self.processHover( result );
    },

    onclick : function( ev ){
        var self = this;
        var oxy = this.coordinate;
        var config = self.config;
        var shape = ev.targetShape;

        if( shape instanceof kity.Circle && self.config.interaction.onCircleClick ){
            
            var index = self.currentIndex;

            var circleEle = self.getChartElementByShape( shape ),
                bind = circleEle.param.bind;
            var info = {
                data : bind.data,
                indexInCategories : index,
                indexInSeries : bind.indexInSeries,
                position : circleEle.getPosition()
            };

            self.callCircleClick( info, circleEle );
        }
    },

    callCircleClick : function( info, circle ){

        var onCircleClick = this.config.interaction.onCircleClick;
        if( typeof onCircleClick == 'function' ){
            onCircleClick( info, circle );
        }else if( onCircleClick !== null ){
            this.defaultCircleClick( info );
        }

    },

    defaultCircleClick : function( info ){
        this.updateTooltip( this.config.xAxis.categories[ info.indexInCategories ] + ' : ' + info.data, info.position.x, info.position.y );
    },

    setCirclePosYByIndex : function( index ){
        var i, pY = 0,
            self = this,
            series = self.config.series;
        
        self.circleArr = [];
        for (i = 0; i < series.length; i++) {
            tmpPos = series[i].positions[ index ];
            if(tmpPos){
                pY = tmpPos[1];
            }else{
                pX = pY = -100;
            }

            self.circleArr.push({
                color: '#FFF',
                radius: 5,
                strokeWidth : 3,
                strokeColor : this.getEntryColor( series[i] ),
                x : self.currentPX,
                y : pY,
                bind : {
                    data : series[ i ].data[ index ],
                    indexInSeries : i,
                    indexInCategories : index
                },
            });
        }


        self.hoverDots.update({
            elementClass : kc.CircleDot,
            list : self.circleArr,
            fx : false
        });

        self.hoverDots.canvas.bringTop();
    },

    setTooltipContent : function( index ){
        var series = this.config.series;
        var categories = this.config.xAxis.categories;
        var html = '<div style="font-weight:bold">' + categories[ index ] + '</div>';
        series.forEach(function( entry, i ){
            html += '<div>' + entry.name + ' : ' + entry.data[ index ] + '</div>';
        });

        return html;
    },

    defaultCircleHover : function( binds ){
        var index = binds[ 0 ].indexInCategories;
        var series = this.config.series;
        var posArr = [];
        var posX = 0;
        var tmp;
        for( var i = 0; i < series.length; i++ ){
            tmp = series[i].positions[ index ];
            posX = tmp[ 0 ];
            posArr.push( tmp[ 1 ] );
        }
        var min = Math.min.apply([], posArr);
        var max = Math.max.apply([], posArr);

        this.updateTooltip( this.setTooltipContent( index ), posX, ( min + max ) / 2 );
    },

    callCircleHover : function(){

        var binds = [];

        this.circleArr.forEach(function( dot, i ){
            binds.push( dot.bind );
        });

        var onCircleHover = this.config.interaction.onCircleHover;
        if( typeof onCircleHover == 'function' ){
            onCircleHover( binds );
        }else if( onCircleHover !== null ){
            this.defaultCircleHover( binds );
        }

    },

    processHover : function( xInfo ){
    	var self = this;
        var pX = xInfo.posX + this.coordinate.param.margin.left;
        var index = xInfo.index;
        self.currentPX = pX;
        if( index == self.currentIndex ){
            return;
        }
        self.currentIndex = index;
        self.setCirclePosYByIndex( index );
        self.callCircleHover();

    }

} );


})();

(function(){

var LineChart = kc.LineChart = kity.createClass( 'LineChart', {
    base: kc.LinearChart,

    constructor: function ( target, param ) {
    	this.chartType = 'line';
        this.callBase( target, param );
        var plots = this.addElement( 'plots', new kc.LinePlots() );
        this.setPlots( plots );
    },

} );


})();

(function(){

var AreaChart = kc.AreaChart = kity.createClass( 'AreaChart', {
    base: kc.LinearChart,

    constructor: function ( target, param ) {
    	this.chartType = 'area';
        this.callBase( target, param );
        var plots = this.addElement( 'plots', new kc.AreaPlots() );
        this.setPlots( plots );
    },

} );


})();

(function(){

var BaseScatterChart = kc.BaseScatterChart = kity.createClass( 'BaseScatterChart', {
    base: kc.BaseChart,

    constructor: function ( target, param ) {
        this.chartType = 'scatter';
        this.callBase( target, param );
        this.coordinate = this.addElement( 'oxy', new kc.CategoryCoordinate() );
        var plots = this.addElement( 'plots', new kc.ScatterPlots() );
        this.setPlots( plots );
    },

    update : function( param ){
        this.callBase( param, kc.BaseScatterData );
    },

    onmousemove : function( ev ){
        var oxy = this.coordinate,
            param = oxy.param,
            oev = ev.originEvent,
            x = oev.offsetX,
            y = oev.offsetY,
            i,
            self = this,
            maxLength = 0,
            lenArr = [],
            tmpL,
            series = self.config.series;

            this.tmpCirlcle;
        
        var ele = this.getChartElementByShape( ev.targetShape );

        if( this.tmpCirlcle === ele ) return;
        this.tmpCirlcle = ele;

        if( ele instanceof kc.CircleDot ){
            self.processHover( ele );
        }

    },

    setTooltipContent : function( bind ){
        var html = '<div style="font-weight:bold">' + bind.label + '</div>';
        html += '<div>x轴: ' + bind.x + ' : y轴: ' + bind.y + '</div>';
        return html;
    },

    defaultCircleHover : function( bind ){
        this.updateTooltip( this.setTooltipContent( bind ), bind.position.x, bind.position.y );
    },

    processHover : function( ele ){
        var bind = ele.param.bind;
        var onCircleHover = this.config.interaction.onCircleHover;
        if( typeof onCircleHover == 'function' ){
            onCircleHover( bind, ele );
        }else if( onCircleHover !== null ){
            this.defaultCircleHover( bind );
        }
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
		var otherList = [];
		//生成List
		for ( var key in origin ) {
			var d = origin[ key ];
			//如果集合中还不存在品牌则将品牌加到集合中
			if ( d.brand === d.relatedbrand ) {
				//找到和自身class相同的项并按尺寸插入到合适的位置（降序排列）
				for ( var index = 0; index < brandList.length; index++ ) {
					if ( brandList[ index ].brandclass === d.brandclass ) break;
				}
				while ( brandList[ index ] && ( brandList[ index ].brandclass === d.brandclass ) && ( parseInt( brandList[ index ].size ) > parseInt( d.relation ) ) ) {
					index++;
				}
				brandList.splice( index, 0, {
					brand: d.brand,
					brandclass: d.brandclass,
					percent: d.percent,
					percentall: d.percentall,
					size: d.relation,
					tags: d.tags,
					connects: [] //初始化记录联系的数组
				} );
				brandSet[ d.brand ] = brandList[ index ];
			}
			//记录数据中的相互关联项
			connectList.push( {
				brand: d.brand,
				relatedbrand: d.relatedbrand,
				relation: d.relation
			} );
			if ( classList.indexOf( d.brandclass ) === -1 ) {
				classList.push( d.brandclass );
			}
		}
		var count = 0;
		for ( var i = 0; i < connectList.length; i++ ) {
			if ( connectList[ i ].brand === connectList[ i ].relatedbrand || parseInt( connectList[ i ].relation ) === 0 ) continue;
			count++;
			var source = brandSet[ connectList[ i ].brand ];
			var target = brandSet[ connectList[ i ].relatedbrand ];
			// if ( !target ) {
			// 	console.log( connectList[ i ].relatedbrand );
			// 	continue;
			// }
			var connects = source.connects;
			connects.push( {
				relatedbrand: target,
				relation: connectList[ i ].relation
			} );
		}
		return {
			brandSet: brandSet,
			brandList: brandList,
			classList: classList,
			connectCount: count
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
		this.canvas.container.on( "click", function ( e ) {
			if ( e.targetShape === me.canvas.container ) {
				me.highlightBrand();
			}
		} );
		var scatters = this.getElement( "scatter" );
		scatters.on( 'listupdatefinish', function () {
			var mode = me.param.mode;
			var scatterList = me.getElement( "scatter" ).elementList;
			var cntListContainer = me.getElement( "connects" );

			for ( var i = 0; i < scatterList.length; i++ ) {
				var disvisConnectLines = scatterList[ i ].param.disvisConnectLines;
				for ( var j = 0; j < disvisConnectLines.length; j++ ) {
					var curC = disvisConnectLines[ j ];
					if ( curC.position === 'start' ) {
						var param = curC.line.param;
						var cl = curC.line = new kc.Bezier( param );
						var source = curC.source;
						var target = curC.target;
						cntListContainer.addElement( 'uVcnt' + '0' + i + '0' + j, cl );
						cl.update( {
							x1: source.x,
							y1: source.y,
							x2: target.x,
							y2: target.y,
							cx: ( ( mode === 'circle' ) ? source.cx : source.x ),
							cy: ( ( mode === 'circle' ) ? source.cy : source.y ),
							width: param.originwidth,
							color: param.color
						} );
					}
				}
			}
		} );
		this._uvCnt = []; //用于记录暂时不显示的连线
	},
	highlightBrand: function ( e ) {
		var uvCnt = this._uvCnt;
		var scatterList = this.getElement( "scatter" ).elementList;
		var cntListContainer = this.getElement( "connects" );
		var cntList = this.getElement( "connects" ).elements;
		var mode = this.param.mode;
		var highlightCircleList = [];
		var highlightConnectList = [];
		uvCnt = this._uvCnt = [];
		//设置全部节点和连线的透明度
		var setAll = function ( opaC, opaL ) {
			for ( var c = 0; c < scatterList.length; c++ ) {
				scatterList[ c ].highlight( false );
				scatterList[ c ].canvas.setOpacity( opaC || 0 );
			}
			for ( var k in cntList ) {
				cntList[ k ].canvas.setOpacity( opaL || 0 );
				var oWidth = cntList[ k ].param.originwidth;
				cntList[ k ].update( {
					width: oWidth
				} );
			}
		};
		//寻找一个节点的全部相关节点
		var findAllRelatedCircles = function ( scatter ) {
			var relatedSet = [];
			var connects = scatter.param.connects;
			for ( var i = 0; i < connects.length; i++ ) {
				var curConnectB = connects[ i ].relatedbrand.brand;
				for ( j = 0; j < scatterList.length; j++ ) {
					var curScatter = scatterList[ j ];
					if ( curConnectB === curScatter.param.brand ) {
						relatedSet.push( curScatter );
					}
				}
			}
			return relatedSet;
		};
		//点中空白区域时直接高亮全部，返回
		if ( e === undefined ) {
			setAll( 1, 1 );
			return false;
		}
		//点中单个节点
		if ( e instanceof ChartEvent ) {
			//点击单个节点
			var circle = e.target;
			highlightCircleList.push( circle );
			var connects = circle.param.connects;
			//判断节点是否在关联的节点集合中
			highlightCircleList = highlightCircleList.concat( findAllRelatedCircles( circle ) );
			highlightConnectList = highlightConnectList.concat( circle.param.connectLines );
			uvCnt = this._uvCnt = uvCnt.concat( circle.param.disvisConnectLines );
			setAll( 0.1 );
		} else { //点击图例
			for ( var i1 = 0; i1 < scatterList.length; i1++ ) {
				var curScatter = scatterList[ i1 ];
				//所属class
				if ( curScatter.param.brandclass === e ) {
					highlightCircleList.push( curScatter );
					if ( mode !== 'circle' ) highlightCircleList = highlightCircleList.concat( findAllRelatedCircles( curScatter ) );
					highlightConnectList = highlightConnectList.concat( curScatter.param.connectLines );
					uvCnt = this._uvCnt = uvCnt.concat( curScatter.param.disvisConnectLines );
				}
			}
			setAll( 0.1 );
		}
		//统一处理节点和连线的高亮和非高亮
		//disvisConnectLines
		for ( var n = 0; n < highlightCircleList.length; n++ ) {
			highlightCircleList[ n ].canvas.setOpacity( 1 );
			highlightCircleList[ n ].highlight( true );
		}
		for ( var m = 0; m < highlightConnectList.length; m++ ) {
			var l = highlightConnectList[ m ];
			if ( l.position === 'start' ) {
				l.line.canvas.setOpacity( 1 );
				l.line.update( {
					width: l.line.param.highlightwidth
				} )
			}
		}
		for ( var x = 0; x < uvCnt.length; x++ ) {
			if ( uvCnt[ x ].position === 'start' ) {
				var param = uvCnt[ x ].line.param;
				var cl = uvCnt[ x ].line;
				var source = uvCnt[ x ].source;
				var target = uvCnt[ x ].target;
				uvCnt[ x ].line.canvas.setOpacity( 1 );
				cl.update( {
					width: param.highlightwidth,
				} );
			}
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
		var brandSet = data.brandSet;
		var list = data.brandList;
		var paperWidth = this.getWidth();
		var paperHeight = this.getHeight();
		var Ox = paperWidth / 2;
		var Oy = paperHeight / 2;
		var brandTop = data.brandTop;
		//计算全图半径
		var R = 350 || ( ( Ox < Oy ? Ox : Oy ) - 10 );
		if ( mode === 'circle' ) {
			R -= 100;
		}
		//初始化圆的尺寸,初始化list数据
		for ( var i = 0; i < list.length; i++ ) {
			list[ i ].color = colors[ list[ i ].brandclass ];
			var circleSize = list[ i ].size;
			list[ i ].radius = list[ i ].originradius = 2 + Math.pow( list[ i ].size + 1, 27 / list.length );
			list[ i ].label = {
				text: list[ i ].brand,
				color: 'black'
			};
			list[ i ].connectLines = [];
			list[ i ].disvisConnectLines = []; //记录不可见的连线
			list[ i ].fxEasing = null;
			list[ i ].mode = mode;
			list[ i ].Ox = Ox;
			list[ i ].Oy = Oy;
			list[ i ].R = R;
			list[ i ].chart = this;
		}
		//更新连线
		connects.removeElement();
		//connects.canvas.clear();
		var cList = data.classList;
		for ( var n = 0; n < list.length; n++ ) {
			var source = list[ n ];
			var sourceConnects = source.connects;
			//更新所有的连线
			for ( var n1 = 0; n1 < sourceConnects.length; n1++ ) {
				var targetInfo = sourceConnects[ n1 ];
				var target = targetInfo.relatedbrand;
				var cnt;
				var cntwidth = Math.log( sourceConnects[ n1 ].relation ) / 50;
				cnt = new kc.Bezier( {
					x1: source.x,
					y1: source.y,
					x2: target.x,
					y2: target.y,
					cx: target.cx,
					cy: target.cy,
					color: target.color,
					originwidth: cntwidth,
					width: cntwidth,
					highlightwidth: ( cntwidth * 2 < 1 ? 1 : cntwidth * 2 )
				} );
				//只往画布上添加一部分的连线
				if ( data.connectCount < 300 || cntwidth > data.connectCount / 13000 ) {
					connects.addElement(
						'Vcnt' + '0' + n + '0' + n1, cnt
					);
					source.connectLines.push( {
						position: 'start',
						line: cnt
					} );
					target.connectLines.push( {
						position: 'end',
						line: cnt
					} );
				} else {
					source.disvisConnectLines.push( {
						source: source,
						target: target,
						line: cnt,
						position: 'start'
					} );
					target.disvisConnectLines.push( {
						source: source,
						target: target,
						line: cnt,
						position: 'end'
					} );
				}
			}
		}
		if ( mode === 'circle' ) {
			var total = 0;
			for ( var j = 0; j < list.length; j++ ) {
				var add = list[ j ].radius;
				if ( add < 10 ) add = 10;
				total += add;
			}
			var sDelta = 0;
			for ( var j1 = 0; j1 < list.length; j1++ ) {
				if ( list[ j1 ].radius > 10 )
					sDelta += list[ j1 ].radius;
				else
					sDelta += 10;
				list[ j1 ].x = R * Math.cos( sDelta * Math.PI / total ) + Ox;
				list[ j1 ].y = R * Math.sin( sDelta * Math.PI / total ) + Oy;
				list[ j1 ].cx = R * 0.2 * Math.cos( sDelta * Math.PI / total ) + Ox;
				list[ j1 ].cy = R * 0.2 * Math.sin( sDelta * Math.PI / total ) + Oy;
				list[ j1 ].sDelta = sDelta;
				list[ j1 ].total = total;
				list[ j1 ].mode = 'circle';
				if ( list[ j1 ].radius > 10 )
					sDelta += list[ j1 ].radius;
				else
					sDelta += 10;
				list[ j1 ].radius = list[ j1 ].radius / 3;
			}
		} else {
			var total = 0;
			for ( var j3 = 0; j3 < list.length; j3++ ) {
				total += list[ j3 ].radius;
			}
			var sDelta = total;
			//将所有的点随机分布在一个圆里
			for ( var j4 = 0; j4 < list.length; j4++ ) {
				sDelta += list[ j4 ].radius;
				list[ j4 ].cx = R * 0.2 * Math.cos( sDelta * Math.PI / total ) + Ox;
				list[ j4 ].cy = R * 0.2 * Math.sin( sDelta * Math.PI / total ) + Oy;
				// var P = list[ j4 ].radius * 9;
				// if ( P > ( R - list[ j4 ].radius ) ) P = R - list[ j4 ].radius;
				// list[ j4 ].x = P * Math.cos( sDelta * Math.PI / total ) + Ox;
				// list[ j4 ].y = P * Math.sin( sDelta * Math.PI / total ) + Oy;
				//循环产生随机数直到没有重叠为止
				while ( true ) {
					var P = Math.random() + list[ j4 ].radius / 70;
					P = P * R;
					if ( P > ( R - list[ j4 ].radius ) ) P = R - list[ j4 ].radius - Math.random() * R * 0.4;
					list[ j4 ].x = P * Math.cos( sDelta * Math.PI / total ) + Ox;
					list[ j4 ].y = P * Math.sin( sDelta * Math.PI / total ) + Oy;
					// list[ j4 ].x = Math.random() * paperWidth;
					// list[ j4 ].y = Math.random() * paperHeight;
					var noIntersect = true;
					for ( var n = 0; n < j4; n++ ) {
						var dx = list[ n ].x - list[ j4 ].x;
						var dy = list[ n ].y - list[ j4 ].y;
						var d = Math.sqrt( dx * dx + dy * dy );
						if ( d < ( list[ n ].radius + list[ j4 ].radius ) ) {
							noIntersect = false;
							break;
						}
					}
					if ( noIntersect ) break;
				}
				list[ j4 ].sDelta = sDelta;
				list[ j4 ].total = total;
				sDelta += list[ j4 ].radius;
			}
			//用力导向算法调整布局
			var setPos = function () {
				var dt = 1; //为最小单位
				var k = 1000;
				for ( var i = 1; i < list.length; i++ ) { //计算下一步的x和y
					var F = new kity.Vector( 0, 0 ); //记录当前受到的合力
					var source = list[ i ];
					var connects = list[ i ].connects;
					for ( var j = 0; j < connects.length; j++ ) {
						var c = connects[ j ];
						var target = c.relatedbrand;
						var l = source.radius + target.radius + Math.log( c.relation );
						var dx = target.x - source.x,
							dy = target.y - source.y;
						var d = Math.sqrt( dx * dx + dy * dy );
						var fV = k * ( d - l ); //分力的值
						var f = new kity.Vector( dx, dy ).normalize( fV );
						F = F.add( f );
					}
					//var k = F.normalize(k);
					L = F.multipy( 1 / k );
					var targetX = source.x + L.x / 100,
						targetY = source.y + L.y / 100;
					//防止重叠
					var noIntersect = true;
					for ( var n = 0; n < list.length; n++ ) {
						if ( list[ n ] === source ) continue;
						var dx = list[ n ].x - targetX;
						var dy = list[ n ].y - targetY;
						var d = Math.sqrt( dx * dx + dy * dy );
						if ( d < ( list[ n ].radius + source.radius ) ) {
							noIntersect = false;
							break;
						}
					}
					if ( noIntersect ) {
						source.x = targetX;
						source.y = targetY;
					}
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
				}
			}
			for ( var t = 0; t < 10; t++ ) {
				setPos();
			}
			// setInterval( function () {
			// 	setPos();
			// 	var List = [].concat( list );
			// 	scatter.update( {
			// 		elementClass: kc.ConnectCircleDot,
			// 		list: List,
			// 		fx: false
			// 	} );
			// } );
		}
		this.param.list = list;
		scatter.update( {
			elementClass: kc.ConnectCircleDot,
			list: list,
			animateDuration: 1000
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

var HorizonData = kc.HorizonData = kity.createClass( 'HorizonData', {
    base: kc.Data,
    format: function ( format ) {
        var origin = this.origin;
        if ( format === undefined ) {
            return origin;
        } else if ( format === 'col' ) {
            //返回每项属性的最大和最小值
            var series = data.series;
            var result = {};
            var dividecount = 0;
            var ranges = [];
            var labels = [];
            for ( var i = 0; i < origin.categories.length; i++ ) {
                ranges.push( {
                    max: 0,
                    min: 0
                } );
            }
            for ( var key in series ) {
                labels.push( key );
                dividecount++;
                var s = series[ key ];
                for ( var j = 0; j < s.length; j++ ) {
                    var sa = s[ j ].args;
                    for ( var k = 0; k < origin.categories.length; k++ ) {
                        if ( parseFloat( sa[ k ] ) > ranges[ k ].max ) {
                            ranges[ k ].max = sa[ k ];
                        } else if ( parseFloat( sa[ k ] ) < ranges[ k ].min ) {
                            ranges[ k ].min = sa[ k ];
                        }
                    }
                }
            }
            result.dividecount = dividecount;
            result.ranges = ranges;
            result.labels = labels;
            return result;
        }
    }
} );
var HorizonChart = kc.HorizonChart = kity.createClass( 'HorizonChart', {
    base: kc.Chart,
    constructor: function ( target, param ) {
        this.callBase( target, param );
        this.setData( new kc.HorizonData() );
        this.addElement( "Lines", new kc.ElementList() );
        this.addElement( "Axis", new kc.ElementList() );
        this.addElement( "Cate", new kc.ElementList() );
    },
    renderChart: function () {
        var colors = this.param.colors;
        var data = this.getData().format();
        var datacol = this.getData().format( 'col' );
        var labels = datacol.labels;
        var categories = data.categories;
        var lLength = labels.length - 1;
        var container = this.getPaper().container;
        var _width = container.offsetWidth;
        var _height = container.offsetHeight;
        var padding = this.param.padding;
        var _space = ( _width - padding[ 1 ] - padding[ 3 ] ) / categories.length;
        var _AxisHeight = _height - padding[ 0 ] - padding[ 2 ]; //y坐标轴的高度
        var axis = this.getElement( 'Axis' );
        var lines = this.getElement( 'Lines' );
        var Cate = this.getElement( 'Cate' );
        var AxisLines = [];
        var Polylines = [];
        var Cates = [];
        //生成连线和Categories数据
        var series = data.series;
        for ( var key in series ) {
            var s = series[ key ];
            console.log( labels.indexOf( key ) );
            Cates.push( {
                text: key,
                at: 'left',
                x: padding[ 3 ] - 20,
                y: padding[ 0 ] + labels.indexOf( key ) * _AxisHeight / lLength
            } );
            for ( var j = 0; j < s.length; j++ ) {
                var item = {
                    points: [
                        [ padding[ 3 ], padding[ 0 ] + labels.indexOf( key ) * _AxisHeight / lLength ]
                    ],
                    color: colors[ labels.indexOf( key ) ] || 'black',
                    width: 0.3
                };
                Polylines.push( item );
                var args = s[ j ].args;
                for ( var k = 0; k < args.length; k++ ) {
                    item.points.push(
                        [ padding[ 3 ] + _space * ( k + 1 ), padding[ 0 ] + ( 1 - args[ k ] / datacol.ranges[ k ].max ) * _AxisHeight ]
                    );
                }
            }
        };
        for ( var x = 0; x < categories.length; x++ ) {
            Cates.push( {
                text: categories[ x ],
                x: padding[ 3 ] + _space * ( x + 1 ),
                y: padding[ 0 ] - 20
            } );
        }
        for ( var i = 0; i <= data.categories.length; i++ ) {
            var item = {
                x1: padding[ 3 ] + _space * i,
                y1: padding[ 0 ],
                x2: padding[ 3 ] + _space * i,
                y2: _height - padding[ 2 ]
            };
            if ( i !== 0 ) {
                item.max = datacol.ranges[ i - 1 ].max;
            } else {
                item.divide = datacol.dividecount;
            }
            AxisLines.push( item );
        }
        //绘制线
        axis.update( {
            elementClass: kc.AxisLine,
            list: AxisLines,
            fx: false
        } );
        lines.update( {
            elementClass: kc.Polyline,
            list: Polylines,
            fx: false
        } );
        Cate.update( {
            elementClass: kc.Label,
            list: Cates,
            fx: false
        } );
    },
    update: function () {
        this.renderChart();
    }
} );

var RadarData = kc.RadarData = kity.createClass( 'RadarData', {
    base: kc.Data
} );
var RadarChart = kc.RadarChart = kity.createClass( 'RadarChart', {
    base: kc.Chart,
    constructor: function ( target, param ) {
        this.callBase( target, param );
        //add chart elements
        this.addElement( "net", new kc.ElementList() );
        this.addElement( "items", new kc.ElementList() );
        this.addElement( "circles", new kc.ElementList() );
        this.addElement( "labels", new kc.ElementList() );
        this.setData( new kc.RadarData() );
    },
    render: function () {
        var data = this.getData().format();
        var param = this.param;
        var colors = param.colors;
        var divide = data.categories.length;
        var delta = Math.PI * 2 / divide;
        var net = this.getElement( 'net' );
        var items = this.getElement( 'items' );
        var circles = this.getElement( 'circles' );
        var labels = this.getElement( 'labels' );
        var lineList = []; //线条数据
        var circleList = []; //点数据
        var labelList = []; //标签数据
        var container = this.container;
        var _width = container.offsetWidth;
        var _height = container.offsetHeight;
        //计算中点和半径
        var Cx = _width / 2;
        var Cy = _height / 2;
        var R = ( _width < _height ? _width : _height ) / 2 - 50;
        var step = R / 5;
        var Angle = 0;
        //绘制罗圈
        for ( var j = 0; j < divide; j++ ) {
            for ( var i = 0; i < 6; i++ ) {
                var r = step * i;
                var item = {
                    x1: Cx + r * Math.cos( Angle ),
                    y1: Cy + r * Math.sin( Angle ),
                    x2: Cx + r * Math.cos( Angle + delta ),
                    y2: Cy + r * Math.sin( Angle + delta ),
                    color: colors.net
                };
                lineList.push( item );
            }
            var item_d = {
                x1: Cx,
                y1: Cy,
                x2: Cx + R * Math.cos( Angle ),
                y2: Cy + R * Math.sin( Angle ),
                color: colors.net
            };
            lineList.push( item_d );
            Angle += delta;
        }
        net.update( {
            elementClass: kc.Line,
            list: lineList,
            fx: false
        } );
        //绘制对象
        var itemColors = colors.items;
        var itemList = [];
        var series = data.series;
        for ( var k = 0; k < series.length; k++ ) {
            var points = [];
            var attributes = series[ k ].data;
            for ( var l = 0; l < attributes.length; l++ ) {
                var r = R * attributes[ l ];
                var _x = Cx + r * Math.cos( delta * l ),
                    _y = Cy + r * Math.sin( delta * l );
                points.push( [ _x, _y ] );
                circleList.push( {
                    radius: param.circle && param.circle.radius || 5,
                    fxEasing: param.circle && param.circle.fxEasing || 'ease',
                    color: itemColors[ k ] || '#7ecffe',
                    x: _x,
                    y: _y
                } );
            }
            var item = {
                points: points,
                color: itemColors[ k ],
                fxEasing: 'ease',
                close: true,
                fill: kity.Color.parse( itemColors[ k ] ).set( kity.Color.A, 0.3 ),
                animatedDir : 'both',
                factor : +new Date
            };
            itemList.push( item );
        }
        items.update( {
            elementClass: kc.Polyline,
            list: itemList
        } );

        if( param.circle && param.circle.enabled ){
            circles.update( {
                elementClass: kc.CircleDot,
                list: circleList,
            } );
        }

        //绘制label
        for ( var m = 0; m < data.categories.length; m++ ) {
            var categorie = data.categories[ m ];
            var item = {
                text: categorie,
                x: Cx + ( R + 30 ) * Math.cos( delta * m ),
                y: Cy + ( R + 30 ) * Math.sin( delta * m ),
            };
            labelList.push( item );
        }
        labels.update( {
            elementClass: kc.Label,
            list: labelList,
        } );
    },
    update: function () {
        this.render();
    }
} );

var CoffeeData = kc.CoffeeData = kity.createClass( 'CoffeeData', {
    base: kc.Data,
    format: function ( colors, chart ) {
        var list = [];
        var origin = this.origin;
        for ( var key in origin ) {
            var o = origin[ key ];
            o.x = 20 + ( list.length % 3 ) * 300;
            o.y = 50 + parseInt( list.length / 3 ) * 200;
            o.colors = colors;
            o.chart = chart;
            list.push( o );
        }
        return list;
    }
} );
var CoffeeChart = kc.CoffeeChart = kity.createClass( 'CoffeeChart', {
    base: kc.Chart,
    constructor: function ( target, param ) {
        this.callBase( target, param );
        //add chart elements
        this.addElement( "coffeecups", new kc.ElementList() );
        this.setData( new kc.CoffeeData() );
    },
    renderCoffee: function () {
        var coffeecups = this.getElement( 'coffeecups' );
        var data = this.getData().format( this.param.colors, this );
        coffeecups.update( {
            elementClass: kc.CoffeeCup,
            list: data,
            animateDuration: 1000
        } );
    },
    update: function () {
        this.renderCoffee();
    }
} );

var ChinaMapData = kc.MapData = kity.createClass('ChinaMapData', {
    base: kc.Data,

    format: function() {
        var origin = this.origin;
        return origin;
    }
});

var ChinaMapChart = kc.ChinaMapChart = kity.createClass('ChinaMapChart', {
    base: kc.Chart,

    constructor: function (target, param) {
        this.callBase(target, kity.Utils.extend({
            width: 600,
            height: 600,
            minColor: 'blue',
            maxColor: 'red'
        }, param));

        this.addElement('map', new kc.Map({
            width: this.param.width,
            height: this.param.height
        }, kc.Map.CHINA));
    },

    updateChart: function(param, data) {
        var has = 'hasOwnProperty';
        var map = this.getElement('map');

        var colors = param.colors.map(kity.Color.parse),
            tweenColor = function (t) {
                var index = t * (colors.length - 1) | 0;
                var v = colors[index].valueOf(),
                    vv = colors[index + 1].valueOf();

                var tRange = 1 / (colors.length - 1);
                var tSkiped = index * tRange;

                t = (t - tSkiped) / tRange;
                
                return new kity.Color.createHSLA(
                    v.h + (vv.h - v.h) * t,
                    v.s + (vv.s - v.s) * t,
                    v.l + (vv.l - v.l) * t,
                    v.a + (vv.a - v.a) * t);
            };

        var block, defaultColor;

        defaultColor = param.defaultColor && new kity.Color(param.defaultColor) || colors[0];

        map.update({
            width: param.width,
            height: param.height
        });

        var china = kc.Map.CHINA.blocks;

        for (var province in china) {
            block = map.findBlockById(province);
            if (!block) continue;
            var color = data[province].value ? tweenColor(data[province].value) : defaultColor;
            block.animate({
                color: color
            });
        }

        this.paper.setWidth(map.renderWidth).setHeight(map.renderHeight);
    },

    getMap: function() {
        return this.getElement('map');
    },

    addOverlay: function(lng, lat, element) {
        var pos = this.getMap().geoToPoint(lng, lat);
        this.addElement(element);
        element.update({
            x: pos.x,
            y: pos.y
        });
        return element;
    }
    
});

(function(exports){

var PieChart = kc.PieChart = kity.createClass( 'PieChart', {
    base : kc.BaseChart,

    constructor: function ( target, param ) {
        this.chartType = 'pie';
        this.callBase( target, param );
        this.config = this.param;
        this.setData( new kc.PieData( param ) );

        var plots = this.addElement( 'plots', new kc.PiePlots() );
        this.setPlots( plots );

        // this.bindAction();
        // this.addLegend();
    },

    update : function( param ){
        this.setConfig( param, kc.PieData );
        
        this.getPlots().update( this.config );
        this.getOption('legend.enabled') && this.addLegend();
    },

    getCenter : function(){
        var center = this.config.plotOptions.pie.center;
        return {
            x : center.x,
            y : center.y
        };
    },

    getSeries : function(){
        return this.config.series;
    },

    bindAction : function(){

    },

} );


})( window );

(function(exports){

var fans = [];
function getFans( node ){
    if( node.children && node.children.length > 0 ){
        !node.hide && node.parent && fans.push( node );
        node.children.forEach(function(n, i){
            getFans( n );
        });
    }else{
        !node.hide && node.parent && fans.push( node );
    }
    return fans;
}

function getParents( node, callback ){
    var tmp = node;
    tmp && tmp.shape && callback && callback( tmp );
    while( tmp.parent ){
        tmp = tmp.parent;
        tmp && tmp.shape && callback && callback( tmp );
    }
}

var SunChart = kc.SunChart = kity.createClass( 'SunChart', {
    base : kc.Chart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        this.config = this.param;
        this.setData( new kc.SunData() );

        this.fans = this.addElement( 'fans', new kc.ElementList() );
    },

    update : function( param ){
        this.param = kity.Utils.extend( this.param, param );
        this.setBlurColor();
        var self = this;
        var data = this.data.format();

        if( data ){
            this.paramList = [];
            this.nodeList = [];
            var inner = this.param.inner || 30, outer = this.param.outer || 60, increment = this.param.increment || 30;
            fans = [];
            var self = this;
            getFans( data ).forEach(function( node, i ){
                var pieAngle = node.weight * 360;
                if(pieAngle < 0.5){
                    return;
                }

                var depth = node.depth - 1;
                self.paramList.push({
                    labelText: null,
                    labelPosition: 'none',

                    connectLineWidth: 0,

                    innerRadius : depth == 0 ? inner : (outer  + ( depth - 1 ) * increment),
                    outerRadius : outer + increment * depth,
                    startAngle : node.weightStart * 360,
                    pieAngle: pieAngle,

                    strokeWidth : 1,
                    strokeColor : "#FFF",

                    color: self.getColor( node.name ),

                    x : self.param.center.x,
                    y : self.param.center.y,

                });

                self.nodeList.push( node );

            });

            if( this.paramList.length < 50 ){
                this.updateFans( this.paramList, true );
            }
            
            this.updateFans( this.paramList, false );
            this.bindData();
            this.bindAction();

        }

    },

    updateFans : function( list, anim ){
        this.fans.update({
            elementClass : kc.Pie,
            list : list,
            fx : anim
        });
    },

    getColor : function( name ){
        return this.config.color[ name ] || this.config.defaultColor || "#808080";
    },

    getDefaultColor : function(){
        return this.config.defaultColor || "#808080";
    },

    bindData : function(){
        var self = this;
        this.fans.getElementList().forEach(function( shape, i ){
            self.nodeList[ i ].shape = shape;
            shape.dataNode = self.nodeList[ i ];
        });
    },

    bindAction : function(){
        var self = this;
        this.fans.getElementList().forEach(function( shape, i ){
            shape.on('mouseover', function( ev ){
                var dataNode = self.nodeList[ i ];
                var ancestors = self.focus( dataNode );
                self.config.onHover && self.config.onHover( ancestors.reverse() );
            });

            shape.on('mouseout', function( ev ){
                self.blur();
            });
        });
    },

    setBlurColor : function(){
        var colors = this.config.color;
        var name, color, light;
        this.blurColors = {};
        for( name in colors ){
            this.blurColors[ name ] = blurColor( this.getColor( name ) );
        }

        this.blurDefaultColors = blurColor( this.getDefaultColor() );

        function blurColor( c ){
            var color = new kity.Color( c );
            color.set('a', 0.5 );
            return color.toRGBA();
        }
    },

    focus : function( dataNode ){
        var self = this;
        var ancestors = [];
        var nodes = [];
        getParents( dataNode, function( node ){
            ancestors.push( node.shape );
            nodes.push( node );
        });

        var colorList = this.fans.getElementList().map(function( fan, i ){
            var color = self.blurColors[ self.nodeList[ i ].name ] || self.blurDefaultColors;
            if( ~ancestors.indexOf( fan ) ){
               color = fan.param.color;
            }
            return {
                color : color
            };
        });

        this.updateFans( colorList, false );
        return nodes;
    },

    blur : function(){
        var self = this;
        var colorList = this.fans.getElementList().map(function( fan, i ){
            var color = self.getColor( self.nodeList[ i ].name );
            return {
                color : color
            };
        });

        this.updateFans( colorList, false );
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

                var color = new kity.Color(255, 204, 191);
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

var HumanData = kc.HumanData = kity.createClass( 'HumanData', {
    base: kc.Data,
    format: function ( colors, chart ) {
        var list = [];
        var origin = this.origin;
        for ( var key in origin ) {
            var o = origin[ key ];
            o.x = 200 + ( list.length % 2 ) * 300;
            o.y = 50 + parseInt( list.length / 3 ) * 200;
            o.colors = colors;
            o.chart = chart;
            list.push( o );
        }
        return list;
    }
} );
var HumanChart = kc.HumanChart = kity.createClass( 'HumanChart', {
    base: kc.Chart,
    constructor: function ( target, param ) {
        this.callBase( target, param );
        //add chart elements
        this.addElement( "coffeecups", new kc.ElementList() );
        this.setData( new kc.HumanData() );
    },
    renderCoffee: function () {
        var coffeecups = this.getElement( 'coffeecups' );
        var data = this.getData().format( this.param.colors, this );
        coffeecups.update( {
            elementClass: kc.HumanBody,
            list: data,
            animateDuration: 1000
        } );
    },
    update: function () {
        this.renderCoffee();
    }
} );

})(kity, window);