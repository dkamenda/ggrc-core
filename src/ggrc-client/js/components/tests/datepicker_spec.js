/*
 Copyright (C) 2019 Google Inc.
 Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 */

import * as Utils from '../../plugins/ggrc_utils';
import {DATE_FORMAT} from '../../plugins/utils/date-utils';
import {getComponentVM} from '../../../js_specs/spec_helpers';
import Component from '../datepicker/datepicker';


describe('datepicker component', function () {
  let events;

  beforeAll(function () {
    events = Component.prototype.events;
  });

  describe('viewModel', function () {
    let viewModel;

    beforeEach(function () {
      viewModel = getComponentVM(Component);
    });

    describe('onSelect() method', function () {
      it('sets new date', function () {
        viewModel.attr('date', 'oldDate');
        viewModel.onSelect('newDate');
        expect(viewModel.attr('date')).toEqual('newDate');
      });
      it('sets false to isShown attribute', function () {
        viewModel.attr('isShown', true);
        viewModel.onSelect();
        expect(viewModel.attr('isShown')).toEqual(false);
      });
    });

    describe('onFocus() method', function () {
      it('sets false to showTop attribute', function () {
        spyOn(Utils, 'inViewport')
          .and.returnValue(true);
        viewModel.attr('showtop', true);
        viewModel.onFocus();
        expect(viewModel.attr('showTop')).toEqual(false);
      });
      it('sets true to isShown attribute', function () {
        spyOn(Utils, 'inViewport')
          .and.returnValue(true);
        viewModel.attr('isShown', false);
        viewModel.onFocus();
        expect(viewModel.attr('isShown')).toEqual(true);
      });
      it('does not set true to showTop attribute if picker is in viewport',
        function () {
          spyOn(Utils, 'inViewport')
            .and.returnValue(true);
          viewModel.onFocus();
          expect(viewModel.attr('showTop')).toEqual(false);
        });
      it('sets true to showTop attribute if picker is not in viewport',
        function () {
          spyOn(Utils, 'inViewport')
            .and.returnValue(false);
          viewModel.onFocus();
          expect(viewModel.attr('showTop')).toEqual(true);
        });
    });
  });

  describe('events', function () {
    describe('inserted() method', function () {
      let method;
      let that;
      let viewModel;
      let altField;
      let element;

      beforeEach(function () {
        viewModel = getComponentVM(Component);
        viewModel.onSelect.bind = jasmine.createSpy()
          .and.returnValue('mockOnSelect');
        element = $('<div class="datepicker__calendar"></div>');
        altField = $('<div class="datepicker__input"></div>');
        $('body').append(element);
        $('body').append(altField);
        that = {
          viewModel: viewModel,
          element: $('body'),
          getDate: function (date) {
            return date;
          },
          updateDate: jasmine.createSpy(),
        };
        method = events.inserted.bind(that);
      });
      afterEach(function () {
        $('body').html('');
      });

      it('create datepicker in specified format', function () {
        method();
        expect(element.datepicker('option', 'dateFormat'))
          .toEqual(DATE_FORMAT.PICKER_ISO_DATE);
        expect(element.datepicker('option', 'altField')[0])
          .toEqual(altField[0]);
        expect(element.datepicker('option', 'altFormat'))
          .toEqual(DATE_FORMAT.PICKER_DISPLAY_FMT);
      });
      it('sets new datepicker to picker of viewModel', function () {
        method();
        expect(viewModel.attr('picker')[0]).toEqual(element[0]);
      });
      it('sets date from viewModel to datepicker', function () {
        element.datepicker('setDate', '2011-11-11');
        viewModel.attr('date', '2012-12-12');
        method();
        expect(viewModel.picker.datepicker().val()).toEqual('2012-12-12');
      });
      it('sets min allowed date to viewModel', function () {
        viewModel.attr('minDate', '2000-10-10');
        viewModel.setMinDate = '2001-01-01';
        method();
        expect(viewModel.attr('setMinDate')).toEqual('2001-01-01');
      });
      it('sets max allowed date to viewModel', function () {
        viewModel.attr('maxDate', '2000-10-10');
        viewModel.setMaxDate = '2011-11-11';
        method();
        expect(viewModel.attr('setMaxDate')).toEqual('2011-11-11');
      });
      it('updates min date if setMinDate is define in viewModel', function () {
        viewModel.setMinDate = '2001-01-01';
        method();
        expect(that.updateDate).toHaveBeenCalledWith('minDate', '2001-01-01');
      });
      it('updates max date if setMaxDate is define in viewModel', function () {
        viewModel.setMaxDate = '2011-11-11';
        method();
        expect(that.updateDate).toHaveBeenCalledWith('maxDate', '2011-11-11');
      });
    });

    describe('getDate() method', function () {
      let method;
      let that;
      let viewModel;

      beforeEach(function () {
        viewModel = getComponentVM(Component);
        that = {
          viewModel: viewModel,
          isValidDate: events.isValidDate.bind(that),
        };
        method = events.getDate.bind(that);
      });

      it('returns formatted date if it is Date object', function () {
        expect(method(new Date('2011-11-11T00:00:00'))).toEqual('2011-11-11');
      });
      it('returns date if it is valid date', function () {
        expect(method('2012-12-12')).toEqual('2012-12-12');
      });
      it('returns null if it is invalid date', function () {
        expect(method('2013-13-13')).toEqual(null);
      });
    });

    describe('isValidDate() method', function () {
      let method;
      let that;

      beforeEach(function () {
        that = {
          viewModel: getComponentVM(Component),
        };
        method = events.isValidDate.bind(that);
      });
      it('returns true if it is valid date', function () {
        expect(method('2011-11-11')).toEqual(true);
      });
      it('returns false if it is invalid date', function () {
        expect(method('-2011-11-11')).toEqual(false);
        expect(method('2011-33-01')).toEqual(false);
        expect(method('2011-11-45')).toEqual(false);
      });
    });

    describe('updateDate() method', function () {
      let method;
      let that;

      beforeEach(function () {
        that = new can.Map({
          viewModel: can.Map.extend({
            picker: {
              datepicker: jasmine.createSpy(),
            },
          }),
        });
        method = events.updateDate.bind(that);
      });

      it('returns undefined for empty date', function () {
        expect(method('maxDate')).toBe(null);
        expect(method('maxDate', null)).toBe(null);
        expect(method('minDate', '')).toBe(null);
      });

      it('returns a date incremented by a day for maxDate', function () {
        let result = method('maxDate', new Date(2017, 0, 1));

        expect(result.getDate()).toBe(31);
        expect(result.getFullYear()).toBe(2016);
        expect(result.getMonth()).toBe(11);
      });

      it('returns a date decremented by a day for minDate', function () {
        let result = method('minDate', new Date(2017, 0, 1));

        expect(result.getDate()).toBe(2);
        expect(result.getFullYear()).toBe(2017);
        expect(result.getMonth()).toBe(0);
      });
    });

    describe('prepareDate() method', function () {
      let method;
      let viewModel;

      beforeEach(function () {
        viewModel = getComponentVM(Component);
        method = events.prepareDate.bind(viewModel);
      });

      it('returns null for incorrect date', function () {
        expect(method(viewModel, 'some string')).toBe(null);
        expect(method(viewModel, '11.12.68')).toBe(null);
        expect(method(viewModel, '11.12.2017')).toBe(null);
        expect(method(viewModel, '')).toBe(null);
      });

      it('returns ISO date formated for correct date', function () {
        expect(method(viewModel, '11/12/2017')).toBe('2017-11-12');
        expect(method(viewModel, ' 11/12/2017')).toBe('2017-11-12');
        expect(method(viewModel, '11/12/2017 ')).toBe('2017-11-12');
      });
    });

    describe('"{viewModel} setMinDate" handler', function () {
      let method;
      let viewModel;
      let that;

      beforeEach(function () {
        viewModel = getComponentVM(Component);
        that = {
          viewModel,
        };
        method = events['{viewModel} setMinDate'].bind(that);
      });
      it('does not change _date if updated date is falsy', function () {
        viewModel.attr('_date', '11/11/2011');
        that.updateDate = jasmine.createSpy()
          .and.returnValue(new Date());
        method(viewModel, {});
        expect(viewModel.attr('_date')).toEqual('11/11/2011');
      });
      it('does not change _date if updated date is before current date',
        function () {
          viewModel.attr('_date', '11/11/2011');
          viewModel.attr('date', '2011-11-11');
          that.updateDate = jasmine.createSpy()
            .and.returnValue(new Date('2010-10-10'));
          method(viewModel, {});
          expect(viewModel.attr('_date')).toEqual('11/11/2011');
        });
      it('changes _date if updated date is after current date',
        function () {
          viewModel.attr('_date', '2011-11-11');
          viewModel.attr('date', '2011-11-11');
          that.updateDate = jasmine.createSpy()
            .and.returnValue(new Date('2012-12-12'));
          method(viewModel, {});
          expect(viewModel.attr('_date')).toEqual('12/12/2012');
        });
    });

    describe('"{viewModel} setMaxDate" handler', function () {
      let method;
      let that;
      beforeEach(function () {
        that = {
          updateDate: jasmine.createSpy(),
        };
        method = events['{viewModel} setMaxDate'].bind(that);
      });
      it('calls updateDate with "maxDate" and new date as arguments',
        function () {
          let date = '11-11-2011';
          method({}, {}, date);
          expect(that.updateDate).toHaveBeenCalledWith('maxDate', date);
        });
    });

    describe('"{viewModel} _date" handler', function () {
      let method;
      let that;
      let viewModel;

      beforeEach(function () {
        viewModel = getComponentVM(Component);
        viewModel.picker = {
          datepicker: jasmine.createSpy(),
        };
        that = {
          prepareDate: jasmine.createSpy()
            .and.returnValue('ISODate'),
        };
        method = events['{viewModel} _date'].bind(that);
      });

      it('sets prepared date to viewModel', function () {
        method(viewModel, {}, {});
        expect(viewModel.attr('date')).toEqual('ISODate');
      });
      it('sets prepared date to datepicker', function () {
        method(viewModel, {}, {});
        expect(viewModel.picker.datepicker)
          .toHaveBeenCalledWith('setDate', 'ISODate');
      });
    });

    describe('"{window} mousedown" handler', function () {
      let method;
      let that;
      let viewModel;

      beforeEach(function () {
        viewModel = getComponentVM(Component);
        that = {
          viewModel: viewModel,
        };
        method = events['{window} mousedown'].bind(that);
      });

      it('sets isShown to false if datepicker is shown' +
      ' and click was outside the datepicker', function () {
        viewModel.attr('isShown', true);
        spyOn(Utils, 'isInnerClick')
          .and.returnValue(false);
        method({}, {});
        expect(viewModel.attr('isShown')).toEqual(false);
      });
      it('does nothing if datepicker is persistent', function () {
        viewModel.attr('persistent', true);
        viewModel.attr('isShown', true);
        method({}, {});
        expect(viewModel.attr('isShown')).toEqual(true);
      });
      it('does nothing if click was inside the datepicker', function () {
        viewModel.attr('persistent', false);
        viewModel.attr('isShown', true);
        spyOn(Utils, 'isInnerClick')
          .and.returnValue(true);
        method({}, {});
        expect(viewModel.attr('isShown')).toEqual(true);
      });
    });
  });
});
