// Written by YOUEIKEN

var GlobalDebug = (function(){
    var savedConsole = console;
    return function(debugOn, suppressAll){
      var debug    = (String($('html').attr('debug')).toLowerCase() == 'true') ? true : false;
      var debugOn  = (typeof debugOn == 'boolean') ? debugOn : debug;
      var suppress = suppressAll || false;
      var styles   = 'font-size: 18px; font-weight: bold; ';
      if (debugOn === false) {
        console.log('%cDEBUG:OFF', styles + 'color: #f00;');
        console     = {};
        console.log = function(){};
        if(suppress) {
          console.info  = function(){};
          console.warn  = function(){};
          console.error = function(){};
        } else {
          console.info  = savedConsole.info;
          console.warn  = savedConsole.warn;
          console.error = savedConsole.error;
        }
      } else {
        console.log('%cDEBUG:ON', styles + 'color: #0ff;');
        console = savedConsole;
      }
    }
})();

class Layout{
  constructor(){
    GlobalDebug();
    var SELF              = this;
    this.$loadingScreen   = $('#loading-screen');
    //this.$leaveConfirm    = $('#leave-confirm');
    //this.$inlineWarning   = $('#inline-warning');
    this.$navbar          = $('.navbar');
    this.$navitem         = $('.navbar-nav');
    this.$horiScrollFalse = $('[horizontal-scrollable="false"]');
    this.showHideLoading();
    this.handleNavBarToggleEvents();
    this.enableWindowsConfirmation();
    this.enableModalConfirmation();
    this.disableFormsEnterKey();
    this.counterHorizontalScroll();
    this.getMediaType();
    $(window).resize(function(){
      SELF.getMediaType();
    });
    console.log('loading...', this);
  }

  showHideLoading(){
    var SELF = this;
    window.onbeforeunload = function(){
      SELF.$loadingScreen.removeClass('d-none');
      console.log('unload...');
    }
    $(function(){
      SELF.$loadingScreen.addClass('d-none');
      console.log('ready');
    });
  }

  handleNavBarToggleEvents(){
    var SELF       = this;
    var myInterval = null;
    SELF.updateHTMLMarginTop();
    $(window).on('scroll', function(e){
      if ($(window).scrollTop() >= 30){
        SELF.$navbar.addClass('scroll-shadow');
      } else {
        SELF.$navbar.removeClass('scroll-shadow');
      }
    });
    SELF.$navbar.on('show.bs.collapse', function(e){
      myInterval = setInterval(function(){
        SELF.updateHTMLMarginTop();
      }, 1);
    });
    SELF.$navbar.on('shown.bs.collapse', function(e){
      clearInterval(myInterval);
      //SELF.updateNavItemScroll();
    });
    SELF.$navbar.on('hide.bs.collapse', function(e){
      myInterval = setInterval(function(){
        SELF.updateHTMLMarginTop();
      }, 1);
    });
    SELF.$navbar.on('hidden.bs.collapse', function(e){
      clearInterval(myInterval);
    });
    SELF.$navitem.on('scroll', function(e){
      //SELF.updateNavItemScroll();
    });
    $('[role="alert"]').on('closed.bs.alert', function () {
      SELF.updateHTMLMarginTop();
    });
  }

  /*updateNavItemScroll(){
    var scrollheight = this.$navitem[0].scrollHeight;
    var scrolltop    = this.$navitem.scrollTop();
    var outerheight  = this.$navitem.outerHeight();
    var hasScroll    = (scrollheight - 1 > outerheight) ? true : false;
    var isTop        = (hasScroll && outerheight - scrolltop == outerheight) ? true : false;
    var isBottom     = (hasScroll && scrollheight - scrolltop - 1 <= outerheight) ? true : false;
    if (isTop){
      this.$navitem.removeClass('hint-arrow-down');
      this.$navitem.addClass('hint-arrow-up');
      console.log('Nav Items : TOP');
    } else if (isBottom){
      this.$navitem.removeClass('hint-arrow-up');
      this.$navitem.addClass('hint-arrow-down');
      console.log('Nav Items : BOTTOM');
    } else if (hasScroll){
      console.log('Nav Items : scrolling...');
    } else{
      console.log('Nav Items : NO SCROLL');
    }
  }*/

  updateHTMLMarginTop(){
    $('html').css('margin-top', this.$navbar.parent().outerHeight() - 1);
  }

  enableWindowsConfirmation(){ // for windows events, i.e., previous, next, close tag and reload
    var SELF = this;
    window.onbeforeunload = function(e){
      if ($('#leave-confirm').length){
        e.returnValue = 'confirmation message here';
        SELF.handleWindowsConfirmation(e);
      } else {
        SELF.handleWindowsConfirmation();
        console.log('unload...');
      }
    }
  }

  handleWindowsConfirmation(e){
    $('html').addClass('freeze-everything');
    $('body').addClass('overflow-hidden');
    this.$loadingScreen.removeClass('d-none');
    //this.$inlineWarning.addClass('d-none');
    if (e){
      var SELF = this;
      window.onfocus = function(){
        $('html').removeClass('freeze-everything');
        $('body').removeClass('overflow-hidden');
        SELF.$loadingScreen.addClass('d-none');
      }
    }
  }

  enableModalConfirmation(){
    var SELF = this;
    var $btn = $('#leave-confirm').find('button[aria-label="Leave"]');
    if ($btn.length > 0){
      $('a:not(".selected")').on('click', function(e){ // for href
        var url    = $(this).attr('href');
        var target = $(this).attr('target');
        if (url && target!='_blank'){
          $btn.click(function(){
            SELF.handleModalConfirmation();
            location.href = url;
          });
          $('#leave-confirm').modal('show');
          e.preventDefault();
        }
      });
      $('button').on('click', function(e){ // for button
        var $form      = $(this).closest('form');
        var isSearch   = ($(this).hasClass('button-search')) ? true : false;
        var isSubmit   = ($(this).attr('type')=='submit') ? true : false;
        var isMove     = ($(this).attr('name')=='_move') ? true : false;
        var isCancel   = ($(this).attr('name')=='_cancel') ? true : false;
        var isSaveCont = ($(this).attr('name')=='_savecont') ? true : false;
        var isDelete   = ($(this).attr('name')=='_delete') ? true : false;
        if (isSearch || isMove || isCancel){
          $btn.click(function(){
            SELF.handleModalConfirmation();
            if (isMove){
              $form.append('<input type="hidden" name="_move" value=true>');
            }
            if (isCancel){
              $form.append('<input type="hidden" name="_cancel" value=true>');
            }
            $form.submit();
          });
          $('#leave-confirm').modal('show');
          e.preventDefault();
        } else if (isSubmit || isSaveCont || isDelete){
          SELF.handleModalConfirmation();
        }
      });
    }
  }

  handleModalConfirmation(){
    //$('body').removeAttr('style');
    //$('#leave-confirm').removeClass('fade');
    $('#leave-confirm').modal('hide');
    $('#leave-confirm').modal('dispose');
    $('#leave-confirm').remove();
    //delete this.$leaveConfirm;
  }

  disableFormsEnterKey(){
    $('form').on('keypress', ':input:not(textarea):not([type=submit])', function(e){
      if (e.keyCode == 13) { // <ENTER>
        var id       = document.activeElement.id || 'unknown';
        var name     = document.activeElement.name || 'unknown';
        var isLogin  = (name=='username' || name=='password') ? true : false;
        var isSearch = (name=='q') ? true : false;
        if (isLogin || isSearch){ // allow search by pressing 'ENTER' key
          $(this).submit();
        } else {
          $(this).blur();
          e.preventDefault();
        }
        console.log('ID / Name: %s / %s is pressed!', id, name);
      }
    });
  }

  counterHorizontalScroll(){
    var SELF = this;
    $(window).on('scroll', function(e){
      SELF.$horiScrollFalse.css('position', 'relative');
      SELF.$horiScrollFalse.css('left', $(window).scrollLeft());
    });
    SELF.$horiScrollFalse.css('position', 'inherit');
  }

  getMediaType(){
    var width = window.innerWidth;
    var media = $('html').attr('media');
    var type  = (width > 575.98) ? 'desktop' : 'mobile';
    if (media != type) {
      $('html').attr('media', type);
      console.log('You are browsing on a %s', type);
    }
  }
}

var MyLayout = new Layout();
