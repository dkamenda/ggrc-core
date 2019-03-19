/*
  Copyright (C) 2019 Google Inc.
  Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

import CanModel from 'can-model/src/can-model';

describe('validateMultiChoiceOptions extension', () => {
  let TestModel;

  beforeAll(() => {
    TestModel = CanModel.extend({}, {
      define: {
        multi_choice_options: {
          value: '',
          validate: {
            validateMultiChoiceOptions: true,
          },
        },
        attribute_type: {
          value: '',
          validate: {
            validateMultiChoiceOptions: true,
          },
        },
      },
    });
  });

  it('Should return TRUE. attribute_type is empty string', () => {
    const model = new TestModel();
    model.attr('attribute_type', '');
    expect(model.validate()).toBeTruthy();
  });

  it('Should return TRUE. attribute_type is not dropdown', () => {
    const model = new TestModel();
    model.attr('attribute_type', 'test type');
    expect(model.validate()).toBeTruthy();
  });

  it('Should return TRUE. Dropdown has correct values', () => {
    const model = new TestModel();
    model.attr('attribute_type', 'Dropdown');
    model.attr('multi_choice_options', '5 , 51, 52');
    expect(model.validate()).toBeTruthy();
  });

  it('Should return FALSE. Empty string as Dropdown value', () => {
    const model = new TestModel();
    model.attr('attribute_type', 'Dropdown');
    model.attr('multi_choice_options', '');
    expect(model.validate()).toBeFalsy();
  });

  it('Should return FALSE. Null as Dropdown value', () => {
    const model = new TestModel();
    model.attr('attribute_type', 'Dropdown');
    model.attr('multi_choice_options', null);
    expect(model.validate()).toBeFalsy();
  });

  it('Should return FALSE. Dropdown has "Blank" values', () => {
    const model = new TestModel();
    model.attr('attribute_type', 'Dropdown');
    model.attr('multi_choice_options', ' , 1, 2');
    expect(model.validate()).toBeFalsy();
  });

  it('Should return FALSE. Dropdown has duplicates', () => {
    const model = new TestModel();
    model.attr('attribute_type', 'Dropdown');
    model.attr('multi_choice_options', '2, 1, 2');
    expect(model.validate()).toBeFalsy();
  });
});
