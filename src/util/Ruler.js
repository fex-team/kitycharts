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

    grid: function ( start, step, alignRight ) {
        var ref = this._ref,
            map = this._map,
            ref_grid = [],
            map_grid = [],
            current;
        var op = alignRight ? '<=' : '<';

        for ( current = start; eval('current ' + op + ' ref.to'); current += step ) {
            ref_grid.push( current );
            map_grid.push( this.measure( current ) );
        }
        this.ref_grid = ref_grid;
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

    gridByCount: function ( count, mod, alignRight ) {
        mod = mod || this.fagm( count );
        var ref = this._ref;
        var start = this.align( ref.from, mod, 'right' );
        var size = mod;
        while ( size * count < ref.dur ) size += mod;
        return this.grid( start, size, alignRight );
    },

    checkOverflow: function ( value ) {
        if ( value < this._ref.from ) {
            return -1;
        }
        if ( value > this._ref.to ) {
            return 1;
        }
        return 0;
    }
} );

Ruler.from = function ( from ) {
    return {
        to: function ( to ) {
            return new Ruler( from, to );
        }
    };
};