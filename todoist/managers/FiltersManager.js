import Manager from './Manager';
import Filter from './../models/Filter';

class FiltersManager extends Manager {

  get state_name() { return 'filters'; }
  get object_type() { return 'filter'; }

  /**
  * Creates a local filter object.
  * @param {string} name
  * @param {string} query
  * @param {Object} params
  * @return {Filter}
  */
  add(name, query, params) {
    const obj = new Filter({ name, query }, this.api);
    obj.temp_id = obj['id'] = this.api.generate_uuid();
    Object.assign(obj.data, params);
    this.api.state[this.state_name].push(obj);

    // get obj data w/o id attribute
    const { id, ...args } = obj.data;

    this.queueCmd({
      type: 'filter_add',
      temp_id: obj.temp_id,
    }, args);
    return obj;
  }

  /**
  * Updates a filter remotely.
  * @param {number} filter_id
  * @param {Object} params
  */
  update(filter_id, params) {
    const args = Object.assign({}, params, { id: filter_id });
    this.queueCmd('filter_update', args);
  }

  /**
  * Deletes a filter remotely.
  *   note: since api response isn't including deleted objects
  *   must flag as deleted by received id.
  * @param {number} filter_id
  * @param {Object} params
  */
  delete(filter_id) {
    this.queueCmd('filter_delete', { id: filter_id });
    this.get_by_id(filter_id, true).then(f => {
      if (f) {
        f.is_deleted = 1;
      }
    });
  }

  /**
  * Updates the orders of multiple filters remotely.
  * @param {Object} id_order_mapping
  */
  update_orders(id_order_mapping) {
    this.queueCmd('filter_update_orders', { id_order_mapping });
  }

  /**
  * Gets an existing filter.
  * @param {number} filter_id
  * @return {Promise}
  */
  get(filter_id) {
    const params = {
      filter_id: filter_id,
    };
    return this.api.get('filters/get', params).then((response) => {
      if (response.error) {
        return null;
      }
      const data = {
        filters: response.filters ? [filters] : []
      };
      this.api.update_state(data);

      return response;
    });
  }
}

export default FiltersManager;
