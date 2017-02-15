import Manager from './Manager';
import Reminder from './../models/Reminder';

class RemindersManager extends Manager {

  get state_name() { return 'reminders'; }
  get object_type() { return 'reminder'; }

  /**
  * Creates a local reminder object.
  * @param {number} item_id
  * @param {Object} params
  * @return {Reminder}
  */
  add(item_id, params) {
    const obj = new Reminder({ item_id }, this.api);
    obj.temp_id = obj.id = this.api.generate_uuid();
    Object.assign(obj.data, params);
    this.api.state[this.state_name].push(obj);

    // get obj data w/o id attribute
    const { id, ...args } = obj.data;

    this.queueCmd({
      type: 'reminder_add',
      temp_id: obj.temp_id,
    }, args);

    return obj;
  }

  /**
  * Updates a reminder remotely.
  * @param {number} reminder_id
  * @param {Object} params
  */
  update(reminder_id, params) {
    const args = Object.assign( {}, params, { id: reminder_id });
    this.queueCmd('reminder_update', args);
  }

  /**
  * Deletes a reminder remotely.
  * @param {number} reminder_id
  */
  delete(reminder_id) {
    this.queueCmd('reminder_delete', { id: reminder_id });
    this.get_by_id(reminder_id, true).then(r => {
      if (r) {
        r.is_deleted = 1;
      }
    });
  }

  /**
  * Gets an existing reminder.
  * @param {number} reminder_id
  * @return {Promise}
  */
  get(reminder_id) {
    const args = { reminder_id };
    return this.api.get('reminders/get', args).then((response) => {
      if (response.error) {
        return null;
      }
      const data = {
        reminders: response.reminder ? [response.reminder] : [],
      };
      this.api.update_state(data);

      return response;
    });
  }
}

export default RemindersManager;
