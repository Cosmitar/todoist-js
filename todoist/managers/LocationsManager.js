import Manager from './Manager';

class LocationsManager extends Manager {

  get state_name() { return 'locations'; }

  /**
  * Clears the locations.
  */
  clear() {
    this.queueCmd('clear_locations');
  }
}

export default LocationsManager;
