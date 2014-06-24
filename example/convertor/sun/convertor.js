function convert2Standard( origin ) {

    var lines = origin.split('\n');
    var root = {};
    var output = {};
    lines.forEach(function( line, i ){
        var arr = line.split(',');
        var pathArr = arr[0].split('-');
        var val = arr[1];

        setPath( pathArr, Number(val), root );
    });

    var a = kity.Utils.copy(root);
    var output = {name:'root'};
    traversal( a, output );
    console.log( output );

    return output;
}

function setPath( pathArr, value, root ) {
    var arr = pathArr;
    arr.unshift('root');
    var  i = 1, p, cur, exp;

    while(i < arr.length){
        cur = arr[i];
        p = getPath( i-1, arr );
        if( !eval('"' + cur + '" in ' + p ) ){
            exp = p + '.' + cur + ' = ' + (i == arr.length-1 ? 'value' : '{}');
            eval( exp );
        }

        i++
    }
}

function getPath( index, arr ){
    var p = [];
    for(var i=0; i<=index; i++){
        p.push( arr[i] );
    }
    return p.join('.');
}

function traversal( node, output ){
    var i, obj = {}, child;
    output.children = [];
    for( i in node ){
        obj = {};
        obj.name = i;

        if(typeof node[i] == 'object'){
            traversal( node[i], obj );
        }else{
            obj.value = node[i];
        }

        output.children.push( obj );

    }
}