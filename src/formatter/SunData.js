kc.SunData = kity.createClass( 'SunData', (function(){

    function getPrevWeight( parent, index ){
        var sum = 0;
        for (var i = 0; i < index; i++) {
            sum += parent.children[ i ].weight;
        }
        return sum;
    }

    function setAttr( node ){
        if( !node.parent ){
            node.depth = 0;
            node.index = 0;
        }

        var sum = 0, func = arguments.callee;

        if( node.children && node.children.length > 0 ){

            if( node.value ){
                sum += node.value;
            }
            node.children.forEach(function( n, i ){
                n.parent = node;
                n.depth = node.depth + 1;
                n.index = i;
                
                if( !node.value ){
                    sum += func( n );
                }else{
                    func( n );
                }
            });

        }else{
            node.depth = node.parent.depth + 1;
            return node.value || 0;
        }

        node.value = node.value || sum;
        return sum;
    }

    function setWeight( node ){
        if( !node.parent ){
            node.weightStart = 0;
            node.weight = 1;
        }

        var func = arguments.callee, unitWeight = 0, prevWeight = 0;

        unitWeight = node.weight / node.value;

        if( node.children && node.children.length > 0 ){

            node.children.forEach(function( n, i ){
                prevWeight = getPrevWeight( node, i );
                n.weight = unitWeight * n.value;
                n.weightStart = n.parent.weightStart + prevWeight;
                
                func( n );
            });

        }

    }

    return {
        base: kc.Data,
        
        format: function () {
            var root = this.origin;

            if( !root.value && !root.children ){
                return null;
            }

            var sum = setAttr( root );
            setWeight( root );
            return root;
        }

    };

})() );