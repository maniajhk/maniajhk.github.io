// Written by YOUEIKEN
// Must also include jquery-ui.js

class AutoCompleteField{
  constructor(config={}){
    var SELF            = this;
    this.method         = 'POST';
    this.url            = 'ajax_request/';
    this.dataType       = 'json';
    this.token          = config['csrf_token'] || $('[name="csrfmiddlewaretoken"]').val();
    this.choices        = config['choices'] || 'GET_ITEM_CHOICES';
    this.details        = config['details'] || 'GET_ITEM_DETAILS';
    this.$loadingScreen = $(config['loadingScreen'] || '#loading-screen');
    this.$iconContainer = $(config['iconContainer'] || '<div class="icon-container"><i class="loader"></i></div>');
    this.$field         = $(config['field']);
    this.$field.autocomplete({
      source : function(request, response){
        SELF.getChoices(
          $.extend(request, {
            'csrfmiddlewaretoken' : SELF.token,
            'ajax_request'        : SELF.choices
          }), response
        );
      },
      select: function(event, ui){
        SELF.getDetails({
          'csrfmiddlewaretoken' : SELF.token,
          'ajax_request'        : SELF.details,
          'pk'                  : ui.item.key
        });
        console.log('\nJQUERY AUTOCOMPLETE SELECT:', ui.item.value, ui.item.key);
      }
    });
    console.log('AutoCompleteField:', this);
  }

  getChoices(request, response){
    var SELF = this;
    SELF.$iconContainer.insertAfter(SELF.$field);
    $.ajax({
      method   : SELF.method,
      url      : SELF.url,
      data     : request,
      dataType : SELF.dataType,
      success  : function(data) {
        response($.map(data, function(value, key) {
          console.log(value, key);
          return {
              key   : key,
              label : value['item_info'],
              value : value['item_info'],
          };
        }));
        SELF.$iconContainer.remove();
      }
    });
  }

  getDetails(request){
    var SELF = this;
    SELF.$loadingScreen.removeClass('d-none');
    $.ajax({
      method   : SELF.method,
      url      : SELF.url,
      data     : request,
      dataType : SELF.dataType,
      success  : function(data) {
        console.log('\n');
        for (let key in data) {
          if (key != 'id') {
            var id        = 'id_' + key.replace('_id', '');
            var selector  = $('#' + id);
            var isChecked = (data[key]) ? true : false;
            if (!selector.hasClass('d-none')){
              if (selector.is(':checkbox')){
                selector.prop('checked', isChecked);
              } else {
                selector.val(data[key]);
              }
              //selector.trigger('change');
              selector.selectpicker('refresh');
            }
            console.log(id, key, data[key]);
          }
        }
        SELF.$loadingScreen.addClass('d-none');
      }
    });
  }
}
