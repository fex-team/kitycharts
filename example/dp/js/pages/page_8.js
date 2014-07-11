/*
 *	page 8
 */

(function(){

	var slider = window.slider;
	var page = slider.addPage(new K.Page());
	page.setBg('#f2f2f2');

	// 标题
	addFrame( page, function(){
		slider.setBg(page.getBg());
		addImage(this, {
			src : 'page8-title',
			width : 495,
			left : 85,
			top : 85,
			opacity : 0
		}, {
			opacity : 1
		});

	});

	// desc
	addFrame( page, function(){

		addHTML(this, {
			html : '<div class="desc"><span class="red">LocalStorage</span>支持度高达97%</div>',
			left : 140,
			top : 143,
			opacity : 0
		}, {
			x : -50,
			opacity : 1
		});
	});
	
	var dTop = 200,
		dMoveY = 50,
		dWidth = 250,
		dMLeft = (slider.STATIC_WIDTH - dWidth*4)/2,
		lTop = 530,
		lMoveY = -30,
		delay = 800;

	function donut( frame, src, left, delay ){

		addIFrame(frame, {
			src : src,
			width : dWidth,
			height : dWidth,
			left : left,
			top : dTop,
			opacity : 0
		}, {
			opacity : 1,
			delay : delay||0,
			y : dMoveY
		});
	}

	function label( frame, txt, left, delay ){

		addHTML(frame, {
			html : '<div class="page8-label">'+txt+'</div>',
			left : left,
			top : lTop,
			opacity : 0
		}, {
			y : lMoveY,
			delay : delay||0,
			opacity : 1
		});
	}

	// addFrame( page, function(){

	// 	donut( this, 'page8-donut-1', dMLeft, 0 );
	// 	label( this, 'LocalStorage', 70, 0 );

	// 	donut( this, 'page8-donut-2', dMLeft + dWidth, delay );
	// 	label( this, 'SVG', 370, delay );

	// 	donut( this, 'page8-donut-3', dMLeft + dWidth*2, delay*2 );
	// 	label( this, 'WebGL', 602, delay*2 );

	// 	donut( this, 'page8-donut-4', dMLeft + dWidth*3, delay*3 );
	// 	label( this, 'Canvas', 855, delay*3 );

	// });

	addFrame( page, function(){

		donut( this, 'page8-donut-1', dMLeft );
		label( this, 'LocalStorage', 70 );
		
	});

	addFrame( page, function(){

		donut( this, 'page8-donut-2', dMLeft + dWidth );
		label( this, 'SVG', 370 );

	});

	addFrame( page, function(){

		donut( this, 'page8-donut-4', dMLeft + dWidth*2 );
		label( this, 'WebGL', 602 );
		
	});

	addFrame( page, function(){

		donut( this, 'page8-donut-3', dMLeft + dWidth*3 );
		label( this, 'Canvas', 855 );
		
	});

})();