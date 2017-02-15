import Model from './Model';

/**
* Implements a collaborator.
*/
class Collaborator extends Model {

  get definition() {
    return {
      id: 0,
      email: '',
      full_name: '',
      timezone: '',
      image_id: null,
    };
  }

  /**
  * Deletes a collaborator from a shared project.
  * @param {number} project_id
  */
  delete(project_id) {
    this.api.collaborators.delete(project_id, this.email);
  }
}

export default Collaborator;
