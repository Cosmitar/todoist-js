import Manager from './Manager';

class BackupsManager extends Manager {
  /**
  * Get backups.
  * @param {object} params
  * @return {Promise}
  */
  get(params) {
    return this.api.get('backups/get', params);
  }
}

export default BackupsManager;
