import Manager from './Manager';

class UploadsManager extends Manager {
  /**
  * Uploads a file. (NOT TESTED).
  * @param {???} file File to upload.
  * @param {Object} params
  * @return {Promise}
  */
  add(files, params) {
    const args = Object.assign( {}, params, { project_id });
    // should get a file, maybe file should be a file handler
    // @TODO make API.post to manage files
    return this.api.post('uploads/add', args, files);
  }

  /**
  * Returns all user's uploads.
  * @param {Object} params
  *   limit: (int, optional) number of results (1-50)
  *   last_id: (int, optional) return results with id<last_id
  * @return {Promise}
  */
  get(params) {
    return this.api.get('uploads/get', params);
  }

  /**
  * Deletes upload.
  * @param {string} file_url Uploaded file URL
  * @return {Promise}
  */
  delete(file_url) {
    return this.api.get('uploads/delete', { file_url });
  }
}

export default UploadsManager;
