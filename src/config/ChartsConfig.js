kc.ChartsConfig = (function(){

    var _configs = {};

    function add( key, val ){
        _configs[key] = val;
    }

    function remove( key ){
        delete _configs[key];
    }

    function init( type ){
        var base = kity.Utils.copy(_configs.base), mix;

        if( type in _configs ){
            mix = kity.Utils.deepExtend( base, _configs[ type ] );
        }

        return  mix;
    }

    return {
        add : add,
        init : init
    }

})();