import Manager from './Manager';
import Label from './../models/Label';

class LabelsManager extends Manager {

  get state_name() { return 'labels'; }
  get object_type() { return 'label'; }

  /**
  * Creates a local label object.
  * @param {string} name
  * @param {Object} params
  * @return {Label}
  */
  add(name, params) {
    const obj = new Label({ name }, this.api);
    obj.temp_id = obj.id = this.api.generate_uuid();
    Object.assign(obj.data, params);
    this.api.state[this.state_name].push(obj);

    // get obj data w/o id attribute
    const { id, ...args } = obj.data;

    this.queueCmd({
      type: 'label_add',
      temp_id: obj.temp_id,
    }, args);

    return obj;
  }

  /**
  * Updates a label remotely.
  * @param {number} label_id
  * @param {Objec} params
  */
  update(label_id, params) {
    const args = Object.assign({}, params, { id: label_id });
    this.queueCmd('label_update', args);
  }

  /**
  * Deletes a label remotely.
  * @param {number} label_id
  */
  delete(label_id) {
    this.queueCmd('label_delete', { id: label_id });
    this.get_by_id(label_id, true).then(l => {
      if (l) {
        l.is_deleted = 1;
      }
    });
  }

  /**
  * Updates the orders of multiple labels remotely.
  * @param {Objec} id_order_mapping Mapping object with label ids
  *   as keys and Array.<number> as order.
  */
  update_orders(id_order_mapping) {
    this.queueCmd('label_update_orders', { id_order_mapping });
  }

  /**
  * Gets an existing label.
  * @param {number} label_id
  * @return {Promise}
  */
  get(label_id) {
    const params = { label_id };
    return this.api.get('labels/get', params).then((response) => {
      if (response.error) {
        return null;
      }
      const data = {
        labels: response.label ? [response.label] : [],
      };

      this.api.update_state(data);
      return response;
    });
  }
}

export default LabelsManager;
