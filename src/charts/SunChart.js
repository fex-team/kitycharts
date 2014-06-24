(function(exports){

var fans = [];
function getFans( node ){
    if( node.children && node.children.length > 0 ){
        !node.hide && node.parent && fans.push( node );
        node.children.forEach(function(n, i){
            getFans( n );
        });
    }else{
        !node.hide && node.parent && fans.push( node );
    }
    return fans;
}

function getParents( node, callback ){
    var tmp = node;
    tmp && tmp.shape && callback && callback( tmp );
    while( tmp.parent ){
        tmp = tmp.parent;
        tmp && tmp.shape && callback && callback( tmp );
    }
}

var SunChart = kc.SunChart = kity.createClass( 'SunChart', {
    base : kc.Chart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        this.config = this.param;
        this.setData( new kc.SunData() );

        this.fans = this.addElement( 'fans', new kc.ElementList() );
    },

    update : function( param ){
        this.param = kity.Utils.extend( this.param, param );
        this.setBlurColor();
        var self = this;
        var data = this.data.format();

        if( data ){
            this.paramList = [];
            this.nodeList = [];
            var inner = this.param.inner || 30, outer = this.param.outer || 60, increment = this.param.increment || 30;
            fans = [];
            var self = this;
            getFans( data ).forEach(function( node, i ){
                var pieAngle = node.weight * 360;
                if(pieAngle < 0.5){
                    return;
                }

                var depth = node.depth - 1;
                self.paramList.push({
                    labelText: null,
                    labelPosition: 'none',

                    connectLineWidth: 0,

                    innerRadius : depth == 0 ? inner : (outer  + ( depth - 1 ) * increment),
                    outerRadius : outer + increment * depth,
                    startAngle : node.weightStart * 360,
                    pieAngle: pieAngle,

                    strokeWidth : 1,
                    strokeColor : "#FFF",

                    color: self.getColor( node.name ),

                    x : self.param.center.x,
                    y : self.param.center.y,

                });

                self.nodeList.push( node );

            });

            if( this.paramList.length < 50 ){
                this.updateFans( this.paramList, true );
            }
            
            this.updateFans( this.paramList, false );
            this.bindData();
            this.bindAction();

        }

    },

    updateFans : function( list, anim ){
        this.fans.update({
            elementClass : kc.Pie,
            list : list,
            fx : anim
        });
    },

    getColor : function( name ){
        return this.config.color[ name ] || this.config.defaultColor || "#808080";
    },

    getDefaultColor : function(){
        return this.config.defaultColor || "#808080";
    },

    bindData : function(){
        var self = this;
        this.fans.getElementList().forEach(function( shape, i ){
            self.nodeList[ i ].shape = shape;
            shape.dataNode = self.nodeList[ i ];
        });
    },

    bindAction : function(){
        var self = this;
        this.fans.getElementList().forEach(function( shape, i ){
            shape.on('mouseover', function( ev ){
                var dataNode = self.nodeList[ i ];
                var ancestors = self.focus( dataNode );
                self.config.onHover && self.config.onHover( ancestors.reverse() );
            });

            shape.on('mouseout', function( ev ){
                self.blur();
            });
        });
    },

    setBlurColor : function(){
        var colors = this.config.color;
        var name, color, light;
        this.blurColors = {};
        for( name in colors ){
            this.blurColors[ name ] = blurColor( this.getColor( name ) );
        }

        this.blurDefaultColors = blurColor( this.getDefaultColor() );

        function blurColor( c ){
            var color = new kity.Color( c );
            color.set('a', 0.5 );
            return color.toRGBA();
        }
    },

    focus : function( dataNode ){
        var self = this;
        var ancestors = [];
        var nodes = [];
        getParents( dataNode, function( node ){
            ancestors.push( node.shape );
            nodes.push( node );
        });

        var colorList = this.fans.getElementList().map(function( fan, i ){
            var color = self.blurColors[ self.nodeList[ i ].name ] || self.blurDefaultColors;
            if( ~ancestors.indexOf( fan ) ){
               color = fan.param.color;
            }
            return {
                color : color
            };
        });

        this.updateFans( colorList, false );
        return nodes;
    },

    blur : function(){
        var self = this;
        var colorList = this.fans.getElementList().map(function( fan, i ){
            var color = self.getColor( self.nodeList[ i ].name );
            return {
                color : color
            };
        });

        this.updateFans( colorList, false );
    }

} );


})( window );