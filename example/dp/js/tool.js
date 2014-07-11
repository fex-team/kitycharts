function processParam( param ){
	var arr = ['width', 'height', 'left', 'top', 'right', 'bottom'];
	for(var i in param){
		if( arr.indexOf( i ) >= 0 ){
			param[i] = slider.measure( parseInt(param[i]) ) + 'px';
		}
	}
	param.position = param.position || 'absolute';
	return param;
}

function addFrame( page, frameAction ) {
    var frame = new K.Frame();
    frame.setAction(frameAction).addToTimeline();
    page.addFrame(frame);
}

function addComponent( frame, com, transitParam, callback ){
	frame.addComponent( com );
	var transitParam = processParam( transitParam );

	transitCall( com, transitParam, callback );
}

function transitCall( com, transitParam, callback ){
	com.transit( transitParam, transitParam.dur || 600, function(){
		if( com.isRemoved() ){
			return;
		}
		callback && callback( com );
	} );
}


function addIFrame( frame, p, transitParam, callback ){
	var com = new K.Component('<iframe scrolling="no" class="iframe" src="charts/' + p.src + '.html"></iframe>');
	var p = processParam( p );

	var transitParam = processParam( transitParam );

	com.getElement()[0].onload = function(){
		com.setStyle(p);	
		transitCall( com, transitParam, callback );
	};

	frame.addComponent( com );
	return com;
}

function addImage( frame, p, transitParam, callback ){
	var p = processParam(p);
	var com = new K.Component('<img src="img/' + p.src + '.png" />').setStyle(p);

	addComponent( frame, com, transitParam, callback );
	return com;
}

function addImageAttach( com, p, transitParam, callback ){
	var p = processParam(p);

	var attach = $('<img src="img/' + p.src + '.png" />').css(p);

	var att = com.attach( attach );

	var transitParam = processParam( transitParam );
	attach.transit( transitParam, transitParam.dur || 600, function(){
		if( $(att).parent().length == 0 ){
			return;
		}
		callback && callback( attach );
	} );

	return attach;
}

function addHTML( frame, p, transitParam, callback ){

	var p = processParam(p);

	var com = new K.Component(p.html).setStyle(p);

	frame.addComponent( com );

	var transitParam = processParam( transitParam );
	transitCall( com, transitParam, callback );

	return com;

}
