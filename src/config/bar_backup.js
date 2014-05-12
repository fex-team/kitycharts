var BarColumnChartDefaultConfig = kc.BarColumnChartDefaultConfig = {

    color : [
        ['#fb8072', '#006d2c', '#2ca25f', '#66c2a4', '#99d8c9', '#ccece6', '#edf8fb'],
        ['#80b1d3', '#006d2c', '#2ca25f', '#66c2a4', '#99d8c9', '#ccece6', '#edf8fb'],
        ['#fdb462', '#006d2c', '#2ca25f', '#66c2a4', '#99d8c9', '#ccece6', '#edf8fb'],
        ['#8dd3c7', '#006d2c', '#2ca25f', '#66c2a4', '#99d8c9', '#ccece6', '#edf8fb'],
        ['#ffffb3'],
        ['#bebada'],
        ['#b3de69'],
        ['#fccde5'],
        ['#d9d9d9'],
        ['#bc80bd'],
        ['#ccebc5']
    ],

    xAxis : {
        categories : [],

        ticks: {
            enabled : true,
            dash : null,
            value: 0,
            width: 1,
            color: '#808080'
        },

        axis : {
            enabled : true
        },

        label : {
            enabled : true
        },

        padding : {
            left : 20,
            right : 20
        },

        margin : {
            left : 30,
            right : 20
        }
    },

    yAxis : {

        categories : [],

        ticks: {
            enabled : true,
            dash : null,
            value: 0,
            width: 1,
            color: '#808080'
        },

        axis : {
            enabled : true
        },

        label : {
            enabled : true
        },

        padding : {
            top: 20,
            bottom : 0
        },

        margin : {
            top : 60,
            bottom : 100
        }
    },

    plotOptions : {

        bar : {
            width : 8,
            margin: 1
        },

        label : {
            enabled : false,
            text : {
                color : '#333',
                margin : -15
            }
        }

    },

    interaction : {

        indicatrix : {
            color : '#BBB',
            width : 1,
            dash : [ 4, 2 ],
        },

        circle : {
            radius : 4,
            stroke : {
                width : 2,
                color : '#FFF'
            }
        }
    },

    enableAnimation : true

};