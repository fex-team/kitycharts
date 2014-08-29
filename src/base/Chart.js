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