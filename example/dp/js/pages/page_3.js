/*
 *	page 3
 */

(function(){

	var slider = window.slider;
	var page = slider.addPage(new K.Page());
	page.setBg('#f2f2f2');

	// 标题
	addFrame( page, function(){
		slider.setBg(page.getBg());
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

		addHTML(this, {
			html : '<div class="desc">各浏览器份额保持<span class="red">稳定</span>，Chrome略有<span class="red">下降</span></div>',
			left : 90,
			top : 150,
			opacity : 0
		}, {
			// x : -50,
			opacity : 1
		});

		addImage(this, {
			src : 'page3-computer',
			width : 148,
			left : 680,
			top : 125,
			opacity : 0
		}, {
			opacity : 1,
		}, addChrome);

		function addChrome( com ){
			addImageAttach( com, {
				src : 'chrome',
				width : 50,
				left : 41,
				top : 18,
				opacity : 0
			}, {
				opacity : 1
			}).addClass('rotate');
		}

		addHTML(this, {
			html : '<div class="no1chrome">No.1 Chrome</div>',
			left : 680,
			top : 100,
			opacity : 0
		}, {
			opacity : 1,
			delay : 600
		});

	});

	// pie
	addFrame( page, function(){

		addIFrame(this, {
			src : 'page3-pie',
			width : 400,
			height : 306,
			left : 70,
			top : 370,
			opacity : 0
		}, {
			opacity : 1,
			x : -50
		});

	});

	//stacked
	addFrame( page, function(){

		addHTML(this, {
			html : '<div class="chart-title">浏览器变化趋势</div>',
			left : 660,
			top : 330,
			opacity : 0
		}, {
			opacity : 1,
			delay : 600
		});

		addIFrame(this, {
			src : 'page3-area',
			width : 530,
			height : 340,
			left : 520,
			top : 350,
			opacity : 0
		}, {
			opacity : 1,
			x : -50
		});

	});

})();