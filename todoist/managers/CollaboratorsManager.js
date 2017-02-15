import Manager from './Manager';

class CollaboratorsManager extends Manager {

  get state_name() { return 'collaborators'; }

  /**
  * Deletes a collaborator from a shared project.
  * @param {number} project_id
  * @param {string} email
  */
  delete(project_id, email) {
    this.queueCmd('delete_collaborator', {
      project_id: project_id,
      email: email,
    });
  }
}

export default CollaboratorsManager;
