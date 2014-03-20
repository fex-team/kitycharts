var Ruler = kc.Ruler = kity.createClass( 'Ruler', {
    constructor: function ( from, to ) {
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

    grid: function ( start, step ) {
        var ref = this._ref,
            map = this._map,
            ref_grid = [],
            map_grid = [],
            current;
        for ( current = start; current < ref.to; current += step ) {
            ref_grid.push( current );
            map_grid.push( this.measure( current ) );
        }
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
        var dur = this._ref.dur | 0,
            digit = dur.toString().length,
            h_mod = Math.pow( 10, digit - 1 ),
            l = dur % h_mod,
            h = dur - l;
        if ( count < 10 ) return h / 10;
        else if ( count < 20 ) return h / 20;
        else if ( count < 50 ) return h / 50;
        else if ( count < 100 ) return h / 100;
        return h / 1000;
    },

    gridByCount: function ( count, mod ) {
        mod = mod || this.fagm( count );
        var ref = this._ref;
        var start = kc.sugar.snap( ref.from, mod, 'right' );
        var size = mod;
        while ( size * count < ref.dur ) size += mod;
        return this.grid( start, size );
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