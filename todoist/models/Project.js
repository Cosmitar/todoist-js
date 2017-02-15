import Model from './Model';

/**
* Implements a project.
*/
class Project extends Model {

  get definition() {
    return {
      id: 0,
      name: '',
      color: 0,
      indent: 0,
      item_order: 0,
      collapsed: 0,
      shared: 0,
      is_deleted: 0,
      is_archived: 0,
    };
  }

  /**
  * Updates project.
  * @param {Object} params
  */
  update(params) {
    this.api.projects.update(this.id, params);
    Object.assign(this.data, params);
  }

  /**
  * Deletes project.
  */
  delete() {
    this.api.projects.delete([this.id]);
    this.is_deleted = 1;
  }

  /**
  * Marks project as archived.
  */
  archive() {
    this.api.projects.archive(this.id);
    this.is_archived = 1;
  }

  /**
  * Marks project as not archived.
  */
  unarchive() {
    this.api.projects.unarchive(this.id);
    this.is_archived = 0;
  }

  /**
  * Shares projects with a user.
  * @param {string} email
  * @param {string} message
  */
  share(email, message = '') {
    this.api.projects.share(this.id, email, message);
  }

  /**
  * Takes ownership of a shared project.
  */
  take_ownership() {
    this.api.projects.take_ownership(this.id);
  }
}

export default Project;
