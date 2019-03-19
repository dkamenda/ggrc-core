/*
  Copyright (C) 2019 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import CanModel from 'can-model/src/can-model';

describe('validateUniqueTitle extension', () => {
  let TestModel;

  beforeAll(() => {
    TestModel = CanModel.extend({}, {
      define: {
        title: {
          value: '',
          validate: {
            validateUniqueTitle: true,
          },
        },
        _transient_title: {
          value: '',
          validate: {
            validateUniqueTitle: true,
          },
        },
      },
    });
  });

  it('Should return FALSE. transient_title - not empty', () => {
    const model = new TestModel();
    model.attr('_transient_title', 'title must be unique');
    expect(model.validate()).toBeFalsy();
  });

  it('Should return TRUE. transient_title - empty', () => {
    const model = new TestModel();
    model.attr('_transient_title', '');
    expect(model.validate()).toBeTruthy();
  });

  it('Should return TRUE. transient_title - empty, title - not empty', () => {
    const model = new TestModel();
    model.attr('_transient_title', '');
    model.attr('title', 'test title');
    expect(model.validate()).toBeTruthy();
  });

  it('Should return FALSE. transient_title - not empty, title - not empty',
    () => {
      const model = new TestModel();
      model.attr('_transient_title', 'title must be unique');
      model.attr('title', 'test title');
      expect(model.validate()).toBeFalsy();
    }
  );
});
