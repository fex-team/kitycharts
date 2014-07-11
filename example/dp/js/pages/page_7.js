/*
 *	page 7
 */

(function(){

	var slider = window.slider;
	var page = slider.addPage(new K.Page());
	page.setBg('#f2f2f2');

	// 标题
	addFrame( page, function(){
		slider.setBg(page.getBg());
		addImage(this, {
			src : 'page7-title',
			width : 307,
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
			html : '<div class="desc"><span class="red">广东</span>用户最喜欢访问百度的产品，用户主要集中在<span class="red">华北、华东</span>和<span class="red">华南</span></div>',
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

		addIFrame(this, {
			src : 'page7-map',
			width : 512,
			height : 445,
			left : 116,
			top : 270,
			opacity : 0
		}, {
			opacity : 1,
			x : -50
		});

		addIFrame(this, {
			src : 'page7-bar',
			width : 499,
			height : 357,
			left : 562,
			top : 258,
			opacity : 0
		}, {
			opacity : 1,
			x : -50
		});

	});


})();