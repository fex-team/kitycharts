(function(){

var StickChart = kc.StickChart = kity.createClass( 'StickChart', {
    base: kc.BaseChart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        this.setData( new kc.ChartData( param ) );
        this.coordinate = this.addElement( 'oxy', new kc.CategoryCoordinate() );
    },

    isStick : function( ele ){
    	return ele instanceof kc.Bar;
    },

    onmousemove : function( ev ){
    	this.currentStick;
    	this.currentStickParam;

    	var ele = this.getChartElementByShape( ev.targetShape );

    	if( this.isStick( ele ) ){

    		if( this.currentStick != ele ){
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
		this.currentStickParam && this.currentStick.update({
			color : this.currentStickParam.color
		});

		if( this.isStick( ele ) ){
			this.currentStick = ele;
			this.currentStickParam = kity.Utils.copy( ele.param );
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
            onStickHover.call( this, bind, this.currentStick );
        }else if( onStickHover !== null ){
        	this.defaultCallHover( bind );
        }
    },

    defaultCallHover : function( bind ){
    	var sum = this.config.series[ bind.indexInSeries ].sum[ bind.indexInCategories ];
    	var html = this.setTooltipContent( bind );
        var p = this.getTooltipPosition( sum );
    	this.updateTooltip( html, p.x, p.y );
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