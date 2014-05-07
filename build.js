/* global require: true */
/* global console: true */
/* jslint evil: true */

var dependience = [

    'src/kitycharts.js',

    'src/util/align.js',
    'src/util/parallel.js',
    'src/util/Query.js',
    'src/util/Ruler.js',
    'src/util/sharpen.js',

    'src/base/ChartEvent.js',
    'src/base/EventHandler.js',
    'src/base/Data.js',
    'src/base/ChartElement.js',
    'src/base/AnimatedChartElement.js',
    'src/base/Chart.js',

    'src/shapex/Arrow.js',
    'src/shapex/Pie.js',
    'src/shapex/RegularPolygon.js',
    'src/shapex/Star.js',

    'src/component/Line.js',
    'src/component/Polyline.js',
    'src/component/ConnectLine.js',
    'src/component/Bezier.js',
    'src/component/Label.js',
    'src/component/Bar.js',
    'src/component/Coordinate.js',
    'src/component/XYCoordinate.js',
    'src/component/CategoryCoordinate.js',
    'src/component/PolarCoordinate.js',
    'src/component/ElementList.js',
    'src/component/Legend.js',
    'src/component/Tooltip.js',
    'src/component/PieDot.js',
    'src/component/CircleDot.js',
    'src/component/ConnectCircleDot.js',
    'src/component/Mesh.js',
    'src/component/Categories.js',
    'src/component/Marquee.js',

    'src/charts/ScatterChart.js',
    'src/charts/ForceChart.js',
    'src/charts/ChartFrame.js',
    'src/charts/LineChart.js',
    'src/charts/BarChart.js'
];

function nodeBuild() {

    var fs = require( 'fs' );

    var buildPath = '../static/kitychart.all.js';

    var contents = [],
        content, fileName;

    while ( dependience.length ) {
        try {
            contents.push( fs.readFileSync( fileName = dependience.shift() ) );
        } catch ( e ) {
            console.log( 'Missing module:' + fileName );
        }
    }

    content = contents.join( '\n\n' );

    content = '(function(kity, window) {\n\n' + content + '\n\n})(kity, window);';

    fs.writeFileSync( buildPath, content );

    console.log( ' > KityCharts build success!' );
}

function devWrite() {
    function getBasePath() {
        var scripts = document.getElementsByTagName( 'script' ),
            i, match, pattern;
        pattern = /(.+\/)build\.js/;
        for ( i = 0; i < scripts.length; i++ ) {
            match = pattern.exec( scripts[ i ].src );
            if ( match ) return match[ 1 ];
        }
    }
    var basePath = getBasePath();
    while ( dependience.length ) {
        document.write( '<script src="' + basePath + dependience.shift() + '"></script>' );
    }
}

var env = window != this ? 'node' : 'script';

var task = {
    'node': nodeBuild,
    'script': devWrite
};

task[ env ].call();