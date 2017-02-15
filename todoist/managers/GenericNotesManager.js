import Manager from './Manager';

class GenericNotesManager extends Manager {

  get object_type() { return 'note'; }

  /**
  * Updates an note remotely.
  * @param {number} note_id
  * @param {Object} params
  */
  update(note_id, params) {
    const args = Object.assign({}, params, { id: note_id });
    this.queueCmd('note_update', args);
  }

  /**
  * Deletes an note remotely.
  * @param {number} note_id
  */
  delete(note_id) {
    this.queueCmd('note_delete', { id: note_id });
    this.get_by_id(note_id, true).then(n => {
      if (n) {
        n.is_deleted = 1;
      }
    });
  }
}

export default GenericNotesManager;
