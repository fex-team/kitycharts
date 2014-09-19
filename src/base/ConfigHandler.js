var ConfigHandler = kc.ConfigHandler = kity.createClass( 'ConfigHandler', {

    constructor: function ( config ) {
        // this.config = config || {};
    },

    getConfig: function () {
        return this.config;
    },

    /*
     * path形式为"plotOptions.label.text", 即访问this.config.plotOptions.label.text
     */
    getOption: function ( path ) {
        return kity.Utils.queryPath( path, this.config );
    },

    setConfig : function( config ){
        this.config = config;
    },

    /*
     * path同getOption参数path
     */
    setOption: function ( path, value ) {
        if( path.indexOf('series') >= 0 ){
            console.log('该接口不支持设置series');
            return;
        }

        var arr = path.split('.');
        arr.unshift('config');
        var  i = 1, p, cur, exp;

        while(i < arr.length){
            cur = arr[i];
            p = getPath( i-1, arr );
            if( !eval('"' + cur + '" in this.' + p ) ){ //属性不存在
                exp = 'this.' + p + '.' + cur + ' = ' + (i == arr.length-1 ? 'value' : '{}');
                eval( exp );
            }else{ //属性存在
                if( i == arr.length-1 ){
                    exp = 'this.' + p + '.' + cur + ' = value';
                    eval( exp );
                }
            }

            i++
        }

        function getPath( index, arr ){
            var p = [];
            for(var i=0; i<=index; i++){
                p.push( arr[i] );
            }
            return p.join('.');
        }


    }

} );