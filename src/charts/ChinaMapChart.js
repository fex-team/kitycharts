var ChinaMapData = kc.ChinaMapData = kity.createClass('ChinaMapData', {
    base: kc.Data,

    format: function() {
        var origin = this.origin;

        var hasVal = function( entry ){
            return ('value' in entry) && kity.Utils.isNumber( entry.value );
        }

        var arr = [];
        for( var i in origin ){
            hasVal( origin[ i ] ) && arr.push( origin[ i ].value );
        }

        var max = Math.max.apply( {}, arr ),
            min = Math.min.apply( {}, arr ),
            dur = max - min;

        var t,
            range = 0.999999;

        for( i in origin ){
            t = origin[ i ];
            if( hasVal( origin[ i ] ) )
                t.mapVal = ( t.value - min ) / dur * range;
        }   

        return origin;
    }
});

var ChinaMapChart = kc.ChinaMapChart = kity.createClass('ChinaMapChart', {
    base: kc.Chart,

    constructor: function (target, param) {
        this.callBase(target, kity.Utils.extend({
            width: 600,
            height: 600,
            minColor: 'blue',
            maxColor: 'red'
        }, param));

        this.setData( new kc.ChinaMapData() );

        this.addElement('map', new kc.Map({
            width: this.param.width,
            height: this.param.height
        }, kc.Map.CHINA));
    },

    updateChart: function(param, data) {
        var has = 'hasOwnProperty';
        var map = this.getElement('map');

        var data = this.data.format();

        var colors = param.colors.map(kity.Color.parse),
            tweenColor = function (t) {
                var index = t * (colors.length - 1) | 0;
                var v = colors[index].valueOf(),
                    vv = colors[index + 1].valueOf();

                var tRange = 1 / (colors.length - 1);
                var tSkiped = index * tRange;

                t = (t - tSkiped) / tRange;
                
                return new kity.Color.createHSLA(
                    v.h + (vv.h - v.h) * t,
                    v.s + (vv.s - v.s) * t,
                    v.l + (vv.l - v.l) * t,
                    v.a + (vv.a - v.a) * t);
            };

        var getColor = function( val ){

        };

        var block, defaultColor;

        defaultColor = param.defaultColor && new kity.Color(param.defaultColor) || colors[0];

        map.update({
            width: param.width,
            height: param.height
        });

        var china = kc.Map.CHINA.blocks;

        for (var province in china) {
            block = map.findBlockById(province);
            if (!block) continue;

            var pro = data[province];
            var color = pro.color ? kity.Color.parse(pro.color) : data[province].mapVal ? tweenColor(data[province].mapVal) : defaultColor ;

            block.animate({
                color: color
            });
        }

        this.paper.setWidth(map.renderWidth).setHeight(map.renderHeight);
    },

    getMap: function() {
        return this.getElement('map');
    },

    addOverlay: function(lng, lat, element) {
        var pos = this.getMap().geoToPoint(lng, lat);
        this.addElement(element);
        element.update({
            x: pos.x,
            y: pos.y
        });
        return element;
    }
    
});