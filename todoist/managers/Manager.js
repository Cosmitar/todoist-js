class Manager {

  constructor(api) {
    this.api = api;
  }

  // should be re-defined in a subclass
  get state_name() { return ''; }
  get object_type() { return ''; }

  /**
  * Finds and returns the object based on its id.
  * @param {number} obj_id
  * @param {boolean} only_local
  * @return {Promise}
  */
  get_by_id(obj_id, only_local = false) {
    let response = null;
    this.api.state[this.state_name].find((obj) => {
      // 2nd term has weak comparison for num-str match.
      if (obj.id === obj_id || obj.temp_id == obj_id) {
        response = obj;
      }
    });

    if (!response && !only_local && this.object_type) {
      // this isn't matching with Python code
      response = this.api[this.state_name].get(obj_id);
    }

    return Promise.resolve(response);
  }

  /**
  * Shorcut to add commands to the queue.
  * @param {string|Object} cmdDef The definition of the command,
  *   can be a string used as type or an object with desired params.
  * @param {Object} cmdArgs The arguments for the command.
  */
  queueCmd( cmdDef, cmdArgs = {} ) {
    const cmd = Object.assign(
      {
        uuid: this.api.generate_uuid(),
      },
      (
        typeof cmdDef === 'string' ? { type: cmdDef } : cmdDef
      ),
      {
        args: cmdArgs,
      }
    );
    this.api.queue.push(cmd);
    return cmd;
  }
}

export default Manager;
