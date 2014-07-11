(function(){

    var index = 0;

    function playSlide( index ){

        if( index >= Timeline.steps.length ) return false;
        Timeline.play( index );
        progress(index);
        K.Hanger.exe(index);
        return true;
    }

    function act(){
        
        $('#control .prev').click(function(ev){
            prev();
        });

        $('#control .next').click(function(ev){
            next();
        });

        document.onkeyup = function( ev ){

            if( ev.keyCode == 13 || ev.keyCode == 39 ){
                next();
            }

            if( ev.keyCode == 37 ){
                prev();
            }

        }

    }

    function prev(){
        index--;
        if( index < 0 ) index = 0;

        K.Timeline.steps[ index ].clear();
        
        if( index > 0 ){
            K.Timeline.steps[ index-1 ].recover();
        }
    }

    function next(){
        playSlide( index );
        lastStep = index;
        
        index++;

        if( index >= Timeline.steps.length ){
            index = Timeline.steps.length;
        }
        
    }

    function progress(index){
        var cur = Timeline.steps[index].getPage().indexInSlider+1;
        var len = slider.pages.length;
        $('#control .progress').html( cur + '/' + len );
    }

    function goThrough(){
        var currentStep = -1;
        var timer = setInterval(function(){
            currentStep++;
            if( !playSlide( currentStep ) ){
                clearInterval(timer);
            }
        }, 500);
    }

    var guidecookie = 'guidecookie';
    function addGuide(index){
        K.Hanger.store(2, function(){

            if( $.cookie(guidecookie) && Number($.cookie(guidecookie)) >= 2 ) return;

            setTimeout(function(){
                var com = new K.Component('<img src="img/guide.png" />').setStyle({
                    position : 'absolute',
                    width : slider.measure(300) + 'px',
                    height : 'auto',
                    left : slider.measure(362) + 'px',
                    top : slider.measure(300) + 'px',
                    opacity : 0
                }).appendTo(slider.container);

                K.Hanger.set('guide', com);

                com.transit({
                   opacity : 1,
                   y : -100
                });

               var num = Number($.cookie(guidecookie) || 0) + 1;
               $.cookie(guidecookie, num);

            }, 400);

        });

        K.Hanger.store(3, function(){
            var guide = K.Hanger.get('guide');
            if( guide ){
                guide.transit({
                   opacity : 0,
                   y : 100
                }, function(){
                    $(guide.element).remove();
                });
            }
        });
    }
    addGuide();

    progress(0);
    act();
    next();
    setTimeout(function(){
        next();
    }, 600);

})();


