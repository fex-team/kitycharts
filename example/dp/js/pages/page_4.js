/*
 *	page 4
 */

(function(){

	var slider = window.slider;
	var page = slider.addPage(new K.Page());

	// 标题
	addFrame( page, function(){

		addImage(this, {
			src : 'page3-title',
			width : 264,
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
			html : '<div class="desc">Firefox<span class="red">下降</span>明显，Safari略有<span class="red">上升</span></div>',
			left : 140,
			top : top,
			opacity : 0
		}, {
			x : -50,
			opacity : 1
		});

		addHTML(this, {
			html : '<div class="desc">IE8在IE中份额<span class="red">最大</span>，IE6仅为<span class="red">4%</span></div>',
			left : 140,
			top : top + lineHeight,
			opacity : 0
		}, {
			x : -50,
			delay : delay,
			opacity : 1
		});

		addHTML(this, {
			html : '<div class="desc">Firefox<span class="red">下降</span>明显，Safari略有<span class="red">上升</span></div>',
			left : 140,
			top : top + lineHeight*2,
			opacity : 0
		}, {
			x : -50,
			delay : delay*2,
			opacity : 1
		});

	});

	// pie
	addFrame( page, function(){

		addIFrame(this, {
			src : 'page4-area-1',
			width : 400,
			height : 327,
			left : 90,
			top : 400,
			opacity : 0
		}, {
			opacity : 1,
			x : -50
		});

	});

	//stacked
	addFrame( page, function(){

		addIFrame(this, {
			src : 'page4-area-2',
			width : 530,
			height : 337,
			left : 520,
			top : 380,
			opacity : 0
		}, {
			opacity : 1,
			x : -50
		});

	});

})();