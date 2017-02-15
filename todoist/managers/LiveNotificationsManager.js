import Manager from './Manager';

class LiveNotificationsManager extends Manager {

  get state_name() { return 'live_notifications'; }

  /**
  * Sets in the local state the last notification read.
  * @param {number} id
  */
  set_last_read(id){
    this.queueCmd('live_notifications_set_last_read', { id });
  }
}

export default LiveNotificationsManager;
