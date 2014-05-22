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
        this.tip = this.addElement( 'tip', new kc.Tooltip( {
            background: '#f39488',
            color: 'white',
            at: 'up',
            content: '',
            padding: [ 2, 10, 2, 10 ],
            anchorSize: 4
        } ) );
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
                list.push({
                    x : node.x,
                    y : node.y,
                    width : node.dx,
                    height : node.dy,
                    color : '#9CCDEE',
                    labelText : node.name,
                    labelColor : '#888',
                    strokeWidth : 1,
                    strokeColor : '#FFF',
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
        this.paper.on( 'mousemove', function(ev){
            var data = ev.targetShape.container.bind;
            if( data ){
                console.log(data);


                self.tip.setVisible( true )
                    .update( {
                        content: {
                            text: 'dsdsd',
                            color: 'white'
                        }
                    } )
                    .animate( {
                        x: 250,
                        y: 300
                    } );


            }
            
        });
    }

} );


})( window );