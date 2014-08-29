/**
 * 直角坐标系
 * @param {Array} dataSet
 *        要显示在坐标系上的数据集（每个元素需要 x, y 数据）
 *
 * @param {Number} width
 *        坐标系要渲染的宽度
 *
 * @param {Number} height
 *        坐标系要渲染的高度
 */
var CategoryCoordinate = kc.CategoryCoordinate = kity.createClass( "CategoryCoordinate", ( function () {
    function defaultFormat( number, index ){
        if ( number > 1000 ) {
            return number / 1000 + 'K';
        }

        var s = number.toString(), arr = s.split('.');
        if( arr.length > 1 && arr[1].length > 4 ){//4位以上小数
            return parseFloat(number.toFixed(4));//去掉小数点后无用的0
        }

        return number;
    }

    var arrowParam = {
        w: 0,
        h: 1,
        a: 7,
        b: 2,
        c: 3,
        d: 0,
        t: 0
    };

    var allComponents = [ "xMesh", "yMesh", "xCat", "yCat", "xAxis", "yAxis", "xAxisArrow", "yAxisArrow" ];

    var componentsIniter = {
        "xMesh" : function(){
            !this.getElement( 'xMesh') && this.addElement( 'xMesh', new kc.Mesh( {
                type: 'vertical'
            } ) );
        },
        "yMesh" : function(){
            !this.getElement( 'yMesh') && this.addElement( 'yMesh', new kc.Mesh( {
                type: 'horizon',
                dir: 1
            } ) );
        },
        "xCat" : function(){
            !this.getElement( 'xCat') && this.addElement( 'xCat', new kc.Categories( {
                at: 'bottom',
                rotate: this.param.xLabelRotate
            } ) );
        },
        "yCat" : function(){
            !this.getElement( 'yCat') && this.addElement( 'yCat', new kc.Categories( {
                at: 'left',
                rotate: this.param.yLabelRotate
            } ) );
        },
        "xAxis" : function(){
            !this.getElement( 'xAxis') && this.addElement( 'xAxis', new kc.Line( {
                color: '#999'
            } ) );
        },
        "yAxis" : function(){
            !this.getElement( 'yAxis') && this.addElement( 'yAxis', new kc.Line( {
                color: '#999'
            } ) );
        },
        "xAxisArrow" : function(){
            var tmp = new kity.Arrow( arrowParam ).fill( '#999' );
            tmp.canvas = tmp; //这里是hack，让chart可以添加kity对象，而不是chartelement
            !this.getElement('xAxisArrow') && this.addElement('xAxisArrow', tmp);
        },
        "yAxisArrow" : function(){
            var tmp = new kity.Arrow( arrowParam ).fill( '#999' );
            tmp.canvas = tmp; //这里是hack，让chart可以添加kity对象，而不是chartelement
            !this.getElement('yAxisArrow') && this.addElement('yAxisArrow', tmp);
        }
    };

    return {
        base: kc.Coordinate,
        constructor: function ( param ) {

            var mix = kity.Utils.extend({
                components : null,
                dataSet: [],
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 90,
                    left: 100
                },
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 0,
                    left: 0
                },

                unitX: null,
                unitY: null,
                meshX: true,
                meshY: true,
                formatX: null,
                formatY: null,
                rangeX: [ 0, 100 ],
                rangeY: [ 0, 100 ],
                minX: null,
                minY: null,
                xLabelsAt: null,
                yLabelsAt: null,
                labelMargin: 10,
                xAxisArrow: null,
                yAxisArrow: null,
                xLabelRotate: 0,
                yLabelRotate: 0,
                xLabelFont : null,
                yLabelFont : null,
                xAxisStyle : null,
                yAxisStyle : null,
                xMeshStyle : null,
                yMeshStyle : null
            }, param );

            this.callBase( mix );

            this._initRulers();

        },
        _initRulers: function () {
            this.xRuler = new kc.Ruler();
            this.yRuler = new kc.Ruler();
        },
        _initElements: function (components){
            components = ( !components )? allComponents : components;
            this._processComponents( components );
        },
        registerUpdateRules: function () {
            return kity.Utils.extend( this.callBase(), {
                'updateAll': [ 
                    'components',
                    'dataSet',
                    'margin',
                    'padding',
                    'unitX',
                    'unitY',
                    'meshX',
                    'meshY',
                    'formatX',
                    'formatY',
                    'rangeX',
                    'rangeY',
                    'minX',
                    'minY',
                    'xLabelsAt',
                    'yLabelsAt',
                    'labelMargin',
                    'xAxisArrow',
                    'yAxisArrow',
                    'xLabelRotate',
                    'yLabelRotate',
                    'xLabelFont',
                    'yLabelFont',
                    'xAxisStyle',
                    'yAxisStyle',
                    'xMeshStyle',
                    'yMeshStyle'
                ]
            } );
        },
        getXRuler: function () {
            return this.xRuler;
        },
        getYRuler: function () {
            return this.yRuler;
        },

        _processComponents : function(components){
            var i, key;
            for( i in allComponents ){
                key = allComponents[ i ];
                if( ~components.indexOf( key ) ){
                    func = componentsIniter[ key ];
                    func && func.bind(this)();
                }else{
                    this.removeElement( key );
                }
            }
        },

        getXLabels : function(){
            return this.xLabels;
        },

        getYLabels : function(){
            return this.yLabels;
        },

        measurePoint : function( point ){
            var p = this.param;
            var x = this.xRuler.measure(point[0]) + p.margin.left,
                y = this.yRuler.measure(point[1]) + p.margin.top + p.padding.top;
            return [ x, y ];
        },

        measurePointX : function( x ){
            return this.xRuler.measure(x) + this.param.margin.left;
        },

        measurePointY : function( y ){
            return this.yRuler.measure(y) + this.param.margin.top + this.param.padding.top;
        },

        measureValueRange : function( val, type ){
            var method = type == 'x'? 'measurePointX' : 'measurePointY';
            return  this[ method ]( val ) - this[ method ]( 0 );
        },

        updateAll: function (
                components,
                dataSet,
                margin,
                padding,
                unitX,
                unitY,
                meshX,
                meshY,
                formatX,
                formatY,
                rangeX,
                rangeY,
                minX,
                minY,
                xLabelsAt,
                yLabelsAt,
                labelMargin,
                xAxisArrow,
                yAxisArrow,
                xLabelRotate,
                yLabelRotate,
                xLabelFont,
                yLabelFont,
                xAxisStyle,
                yAxisStyle,
                xMeshStyle,
                yMeshStyle
        ){

            this._initElements( components );

            var width = this.container.getWidth() - margin.left - margin.right,
                height = this.container.getHeight() - margin.top - margin.bottom;

            var xCategories = dataSet.xAxis && dataSet.xAxis.categories;
            var yCategories = dataSet.yAxis && dataSet.yAxis.categories;

            var xGridArr = dataSet.xAxis && dataSet.xAxis.grid;
            var yGridArr = dataSet.yAxis && dataSet.yAxis.grid;

            var xFormat = formatX || defaultFormat,
                yFormat = formatY || defaultFormat;

            var xRuler = this.xRuler, xMin, xMax, xCount;
            var yRuler = this.yRuler, yMin, yMax, yCount;

            if( xCategories ){
                rangeX = [0, xCategories.length-1];
            }
            xMin = kity.Utils.isNumber( minX )? minX : rangeX[ 0 ];
            xMax = rangeX[ 1 ];

            if( yCategories ){
                rangeY = [0, yCategories.length-1];
            }
            yMin = kity.Utils.isNumber( minY )? minY : rangeY[ 0 ];
            yMax = rangeY[ 1 ]; 


            xRuler.ref( xMin, xMax ).map( padding.left, width - padding.right );
            if(xCategories){
                xGrid = xRuler.gridByCategories( xCategories.length );
            }else if( kity.Utils.isArray(xGridArr) ){
                xGrid = xRuler.gridByArray( xGridArr );
            }else{
                xCount = width / 60 | 0;
                xGrid = xRuler.gridByCount( xCount, null, true, minX );
            }
          
            yRuler.ref( yMin, yMax ).map( height - padding.top - padding.bottom, 0 );
            if(yCategories){
                yGrid = yRuler.gridByCategories( yCategories.length );
            }else if( kity.Utils.isArray(yGridArr) ){
                yGrid = yRuler.gridByArray( yGridArr );
            }else{
                yCount = height / 40 | 0;
                yGrid = yRuler.gridByCount( yCount, null, true, minY );
            }

            for (var i = 0; i < yGrid.map.length; i++) {
                yGrid.map[i] = yGrid.map[i] + padding.top;
            }

            var xAxis = this.getElement( 'xAxis' ),
                yAxis = this.getElement( 'yAxis' ),
                xCat  = this.getElement( 'xCat' ),
                yCat  = this.getElement( 'yCat' ),
                xMesh = this.getElement( 'xMesh' ),
                yMesh = this.getElement( 'yMesh' );

            xAxis && xAxis.update({
                x1: 0,
                y1: height,
                x2: width,
                y2: height,
                width: xAxisStyle.width,
                color: xAxisStyle.color
            });

            yAxis && yAxis.update({
                x1: 0,
                y1: 0,
                x2: 0,
                y2: height,
                width: yAxisStyle.width,
                color: yAxisStyle.color
            });

            if( unitX ){
                this.unitXLabel = this.unitXLabel || this.addElement( 'unitXLabel', new kc.Label() );
                this.unitXLabel.update({
                    text: unitX.text,
                    at: 'right',
                    margin: 0,
                    style : unitX.font || xLabelFont,
                    // color: xLabelFont.color || '#000',
                    x : width + 10,
                    y : height + 16
                }); 
            }

            if( unitY ){
                this.unitYLabel = this.unitYLabel || this.addElement( 'unitYLabel', new kc.Label() );
                this.unitYLabel.update({
                    text: unitY.text,
                    at: yLabelsAt,
                    margin: 0,
                    style: unitY.font || yLabelFont,
                    color: unitY.font && unitY.font.color || '#000',
                    x : -8,
                    y : -14
                });
            }

            var xLabels = xCategories ? xCategories : xGrid.ref.map( xFormat );
            if(xCat){
                xCat.update( {
                    rules: xGrid.map,
                    labels: xLabels,
                    y: height,
                    step: dataSet.xAxis && dataSet.xAxis.step || 1,
                    at : xLabelsAt || 'bottom',
                    font : xLabelFont
                } );
            }
            if(xCategories){
                this.xLabels = xLabels;
            }

            var yLabels = yCategories ? yCategories : yGrid.ref.map( yFormat );
            if(yCat){
                margin = yLabelsAt == 'right'? xRuler._map.to + labelMargin : labelMargin;

                yCat.update( {
                    rules: yGrid.map,
                    labels: yLabels,
                    x: 0,
                    step: dataSet.yAxis && dataSet.yAxis.step || 1,
                    at : yLabelsAt || 'left',
                    margin : margin,
                    font : yLabelFont
                } );
            }
            if(yCategories){
                this.yLabels = yLabels;
            }

            xMesh && xMesh.update( {
                rules: xGrid.map,
                length: height,
                y: height,
                width: xMeshStyle.width,
                color: xMeshStyle.color,
                dash : xMeshStyle.dash,
                step: dataSet.xAxis && dataSet.xAxis.step || 1
            } );

            yMesh && yMesh.update( {
                rules: yGrid.map,
                length: width, //xGrid.map[ xGrid.map.length - 1 ],
                x: 0,
                y: 0,
                width: yMeshStyle.width,
                color: yMeshStyle.color,
                dash : yMeshStyle.dash,
                step: dataSet.yAxis && dataSet.yAxis.step || 1
            } );

            var xa, ya;
            (xa = this.getElement('xAxisArrow')) && xa.setTranslate( width, height + 0.5 );
            (ya = this.getElement('yAxisArrow')) && ya.setRotate( -90 ).setTranslate( 0.5, 0 );
        },

        setCoordinateConf : function( conf ) {
            var result = {},
                components = [];

            var xAxis = conf.xAxis,
                yAxis = conf.yAxis,
                tmp;

            // 组件
            xAxis.axis.enabled  && components.push( 'xAxis' );
            xAxis.ticks.enabled && components.push( 'xMesh' );
            xAxis.label.enabled && components.push( 'xCat' );
            xAxis.axis.arrow && components.push( 'xAxisArrow' );
            yAxis.axis.enabled  && components.push( 'yAxis' );
            yAxis.ticks.enabled && components.push( 'yMesh' );
            yAxis.label.enabled && components.push( 'yCat' );
            yAxis.axis.arrow && components.push( 'yAxisArrow' );
            result.components = components;

            result.xAxisArrow = xAxis.axis.arrow;
            result.xAxisStyle = {
                width : xAxis.axis.width,
                color : xAxis.axis.color
            };

            result.yAxisArrow = yAxis.axis.arrow;
            result.yAxisStyle = {
                width : yAxis.axis.width,
                color : yAxis.axis.color
            };

            result.xMeshStyle = {
                width : xAxis.ticks.width,
                color : xAxis.ticks.color,
                dash : xAxis.ticks.dash
            };

            result.yMeshStyle = {
                width : yAxis.ticks.width,
                color : yAxis.ticks.color,
                dash : yAxis.ticks.dash
            };

            // 外部空隙
            var xm = xAxis.margin,
                ym = yAxis.margin;
            result.margin = {
                left   : xm.left || 0,
                right  : xm.right || 0,
                top    : ym.top || 0,
                bottom : ym.bottom || 0
            };

            // 内部空隙
            var xp = xAxis.padding,
                yp = yAxis.padding;
            result.padding = {
                left   : xp.left || 0,
                right  : xp.right || 0,
                top    : yp.top || 0,
                bottom : yp.bottom || 0
            };

            // 指定刻度最小值
            var minX = kity.Utils.queryPath('xAxis.min', conf);
            if( kity.Utils.isNumber( minX ) ){
                result['minX'] = minX;
            }
            var minY = kity.Utils.queryPath('yAxis.min', conf);
            if( kity.Utils.isNumber( minY ) ){
                result['minY'] = minY;
            }

            // 指定范围
            conf.rangeX && (result.rangeX = conf.rangeX);
            conf.rangeY && (result.rangeY = conf.rangeY);

            // label位置
            // result.xLabelsAt = xAxis.label.at || "middle";
            result.xLabelRotate = xAxis.label.rotate;
            result.xLabelFont = xAxis.label.font;

            result.yLabelsAt = yAxis.label.at || "left";
            result.yLabelRotate = yAxis.label.rotate;
            result.yLabelFont = yAxis.label.font;

            result.labelMargin = yAxis.label.margin || 10;

            // 坐标轴标签格式化
            result.formatX = kity.Utils.queryPath('xAxis.label.format', conf);
            result.formatY = kity.Utils.queryPath('yAxis.label.format', conf);

            // 单位
            result.unitX = kity.Utils.queryPath('xAxis.unit', conf) || '';
            result.unitY = kity.Utils.queryPath('yAxis.unit', conf) || '';

            result.x = kity.Utils.queryPath('xAxis.margin.left', conf) || 0;
            result.y = kity.Utils.queryPath('yAxis.margin.top', conf) || 0;

            var confCopy = kity.Utils.copy( conf );

            // categories 判断
            if( confCopy.yAxis.inverted ){
                confCopy.yAxis.categories = confCopy.xAxis.categories;
                delete( confCopy.xAxis.categories );

                result['minX'] = minY;
                delete result['minY'];
                
            }else{
                delete( confCopy.yAxis.categories );
            }

            result.dataSet = confCopy;
            return result;
        }
    };
} )() );