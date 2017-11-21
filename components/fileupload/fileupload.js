/* start-amd-strip-block */
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function($) {
/* end-amd-strip-block */

  $.fn.fileupload = function() {

    'use strict';

    // Settings and Options
    var pluginName = 'fileupload';

    /**
    * A trigger field for uploading a single file.
    *
    * @class FileUpload
    * @param {Boolean} none  &nbsp;-&nbsp; No options
    */
    function FileUpload(element) {
      this.element = $(element);
      Soho.logTimeStart(pluginName);
      this.init();
      Soho.logTimeEnd(pluginName);
    }

    // FileUpload Methods
    FileUpload.prototype = {

      init: function() {
        this.build();
      },

      // Example Method
      build: function() {
        var self = this,
          elem = this.element,
          hasInlineLabel = !elem.is('input.fileupload'),
          isReadonly = elem.attr('readonly');

        this.fileInput = hasInlineLabel ? elem.find('input') : elem;

        elem.closest('.field').addClass('field-fileupload');

        //append markup
        var id = !hasInlineLabel ? (elem.attr('id') || elem.attr('name')) : elem.find('input').attr('name'),
          elemClass = !hasInlineLabel ? elem.attr('class') : elem.find('input').attr('class'),
          instructions = Locale.translate('FileUpload'),
          label = $('<label for="'+ id +'-filename">'+ elem.text() +' <span class="audible">'+ instructions +'</span></label>'),
          shadowField = $('<input readonly id="'+ id +'-filename" class="fileupload-background-transparent'+ (elemClass ? ' '+ elemClass : '') +'" type="text">'),
          svg = (!hasInlineLabel ? '<label class="fileupload">' : '') + '<span class="trigger" tabindex="-1">' + $.createIcon('folder') + '</span>' + (!hasInlineLabel ? '</label>' : ''),
          svgClose = (!hasInlineLabel ? '<label class="fileclose">' : '') + '<span class="trigger" tabindex="-1">' + $.createIcon('close') + '</span>' + (!hasInlineLabel ? '</label>' : '');

        if (!hasInlineLabel) {
          var orgLabel = elem.prev('label');

          if (orgLabel.length === 0) {  //Could be wrapped (angular)
            orgLabel = elem.parent().prev('label');
          }

          label = $('<label for="'+ (elem.attr('id') || elem.attr('name')) +'-filename">'+ orgLabel.text() +'</label>');
          elem.before(label, shadowField);
          this.fileInput.after(svgClose);
          this.fileInput.after(svg);
          orgLabel.addClass('audible').append('<span class="audible">'+ instructions +'</span>');
        } else {
          elem.before(label, shadowField);
          this.fileInput.after(svgClose);
          this.fileInput.after(svg);
        }

        this.textInput = elem.parent().find('[type="text"]');
        /*
        * Added Keydown for Keyboard Backspace and remove Keypress because it doesn't detect Backspace
        */
        this.textInput.on('keydown.fileupload', function(e) {
          e.stopPropagation();
          if (e.which === 13 || e.which === 32) {
            elem.parent().find('[type="file"]').trigger('click');
          } else if (e.which === 8) {
            self.clearUploadFile();
          }
        });

        if (!hasInlineLabel) {
          svg = elem.parent().find('label.fileupload');
          svg.on('click.fileupload', function () {
            if (self.textInput.is(':disabled')) {
              return;
            }
            elem.parent().find('[type="file"]').trigger('click');
          });

          svgClose = elem.parent().find('label.fileclose');
          svgClose.on('click.fileclose', function () {
            self.clearUploadFile();
          });
          $('.fileclose').hide();
        }

        if (this.fileInput.is(':disabled')) {
          this.textInput.prop('disabled', true);
        }

        if (elem.hasClass('required')) {
          label.addClass('required');
          elem.removeClass('required');
        }

        if (this.fileInput.attr('data-validate')) {
          this.textInput.attr('data-validate', this.fileInput.attr('data-validate'));
          this.textInput.validate();
        }

        if (isReadonly) {
          this.textInput.prop('disabled', false);
          this.textInput[0].classList.remove('fileupload-background-transparent');
          this.fileInput.attr('disabled', 'disabled');
        }

        /*
        * New Event for File Upload Change
        */
        this.fileInput.on('change.fileupload', function() {
          if (this.files.length > 0) {
            elem.prev('input').val(this.files[0].name);
            $('label.fileclose:eq(0)').show();
          } else {
            elem.prev('input').val('');
            $('label.fileclose:eq(0)').hide();
          }
        });

        // Fix: not sure why, but some browser(ie. safari) need to rerender,
        // some rules were not applying from css file
        self.fileInput.css({position: 'static', left: 0});
        setTimeout(function() {
          self.fileInput.css({position: 'fixed', left: '-10000px'});
        }, 0);
      },

      /*
      * Clear the Input Upload File
      */
      clearUploadFile: function() {
        $('#fileupload').wrap('<form>').closest('form').get(0).reset();
        $('#fileupload').unwrap();
        $('#fileupload-filename').val('');
        $('label.fileclose:eq(0)').hide();
      },

      /**
      * Teardown - Remove added markup and events
      */
      destroy: function() {
        this.element.parent().find('label.fileclose').off('click.fileclose');

        this.fileInput.off('change.fileupload');
        this.textInput.off('keydown.fileupload');

        this.element.closest('.field-fileupload')
          .removeClass('field-fileupload')
          .find('>label:first, >[type="text"]:first, .trigger, .icon-dirty, .msg-dirty').remove();

        $.removeData(this.element[0], pluginName);
      },

      /**
      * Disable the input and button.
      */
      disable: function() {
        this.textInput.prop('disabled', true);
        this.fileInput.prop('disabled', true);
      },

      /**
      * Enable the input and button.
      */
      enable: function() {
        this.textInput.prop('disabled', false).prop('readonly', false);
        this.fileInput.removeAttr('disabled');
      },

      /**
      * Make the input readonly and disable the button.
      */
      readonly: function() {
        this.textInput.prop('readonly', true);
        this.fileInput.prop('disabled', true);

        this.textInput.prop('disabled', false);
        this.textInput.removeClass('fileupload-background-transparent');
      }

    };

    // Initialize the plugin (Once)
    return this.each(function() {
      var instance = $.data(this, pluginName);
      if (!instance) {
        instance = $.data(this, pluginName, new FileUpload(this));
      }
    });
  };

/* start-amd-strip-block */
}));
/* end-amd-strip-block */
