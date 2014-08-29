(function(exports){

var rects = [];
function getRects( node ){
    if( node.children && node.children.length > 0 ){
        node.children.forEach(function(n, i){
            getRects( n );
        });
    }else{
        rects.push( node );
    }
    return rects;
}

function getParents( node, callback ){
    var tmp = node;
    callback && callback( tmp );
    while( tmp.parent ){
        tmp = tmp.parent;
        callback && callback( tmp );
    }
}

var Treemap = exports.Treemap = kc.Treemap = kity.createClass( 'Treemap', {
    base : kc.Chart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        this.setData( new kc.TreemapData( param ) );
        this.rects = this.addElement( 'rects', new kc.ElementList() );

        this.tip = this.addElement( 'tip', a = new kc.Tooltip( {
            background: '#FFF',
            at: 'up',
            padding: [ 10, 20, 10, 20 ],
            borderRadius : 3,
            anchorSize: 4
        } ) );

        // var filter = new kity.ProjectionFilter( 2, 1, 1 );
        // filter.setColor( "rgba( 0, 0, 0, 0.3 )" );
        // this.paper.addResource( filter );
        // this.tip.canvas.applyFilter( filter );

        this._bindAction();
    },

    update : function( param ){

        this.param = kity.Utils.extend( this.param, param )

        var data = this.data.format( this.param.width, this.param.height, this.param.mode || 'squarify' );
        
        if( data ){
            var list = [];
            rects = [];
            getRects( data ).forEach(function( node, i ){
                var str = [];
                getParents( node, function( n ){
                    str.push( n.name );
                } )
                str = str.reverse().join(' > ');

                var color = new kity.Color(255, 204, 191);
                color.set('h', node.parent.weightStart * 200);
                color.set('s', 80);
                color.set('l', 75);

                list.push({
                    x : node.x,
                    y : node.y,
                    width : node.dx,
                    height : node.dy,
                    color : color,
                    labelText : node.name,
                    labelColor : '#000',
                    strokeWidth : 1,
                    strokeColor : '#FFF',
                    labelX : node.dx/2,
                    labelY : node.dy/2,
                    bind : str
                });
            });

            this.rects.update({
                elementClass : kc.Rectage,
                list : list,
                fx : true
            });

        }

    },

    _bindAction : function(){
        var self = this;
        var prev, rect, timer;
        this.on( 'mousemove', function(ev){

            clearTimeout( timer );

            timer = setTimeout(function(){
                var rect = ev.getTargetChartElement();
                rect = rect.text ? rect.container : rect;
                var data = rect.getBindData();
                if( data ){

                    if( prev == rect ){
                        return;
                    }

                    prev = rect;

                    var fontSize = rect.label.direction == 'horizon' ?  rect.label.text.getHeight() : rect.label.text.getWidth();

                    self.tip
                        .setVisible( true )
                        .update( {
                            content: {
                                text: data,
                                color: '#555'
                            }
                        } );


                    var rectPos = rect.getPosition();
                    var rectSize = rect.getSize();
                    var rectCenter = {
                        x : rectPos.x + rectSize.width / 2,
                        y : rectPos.y + rectSize.height / 2
                    };

                    var paperWidth = self.paper.getWidth() || self.paper.node.getClientRects()[0].width;

                    var tipPos = self.tip.getPosition();
                    var tipSize = self.tip.getSize();

                    var at = 'up';
                    var posX = 0, posY = 0;
                    var gap = fontSize,
                        tipHalfWidth = tipSize.width / 2,
                        tipHalfHeight = tipSize.height / 2;

                    posY = rectCenter.y - tipHalfHeight - gap;

                    if( rectCenter.x + tipHalfWidth > paperWidth ){
                        at = 'left';
                        posX = rectCenter.x - tipHalfWidth - gap;
                        posY = rectCenter.y;
                    }else if( rectCenter.x - tipHalfWidth < 0 ){
                        at = 'right';
                        posX = rectCenter.x + tipHalfWidth + gap;
                        posY = rectCenter.y;
                    }else{
                        posX = rectCenter.x;
                    }

                    if( rectCenter.y - tipHalfHeight - gap < 0 && rectCenter.x + tipHalfWidth <= paperWidth && rectCenter.x - tipHalfWidth >= 0 ){
                        at = 'down';
                        posY = rectCenter.y + tipHalfHeight + gap;
                    }

                    self.tip
                        .update({
                            at : at
                        }).animate({
                            x: posX,
                            y: posY
                        }, 200);
                }
            }, 100);

            
        });
    }

} );


})( window );