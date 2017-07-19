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

  //NOTE: Just this part will show up in SoHo Xi Builds.
  var TOOLBARSEARCHFIELD_EXPAND_SIZE = 230,
    MAX_TOOLBARSEARCHFIELD_EXPAND_SIZE = 450;

  $.fn.toolbarsearchfield = function(options) {
    'use strict';

    // Settings and Options
    var pluginName = 'toolbarsearchfield',
        defaults = {
          clearable: true,  // If "true", provides an "x" button on the right edge that clears the field
          collapsible: true, // If "true", allows the field to expand/collapse on larger breakpoints when focused/blurred respectively
          collapsibleOnMobile: true // If true, overrides `collapsible` only on mobile settings.
        },
        settings = $.extend({}, defaults, options);

    /**
     * Depends on both a Toolbar control and Searchfield control to be present
     * @constructor
     * @param {Object} element
     */
    function ToolbarSearchfield(element) {
      this.settings = $.extend({}, settings);
      this.element = $(element);
      Soho.logTimeStart(pluginName);
      this.init();
      Soho.logTimeEnd(pluginName);
    }

    // Plugin Methods
    ToolbarSearchfield.prototype = {

      init: function() {
        return this
          .build()
          .handleEvents();
      },

      // Creates and manages any markup the control needs to function.
      build: function() {
        // Used for managing events that are bound to $(document)
        if (!this.id) {
          this.id = this.element.uniqueId('toolbar-searchfield');
        }

        // Build the searchfield element
        this.input = this.element;

        // If inside a toolbar, make sure to append it to the root toolbar element.
        this.toolbarParent = this.element.parents('.toolbar');
        this.containmentParent = this.toolbarParent;
        var moduleTabs = this.containmentParent.closest('.module-tabs');
        if (moduleTabs.length) {
          this.containmentParent = moduleTabs;
        }

        this.getToolbarElements();

        // Setup ARIA
        var label = this.element.attr('placeholder') || this.element.prev('label, .label').text().trim();
        if (!label || label === '') {
          label = Locale.translate('Keyword');
        }
        this.input.attr({
          'aria-label': label,
        });

        // Invoke Searchfield, pass settings on
        var sfSettings = $.extend({ 'noToolbarSearchfieldInvoke': true }, this.settings, $.fn.parseOptions(this.input[0]));
        this.input.searchfield(sfSettings);
        this.inputWrapper = this.input.parent();
        this.inputWrapper.addClass('toolbar-searchfield-wrapper');

        if (sfSettings.categories) {
          this.button = this.inputWrapper.find('.searchfield-category-button');
        }

        // Add/remove the collapsible setting
        var collapsibleMethod = this.settings.collapsible ? 'removeClass' : 'addClass';
        this.inputWrapper[collapsibleMethod]('non-collapsible');

        this.xButton = this.inputWrapper.children('.icon.close');

        // Open the searchfield once on intialize if it's a "non-collapsible" searchfield
        if (this.settings.collapsible === false ) {
          this.inputWrapper.addClass('no-transition').one('expanded.' + this.id, function() {
            $(this).removeClass('no-transition');
          });

          if (!this.shouldBeFullWidth()) {
            this.expand(true);
          }
        } else {
          if (this.button instanceof $ && this.button.length) {
            this.setClosedWidth();
          }
        }

        return this;
      },

      // Main entry point for setting up event handlers.
      handleEvents: function() {
        var self = this;

        this.inputWrapper.on('mousedown.toolbarsearchfield', function() {
          self.fastExpand = true;
        }).on('focusin.toolbarsearchfield', function(e) {
          self.handleFocus(e);
        }).on('collapse.toolbarsearchfield', function() {
          self.collapse();
        });

        if (this.button && this.button.length) {
          this.button.on('beforeopen.toolbarsearchfield', function(e, menu) {
            return self.handlePopupBeforeOpen(e, menu);
          });
        }

        // Used to determine if the "Tab" key was involved in switching focus to the searchfield.
        $(document).on('keydown.' + this.id, function(e) {
          self.handleOutsideKeydown(e);
        });

        $('body').on('resize.' + this.id, function() {
          self.adjustOnBreakpoint();
        });

        return this;
      },

      handleDeactivationEvents: function() {
        var self = this,
          arr = ['click', 'touchend', 'touchcancel'].map(function(v) {
            return v +'.'+ self.id;
          });
        self.handleOutsideStr = arr.join(' ');

        $(document).on(self.handleOutsideStr, function(e) {
          self.handleOutsideClick(e);
        });
      },

      handleFocus: function() {
        var self = this;
        clearTimeout(this.focusTimer);

        this.inputWrapper.addClass('has-focus');

        function searchfieldActivationTimer() {
          self.expand();
        }

        if (this.fastExpand) {
          searchfieldActivationTimer();
          return;
        }

        this.focusTimer = setTimeout(searchfieldActivationTimer, 0);
      },

      handleFakeBlur: function() {
        var self = this;
        clearTimeout(this.focusTimer);

        function searchfieldCollapseTimer() {
          if (!$.contains(self.inputWrapper[0], document.activeElement) && self.inputWrapper.hasClass('active')) {
            self.focusElem = document.activeElement;
            self.collapse();
          }
        }

        this.focusTimer = setTimeout(searchfieldCollapseTimer, 100);
      },

      handleOutsideClick: function(e) {
        var target = $(e.target);

        if (Soho.env.os.name === 'ios') {
          $('head').triggerHandler('disable-zoom');
        }

        // Don't close if we're focused on an element inside the wrapper
        if ($.contains(this.inputWrapper[0], e.target) || target.is(this.element) || target.is(this.inputWrapper)) {
          return;
        }

        // Don't close if a category is being selected from a category menu
        if (this.button && this.button.length) {
          var menu = this.button.data('popupmenu').menu;
          if (menu.has(target).length) {
            return;
          }
        }

        $(document).off(this.outsideEventStr);
        this.collapse();
      },

      handleOutsideKeydown: function(e) {
        var key = e.which;

        this.fastExpand = false;
        if (key === 9) { // Tab
          this.fastExpand = true;
          return this.handleFakeBlur();
        }

        var wasInputTheTarget = ($(e.target).is(this.input) || $(e.target).is(this.inputWrapper));
        if (wasInputTheTarget && (key === 37 || key === 38 || key === 39 || key === 40)) {
          return this.handleFakeBlur();
        }
      },

      handlePopupBeforeOpen: function(e, menu) {
        if (!menu) {
          return false;
        }

        if (!this.inputWrapper.is('.is-open')) {
          this.input.focus();
          return false;
        }

        return true;
      },

      // Retrieves the distance between a left and right boundary.
      // Used on controls like Lookup, Contextual Panel, etc. to fill the space remaining in a toolbar.
      getFillSize: function(leftBoundary, rightBoundary) {
        var leftBoundaryNum = 0,
          rightBoundaryNum = 0;

        function sanitize(boundary) {
          if (!boundary) {
            return 0;
          }

          // Return out if the boundary is just a number
          if (!isNaN(parseInt(boundary))) {
            return parseInt(boundary);
          }

          if (boundary instanceof jQuery) {
            if (!boundary.length) {
              return;
            }

            if (boundary.is('.title')) {
              boundary = boundary.next('.buttonset');
            }

            boundary = boundary[0];
          }

          return boundary;
        }

        function getEdgeFromBoundary(boundary, edge) {
          if (!isNaN(boundary)) {
            return (boundary === null || boundary === undefined) ? 0 : boundary;
          }

          if (!edge || typeof edge !== 'string') {
            edge = 'left';
          }

          var edges = ['left', 'right'];
          if ($.inArray(edge, edges) === -1) {
            edge = edges[0];
          }

          var rect;

          if (boundary instanceof HTMLElement || boundary instanceof SVGElement) {
            rect = boundary.getBoundingClientRect();
          }

          return rect[edge];
        }

        leftBoundary = sanitize(leftBoundary);
        rightBoundary = sanitize(rightBoundary);

        function whichEdge() {
          var e = 'left';
          if (leftBoundary === rightBoundary || ($(rightBoundary).length && $(rightBoundary).is('.buttonset'))) {
            e = 'right';
          }

          return e;
        }

        leftBoundaryNum = getEdgeFromBoundary(leftBoundary);
        rightBoundaryNum = getEdgeFromBoundary(rightBoundary, whichEdge());

        if (!leftBoundaryNum && !rightBoundaryNum) {
          return TOOLBARSEARCHFIELD_EXPAND_SIZE;
        }

        var distance = rightBoundaryNum - leftBoundaryNum;
        if (distance <= TOOLBARSEARCHFIELD_EXPAND_SIZE) {
          return TOOLBARSEARCHFIELD_EXPAND_SIZE;
        }

        if (distance >= MAX_TOOLBARSEARCHFIELD_EXPAND_SIZE) {
          return MAX_TOOLBARSEARCHFIELD_EXPAND_SIZE;
        }

        return distance;
      },

      setClosedWidth: function() {
        // If the searchfield category button exists, change the width of the
        // input field on the inside to provide space for the (variable) size of the currently-selected
        // category (or categories)
        if ((this.button instanceof $) && this.button.length) {
          var buttonStyle = window.getComputedStyle(this.button[0]),
            buttonWidth = parseInt(buttonStyle.width),
            buttonPadding = parseInt(buttonStyle.paddingLeft) + parseInt(buttonStyle.paddingRight);

          if (this.inputWrapper[0]) {
            this.inputWrapper[0].style.width = (buttonWidth + buttonPadding) + 'px';
          }
        }
      },

      setOpenWidth: function() {
        if (this.inputWrapper[0]) {
          this.inputWrapper[0].style.width = this.openWidth;
        }

        // If the searchfield category button exists, change the width of the
        // input field on the inside to provide space for the (variable) size of the currently-selected
        // category (or categories)
        if ((this.button instanceof $) && this.button.length) {
          var buttonStyle = window.getComputedStyle(this.button[0]),
            buttonWidth = parseInt(buttonStyle.width),
            buttonPadding = parseInt(buttonStyle.paddingLeft) + parseInt(buttonStyle.paddingRight),
            buttonBorder = (parseInt(buttonStyle.borderWidth) * 2),
            inputWidth = 'calc(100% - ' + (buttonWidth + buttonPadding + buttonBorder - 2) + 'px)';

          this.input[0].style.width = inputWidth;
        }
      },

      calculateOpenWidth: function() {
        var buttonset = this.element.parents('.toolbar').children('.buttonset'),
          nextElem = this.inputWrapper.next(),
          width;

        // If small form factor, use the right edge
        if (nextElem.is('.title')) {
          nextElem = buttonset;
        }

        if (this.shouldBeFullWidth()) {
          width = '100%';

          if (this.toolbarParent.closest('.header').length) {
            width = 'calc(100% - 40px)';
          }
          if (this.toolbarParent.closest('.tab-container.module-tabs').length) {
            width = 'calc(100% - 1px)';
          }

          this.openWidth = width;
          return;
        }

        if (!buttonset.length) {
          return;
        }

        // Figure out boundaries
        // +10 on the left boundary reduces the likelyhood that the toolbar pushes other elements
        // into the spillover menu whenever the searchfield opens.
        var leftBoundary = buttonset.offset().left + 10;
        var rightBoundary = this.inputWrapper.next();

        // If the search input sits alone, just use the other side of the buttonset to measure
        if (!rightBoundary.length) {
          rightBoundary = buttonset.offset().left + buttonset.outerWidth(true);
        }

        width = this.getFillSize(leftBoundary, rightBoundary);
        this.openWidth = width + 'px';
      },

      isActive: function() {
        return this.inputWrapper.hasClass('is-active');
      },

      adjustOnBreakpoint: function() {
        var isFullWidth = this.shouldBeFullWidth(),
          hasStyleAttr = this.inputWrapper.attr('style');

        if (this.isActive()) {
          this.collapse();
        }

        if (!isFullWidth && !hasStyleAttr) {
          this.calculateOpenWidth();

          if (this.settings.collapsible === false) {
            this.expand(true);
          }
        }
      },

      // Angular may not be able to get these elements on demand so we need to be
      // able to call this during the expand method.
      getToolbarElements: function() {
        this.buttonsetElem = this.toolbarParent.children('.buttonset')[0];
        if (this.toolbarParent.children('.title').length) {
          this.titleElem = this.toolbarParent.children('.title')[0];
        }
      },

      expand: function(noFocus) {
        var self = this,
          notFullWidth = !this.shouldBeFullWidth();

        if (this.inputWrapper.hasClass('active')) {
          return;
        }

        var dontRecalculateButtons = false,
          toolbarAPI = this.toolbarParent.data('toolbar'),
          toolbarSettings,
          containerSizeSetters;

        if (toolbarAPI) {
           toolbarSettings = this.toolbarParent.data('toolbar').settings;
        }

        if (this.animationTimer) {
          clearTimeout(this.animationTimer);
        }

        if (this.buttonsetElem === undefined) {
          this.getToolbarElements();
        }

        function expandCallback() {
          self.inputWrapper.addClass('is-open');
          self.calculateOpenWidth();
          self.setOpenWidth();

          var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
          if (!noFocus || iOS) {
            self.input.focus();
          }

          var eventArgs = [];
          if (containerSizeSetters) {
            eventArgs.push(containerSizeSetters);
          }

          self.toolbarParent.triggerHandler('recalculate-buttons', eventArgs);
          self.inputWrapper.triggerHandler('expanded');
        }

        // Places the input wrapper into the toolbar on smaller breakpoints
        if (!notFullWidth) {
          this.elemBeforeWrapper = this.inputWrapper.prev();
          this.inputWrapper.detach().prependTo(this.containmentParent);
          Soho.utils.fixSVGIcons(this.inputWrapper);
        } else {

          // Re-adjust the size of the buttonset element if the expanded searchfield would be
          // too large to fit.
          var buttonsetWidth = parseInt(window.getComputedStyle(this.buttonsetElem).width),
            d = TOOLBARSEARCHFIELD_EXPAND_SIZE;

          if (buttonsetWidth < TOOLBARSEARCHFIELD_EXPAND_SIZE) {
            d = TOOLBARSEARCHFIELD_EXPAND_SIZE - buttonsetWidth;
          }

          var buttonsetElemWidth = buttonsetWidth + TOOLBARSEARCHFIELD_EXPAND_SIZE;
          containerSizeSetters = {
            buttonset: buttonsetElemWidth
          };

          if (toolbarSettings && toolbarSettings.favorButtonset === true && this.titleElem) {
            var toolbarStyle = window.getComputedStyle(this.toolbarParent[0]),
              titleStyle = window.getComputedStyle(this.titleElem),
              toolbarElemWidth = parseInt(toolbarStyle.width),
              toolbarPadding = parseInt(toolbarStyle.paddingLeft) + parseInt(toolbarStyle.paddingRight),
              titleElemWidth = parseInt(titleStyle.width),
              moreElem = this.toolbarParent.children('more'),
              moreStyle, moreElemWidth = 0;

            if (moreElem.length) {
              moreStyle = window.getComputedStyle(moreElem[0]);
              moreElemWidth = moreStyle.width;
            }

            if (toolbarElemWidth < (toolbarPadding + titleElemWidth + buttonsetElemWidth + moreElemWidth)) {
              containerSizeSetters.title = (titleElemWidth - d);
            }
          }

          dontRecalculateButtons = true;
        }

        this.inputWrapper.addClass('active');
        this.handleDeactivationEvents();

        /*
        // Return out without collapsing or handling callbacks for the `collapse` event if:
        // Searchfield is not collapsible in general -OR-
        // Searchfield is only collapsible on mobile, and we aren't below the mobile breakpoint
        if ((self.settings.collapsible === false && self.settings.collapsibleOnMobile === false) ||
           (self.settings.collapsible === false && self.settings.collapsibleOnMobile === true && !self.shouldBeFullWidth())) {
          return;
        }
        */

        if (this.shouldExpandOnMobile()) {
          expandCallback();
          return;
        }

        this.animationTimer = setTimeout(expandCallback, 0);
      },

      collapse: function() {
        var self = this,
          textMethod = 'removeClass';

        function closeWidth() {
          if (self.button instanceof $ && self.button.length) {
            self.setClosedWidth();
          } else {
            self.inputWrapper.removeAttr('style');
          }
        }

        function collapseCallback() {
          self.inputWrapper.removeClass('is-open');
          self.fastExpand = false;

          closeWidth();

          if (self.button && self.button.length) {
            self.button.data('popupmenu').close(false, true);
          }

          self.inputWrapper.triggerHandler('collapsed');

          // TODO: Make this process more solid, without FOUC/jumpiness and better focus handling (EPC)
          // See http://jira/browse/SOHO-6347
          self.inputWrapper.one($.fn.transitionEndName(), function() {
            self.toolbarParent.triggerHandler('recalculate-buttons');
            if (Soho.env.os.name === 'ios') {
              $('head').triggerHandler('enable-zoom');
            }
          });
        }

        // Puts the input wrapper back where it should be if it's been moved due to small form factors.
        if (this.inputWrapper.parent().is(this.containmentParent)) {
          if (!(this.elemBeforeWrapper instanceof $) || !this.elemBeforeWrapper.length) {
            this.inputWrapper.prependTo(this.toolbarParent.children('.buttonset'));
          } else {
            this.inputWrapper.detach().insertAfter(this.elemBeforeWrapper);
          }
          self.handleDeactivationEvents();
          self.toolbarParent.triggerHandler('scrollup');
          Soho.utils.fixSVGIcons(this.inputWrapper);

          this.elemBeforeWrapper = null;
        }

        if (this.input.val().trim() !== '') {
          textMethod = 'addClass';
        }
        this.inputWrapper[textMethod]('has-text');

        if (this.animationTimer) {
          clearTimeout(this.animationTimer);
        }

        self.inputWrapper.removeClass('active has-focus');

        // Return out without collapsing or handling callbacks for the `collapse` event if:
        // Searchfield is not collapsible in general -OR-
        // Searchfield is only collapsible on mobile, and we aren't below the mobile breakpoint
        if ((self.settings.collapsible === false && self.settings.collapsibleOnMobile === false) ||
           (self.settings.collapsible === false && self.settings.collapsibleOnMobile === true && !self.shouldBeFullWidth())) {
          return;
        }

        if (this.fastExpand || !this.shouldExpandOnMobile()) {
          collapseCallback();
          return;
        }

        this.animationTimer = setTimeout(collapseCallback, 310);
      },

      /**
       * Determines whether or not the full-size Searchfield should open over top of its sibling Toolbar elements.
       * @private
       * @returns {boolean}
       */
      shouldBeFullWidth: function() {
        var header = this.inputWrapper.closest('.header'),
          headerCondition = false;

        if (header.length) {
          headerCondition = header.width() < 320;
        }

        return headerCondition || Soho.breakpoints.isBelow('phone-to-tablet');
      },

      /**
       * Determines whether or not the Searchfield should expand on the Mobile breakpoint.
       * @private
       * @returns {boolean}
       */
      shouldExpandOnMobile: function() {
        if (this.settings.collapsible === true) {
          return false;
        }
        if (this.settings.collapsibleOnMobile === true) {
          return true;
        }
        return this.shouldBeFullWidth();
      },

      // Used when the control has its settings or structural markup changed.  Rebuilds key parts of the control that
      // otherwise wouldn't automatically update.
      updated: function() {
        return this
          .teardown()
          .init();
      },

      enable: function() {
        this.inputWrapper.addClass('is-disabled');
        this.input.prop('disabled', true);
      },

      disable: function() {
        this.inputWrapper.removeClass('is-disabled');
        this.input.prop('disabled', false);
      },

      // Tears down events, properties, etc. and resets the control to "factory" state
      teardown: function() {
        this.inputWrapper.off('mousedown.toolbarsearchfield focusin.toolbarsearchfield collapse.toolbarsearchfield');
        this.inputWrapper.find('.icon').remove();
        $(document).off(this.outsideEventStr);

        if (this.xButton && this.xButton.length) {
          this.xButton.remove();
        }

        // Used to determine if the "Tab" key was involved in switching focus to the searchfield.
        $(document).off('keydown.' + this.id);
        $('body').off('resize.' + this.id);

        return this;
      },

      // Removes the entire control from the DOM and from this element's internal data
      destroy: function() {
        this.teardown();
        $.removeData(this.element[0], pluginName);
      }
    };

    // Initialize the plugin (Once)
    return this.each(function() {
      var instance = $.data(this, pluginName);
      if (instance) {
        instance.settings = $.extend({}, instance.settings, options);
        instance.updated();
      } else {
        instance = $.data(this, pluginName, new ToolbarSearchfield(this, settings));
      }
    });
  };

/* start-amd-strip-block */
}));
/* end-amd-strip-block */
