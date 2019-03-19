/*
  Copyright (C) 2019 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import CanModel from 'can-model/src/can-model';

describe('validateStartEndDates extension', () => {
  let TestModel;

  beforeAll(() => {
    TestModel = CanModel.extend({}, {
      define: {
        start_date: {
          value: '2015-05-20T08:17:54',
          validate: {
            validateStartEndDates: true,
          },
        },
        end_date: {
          value: '2015-03-20T08:17:54',
          validate: {
            validateStartEndDates: true,
          },
        },
      },
    });
  });

  it('should return TRUE. daterange is correct', () => {
    const model = new TestModel();
    model.attr('start_date', '2015-05-20');
    model.attr('end_date', '2015-05-23');
    expect(model.validate()).toBeTruthy();
  });

  it('should return FALSE. end_date is empty', () => {
    const model = new TestModel();
    model.attr('start_date', '2015-05-20');
    expect(model.validate()).toBeFalsy();
  });

  it('should return FALSE. start_date is empty', () => {
    const model = new TestModel();
    model.attr('end_date', '2015-05-20');
    expect(model.validate()).toBeFalsy();
  });

  it('should return FALSE. dates are empty', () => {
    const model = new TestModel();
    model.attr('end_date', null);
    model.attr('start_date', null);
    expect(model.validate()).toBeFalsy();
  });
});
