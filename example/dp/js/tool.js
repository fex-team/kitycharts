function addFrame( page, frameAction ) {
    var frame = new K.Frame();
    frame.setAction(frameAction).addToTimeline();
    page.addFrame(frame);
}

function addComponent( frame, com, transitParam, callback ){
	frame.addComponent( com );

	com.transit( transitParam, transitParam.dur || 600, function(){
		if( com.isRemoved() ){
			return;
		}
		callback && callback( com );
	} );
}

function addIFrame( frame, p, transitParam, callback ){
	var com = new K.Component('<iframe scrolling="no" class="iframe" src="charts/' + p.src + '.html"></iframe>');

	com.getElement()[0].onload = function(){
		com.setStyle({
			position : 'absolute',
			width : slider.measure(p.width) + 'px',
			height : slider.measure(p.height) + 'px',
			left : slider.measure(p.left) + 'px',
			top : slider.measure(p.top) + 'px',
			opacity : p.opacity
		})

		com.transit( transitParam, transitParam.dur || 600, function(){
			if( com.isRemoved() ){
				return;
			}
			callback && callback( com );
		} );
	};

	frame.addComponent( com );
	return com;
}

function addImage( frame, p, transitParam, callback ){
	var com = new K.Component('<img src="img/' + p.src + '.png" />').setStyle({
		position : 'absolute',
		width : slider.measure(p.width) + 'px',
		height : 'auto',
		left : slider.measure(p.left) + 'px',
		top : slider.measure(p.top) + 'px',
		opacity : p.opacity
	})

	addComponent( frame, com, transitParam, callback );
	return com;
}

function addImageAttach( com, p, transitParam, callback ){

	var attach = $('<img src="img/' + p.src + '.png" />').css({
		position : 'absolute',
		display : 'inline-block',
		width : slider.measure(p.width) + 'px',
		height : 'auto',
		top : slider.measure(p.top) + 'px',
		left : slider.measure(p.left) + 'px',
		opacity : p.opacity
	});

	com.attach( attach );

	attach.transit( transitParam, transitParam.dur || 600, function(){
		if( attach.parent().length == 0 ){
			return;
		}
		callback && callback( attach );
	} );

	return attach;
}

function addHTML( frame, p, transitParam ){

	var com = new K.Component(p.html).setStyle({
		position : 'absolute',
		display : 'inline-block',
		width : isNaN(p.width) ? 'auto' : slider.measure(p.width) + 'px',
		height : 'auto',
		left : slider.measure(p.left) + 'px',
		top : slider.measure(p.top) + 'px',
		opacity : p.opacity
	})

	frame.addComponent( com );

	com.transit( transitParam, transitParam.dur || 600, function(){
		transitParam.complete && transitParam.complete( com );
	});
	return com;

}
