function convert2Standard( origin ) {
    var lines = origin.split('\n');
    var leaves = [];
    var paths = lines.map(function( line, i ){
        var arr = line.split(',');
        var path = arr[0].split('-');
        var value = arr[1];

        var leaf = {
            name : path[ path.length-1 ],
            value : value
        }

        leaves.push( leaf );
        return path;
    });


    step(paths);

    var standard = {};
    return standard;
}

function step(paths){
    var obj = {}, i, j;
    for(i = 0; i < 7; i++){

        for(j = 0; j < paths.length; j++){
            if(i == 0){
                obj[ paths[j][i] ] = {};
            }else{
                if( paths[j][i-1] ){
                    obj[ paths[j][i-1] ] = obj[ paths[j][i-1] ] || {};
                    obj[ paths[j][i-1] ][ paths[j][i] ] = {};
                    console.log( paths[j][i] );     
                }

            }
        }



        
    }
    console.log( obj );
}



function queryPath(path, obj) {
    var arr = path.split('.');
    var i = 0,
        tmp = obj,
        l = arr.length;
    while (i < l) {
        if (arr[i] in tmp) {
            tmp = tmp[arr[i]];
            i++;
            if (i >= l || tmp === undefined) {
                return tmp;
            }
        } else {
            return undefined;
        }
    }
}