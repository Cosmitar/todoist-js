/**
* Implements a generic object.
*/
class Model {
  constructor(data, api) {
    this.data = data;
    this.api = api;
    this.temp_id = '';

    // Until we decide to imlpement Proxies (lack of browsers/platforms support) lets
    // generate each setter/getter based on subclass definition, received data and temp_id.
    Object.keys(Object.assign({ temp_id: '' }, this.definition, data)).map((k) => {
      Object.defineProperty(this, k, {
        get: () => this.data[k],
        set: (val) => this.data[k] = val,
      })
    });
  }

  toString() {
    const data = JSON.stringify(this.data);
    return `${this.constructor.name}(${data})`;
  }
}

export default Model;
