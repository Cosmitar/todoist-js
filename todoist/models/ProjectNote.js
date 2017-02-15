import GenericNote from './GenericNote';

/**
* Implement a project note.
*/
class ProjectNote extends GenericNote {
  constructor(data, api) {
    super(data, api);
    this.local_manager = api.project_notes;
  }
}

export default ProjectNote;
