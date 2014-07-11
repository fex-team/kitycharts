/*
 *	page 2
 */

(function(){

	var slider = window.slider;
	var page = slider.addPage(new K.Page());
	page.setBg('#f2f2f2');

	// 标题
	addFrame( page, function(){
		slider.setBg(page.getBg());
		var com = new K.Component('<img src="img/page2-title.png" />').setStyle({
			position : 'absolute',
			width : slider.measure(250) + 'px',
			height : 'auto',
			left : slider.measure(85) + 'px',
			top : slider.measure(85) + 'px',
			opacity : 0
		})

		this.addComponent( com );

		com.transit({
			opacity : 1
		}, 600);

	});

	var computersMarginLeft = 20,
		computersWidth = 235,
		moveX = 50,
		screemZIndex = 1,
		passTop = 200;

	function addComputer( frame, left, moveX, callback ){

		var com = addImage( frame, {
			src : 'computer',
			width : 162,
			left : left,
			top : 260,
			opacity : 0
		}, {
			opacity : 1,
			x : moveX
		}, callback );

		return com;
	}


	function addScreen( com, src, width, top, left, dur, callback ){

		var attach = addImageAttach( com, {
			src : src,
			position : 'absolute',
			display : 'inline-block',
			width : width,
			height : 'auto',
			top : top,
			left : left,
			opacity : 0,
			zIndex : screemZIndex++,
			dur : dur
		}, {
			opacity : 1
		}, callback );
		return attach;
	}

	function addPass( frame, width ){
		addImage(frame, {
			src : 'page2-pass',
			width : 60,
			height : 333,
			left : computersMarginLeft + width - 10,
			top : passTop,
			opacity : 0
		}, {
			opacity : 1,
			delay : 600
		});
	}

	function addPassText( frame, text, className, left, top ){
		addHTML(frame, {
			html : '<div class="' + className + '">' + text + '</div>',
			left : left,
			top : top,
			opacity : 0
		}, {
			opacity : 1,
			delay : 600
		});

	}

	function addClockContainer(frame, id, left, time){
		addHTML(frame, {
			html : '<div id="'+id+'" class="page2-clock"></div>',
			width: 60,
			height : 60,
			left : left,
			top : 490,
			opacity : 0
		}, {
			opacity : 1,
			// delay : 600
		}, function(){

			addClock( id, time );

		});
	}

	function addClock(id, time){
		var colors = ['#f2bd3d'];
		var d = {
			list:[ {
	            x: 50,
	            y: 50,
	            circle: 1,//长针转一圈代表的数值
	            target: time,//目标数值
	            total: 4,//整个表盘刻度代表的数值
	            duraction: 600//完成刻度所需的时间
	        } ]
		};

		var clock = new kc.ClockChart(id,{
			colors : colors
		});

		clock.canvas.setScale(0.5);

		clock.getData().update(d);
	}

	// computer 1
	addFrame( page, function(){

		addComputer( this, computersMarginLeft, moveX );

		addPass( this, computersWidth );

		addPassText( this, '屏幕开始有内容', 'page2-desc-blue', 205, 170 );
		addPassText( this, '平均等待时间: 1s', 'page2-desc-black', 205, 550 );	

		addClockContainer(this, 'page2-clock-1', 245, 1);
	});

	// computer 2
	addFrame( page, function(){

		var com = addComputer( this, computersMarginLeft + computersWidth, moveX, function(){
			addScreen( com, 'screen-1', 70, 12, 76, 300 );
		} );

		addPass( this, computersWidth * 2 );

		addPassText( this, '首屏所有内容显示完毕', 'page2-desc-blue', 405, 170 );
		addPassText( this, '平均等待时间: 2s', 'page2-desc-black', 435, 550 );

		addClockContainer(this, 'page2-clock-2', 482, 2);

	});

	// computer 3
	addFrame( page, function(){

		var com = addComputer( this, computersMarginLeft + computersWidth * 2, moveX, function(){
			addScreen( com, 'screen-1', 70, 12, 76, 0, function(){
				var att = addScreen( com, 'screen-2', 34, 12, 150, 600, function(){
					if( att.parent().length == 0 ){
						$(att).remove();
					}
				} );
			});
		} );

		addPass( this, computersWidth * 3 );

		addPassText( this, '鼠标可点击', 'page2-desc-blue', 685, 170 );
		addPassText( this, '平均等待时间: 2.2s', 'page2-desc-black', 675, 550 );

		addClockContainer(this, 'page2-clock-3', 717, 2.2);

	});

	// computer 4
	addFrame( page, function(){

		var com = addComputer( this, computersMarginLeft + computersWidth * 3, moveX, function(){
			addScreen( com, 'screen-1', 70, 12, 76, 0, function(){
				addScreen( com, 'screen-2', 34, 12, 150, 0, function(){
					var attach = addScreen( com, 'click', 50, 14, 100, 0);
					attach.addClass('blink');
				});
			});
		} );


	});

})();