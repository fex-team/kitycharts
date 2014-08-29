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