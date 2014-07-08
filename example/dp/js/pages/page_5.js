/*
 *	page 5
 */

(function(){

	var slider = window.slider;
	var page = slider.addPage(new K.Page());

	// 标题
	addFrame( page, function(){

		addImage(this, {
			src : 'page5-title',
			width : 416,
			left : 85,
			top : 85,
			opacity : 0
		}, {
			opacity : 1
		});

	});

	// chrome
	addFrame( page, function(){

		var top = 143, lineHeight = 50, delay = 200;

		addHTML(this, {
			html : '<div class="desc">用户趋于使用高分辨率设备，有2%的提升</div>',
			left : 140,
			top : top,
			opacity : 0
		}, {
			x : -50,
			opacity : 1
		});

		addHTML(this, {
			html : '<div class="desc">用户更爱<span class="red">16:9</span> & <span class="red">16:10</span>屏，最喜欢<span class="red">1366*768</span>分辨率</div>',
			left : 140,
			top : top + lineHeight,
			opacity : 0
		}, {
			x : -50,
			delay : delay,
			opacity : 1
		});

	});

	// page5-chart-1
	addFrame( page, function(){

		addIFrame(this, {
			src : 'page5-column-1',
			width : 423,
			height : 260,
			left : 120,
			top : 292,
			opacity : 0
		}, {
			opacity : 1,
			x : -50
		});

	});

	// page5-chart-2
	addFrame( page, function(){

		addIFrame(this, {
			src : 'page5-line',
			width : 416,
			height : 221,
			left : 570,
			top : 300,
			opacity : 0
		}, {
			opacity : 1,
			x : -50
		});

	});

	// page5-chart-3
	addFrame( page, function(){

		addIFrame(this, {
			src : 'page5-column',
			width : 420,
			height : 200,
			left : 120,
			top : 580,
			opacity : 0
		}, {
			opacity : 1,
			x : -50
		});

	});

	// 标题
	addFrame( page, function(){

		addImage(this, {
			src : 'page5-people',
			width : 233,
			left : 630,
			top : 524,
			opacity : 0
		}, {
			opacity : 1
		}, addBubble);

		function addBubble( com ){
			addImageAttach( com, {
				src : 'page5-bubble',
				width : 63,
				left : 100,
				top : 0,
			}, {}).addClass('blink');
		}

	});

})();