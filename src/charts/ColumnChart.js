(function(){

var ColumnChart = kc.ColumnChart = kity.createClass( 'ColumnChart', {
    base: kc.BaseChart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        var plots = this.addElement( 'plots', new kc.ColumnPlots() );
        this.setPlots( plots );
    },

    isStick : function( ele ){
    	return ele instanceof kc.Bar;
    },

    onmousemove : function( ev ){
    	this.tmpStick;
    	this.tmpStickParam;

    	var ele = this.getChartElementByShape( ev.targetShape );

    	if( this.isStick( ele ) ){

    		if( this.tmpStick != ele ){
				this.onMouseOut( ele );
    		}else{
    			this.onMouseIn( ele );
    		}

    	}else{
			this.onMouseOut( ele );
    	}

    },

    getPosXByIndex : function( index ){
    	return this.coordinate.measurePointX( index );
    },

    getPosYByValue : function( val ){
    	return this.coordinate.measurePointY( val );
    },

    onMouseIn : function( ele ){
    	var color = new kity.Color( ele.param.color );
    	color.set( 'a', 0.7 );

	    ele.update({
			color : color.toRGBA()
		});

		var bind = ele.getBindData();

		this.processHover( bind );
    },

    onMouseOut : function( ele ){
		this.tmpStickParam && this.tmpStick.update({
			color : this.tmpStickParam.color
		});

		if( this.isStick( ele ) ){
			this.tmpStick = ele;
			this.tmpStickParam = kity.Utils.copy( ele.param );
		}
    },

    processHover : function( bind ){
    	if( this.currentMark == bind.indexInSeries + bind.indexInCategories ) return;
    	this.currentMark = bind.indexInSeries + bind.indexInCategories
    	this.callHover( bind );
    },

    callHover : function( bind ){
    	var onStickHover = this.config.interaction.onStickHover;

        if( typeof onStickHover == 'function' ){
            onStickHover.call( this, bind, this.tmpStick );
        }else if( onStickHover !== null ){
        	this.defaultCallHover( bind );
        }
    },

    defaultCallHover : function( bind ){
    	var sum = this.config.series[ bind.indexInSeries ].sum[ bind.indexInCategories ];
       	var posX = this.tmpStick.param.x;
    	var posY = this.getPosYByValue( sum );
    	var html = this.setTooltipContent( bind );
    	this.updateTooltip( html, posX, posY );
    },

    setTooltipContent : function( bind ){
    	var j = bind.indexInSeries, i = bind.indexInCategories
    	var series = this.config.series;
    	var categories = this.config.xAxis.categories;
    	var html = '<div style="font-weight:bold">' + categories[ i ] + '</div>';
    	html += '<div>' + series[ j ].name + ' : ' + series[ j ].data[ i ] + '</div>';
    	html += '<div> Total : ' + series[ j ].sum[ i ] + '</div>';

    	return html;
    },

} );


})();