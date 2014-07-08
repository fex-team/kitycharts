/*
 *	page 3
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

		addImage(this, {
			src : 'page3-desc1',
			width : 362,
			left : 90,
			top : 150,
			opacity : 0
		}, {
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
			src : 'page3-area',
			width : 530,
			height : 340,
			left : 520,
			top : 380,
			opacity : 0
		}, {
			opacity : 1,
			x : -50
		});

	});

})();