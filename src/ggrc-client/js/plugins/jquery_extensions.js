/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

$.fn.extend({
  load: function (callback) {
    $(window).on('load', callback);
  },

  /*
  * @function jQuery.fn.controls jQuery.fn.controls
  * @parent can.Control.plugin
  * @description Get the Controls associated with elements.
  * @signature `jQuery.fn.controls([type])`
  * @param {String|can.Control} [control] The type of Controls to find.
  * @return {can.Control} The controls associated with the given elements.
  *
  * @body
  * When the widget is initialized, the plugin control creates an array
  * of control instance(s) with the DOM element it was initialized on using
  * [can.data] method.
  *
  * The `controls` method allows you to get the control instance(s) for any element
  * either by their type or pluginName.
  */
  controls: function () {
    let controllerNames = can.makeArray(arguments);
    let instances = [];
    let controls;
    // check if arguments
    this.each(function () {
      controls = $(this).data('controls');
      if (!controls) {
        return;
      }
      for (let i = 0; i < controls.length; i++) {
        let control = controls[i];
        if (!controllerNames.length) {
          instances.push(control);
        }
      }
    });
    return instances;
  },

  /*
   * @function jQuery.fn.control jQuery.fn.control
   * @parent can.Control.plugin
   * @description Get the Control associated with elements.
   * @signature `jQuery.fn.control([type])`
   * @param {String|can.Control} [control] The type of Control to find.
   * @return {can.Control} The first control found.
   *
   * @body
   * This is the same as [jQuery.fn.controls $().controls] except that
   * it only returns the first Control found.
   */
  control: function () {
    /* eslint-disable */
    return this.controls.apply(this, arguments)[0];
  },
});
