kc.TreemapData = kity.createClass( 'TreemapData', (function(){

    var ratio = 0.5 * (1 + Math.sqrt(5));
    var mode = "squarify";

    function setAttr( node ){
        if( !node.parent ){
            node.depth = 0;
            node.index = 0;
            node.weightStart = 0;
            node.weight = 1;
        }

        var sum = 0, func = arguments.callee, childWeight = 0;
        if( node.children && node.children.length > 0 ){

            childWeight = node.weight / node.children.length;

            node.children.forEach(function( n, i ){
                n.parent = node;
                n.depth = node.depth + 1;
                n.index = i;
                n.weightStart = n.parent.weightStart + i * childWeight;
                n.weight = childWeight;
                sum += func( n );
            });
        }else{
            node.depth = node.parent.depth + 1;
            return node.value || 0;
        }

        node.value = sum;
        return sum;
    }

    function scale(children, k) {
        var i = -1, child, area;

        while (++i < children.length) {
            child = children[i];
            area = child.value * (k < 0 ? 0 : k);
            child.area = isNaN(area) || area <= 0 ? 0 : area; // 给节点添加area属性
        }

    }

    function squarify( node ) {

        var children = node.children;
        if (children && children.length) {

            var rect = { x: node.x, y: node.y, dx: node.dx, dy: node.dy },
                row = [],
                remaining = children.slice(), // copy-on-write
                child,
                best = Infinity, // the best row score so far
                score, // the current row score
                u = mode === "slice" ? rect.dx
                : mode === "dice" ? rect.dy
                : mode === "slice-dice" ? node.depth & 1 ? rect.dy : rect.dx
                : Math.min(rect.dx, rect.dy), // initial orientation
                n;

            scale(remaining, rect.dx * rect.dy / node.value);
            row.area = 0;

            while ((n = remaining.length) > 0) {
                row.push(child = remaining[n - 1]);
                row.area += child.area;
                if (mode !== "squarify" || (score = worst(row, u)) <= best) { // continue with this orientation
                    remaining.pop();
                    best = score;
                } else { // abort, and try a different orientation
                    row.area -= row.pop().area;
                    position(row, u, rect, false);
                    u = Math.min(rect.dx, rect.dy);
                    row.length = row.area = 0;
                    best = Infinity;
                }
            }

            if (row.length) {
                position(row, u, rect, true);
                row.length = row.area = 0;
            }
            children.forEach( arguments.callee );

        }
    }

    function getRect( node ) {
        return { x: node.x, y: node.y, dx: node.dx, dy: node.dy };
    }

    function worst( row, u ) {
        var s = row.area,
            r,
            rmax = 0,
            rmin = Infinity,
            i = -1,
            n = row.length;

        while (++i < n) {
            if (!(r = row[i].area)) continue;
            if (r < rmin) rmin = r;
            if (r > rmax) rmax = r;
        }

        s *= s;
        u *= u;

        return s ? Math.max((u * rmax * ratio) / s, s / (u * rmin * ratio)) : Infinity;
    }

    function position( row, u, rect, flush ){
        var i = -1,
            n = row.length,
            x = rect.x,
            y = rect.y,
            round = Math.round,
            v = u ? round(row.area / u) : 0,
            o;

        if (u == rect.dx) { // horizontal subdivision
            if (flush || v > rect.dy) v = rect.dy; // over+underflow

            while (++i < n) {
                o = row[i];
                o.x = x;
                o.y = y;
                o.dy = v;
                x += o.dx = Math.min(rect.x + rect.dx - x, v ? round(o.area / v) : 0);
            }

            o.z = true;
            o.dx += rect.x + rect.dx - x; // rounding error
            rect.y += v;
            rect.dy -= v;

        } else { // vertical subdivision

            if (flush || v > rect.dx) v = rect.dx; // over+underflow
            while (++i < n) {
                o = row[i];
                o.x = x;
                o.y = y;
                o.dx = v;
                y += o.dy = Math.min(rect.y + rect.dy - y, v ? round(o.area / v) : 0);
            }
            o.z = false;
            o.dy += rect.y + rect.dy - y; // rounding error
            rect.x += v;
            rect.dx -= v;
        }
    }

    function setMode( m ){
        mode = m;
    }

    return {

        base: kc.Data,

        format: function ( width, height, mode ) {
            setMode( mode );

            var root = this.origin;
            
            if( !(( 'name' in root ) && ( 'value' in root || 'children' in root )) ) return null;

            setAttr( root );

            root.x = 0;
            root.y = 0;
            root.dx = width;
            root.dy = height;

            scale([root], root.dx * root.dy / root.value);
            squarify( root );

            return root;
        }
    }

})());  

