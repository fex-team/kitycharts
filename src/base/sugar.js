var sugar = kc.sugar = {
    snap: function ( value, mod, dir ) {
        var left = value > 0 ?
            value - value % mod :
            value - value % mod - mod,
            right = left + mod;
        switch ( dir ) {
        case 'left':
            return left;
        case 'right':
            return right;
        default:
            return value - left < right - value ? left : right;
        }
    },
    sharpen: function ( p ) {
        if(typeof(p) == 'number') return (p | 0) + 0.5;
        if(p.x && p.y) return {
            x: (p.x | 0) + 0.5,
            y: (p.y | 0) + 0.5
        };
    }
};