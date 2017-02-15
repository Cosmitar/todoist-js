import Manager from './Manager';

class CompletedManager extends Manager{
  /**
  * Returns the user's recent productivity stats.
  * @return {Promise}
  */
  get_stats() {
    return this.api.get('completed/get_stats');
  }

  /**
  * Returns all user's completed items.
  * @return {Promise}
  */
  get_all(params = {}) {
    return this.api.get('completed/get_all', params);
  }
}

export default CompletedManager;
