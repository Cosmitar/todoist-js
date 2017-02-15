import Manager from './Manager';

class CollaboratorStatesManager extends Manager {

  get state_name() { return 'collaborator_states'; }

  /**
  * Finds and returns the collaborator state based on the project and user
  *   ids.
  * @param {number} project_id
  * @param {number} user_id
  */
  get_by_ids(project_id, user_id) {
    const obj = this.api.state[this.state_name].find(
      c => c.project_id === project_id && c.user_id === user_id
    );
    return Promise.resolve(obj);
  }
}

export default CollaboratorStatesManager;
