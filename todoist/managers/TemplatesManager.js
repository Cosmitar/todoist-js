import Manager from './Manager';

class TemplatesManager extends Manager {
  /**
  * Imports a template into a project.
  * @param {number} project_id
  * @param {???} file
  * @param {Object} params
  * @return {Promise}
  */
  import_into_project(project_id, file, params) {
    const args = Object.assign( {}, params, { project_id, file });
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    return this.api.post('templates/import_into_project', args, files, headers);
  }

  /**
  * Exports a template as a file.
  * @param {number} project_id
  * @param {Object} params
  * @return {Promise}
  */
  export_as_file(project_id, params) {
    const args = Object.assign( {}, params, { project_id });
    return this.api.post('templates/export_as_file', args);
  }

  /**
  * Exports a template as a URL.
  * @param {number} project_id
  * @param {Object} params
  * @return {Promise}
  */
  export_as_url(project_id, params) {
    const args = Object.assign( {}, params, { project_id });
    return this.api.post('templates/export_as_url', args);
  }
}

export default TemplatesManager;
