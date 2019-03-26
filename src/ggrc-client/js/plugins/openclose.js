/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import {trigger} from 'can-event';

(function ($) {
  function openclose(command) {
    let $that = $(this);
    let useSlide = $that.length < 100;

    $that.each(function () {
      let $this = $(this);
      let $main = $this.closest('.item-main');
      let $li = $main.closest('li');
      let $content = $li.children('.item-content');
      let $peopleInfo = $li.children('people-list-info');
      let $icon = $main.find('.openclose');
      let $parentTree = $this.closest('ul.new-tree');
      let cmd = command;

      if (typeof cmd !== 'string' || cmd === 'toggle') {
        cmd = $icon.hasClass('active') ? 'close' : 'open';
      }

      if (cmd === 'close') {
        if (useSlide) {
          $content.slideUp('fast');
        } else {
          $content.css('display', 'none');
        }
        $icon.removeClass('active');
        $li.removeClass('item-open');
        // Only remove tree open if there are no open siblings
        if (!$li.siblings('.item-open').length) {
          $parentTree.removeClass('tree-open');
        }
        $content.removeClass('content-open');
        trigger.call($peopleInfo[0], 'close');
      } else if (cmd === 'open') {
        if (useSlide) {
          $content.slideDown('fast');
        } else {
          $content.css('display', 'block');
        }
        $icon.addClass('active');
        $li.addClass('item-open');
        $parentTree.addClass('tree-open');
        $content.addClass('content-open');
        trigger.call($peopleInfo[0], 'open');
      }
    });

    return this;
  }
  $.fn.openclose = openclose;
})(jQuery);
