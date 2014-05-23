var ChinaMapData = kc.MapData = kity.createClass('ChinaMapData', {
    base: kc.Data,

    format: function() {
        var origin = this.origin;
        return origin;
    }
});

var ChinaMapChart = kc.MapChart = kity.createClass('ChinaMapChart', {
    base: kc.Chart,

    constructor: function (target, param) {
        this.callBase(target, kity.Utils.extend({
            width: 600,
            height: 600,
            baseColor: 'blue'
        }, param));

        this.addElement('map', new kc.Map({
            width: this.param.width,
            height: this.param.height
        }));
    },

    update: function() {
        var param = this.param;
        var china = this.data.format();
        var has = 'hasOwnProperty';
        var map = this.getElement('map');
        var baseColor = new kity.Color(param.baseColor).set('s', 0);
        var block;

        map.update({
            width: param.width,
            height: param.height,
            blocks: {
                common: {   
                    color: baseColor
                }   
            }
        });

        for (var province in china) {
            if (china[has](province)) {
                block = map.getBlockById(province);
                block.animate({
                    color: baseColor.inc('s', china[province])
                });
            }
        }
    }
});