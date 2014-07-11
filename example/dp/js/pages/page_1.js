/*
 *	封面图 slider - 1
 */

(function(){

	var slider = window.slider;
	var page = slider.addPage(new K.Page());

	// 背景色
	addFrame( page, function(){
		slider.setBg('#ef5363');

		addHTML(this, {
			html : '<div style="width:100%;height:100%;background-color:#ef5363"></div>',
			width : 1024,
			height : 768
		}, {});

	});

	// 彩条 & 标题
	addFrame( page, function(){

		addImage(this, {
			src : 'caitiao',
			width : 800,
			left : 112,
			top : 100
		}, {
			y : 150,
		});

		addImage(this, {
			src : 'title',
			width : 600,
			left : 212,
			top : 412
		}, {
			y : -150
		});

	});

	// 日期
	addFrame( page, function(){

		addImage(this, {
			src : 'date',
			width : 200,
			left : 412,
			top : 380,
			opacity : 0
		}, {
			opacity : 1
		});

	});

})();