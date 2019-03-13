/*
    Copyright (C) 2019 Google Inc.
    Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
*/

export default can.Component.extend({
  tag: 'dropdown-wrapper',
  leakScope: true,
  viewModel: can.Map.extend({
    value: null,
    selected: '',
    options: [],
    role: '',
    define: {
      /*
        dropdown-wrapper when data should be fetched first
        {modelConstructor}: Model definition to fetch
        {(selected)}: Two-way binding parent`s target attribute
      */
      modelConstructor: {
        set(newModelConstructor) {
          if (newModelConstructor) {
            let role = this.attr('role');
            let params = role ? {role} : {};

            newModelConstructor.findAll(params)
              .done(this.prepareOptions.bind(this));

            return newModelConstructor;
          }
        },
      },
    },
    prepareOptions(items) {
      let selected = this.attr('value');
      let options = _.map(items, (item) => {
        return {
          value: item.id,
          title: item.title,
        };
      });

      this.attr('options', options);
      this.attr('selected', selected && selected.id ? selected.id : '');
    },
    selectedChanged() {
      let newSelected = this.attr('selected');
      let model = this.attr('modelConstructor');

      // get new item from Cache
      let selected = model.findInCacheById(newSelected);

      this.attr('value', selected || null);
    },
  }),
});
