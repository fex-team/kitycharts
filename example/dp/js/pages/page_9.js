/*
 *	page9
 */

(function(){

	var slider = window.slider;
	var page = slider.addPage(new K.Page());
	page.setBg('#8ed2d7');

	// 背景色
	addFrame( page, function(){
		slider.setBg(page.getBg());

		var com = new K.Component('<div></div>').setStyle({
			width : '100%',
			height : '100%',
			backgroundColor : '#8ed2d7'
		})

		this.addComponent( com );

		// 彩条 & 标题
		addImage(this, {
			src : 'page9-qrcode',
			width : 179,
			left : 180,
			top : 170,
			opacity : 0
		}, {
			y : 30,
			opacity : 1
		});

		addHTML(this, {
			html : '<div class="">FEX团队微信二维码</div>',
			left : 202,
			top : 420,
			opacity : 0
		}, {
			opacity : 1,
			y : -20
		});

	});

	// 背景色
	addFrame( page, function(){

		addHTML(this, {
			html : '<div class="page9-right"><div>出品:<a target="_blank" href="http://fex.baidu.com/">http://fex.baidu.com/</a></div><div class="right">数据:<a target="_blank" href="http://dp.baidu.com/">http://dp.baidu.com/</a></div></div>',
			left : 452,
			top : 178,
			opacity : 0
		}, {
			opacity : 1,
			y : 20
		});	

		addHTML(this, {
			html : '<div class="page9-cop"><div><div class="left">合作:</div><div class="right"><img width="140" src="img/page9-shushuo.png" /><a target="_blank" href="http://shushuo.baidu.com/">http://shushuo.baidu.com/</a><img class="ue" width="150" src="img/page9-ue.png" /><a target="_blank" href="http://shushuo.baidu.com/">http://ue.baidu.com/</a></div></div>',
			left : 452,
			top : 348,
			opacity : 0
		}, {
			opacity : 1,
			y : -20
		});	

	});

})();