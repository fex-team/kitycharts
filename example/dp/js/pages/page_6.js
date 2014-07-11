/*
 *	page 6
 */

(function(){

	var slider = window.slider;
	var page = slider.addPage(new K.Page());
	page.setBg('#f2f2f2');

	// 标题
	addFrame( page, function(){
		slider.setBg(page.getBg());
		addImage(this, {
			src : 'page6-title',
			width : 303,
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
			html : '<div class="desc">用户最爱在<span class="red">19:00-21:00</span>点访问百度的产品&nbsp;&nbsp;&nbsp;<span class="red">24:00</span>点后仍有大量用户访问</div>',
			left : 140,
			top : top,
			opacity : 0
		}, {
			x : -50,
			delay : delay,
			opacity : 1
		});

	});

	// page5-chart-1
	addFrame( page, function(){

		addImage(this, {
			src : 'page6-day',
			width : 178,
			left : 268,
			top : 268,
			opacity : 0
		}, {
			opacity : 1,
			x : -50
		});

		addImage(this, {
			src : 'page6-clock-1',
			width : 60,
			height : 60,
			left : 230,
			top : 190,
			opacity : 0
		}, {
			opacity : 1,
			x : 50
		});

		addImage(this, {
			src : 'page6-night',
			width : 140,
			left : 620,
			top : 304,
			opacity : 0
		}, {
			opacity : 1,
			x : -50
		});

		addImage(this, {
			src : 'page6-clock-2',
			width : 60,
			height : 60,
			left : 557,
			top : 190,
			opacity : 0
		}, {
			opacity : 1,
			x : 50
		});

	});

	// page5-chart-2
	addFrame( page, function(){

		addIFrame(this, {
			src : 'page6-column',
			width : 598,
			height : 213,
			left : 206,
			top : 524,
			opacity : 0
		}, {
			opacity : 1
		});

	});

})();