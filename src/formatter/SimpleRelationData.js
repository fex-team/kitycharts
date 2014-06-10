kc.SimpleRelationData = kity.createClass( 'SimpleRelationData', {
    base: kc.Data,
    
    format: function () {
        var origin = this.origin;

        return {
        	nodes : origin.nodes || [],
        	edges : origin.edges || []
        };
    }
} );