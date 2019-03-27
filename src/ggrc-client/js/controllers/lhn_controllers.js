/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import './infinite-scroll-controller';
import tracker from '../tracker';
import RefreshQueue from '../models/refresh_queue';
import Cacheable from '../models/cacheable';
import Search from '../models/service-models/search';
import {
  getLHNavSize,
  setLHNavSize,
  getLHNState,
  setLHNState,
} from '../plugins/utils/display-prefs-utils';
import * as businessModels from '../models/business-models';
import Relationship from '../models/service-models/relationship';
import '../components/recently-viewed/recently-viewed';
import '../components/questionnaire-create-link/questionnaire-create-link';
import {InfiniteScrollControl, LhnTooltipsControl} from '../controllers/infinite-scroll-controller';
import * as canBatch from 'can-event/batch/batch';

const LhnControl = can.Control.extend({}, {
  init: function () {
    this.obs = new can.Map();

    this.init_lhn();

    // Set up a scroll handler to capture the current scroll-Y position on the
    // whole LHN search panel.  scroll events do not bubble, so this cannot be
    // set as a delegate on the controller element.
    let lhsHolderOnscroll = _.debounce(function () {
      setLHNState({panel_scroll: this.scrollTop});
    }, 250);
    this.element.find('.affix-holder').on('scroll', lhsHolderOnscroll);
  },
  is_lhn_open: function () {
    let isOpen = getLHNState().is_open;

    if (typeof isOpen === 'undefined') {
      return false;
    }

    return isOpen;
  },
  'input.widgetsearch keypress': function (el, ev) {
    let value;
    if (ev.which === 13) {
      ev.preventDefault();

      value = $(ev.target).val();
      this.do_search(value);
      this.toggle_filter_active();
    }
  },
  submit(el, ev) {
    ev.preventDefault();

    let value = $(ev.target).find('input.widgetsearch').val();
    this.do_search(value);
    this.toggle_filter_active();
  },
  toggle_filter_active: function () {
    // Set active state to search field if the input is not empty:
    let $filter = this.element.find('.widgetsearch');
    let $button = this.element.find('.widgetsearch-submit');
    let $off = this.element.find('.filter-off');
    let $searchTitle = this.element.find('.search-title');
    let gotFilter = !!$filter.val().trim().length;

    $filter.toggleClass('active', gotFilter);
    $button.toggleClass('active', gotFilter);
    $off.toggleClass('active', gotFilter);
    $searchTitle.toggleClass('active', gotFilter);
  },
  '.filter-off a click': function (el, ev) {
    ev.preventDefault();

    this.element.find('.widgetsearch').val('');
    this.do_search('');
    this.toggle_filter_active();
  },
  "a[data-name='work_type'] click": function (el, ev) {
    let target = $(ev.target);
    let checked;

    checked = target.data('value') === 'my_work';
    this.obs.attr('my_work', checked);

    setLHNState({my_work: checked});
    this.set_active_tab(checked);
  },
  toggle_lhn: function (ev) {
    ev && ev.preventDefault();
    let isOpen = this.is_lhn_open();

    if (isOpen) {
      this.close_lhn();
    } else {
      this.open_lhn();
    }
  },
  close_lhn: function () {
    if (getLHNState().is_pinned) {
      return;
    }

    // not nested
    $('.lhn-trigger').removeClass('active');

    let _width = getLHNavSize();
    let width = _width || this.element.find('.lhs-holder').width();
    let safety = 20;

    this.element.find('.lhs-holder')
      .removeClass('active')
      .css('left', (-width - safety) + 'px');

    setLHNState({is_open: false});
  },
  open_lhn: function () {
    let lhsCtr = $('#lhs').control();
    this.set_active_tab();

    // not nested
    $('.lhn-trigger').removeClass('hide').addClass('active');

    this.element.find('.lhs-holder')
      .css('left', '')
      .addClass('active');

    setLHNState({is_open: true});
    if (lhsCtr.options._hasPendingRefresh) {
      lhsCtr.refresh_counts();
      lhsCtr.refresh_visible_lists();
    }
  },

  set_active_tab: function (newval) {
    newval || (newval = this.obs.attr('my_work'));

    let value = ['all', 'my_work'][Number(newval)];
    $("a[data-name='work_type']").removeClass('active');
    $("a[data-name='work_type'][data-value='" + value + "'").addClass('active');
    $('input.widgetsearch').attr('placeholder',
      'Filter ' + (newval ? 'my' : 'all') + ' objects...');
  },

  init_lhn: function () {
    let $lhs = $('#lhs');
    let myWorkTab = false;

    if (typeof getLHNState().my_work !== 'undefined') {
      myWorkTab = !!getLHNState().my_work;
    }
    this.obs.attr('my_work', myWorkTab);

    let searchControl = new LhnSearchControl($lhs, {
      observer: this.obs,
    });
    searchControl.display();

    new LhnTooltipsControl($lhs);

    let checked = this.obs.attr('my_work');
    let value = checked ? 'my_work' : 'all';
    let target = this.element.find(`#lhs input.my-work[value=${value}]`);

    target.prop('checked', true);
    target.closest('.btn')[checked
      ? 'addClass'
      : 'removeClass'
    ]('btn-green');

    // When first loading up, wait for the list in the open section to be loaded (if there is an open section), then
    //  scroll the LHN panel down to the saved scroll-Y position.  Scrolling the
    //  open section is handled in the LHN Search controller.

    if (getLHNState().open_category) {
      this.element.one('list_displayed', this.initial_scroll.bind(this));
    } else {
      this.initial_scroll();
    }

    this.toggle_filter_active();

    if (getLHNState().is_pinned) {
      this.pin();
    }

    this.initial_lhn_render();
  },

  initial_scroll: function () {
    this.element.find('.affix-holder').scrollTop(
      getLHNState().panel_scroll || 0
    );
  },
  // this uses polling to make sure LHN is there
  // requestAnimationFrame takes browser render optimizations into account
  // it ain't pretty, but it works
  initial_lhn_render: function () {
    let self = this;
    if (!$('.lhs-holder').length || !$('.lhn-trigger').length) {
      window.requestAnimationFrame(this.initial_lhn_render.bind(this));
      return;
    }

    // this is ugly, but the trigger doesn't nest inside our top element
    $('.lhn-trigger').on('click', this.toggle_lhn.bind(this));
    import(/* webpackChunkName: "mousetrap" */'mousetrap')
      .then(function ({'default': Mousetrap}) {
        Mousetrap.bind('alt+m', self.toggle_lhn.bind(self));
      });
    this.resize_lhn();
    this.open_lhn();
  },
  lhn_width: function () {
    return $('.lhs-holder').width() + 8;
  },
  hide_lhn: function () {
    // UI-revamp
    // Here we should hide the button ||| also
    let $lhsHolder = $('.lhs-holder');
    let $bar = $('.bar-v');
    let $lhnTrigger = $('.lhn-trigger');

    this.element.hide();
    $lhsHolder.css('width', 0);
    $('.page-content').css('margin-left', 0);
    $bar.hide();
    $lhnTrigger.hide();
    $lhnTrigger.addClass('hide');

    window.resize_areas();
  },
  do_search: function (value) {
    let $searchTitle = this.element.find('.search-title');
    value = $.trim(value);
    if (this._value === value) {
      return;
    }
    $searchTitle.addClass('active');
    this.obs.attr('value', value);
    setLHNState({search_text: value});
    this._value = value;
  },
  mousedown: false,
  dragged: false,
  resize_lhn: function (resize, noTrigger) {
    resize || (resize = getLHNavSize());

    let maxWidth = window.innerWidth * .75;
    let defaultSize = 240;

    if (resize < defaultSize) {
      resize = defaultSize;
    }
    resize = Math.min(resize, maxWidth);

    this.element.find('.lhs-holder').width(resize);

    if (resize) {
      setLHNavSize(resize);
    }

    if (!noTrigger) {
      $(window).trigger('resize');
    }
  },
  '.bar-v mousedown': function (el, ev) {
    this.mousedown = true;
    this.dragged = false;
  },
  '{window} mousemove': function (el, ev) {
    if (!this.mousedown) {
      return;
    }

    ev.preventDefault();
    this.dragged = true;

    if (!this.element.find('.bar-v').hasClass('disabled')) {
      this.resize_lhn(ev.pageX);
    }
  },
  '{window} mouseup': function (el, ev) {
    if (!this.mousedown) return;

    this.mousedown = false;
  },
  '{window} resize': function (el, ev) {
    this.resize_lhn(null, true); // takes care of height and min/max width
  },
  '{window} mousedown': function (el, event) {
    let x = event.pageX;
    let y = event.pageY;

    if (x === undefined || y === undefined) {
      return;
    }

    let onLhn = ['.lhn-trigger:visible', '.lhs-holder:visible']
      .reduce(function (yes, selector) {
        let $selector = $(selector);
        let bounds;

        if (!$selector.length) {
          return;
        }

        bounds = $selector[0].getBoundingClientRect();

        return yes
              || x >= bounds.left
              && x <= bounds.right
              && y >= bounds.top
              && y <= bounds.bottom;
      }, false);

    // #extended-info - makes sure that menu doesn't close if tooltip is open and user has clicked inside
    // We should handle this form some manager, and avoid having God object
    if (!onLhn &&
      !getLHNState().is_pinned &&
      !$('#extended-info').hasClass('in')
    ) {
      this.close_lhn();
    }
  },
  destroy: function () {
    this.element.find('.affix-holder').off('scroll');
    this._super && this._super(...arguments);
  },
  '.lhn-pin click': function (element, event) {
    if (getLHNState().is_pinned) {
      this.unpin();
    } else {
      this.pin();
    }
  },
  unpin: function () {
    this.element.find('.lhn-pin').removeClass('active');
    this.element.find('.bar-v').removeClass('disabled');
    setLHNState({is_pinned: false});
  },
  pin: function () {
    this.element.find('.lhn-pin').addClass('active');
    this.element.find('.bar-v').addClass('disabled');
    setLHNState({is_pinned: true});
  },
});

const LhnSearchControl = can.Control.extend({
  defaults: {
    list_view: 'base_objects/search_result',
    actions_view: 'base_objects/search_actions',
    list_selector: 'ul.top-level > li, ul.mid-level > li',
    list_toggle_selector: 'li > a.list-toggle',
    model_attr_selector: null,
    model_attr: 'data-model-name',
    model_extra_attr: 'data-model-extra',
    count_selector: '.item-count',
    list_mid_level_selector: 'ul.mid-level',
    list_content_selector: 'ul.sub-level',
    actions_content_selector: 'ul.sub-actions',
    limit: 50,
    observer: null,
    filter_params: new can.Map(),
    counts: new can.Map(),
  },
}, {
  display: function () {
    let lhnPrefs = getLHNState();

    // 2-way binding is set up in the view using value:bind, directly connecting the
    //  search box and the display prefs to save the search value between page loads.
    //  We also listen for this value in the controller
    //  to trigger the search.
    let view = GGRC.Templates[this.element.data('template')];
    let frag = can.stache(view)(lhnPrefs);
    this.element.html(frag);

    let initialParams = {};
    let savedFilters = lhnPrefs.filter_params || new can.Map();

    this.post_init();

    let subLevelElements = this.element.find('.sub-level');
    new InfiniteScrollControl(subLevelElements);
    subLevelElements.on('scroll', _.debounce(function () {
      setLHNState({category_scroll: this.scrollTop});
    }, 250));

    let initialTerm = lhnPrefs.search_text || '';
    if (this.options.observer.my_work) {
      initialParams = {contact_id: GGRC.current_user.id};
    }
    $.map(businessModels, (model, name) => {
      if (model.default_lhn_filters) {
        this.options.filter_params.attr(model.default_lhn_filters);
      }
    });

    this.options.filter_params.attr(savedFilters.serialize());
    this.options.loaded_lists = [];
    this.run_search(initialTerm, initialParams);

    // Above, category scrolling is listened on to save the scroll position.  Below, on page load the
    //  open category is toggled open, and the search placed into the search box by display prefs is
    //  sent to the search service.

    if (lhnPrefs.open_category) {
      let selector = this.options.list_selector
        .split(',')
        .map((item) =>
          `${item} > a[data-object-singular=${lhnPrefs.open_category}]`)
        .join(',');

      this.toggle_list_visibility(
        this.element.find(selector)
      );
    }
  },
  post_init: function () {
    let lhnCtr = $('#lhn').control();
    let refreshCounts = _.debounce(this.refresh_counts.bind(this), 1000, {
      leading: true,
      trailing: false,
    });

    this.init_object_lists();
    this.init_list_views();

    Cacheable.bind('created', function (ev, instance) {
      let modelNames;
      let modelName;

      if (instance instanceof Relationship) {
        // Don't refresh LHN counts when relationships are created
        return;
      }
      if (!lhnCtr.is_lhn_open()) {
        this.options._hasPendingRefresh = true;
        return;
      }
      modelNames = _.filteredMap(
        this.get_visible_lists(), ($list) => this.get_list_model($list));
      modelName = instance.constructor.model_singular;

      if (modelNames.indexOf(modelName) > -1) {
        this.options.visible_lists[modelName].unshift(instance);
        this.options.results_lists[modelName].unshift(instance);
      }
      // Refresh the counts whenever the lists change
      refreshCounts();
    }.bind(this));
  },
  '{list_toggle_selector} click': function (el, ev) {
    ev && ev.preventDefault();
    this.toggle_list_visibility(el);
  },
  ensure_parent_open: function (el) {
    let $toggle = el
      .parents(this.options.list_mid_level_selector)
      .parents('li')
      .find('a.list-toggle.top');
    let $ul = $toggle.parent('li').find(this.options.list_mid_level_selector);

    if ($toggle.length && !$toggle.hasClass('active')) {
      this.open_list($toggle, $ul, null, true);
    }
  },
  toggle_list_visibility: function (el, dontUpdatePrefs) {
    let subSelector = this.options.list_content_selector + ',' +
      this.options.actions_content_selector;
    let midSelector = this.options.list_mid_level_selector;
    let $parent = el.parent('li');
    let selector;

    if ($parent.find(midSelector).length) {
      selector = midSelector;
    } else {
      selector = subSelector;
    }

    let $ul = $parent.find(selector);

    // Needed because the `list_selector` selector matches the Recently Viewed
    // list, which will cause errors
    if ($ul.length < 1) {
      return;
    }

    if ($ul.is(':visible')) {
      this.close_list(el, $ul, dontUpdatePrefs);
    } else {
      this.open_list(el, $ul, selector, dontUpdatePrefs);
    }
  },
  open_list: function (el, $ul, selector, dontUpdatePrefs) {
    // Use a cached max-height if one exists
    let holder = el.closest('.lhs-holder');
    let $content = $ul.filter([this.options.list_content_selector,
      this.options.list_mid_level_selector].join(','));
    let $siblings = selector ? $ul.closest('.lhs').find(selector) : $(false);
    let extraHeight = 0;
    let top;

    // Collapse other lists
    let $mids = $ul.closest('.lhs').find(this.options.list_mid_level_selector)
      .not(el.parents(this.options.list_mid_level_selector))
      .not(el.parent().find(this.options.list_mid_level_selector));
    let $nonChildren = $ul.closest('.lhs')
      .find([this.options.list_content_selector,
        this.options.actions_content_selector].join(','))
      .filter('.in')
      .filter(function (i, el) {
        return !$.contains($ul[0], el);
      });

    [$siblings, $mids, $nonChildren].map(function ($selection) {
      $selection.slideUp().removeClass('in');
    });

    // Expand this list
    $ul.slideDown().addClass('in');

    // Remove active classes from others
    // remove all except current element or children
    // this works because open_list is called twice if we ensure parent is open
    let $others = $ul.closest('.lhs').find(this.options.list_selector)
      .find('a.active')
      .not(el)
      .filter(function (i, el) {
        return !$.contains($ul[0], el);
      });
    $others.removeClass('active');

    // Add active class to this list
    el.addClass('active');

    // Compute the extra height to add to the expandable height,
    // based on the size of the content that is sliding away.
    top = $content.offset().top;
    $siblings.filter(':visible').each(function () {
      let siblingTop = $(this).offset().top;
      if (siblingTop <= top) {
        extraHeight += this.offsetHeight + (siblingTop < 0
          ? -holder[0].scrollTop
          : 0
        );
      }
    });

    // Determine the expandable height
    this._holder_height = holder.outerHeight();
    if (!$ul.hasClass('mid-level')) {
      $content.filter(this.options.list_content_selector).css(
        'maxHeight',
        Math.max(160, (
          this._holder_height -
          holder.position().top +
          extraHeight -
          top -
          40)
        )
      );
    }

    // Notify the display prefs that the category the user just opened is to be reopened on next page load.
    if (!dontUpdatePrefs) {
      setLHNState({
        open_category: el.attr('data-object-singular'),
      });
    }

    this.ensure_parent_open(el);
    this.on_show_list($ul);
  },
  close_list: function (el, $ul, dontUpdatePrefs) {
    el.removeClass('active');
    $ul.slideUp().removeClass('in');
    // on closing a category, set the display prefs to reflect that there is no open category and no scroll
    //  for the next category opened.
    if (!dontUpdatePrefs) {
      setLHNState({
        open_category: null,
        category_scroll: 0,
      });
    }
  },
  ' resize': function () {
    let $content = this.element
      .find([this.options.list_content_selector].join(','))
      .filter(':visible');

    if ($content.length) {
      let lastHeight = this._holder_height;
      let holder = this.element.closest('.lhs-holder');
      this._holder_height = holder.outerHeight();


      $content.css(
        'maxHeight',
        Math.max(160,
          (this._holder_height - lastHeight))
      );
    }
  },
  on_show_list: function (el, ev) {
    let $list = $(el).closest(this.get_lists());
    let modelName = this.get_list_model($list);
    let that = this;
    let stopFn = tracker.start(
      `LHN: ${modelName}`,
      tracker.USER_JOURNEY_KEYS.LOADING,
      tracker.USER_ACTIONS.LHN.SHOW_LIST
    );

    setTimeout(function () {
      that.refresh_visible_lists().done(stopFn);
    }, 20);
  },
  '{observer} value': function (el, ev, newval) {
    this.run_search(newval, this.current_params);
  },
  '{observer} my_work': function (el, ev, newval) {
    this.run_search(this.current_term, newval
      ? {contact_id: GGRC.current_user.id}
      : null
    );
  },
  '.sub-level scrollNext': 'show_more',
  show_more: function ($el, ev) {
    if (this._show_more_pending) {
      return;
    }

    let that = this;
    let $list = $el.closest(this.get_lists());
    let modelName = this.get_list_model($list);
    let visibleList = this.options.visible_lists[modelName];
    let resultsList = this.options.results_lists[modelName];
    let refreshQueue;
    let newVisibleList;
    let stopFn = tracker.start(
      `LHN: ${modelName}`,
      tracker.USER_JOURNEY_KEYS.LOADING,
      tracker.USER_ACTIONS.LHN.SHOW_MORE
    );

    if (visibleList.length >= resultsList.length) {
      return;
    }

    this._show_more_pending = true;
    refreshQueue = new RefreshQueue();
    newVisibleList = resultsList.slice(visibleList.length,
      visibleList.length + this.options.limit
    );

    newVisibleList.forEach(function (item) {
      refreshQueue.enqueue(item);
    });
    refreshQueue.trigger().then(function (newItems) {
      visibleList.push(...newItems);
      visibleList.attr('is_loading', false);
      delete that._show_more_pending;
    }).done(stopFn);
    visibleList.attr('is_loading', true);
  },

  init_object_lists: function () {
    let self = this;
    if (!this.options.results_lists) {
      this.options.results_lists = {};
    }
    if (!this.options.visible_lists) {
      this.options.visible_lists = {};
    }

    this.get_lists().forEach(function ($list) {
      let modelName;
      $list = $($list);
      modelName = self.get_list_model($list);
      self.options.results_lists[modelName] = new can.List();
      self.options.visible_lists[modelName] = new can.List();
      self.options.visible_lists[modelName].attr('is_loading', true);
    });
  },
  init_list_views: function () {
    let self = this;

    this.get_lists().forEach(function ($list) {
      let modelName;
      $list = $($list);
      modelName = self.get_list_model($list);

      let context = {
        model: businessModels[modelName],
        filter_params: self.options.filter_params,
        list: self.options.visible_lists[modelName],
        counts: self.options.counts,
        count: can.compute(function () {
          return self.options.results_lists[modelName].attr('length');
        }),
      };

      let listView = GGRC.Templates[
        $list.data('template') || self.options.list_view];
      let listItem = can.stache(listView)(context);
      $list.find(self.options.list_content_selector).html(listItem);

      // If this category we're rendering is the one that is open, wait for the
      //  list to finish rendering in the content pane, then set the scrolltop
      //  of the category to the stored value in display prefs.
      if (modelName === getLHNState().open_category) {
        $list.one('list_displayed', function () {
          $(this).find(self.options.list_content_selector).scrollTop(
            getLHNState().category_scroll || 0
          );
        });
      }

      let actionView = GGRC.Templates[
        $list.data('actions') || self.options.actions_view];
      let actions = can.stache(actionView)(context);
      $list.find(self.options.actions_content_selector).html(actions);
    });
  },
  get_list_model: function ($list, count) {
    $list = $($list);
    if (this.options.model_attr_selector) {
      $list = $list.find(this.options.model_attr_selector).first();
    }
    if (count && $list.attr('data-count')) {
      return $list.attr('data-count');
    }
    return $list.attr(this.options.model_attr);
  },
  get_extra_list_model: function ($list) {
    $list = $($list);
    if (this.options.model_attr_selector) {
      $list = $list.find(this.options.model_attr_selector).first();
    }
    if (!$list.attr(this.options.model_extra_attr)) {
      return null;
    }
    let model = $list.attr(this.options.model_attr);
    let extra = $list.attr(this.options.model_extra_attr).split(',');

    extra = $.map(extra, function (e) {
      return e + '=' + model;
    }).join(',');
    return extra;
  },
  display_counts: function (searchResult) {
    let self = this;

    // Remove all current counts
    self.options.counts.each(function (val, key) {
      self.options.counts.removeAttr(key);
    });
    // Set the new counts
    self.options.counts.attr(searchResult.counts.serialize());

    this.get_lists().forEach(function ($list) {
      let modelName;
      let count;
      $list = $($list);
      modelName = self.get_list_model($list, true);
      if (modelName) {
        count = searchResult.getCountFor(modelName);

        // Remove filter suffix (ie Workflow_All) from model_name before
        //  checking permissions
        modelName = modelName.split('_')[0];
        $list
          .find(self.options.count_selector)
          .text(count);
      }
    });
  },
  display_lists: function (searchResult) {
    let self = this;
    let lists = this.get_visible_lists();
    let dfds = [];

    lists.forEach(function (list) {
      let dfd;
      let $list = $(list);
      let modelName = self.get_list_model($list);
      let results = searchResult.getResultsForType(modelName);
      let refreshQueue = new RefreshQueue();
      let initialVisibleList = null;


      self.options.results_lists[modelName].attr(results, true);
      initialVisibleList =
          self.options.results_lists[modelName].slice(0, self.options.limit);

      initialVisibleList.forEach(function (obj) {
        refreshQueue.enqueue(obj);
      });

      function finishDisplay(results) {
        canBatch.start();
        self.options.visible_lists[modelName].attr('is_loading', false);
        self.options.visible_lists[modelName].replace(results);
        canBatch.stop();
        setTimeout(function () {
          $list.trigger('list_displayed', modelName);
        }, 1);
      }
      dfd = refreshQueue.trigger().then(finishDisplay);

      dfds.push(dfd);
    });

    return $.when(...dfds);
  },

  refresh_counts: function () {
    let searchId = this.search_id;
    let models;
    let extraModels;

    if (!$('.lhn-trigger').hasClass('active')) {
      this.options._hasPendingRefresh = true;
      return $.Deferred().resolve();
    }


    models = _.filteredMap(this.get_lists(),
      ($list) => this.get_list_model($list));
    extraModels = _.filteredMap(
      this.get_lists(), ($list) => this.get_extra_list_model($list));

    this.options._hasPendingRefresh = false;
    // Retrieve and display counts
    return Search.counts_for_types(
      this.current_term, models, this.current_params, extraModels
    ).then(function () {
      if (this.search_id === searchId) {
        return this.display_counts(...arguments);
      }
    }.bind(this));
  },

  refresh_visible_lists: function () {
    let self = this;
    let searchId = this.search_id;
    let lists = this.get_visible_lists();
    let models = _.filteredMap(lists, ($list) => this.get_list_model($list));

    if (!$('.lhn-trigger').hasClass('active')) {
      this.options._hasPendingRefresh = true;
      return $.Deferred().resolve();
    }

    models = _.filteredMap(models, (modelName) => {
      if (self.options.loaded_lists.indexOf(modelName) === -1) {
        return modelName;
      }
    });

    if (models.length > 0) {
      // Register that the lists are loaded
      models.forEach(function (modelName) {
        self.options.loaded_lists.push(modelName);
      });

      return Search.search_for_types(
        this.current_term, models, this.current_params
      ).then(function () {
        if (self.search_id === searchId) {
          return self.display_lists(...arguments);
        }
      });
    } else {
      return new $.Deferred().resolve();
    }
  },
  run_search: function (term, extraParams) {
    let filterList = [];
    const contactId = extraParams && extraParams.contact_id;
    let stopFn = tracker.start(
      tracker.FOCUS_AREAS.LHN,
      tracker.USER_JOURNEY_KEYS.LOADING,
      tracker.USER_ACTIONS.LHN.SEARCH(contactId ? 'My Objects' : 'All Objects'),
    );

    if (term !== this.current_term || extraParams !== this.current_params) {
      // Clear current result lists
      _.forEach(this.options.results_lists, function (list) {
        list.replace([]);
      });
      _.forEach(this.options.visible_lists, function (list) {
        list.replace([]);
        list.attr('is_loading', true);
      });
      this.options.loaded_lists = [];

      //  `search_id` exists solely to provide a simple unique value for
      //  each search to ensure results are shown for the correct search
      //  parameters (avoiding a race condition with quick search term
      //  changes)
      this.search_id = (this.search_id || 0) + 1;
      this.current_term = term;
      this.current_params = extraParams || {};

      // Construct extra_params based on filters:
      delete this.current_params.extra_params;
      setLHNState({filter_params: this.options.filter_params});
      this.options.filter_params.each(function (obj, type) {
        let propertiesList = [];
        obj.each(function (v, k) {
          propertiesList.push(k + '=' + v);
        });
        if (propertiesList.length) {
          filterList.push(type + ':' + propertiesList.join(','));
        }
      });
      this.current_params.extra_params = filterList.join(';');

      // Retrieve and display results for visible lists
      return $.when(
        this.refresh_counts(),
        this.refresh_visible_lists()
      ).done(stopFn);
    }
  },
  get_lists: function () {
    return $.makeArray(
      this.element.find(this.options.list_selector));
  },
  get_visible_lists: function () {
    let self = this;
    return _.filteredMap(this.get_lists(), ($list) => {
      $list = $($list);
      if ($list.find([self.options.list_content_selector,
        self.options.list_mid_level_selector].join(',')).hasClass('in')) {
        return $list;
      }
    });
  },

  '.filters a click': function (el, ev) {
    let term = getLHNState().search_text || '';
    let param = {};
    let key = el.data('key');
    let value = el.data('value');
    let forModel = el.parent().data('for');
    let filters = this.options.filter_params;
    if (this.options.observer.my_work) {
      param = {contact_id: GGRC.current_user.id};
    }

    if (el.hasClass('active')) {
      filters[forModel].removeAttr(key);
      this.run_search(term, param);
      return;
    }
    if (!(forModel in filters)) {
      filters.attr(forModel, {});
    }
    filters[forModel].attr(key, value);
    this.run_search(term, param);
  },
});

export {
  LhnControl,
};
