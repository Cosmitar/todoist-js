import Manager from './Manager';
import Item from './../models/Item';

class ItemsManager extends Manager {

  get state_name() { return 'items'; }
  get object_type() { return 'item'; }

  /**
  * Creates a local item object.
  * @param {string} content
  * @param {number} project_id
  * @param {Object} params
  * @return {Item}
  */
  add(content, project_id, params) {
    const obj = new Item({ content, project_id }, this.api);
    obj.temp_id = obj.id = this.api.generate_uuid();
    Object.assign(obj.data, params);
    this.api.state[this.state_name].push(obj);

    // get obj data w/o id attribute
    const { id, ...args } = obj.data;

    this.queueCmd({
      type: 'item_add',
      temp_id: obj.temp_id,
    }, args);
    return obj;
  }

  /**
  * Updates an item remotely.
  * @param {number} item_id
  * @param {Object} params
  */
  update(item_id, params) {
    const args = Object.assign( {}, params, { id: item_id });
    this.queueCmd('item_update', args);
  }

  /**
  * Deletes items remotely.
  * @param {Array.<number>} item_ids
  */
  delete(item_ids) {
    this.queueCmd('item_delete', { ids: item_ids });
    item_ids.forEach(id => {
      this.get_by_id(id, true).then(i => {
        if (i) {
          i.is_deleted = 1;
        }
      });
    });
  }

  /**
  * Moves items to another project remotely.
  * @param {Object} project_items Mapping object with project
  *   ids as keys and Array.<number> as list of item ids.
  * @param {number} to_project Destination project id.
  */
  move(project_items, to_project) {
    this.queueCmd('item_move', {
      project_items,
      to_project,
    });
  }

  /**
  * Marks item as done.
  * @param {number} item_id
  */
  close(item_id) {
    this.queueCmd('item_close', { id: item_id });
  }

  /**
  * Marks items as completed remotely.
  * @param {Array.<number>} item_ids
  * @param {boolean} force_history
  */
  complete(item_ids, force_history) {
    this.queueCmd('item_complete', {
      ids: item_ids,
      force_history,
    });
  }

  /**
  * Marks items as not completed remotely.
  * @param {Array.<number>} item_ids
  * @param {boolean} update_item_orders
  * @param {boolean} restore_state
  */
  uncomplete(item_ids, update_item_orders, restore_state) {
    const args = {
      ids: item_ids,
      update_item_orders,
    };

    if (restore_state) {
      args['restore_state'] = restore_state;
    }

    this.queueCmd('item_uncomplete', args);
  }

  /**
  * Completes a recurring task remotely.
  * @param {number} item_id
  * @param {string} new_date_utc
  * @param {string} date_string
  * @param {boolean} is_forward
  */
  update_date_complete(item_id, new_date_utc, date_string, is_forward) {
    const args = {
      'id': item_id,
    };

    if (new_date_utc) {
      args.new_date_utc = new_date_utc;
    }

    if (date_string) {
      args.date_string = date_string;
    }

    if (!isNaN(is_forward)) {
      args.is_forward = is_forward;
    }

    this.queueCmd('item_update_date_complete', args);
  }

  /**
  * Updates the order and indents of multiple items remotely.
  * @param {object} ids_to_orders_indents Mapping object with item ids as
  *   keys and values with Array.<number> length 2 where 1st element is order and 2nd indent.
  */
  update_orders_indents(ids_to_orders_indents) {
    this.queueCmd('item_update_orders_indents', { ids_to_orders_indents });
  }

  /**
  * Updates in the local state the day orders of multiple items remotely.
  * @param {object} ids_to_orders Mapping object with item ids as keys
  *   and number values for order.
  */
  update_day_orders(ids_to_orders) {
    this.queueCmd('item_update_day_orders', { ids_to_orders });
  }

  /**
  * Returns a project's completed items.
  * @param {number} project_id
  * @param {Object} params
  * @return {Promise}
  */
  get_completed(project_id, params) {
    const args = Object.assign({}, params, { project_id });
    return this.api.get('items/get_completed', args);
  }

  /**
  * Gets an existing item.
  * @param {number} item_id
  * @return {Promise}
  */
  get(item_id) {
    const args = { item_id };
    return this.api.get('items/get', args).then((response) => {
      if (response.error) {
        return null;
      }
      const data = {
        projects: response.project ? [response.project] : [],
        items: response.item ? [response.item] : [],
        // @TODO check how to assign notes here
        notes: response.note ? [...response.notes] :[],
      };
      this.api.update_state(data);

      return response;
    });

  }
}

export default ItemsManager;
