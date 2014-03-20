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