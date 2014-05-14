<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>KityCharts API</title>


        <script src="../../kity/dev-lib/dev-define.js"></script>
        <script>
            inc.config({
                base: '../../kity/src'
            });
        </script>
        <script src="../../kity/dev-lib/exports.js"></script>
        <script src="../../kity/dev-lib/dev-start.js"></script>

        <script src="../../build.js"></script>
        <script src="../../example/lib/jquery-2.1.0.min.js"></script>
        <style>
            .container {
                width: 500px;
                height: 300px;
                /*background: #EEE;*/
                display: inline-block;
                /*border: #999 1px solid;*/
            }

            #config{
                width: 500px;
                height: 300px;
                display: none;
            }
        </style>
    </head>
    <body>

        <div id="kitycharts" class="container"></div><br><br><br><br>
        <textarea id="config">
<?php echo file_get_contents($_GET['data'])?>
        </textarea>
        <br>
        <input id="btn" type="button" value="submit" />
        <input id="save" type="button" value="save" />
        <input id="edit" type="button" value="edit" />
    </body>
    <script>

        // function chart( type ){
        //     $.ajax({
        //         url: type + '.json', 
        //         success: function( data ) {
        //             new KityCharts( type, data );
        //         }
        //     });
        // }

        // chart( 'kitycharts' );

        function render(){
            $('#kitycharts').html('');
            var conf = JSON.parse( $('#config').val() );
            new KityCharts( 'kitycharts', conf );
        }
        render();

        $('#btn').click(function(){
            render();
        });

        $('#save').click(function(){
            $('#config').val()
        });

        $('#edit').click(function(){
            $('#config').toggle()
        });

    </script>
</html>