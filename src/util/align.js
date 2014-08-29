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