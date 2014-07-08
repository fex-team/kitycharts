window.K = window.K || {};

(function(exports){

    var slideClass = 'slide';
    var slideClassPrefix = 'sl_';

    function extend( t ) {
        var a = arguments,
            len = a.length;
        for (var i = 1; i < len; i++) {
            var x = a[i];
            for (var k in x) {
                if (!t.hasOwnProperty(k)) {
                    t[k] = x[k];
                }
            }
        }
        return t;
    }

    Timeline = {
        steps : [],
        play : function( index ){
            var frame = this.steps[ index ];
            if( frame.isFirstFrameInPage() && frame.getPage().indexInSlider > 0 ){
                var i = frame.getPage().indexInSlider;
                frame.getSlider().pages[ i - 1 ].clear();
            }
            frame.play();
        }
    };

    function Slider( id, param ){
        
        this.pages = [];
        this.pageIndex = 0;

        var WIDTH = 1024,
            HEIGHT = 768;

        this.aspectRatio = WIDTH / HEIGHT;

        var tmp = param.width / param.height;
        if( tmp > this.aspectRatio ){
            this.height = param.height;
            this.width = this.height * this.aspectRatio;
        }else{
            this.width = param.width;
            this.height = this.width / this.aspectRatio;
        }

        this.ratio = this.width / 1024;

        this.container = $('#' + id)[0];
        $(this.container).width( this.width );
    }

    Slider.prototype = {

        addPage : function( page ){
            page.slider = this;
            page.indexInSlider = this.pageIndex++;
            this.pages.push( page );
            return page;
        },

        removePage : function( index ){
            //this.pages.splice();
        },

        show : function( index ){
            this.pages[ index ].show();
        },

        measure : function( length ){
            return length * this.ratio;
        },

        setBg : function( color ){
            document.body.style.backgroundColor = color;
        }

    };

    function Page(){
        this.index = Page.index++;
        this.frames = [];
        this.frameIndex = 0;
    }

    Page.index = 0;

    Page.prototype = {

        addFrame : function( frame ){
            frame.page = this;
            frame.indexInPage = this.frameIndex++;
            this.frames.push( frame );
        },

        getSlider : function(){
            return this.slider || null;
        },

        removeFrame : function( index ){
            //this.pages.splice();
        },

        playFrame : function( index ){
            this.pages[ index ].play();
        },

        clear : function(){
            this.frames.forEach( function( frame , i ){
                frame.clear();
            } );
            return this;
        },

    };

    function Frame(){
        this.components = [];
        this.action = null;
    }

    Frame.prototype = {

        setAction : function( func ){
            this.action = func;
            return this;
        },

        addComponent : function( com, appendTo ){
            if( !this.hasComponent() ){
                com.frame = this;
                this.components.push( com );
            }

            if( appendTo !== false ){
                var con = this.getSlider().container;
                $(com.element).appendTo( con );
                com.container = con;
            }
        },

        hasComponent : function( com ){

            for(var i = 0; i < this.components.length; i++){
                if( this.components[i] === com ){
                    return true;
                }
            }

            return false;
        },

        getPage : function(){
            return this.page || null;
        },

        getSlider : function(){
            return this.page && this.page.slider || null;
        },

        play : function(){
            // 必须自定义frame
            var args = Array.prototype.slice.call( arguments, 0 );
            this.action.apply( this, args );
            return this;
        },

        clear : function(){
            this.components.forEach( function( com , i ){
                $(com.element).remove();

                if( com.attachments.length > 0 ){
                    com.attachments.forEach(function( attachment, i ){
                        attachment.remove();
                    });
                }

            } );
            return this;
        },

        addToTimeline : function(){
            Timeline.steps.push( this );
            return this;
        },

        recover : function(){
            var index = this.indexInPage;
            this.getPage().frames.forEach(function( frame, i ){
                if( i <= index )
                    frame.showComponents();
            });
        },

        showComponents : function(){
            this.components.forEach(function( com, i ){
                $(com.element).appendTo( com.container );
                com.attachments.forEach(function( att, i ){
                    $(att).appendTo( com.container );
                });
            });
        },

        isFirstFrameInPage : function(){
            return this.indexInPage == 0;
        },

        isLastFrameInPage : function(){
            return this.indexInPage == this.getPage().frames.length - 1;
        }

    };

    function Component( html ){
        this.element = $( html );
        this.element[0].id = ( Component.index++ );
        this.attachments = [];
    }

    Component.index = 0;

    Component.prototype = {

        getElement : function(){
            return this.element;
        },

        setStyle : function( style ){
            this.element.css( style );
            this._setWidth();
            return this;
        },

        getFrame : function(){
            return this.frame;
        },

        getSlider : function(){
            return this.frame && this.frame.page && this.frame.page.slider || null;
        },

        addClass : function( cls ){
            this.element.addClass( cls );
            this._setWidth();
            return this;
        },

        removeClass : function( cls ){
            this.element.removeClass( cls );
            return this;
        },

        appendTo : function( con ){
            this.element.appendTo( con );
            return this;
        },

        _setWidth : function(){
            var clone = this.element.css('display','inline-block').clone();
            this.width = clone.appendTo( document.body ).width();
            // this.element.width( this.width );
            clone.remove();
        },

        getWidth : function(){
            return this.width;
        },

        transit : function( param, dur, ease, callback ){
            this.element.transit( param, dur, ease, callback );
        },

        attach : function( attachment ){
            var att = $('<div></div>');
            att.css({
                position : 'absolute',
                top : this.element.css('top'),
                left : this.element.css('left')
            }).append( attachment ).appendTo( this.container );

            this.attachments.push( att[0] );
        },

        measure : function( length ){
            return this.getSlider().measure( length );
        },

        isRemoved : function(){
            return $( this.element ).parent().length == 0;
        }
    };

    K.Slider = Slider;
    K.Page = Page;
    K.Frame = Frame;
    K.Timeline = Timeline;
    K.Component = Component;

})(K);