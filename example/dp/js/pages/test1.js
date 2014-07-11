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
			opacity : 1,
			x:10
		});
		addHTML(this, {
			html : '<div class="no1chrome" style="color:#000;font-size:25px;">step 2</div>',
			left : 85,
			top : 65,
		}, {});

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
			opacity : 1,
			x:10
		});

		addImage(this, {
			src : 'page3-computer',
			width : 148,
			left : 680,
			top : 125,
			opacity : 0
		}, {
			opacity : 1,
			x:10
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

		addHTML(this, {
			html : '<div class="no1chrome" style="color:#000;font-size:25px;">step 3</div>',
			left : 680,
			top : 80,
		}, {});

	});

	// pie
	// addFrame( page, function(){


	// });

	//stacked
	// addFrame( page, function(){

	// });

})();