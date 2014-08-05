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