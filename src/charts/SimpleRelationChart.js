(function(){

var SimpleRelationChart = kc.SimpleRelationChart = kity.createClass( 'SimpleRelationChart', {

    mixins : [ kc.ConfigHandler ],

    base: kc.Chart,

    constructor: function ( target, param ) {
        this.callBase( target, param );
        this.config = this.param || {};
        
        this.callMixin();

        this.setData( new kc.SimpleRelationData() );
        this.nodes = this.addElement( 'nodes', new kc.ElementList() );
        this.edges = this.addElement( 'edges', new kc.ElementList() );

    },

    update : function( param ){

        var data = this.data.format();
        this.config = kity.Utils.extend( this.config, data, param );
        this.renderRelation( data );
        this.getOption('legend.enabled') && this.addLegend();

    },

    renderNodes : function( data ){
        this.center = {
            x : this.paper.getWidth() / 2,
            y : this.paper.getHeight() / 2
        };

        var radius = this.config.distance || 200,
            count = data.nodes.length,
            PI = Math.PI,
            sin = Math.sin,
            cos = Math.cos;

        var i,
            piece = ( 2 * PI ) / count,
            delX = delY = 0, x, y,
            id, label, tmp, color;

        this.nodesParam = [];

        for( i = 0; i < count; i++ ){

            delX = cos( piece * i - PI/2 ) * radius;
            delY = sin( piece * i - PI/2 ) * radius;

            x = this.center.x + delX;
            y = this.center.y + delY;

            tmp = data.nodes[ i ];
            id = tmp.id;
            label = tmp.label;

             this.nodesParam.push({
                label: {
                    at: 'bottom',
                    color: 'black',
                    text: label
                },
                strokeColor : '#FFF',
                strokeWidth : 0,
                color : this.param.color[ i ],
                radius : this.config.radius || 30,
                fxEasing : 'easeOutElastic',
                x : x,
                y : y,
                bind : {
                    id : id,
                    label : label
                }
            });
        }

        this.nodes.update({
            elementClass : kc.CircleDot,
            list : this.nodesParam,
            fx : true
        });
    },

    getNodeParamById : function( id ){
        var nodes = this.nodesParam;
        for(var i = 0; i < nodes.length; i++ ){
            if( nodes[ i ].bind.id == id ){
                return nodes[ i ];
            }
        }
    },

    renderEdges : function( data ){
        this.edgesParam = [];
        var i, startNode, endNode, tmp, angle;
        var sin = Math.sin,
            cos = Math.cos,
            atan2 = Math.atan2;

        var gap = 10, color;

        for( i = 0; i < data.edges.length; i++){
            color = this.param.color[ i ];
            tmp = data.edges[ i ];
            startNode = this.getNodeParamById( tmp.from );
            endNode = this.getNodeParamById( tmp.to );

            angle = atan2( endNode.y - startNode.y, endNode.x - startNode.x );

            this.edgesParam.push({
                x1: startNode.x + cos(angle) * ( startNode.radius + gap ), 
                y1: startNode.y + sin(angle) * ( startNode.radius + gap ),
                x2: endNode.x - cos(angle) * ( endNode.radius + gap ),
                y2: endNode.y - sin(angle) * ( endNode.radius + gap ),
                offset: 5,
                color: startNode.color,
                width: 2,
                label: {
                    color: startNode.color,
                    text: tmp.label
                },
            });
        }

        this.edges.update({
            elementClass : kc.ArrowLine,
            list : this.edgesParam,
            fx : true
        });
    },

    renderRelation : function( data ){
        this.renderNodes( data );
        this.renderEdges( data );
    }

} );


})();