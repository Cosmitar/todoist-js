import Manager from './Manager';
import Project from './../models/Project';

class ProjectsManager extends Manager {
  get state_name() { return 'projects'; }
  get object_type() { return 'project'; }

  /**
  * Creates a local project object.
  * @param {string} name
  * @param {Object} params
  * @return {Project}
  */
  add(name, params) {
    const obj = new Project({ name }, this.api);
    obj.temp_id = obj.id = `$${this.api.generate_uuid()}`;
    Object.assign(obj.data, params);
    this.api.state[this.state_name].push(obj);

    // get obj data w/o id attribute
    const { id, ...args } = obj.data;

    this.queueCmd({
      type: 'project_add',
      temp_id: obj.temp_id,
    }, args);
    return obj;
  }

  /**
  * Updates a project remotely.
  * @param {number} project_id
  * @param {Object} params
  */
  update(project_id, params) {
    (async () => {
      const obj = await this.get_by_id(project_id);
      if (obj) {
        Object.assign(obj.data, params);
      }
    })();

    const args = Object.assign({}, params, { id: project_id });
    this.queueCmd('project_update', args);
  }

  /**
  * Deletes a project remotely.
  * @param {Array.<number>} project_ids
  */
  delete(project_ids) {
    this.queueCmd('project_delete', { ids: project_ids });
    project_ids.forEach(id => {
      this.get_by_id(id, true).then(p => {
        if (p) {
          p.is_deleted = 1;
        }
      });
    });
  }

  /**
  * Marks project as archived remotely.
  * @param {number} project_id
  */
  archive(project_id) {
    this.queueCmd('project_archive', { id: project_id });
    this.get_by_id(project_id, true).then(p => {
      p.is_archived = 1;
    });
  }

  /**
  * Marks project as not archived remotely.
  * @param {number} project_id
  */
  unarchive(project_id) {
    this.queueCmd('project_unarchive', { id: project_id });
  }

  /**
  * Updates the orders and indents of multiple projects remotely.
  * @param {Object} ids_to_orders_indents Mapping object with project ids as
  *   keys and values with Array.<number> length 2 where 1st element is order and 2nd indent.
  */
  update_orders_indents(ids_to_orders_indents) {
    this.queueCmd('project_update_orders_indents', { ids_to_orders_indents });
  }

  /**
  * Shares a project with a user.
  * @param {number} project_id
  * @param {string} email
  * @param {string} message
  */
  share(project_id, email, message) {
    this.queueCmd('share_project', {
      project_id,
      email,
    });
  }

  /**
  * Returns archived projects.
  * @return {Promise}
  */
  get_archived() {
    return this.api.get('projects/get_archived');
  }

  /**
  * Returns a project's uncompleted items.
  * @param {number} project_id
  * @return {Promise}
  */
  get_data(project_id) {
    const params = { project_id };
    return this.api.get('projects/get_data', params);
  }

  /**
  * Gets an existing project.
  * @param {number} project_id
  * @return {Promise}
  */
  get(project_id) {
    const params = { project_id };
    return this.api.get('projects/get', params).then((response) => {
      if (response.error) {
        return null;
      }

      const data = {
        projects: response.project ? [response.project] : [],
        project_notes: response.notes ? [response.notes] : [],
      };

      this.api.update_state(data);
      return response;
    });
  }
}

export default ProjectsManager;
