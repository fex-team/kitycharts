var ConfigHandler = kc.ConfigHandler = kity.createClass( 'ConfigHandler', {

    constructor: function ( config ) {
        // this.config = config || {};
    },

    getConfig: function () {
        return this.config;
    },

    getOption: function ( path ) {
        return kity.Utils.queryPath( path, this.config );
    },

    setOption: function ( path, value ) {
        eval( 'this.config.' + path + ' = value' );
    }

} );