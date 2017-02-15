import Manager from './Manager';

class ActivityManager extends Manager {
  /**
  * Get events from the activity log.
  * @param {object} params
  * @return {Promise}
  */
  get(params) {
    return this.api.get('activity/get', params);
  }
}

export default ActivityManager;
