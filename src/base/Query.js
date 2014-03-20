var Query = kc.Query = kity.createClass( 'Query', ( function () {

    function fieldMapper( field ) {
        return function ( x ) {
            return x[ field ];
        };
    }

    function guessMapper( fn ) {
        switch ( typeof ( fn ) ) {
        case 'string':
            return fieldMapper( fn );
        case 'function':
            return fn;
        default:
            return function ( x ) {
                return x;
            };
        }
    }

    return {

        constructor: function ( dataSet ) {
            this.dataSet = dataSet;
        },

        where: function ( condition ) {
            var success = [],
                data, i;
            for ( i = 0; i < this.dataSet.length; i++ ) {
                data = this.dataSet[ i ];
                if ( condition.call( data, data, i ) ) {
                    success.push( data );
                }
            }
            return new Query( data );
        },

        count: function ( condition ) {
            if ( condition ) {
                return this.where( condition ).count();
            }
            return this.dataSet.length;
        },

        map: function ( mapper ) {
            var mapped = [],
                data, i;
            mapper = guessMapper( mapper );
            for ( i = 0; i < this.dataSet.length; i++ ) {
                data = this.dataSet[ i ];
                mapped.push( mapper.call( this, data, i ) );
            }

            return new Query( mapped );
        },

        max: function ( mapper ) {
            var maxData = null,
                data, i, maxValue, value;
            
            mapper = guessMapper( mapper );

            for ( i = 0; i < this.dataSet.length; i++ ) {
                data = this.dataSet[ i ];
                value = mapper.call( data, data, i );
                if ( maxData === null || value > maxValue ) {
                    maxData = data;
                    maxValue = value;
                }
            }

            return maxData;
        },

        min: function ( mapper ) {
            mapper = guessMapper( mapper );
            return this.max( function ( data, i ) {
                return -mapper.call( data, data, i );
            } );
        },

        sum: function ( mapper ) {
            var sum = 0,
                data, i, value;

            mapper = guessMapper( mapper );
            
            for ( i = 0; i < this.dataSet.length; i++ ) {
                data = this.dataSet[ i ];
                value = mapper.call( data, data, i );
                sum += value;
            }

            return sum;
        },

        average: function () {
            return this.sum() / this.count();
        },

        list: function () {
            return this.dataSet;
        }
    };
} )() );