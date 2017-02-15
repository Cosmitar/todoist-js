import Model from  './Model';

/**
* Implements a reminder.
*/
class Reminder extends Model {

  get definition() {
    return {
      id: 0,
      notify_uid: 0,
      item_id: 0,
      service: '',
      type: '',
      date_string: '',
      date_lang: '',
      due_date_utc: '',
      minute_offset: 0,
      is_deleted: 0,
    };
  }

  /**
  * Updates reminder.
  * @param {Object} params
  */
  update(params) {
    this.api.reminders.update(this.id, params);
    Object.assign(this.data, params);
  }

  /**
  * Deletes reminder.
  */
  delete() {
    this.api.reminders.delete(this.id);
    this.is_deleted = 1;
  }
}

export default Reminder;
