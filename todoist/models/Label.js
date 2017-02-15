import Model from './Model';

/**
* Implements a filter.
*/
class Label extends Model {

  get definition() {
    return {
      id: 0,
      name: '',
      color: 0,
      item_order: 0,
      is_deleted: 0,
    };
  }

  /**
  * Updates label.
  * @param {Object} params
  */
  update(params) {
    this.api.labels.update(this.id, params);
    Object.assign(this.data, params);
  }

  /**
  * Deletes label.
  */
  delete() {
    this.api.labels.delete(this.id);
    this.is_deleted = 1;
  }
};

export default Label;
