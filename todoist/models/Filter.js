import Model from './Model';

/**
* Implements a filter.
*/
class Filter extends Model {

  get definition() {
    return {
      id: 0,
      name: '',
      query: '',
      color: 0,
      item_order: 0,
      is_deleted: 0,
    };
  }

  /**
  * Updates filter.
  * @param {Object} params
  */
  update(params) {
    this.api.filters.update(this.id, params);
    Object.assign(this.data, params);
  }

  /**
  * Deletes filter.
  */
  delete() {
    this.api.filters.delete(this.id);
    this.is_deleted = 1;
  }
};

export default Filter;
