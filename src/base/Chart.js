var Chart = kc.Chart = kity.createClass( 'Chart', {
    base: kc.ChartElement,
    constructor: function ( data, elements ) {
        this.data = data || new kc.Data();
        this.elements = elements || [];
    },
    addElement: function ( chartElement ) {
        this.elements.push( chartElement );
        this.canvas.addShape( chartElement.canvas );
    },
    removeElement: function ( chartElement ) {
        var index = this.elements.indexOf( chartElement );
        if ( ~index ) {
            this.elements.splice( index, 1 );
            this.canvas.removeShape( chartElement.canvas );
        }
    },
    getData: function() {
        return this.data;
    },
    setData: function(data) {
        this.data = data;
    },
    /* abstract class */
    update: function() {
        // 子类应该重载该方法，根据数据渲染图表
    }
} );