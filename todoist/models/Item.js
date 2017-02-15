import Model from './Model';

/**
* Implements an Item.
*/
class Item extends Model {

  get definition() {
    return {
      id: 0,
      user_id: 0,
      project_id: 0,
      content: '',
      date_string: '',
      date_lang: '',
      due_date_utc: null,
      indent: 0,
      priority: 0,
      item_order: 0,
      day_order: 0,
      collapsed: 0,
      children: null,
      labels: [],
      assigned_by_uid: 0,
      responsible_uid: null,
      checked: 0,
      in_history: 0,
      is_deleted: 0,
      is_archived: 0,
      sync_id: null,
      date_added: '',
    };
  }

  /**
  * Updates item.
  * @param {Object} params
  */
  update(params) {
    this.api.items.update(this.id, params);
    Object.assign(this.data, params);
  }

  /**
  * Deletes item.
  */
  delete() {
    this.api.items.delete([this.id]);
    this.is_deleted = 1;
  }

  /**
  * Moves item to another project.
  * @param {number} to_project
  */
  move(to_project) {
    this.api.items.move({ [this.project_id]: [this.id] }, to_project);
    this.project_id = to_project;
  }

  /**
  * Marks item as closed.
  */
  close() {
    this.api.items.close(this.id);
  }

  /**
  * Marks item as completed.
  * @param {boolean} force_history
  */
  complete(force_history = 0) {
    this.api.items.complete([this.id], force_history);
    this.checked = 1;
    this.in_history = force_history;
  }

  /**
  * Marks item as not completed.
  * @param {boolean} update_item_orders
  * @param {Object} restore_state
  */
  uncomplete(update_item_orders = 1, restore_state = {}){
    this.api.items.uncomplete([this.id], update_item_orders, restore_state);
    this.checked = 0;
    this.in_history = 0;

    if (restore_state[this.id]) {
      [
        this.in_history,
        this.checked,
        this.item_order,
        this.indent
      ] = restore_state[this.id];
    }
  }
  /**
  * Completes a recurring task.
  * @param {string} new_date_utc
  * @param {string} date_string
  * @param {boolean} is_forward
  */
  update_date_complete(new_date_utc = '', date_string = '', is_forward = 0) {
    this.api.items.update_date_complete(this.id, new_date_utc, date_string, is_forward);
    this.due_date_utc = new_date_utc || this.due_date_utc;
    this.date_string = date_string || this.date_string;
  }
};

export default Item;
