
updateCircle : function( data ){
    var l = this.circleArr && this.circleArr.length;
    if( l && l > 0 ){
        for (var i = 0; i < l; i++) {
            this.circleArr.pop().remove();
        }
    }

    this.circleArr = [];
    var i, circle, style = this.config.interaction.circle, series = data.series[ this.chartType ];
    for (var i = 0; i < series.length; i++) {
        circle = new kity.Circle(style.radius, -20, -20);
        circle.lineData = series[i];
        
        var pen = new kity.Pen();
        pen.setWidth( style.stroke.width );
        pen.setColor( style.stroke.color );

        circle.fill( series[i].color || this.config.color[i] || this.config.finalColor );
        circle.stroke( pen );

        this.circleArr.push( circle );
    }
    this.canvas.addShapes( this.circleArr );
},

hideCircle : function(circle){
    circle.setCenter(-100, -100);
},



bindAction : function(){
        var self = this;
        this.currentIndex = 0;

        this.paper.on( 'mousemove', function (ev) {
            var oxy = self.coordinate;
            if(!oxy) return;

            var param = oxy.param,
                data = self.formattedData;
            var oev = ev.originEvent;
            var x = oev.offsetX;
            var y = oev.offsetY;
            var i, l = self.circleArr.length;
            
            var reuslt = oxy.xRuler.leanTo( x - oxy.param.margin.left, 'map' );

            var maxLength = 0;
            var lenArr = [], tmpL, series = data.series.line;
            for (i = 0; i < series.length; i++) {
                tmpL = series[i].positions.length;
                if( tmpL > maxLength ){
                    maxLength = tmpL;
                }
            }

            if( !reuslt || reuslt.index > maxLength ) return;

            var pX = reuslt.value + oxy.param.margin.left;

            var pY = 0;
            var index = reuslt.index, tmpPos;

            for (i = 0; i < self.circleArr.length; i++) {
                tmpPos = series[i].positions[index];
                if(tmpPos){
                    pY = tmpPos[1];
                    self.circleArr[i].setCenter(pX, pY);
                }else{
                    self.circleArr[i].setCenter(-100, -100);
                }

            }

            // self.updateIndicatrix(pX, oxy.param.height + oxy.param.margin.top);

            self.currentIndex = index;

            if( self.param.onCircleHover){
                var info = {
                    posX : pX,
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.margin.left,
                    marginTop : oxy.param.margin.top,
                    data : data
                };
                self.param.onCircleHover( info );
            }
        } );

        this.paper.on('click', function(ev){
            var oxy = self.coordinate;
            if(!oxy) return;

            if( self.param.onCircleClick && (ev.targetShape.lineData || Math.abs(self.indicatrix.param.x1 - ev.originEvent.offsetX) < 10) ){
                var target = ev.targetShape,
                    index = self.currentIndex,
                    indicatrixParam = self.indicatrix.param;

                var info = {
                    circle : target,
                    lineData : target.lineData,
                    position : target.getCenter ? target.getCenter() : { x: indicatrixParam.x1, y: oxy.param.height/2 },
                    label : oxy.getXLabels()[ index ],
                    index : index,
                    marginLeft : oxy.param.margin.left,
                    marginTop : oxy.param.margin.top,
                    data : self.formattedData
                };

                if( target.lineData ){
                    info.value = target.lineData.values[ index ];
                }

                self.param.onCircleClick( info );
            }
        });
    },