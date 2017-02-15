import Model from './Model';

/**
* Implements a note.
*/
class GenericNote extends Model {
  constructor(data, api) {
    super(data, api);
    // has to be defined in subclasses
    this.local_manager = null;
  }

  /**
  * Updates note.
  * @param {Object} params
  */
  update(params) {
    this.local_manager.update(this.id, params);
    Object.assign(this.data, params);
  }

  /**
  * Deletes note.
  */
  delete() {
    this.local_manager.delete(this.id);
    this.data.is_deleted = 1;
  }
}

export default GenericNote;
