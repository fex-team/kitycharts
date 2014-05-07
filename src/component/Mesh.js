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