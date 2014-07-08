/*
 *	封面图 slider - 1
 */

(function(){

	var slider = window.slider;
	var page = slider.addPage(new K.Page());

	// 背景色
	addFrame( page, function(){
		slider.setBg('#ef5363');

		var com = new K.Component('<div></div>').setStyle({
			width : '100%',
			height : '100%',
			backgroundColor : '#ef5363'
		})

		this.addComponent( com );

	});

	// 彩条 & 标题
	addFrame( page, function(){

		var com = new K.Component('<img src="img/caitiao.png" />').setStyle({
			position : 'absolute',
			display : 'inline-block',
			marginLeft : slider.measure(-400) + 'px',
			width : slider.measure(800) + 'px',
			height : 'auto',
			top : slider.measure(100) + 'px',
			left : '50%'
		});

		this.addComponent( com );

		com.transit({
			opacity : 1,
			y : slider.measure(150)
		}, 600);


		var attach = $('<img src="img/title.png" />').css({
			position : 'absolute',
			display : 'inline-block',
			marginLeft : slider.measure(-300) + 'px',
			width : slider.measure(600) + 'px',
			height : 'auto',
			top : slider.measure(12) + 'px',
			left : '50%'
		});

		attach.transit({
			y : slider.measure(300)
		}, 0);

		com.attach( attach );

		attach.transit({
			y : slider.measure(150)
		}, 600);

	});

	// 背景色
	addFrame( page, function(){

		var com = new K.Component('<img src="img/date.png" />').setStyle({

			position : 'absolute',
			display : 'inline-block',
			marginLeft : slider.measure(-100) + 'px',
			width : slider.measure(200) + 'px',
			height : 'auto',
			top : slider.measure(380) + 'px',
			left : '50%',
			opacity : 0

		})

		this.addComponent( com );

		com.transit({
			opacity : 1
		}, 600);

	});

})();