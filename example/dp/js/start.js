function playSlide( index ){
    if( index >= Timeline.steps.length ) return false;
    Timeline.play( index );
    return true;
}

var start = function(){
    var index = currentStep = 0,
        lastFrame;

    // $('#go').click(function(ev){
    //     playSlide( currentStep );
    //     currentStep++;
    // });

    document.onkeyup = function( ev ){

        if( ev.keyCode == 13 || ev.keyCode == 39 ){

            playSlide( index );
            lastStep = index;
            
            index++;

            if( index >= Timeline.steps.length ){
                index = Timeline.steps.length;
            }
        }

        if( ev.keyCode == 37 ){
            
            index--;
            if( index < 0 ) index = 0;

            K.Timeline.steps[ index ].clear();
            
            if( index > 0 ){
                K.Timeline.steps[ index-1 ].recover();
            }
        }

    }

}

start();


// var currentStep = -1;
// var timer = setInterval(function(){
//     currentStep++;
//     if( !playSlide( currentStep ) ){
//         clearInterval(timer);
//     }
// }, 500);


