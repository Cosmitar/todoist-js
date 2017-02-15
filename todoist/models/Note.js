import GenericNote from './GenericNote';

/**
* Implement an item note.
*/
class Note extends GenericNote {

  get definition() {
    return {
      id: 0,
      posted_uid: 0,
      project_id: 0,
      item_id: 0,
      content: '',
      file_attachment: null,
      uids_to_notify: null,
      is_deleted: 0,
      is_archived: 0,
      posted: ''
    };
  }

  constructor(data, api) {
    super(data, api);
    this.local_manager = api.notes;
  }
}

export default Note;
