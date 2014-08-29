kc.ChartsConfig.add('base', {
    color : [
        'rgb(31, 119, 180)',
        'rgb(174, 199, 232)',
        'rgb(255, 127, 14)',
        'rgb(255, 187, 120)',
        'green'
    ],

    finalColor: 'rgb(255, 187, 120)',

    xAxis : {

        ticks: {
            enabled : true,
            dash : [1],
            width: 1,
            color: '#808080'
        },

        axis : {
            enabled : true,
            arrow : false,
            width : 1,
            color : '#000'
        },

        label : {
            enabled : true,
            rotate : 0,
            font : {
                color : "#000",
                fontSize : 12,
                family : "Arial"
            }
        },

        padding : {
            left : 0,
            right : 20
        },

        margin : {
            left : 80,
            right : 50
        }
    },

    yAxis : {
        categories : [],

        ticks: {
            enabled : true,
            dash : [1],
            width: 1,
            color: '#808080'
        },

        axis : {
            enabled : true,
            arrow : false,
            width : 1,
            color : '#000'
        },

        label : {
            enabled : true,
            rotate : 0,
            font : {
                color : "#000",
                fontSize : 12,
                family : "Arial"
            }
        },

        padding : {
            top: 20,
            bottom : 0
        },

        margin : {
            top : 20,
            bottom : 60
        }

    },

    plotOptions : {

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
            enabled : false,
            color : '#BBB',
            width : 1,
            dash : [ 4, 2 ],
        },

        hover : {
            enabled : false,
            circle : {
                radius : 4,
                stroke : {
                    width : 2,
                    color : '#FFF'
                }
            }
        }

    },

    legend : {
        enabled : true,
        level : 'entry'
    },

    animation : {
        enabled : true,
        duration : 600,
        mode : 'ease'
    },
});