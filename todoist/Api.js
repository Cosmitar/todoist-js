/**
* @fileoverview Implements the API that makes it possible to interact with a Todoist user
*   account and its data.
* @author Cosmitar (JS Version)
*/
import Session from './Session';
// managers
import ActivityManager from './managers/ActivityManager';
import BackupsManager from './managers/BackupsManager';
import BizInvitationsManager from './managers/BizInvitationsManager';
import BusinessUsersManager from './managers/BusinessUsersManager';
import CollaboratorsManager from './managers/CollaboratorsManager';
import CollaboratorStatesManager from './managers/CollaboratorStatesManager';
import CompletedManager from './managers/CompletedManager';
import FiltersManager from './managers/FiltersManager';
import InvitationsManager from './managers/InvitationsManager';
import ItemsManager from './managers/ItemsManager';
import LabelsManager from './managers/LabelsManager';
import LiveNotificationsManager from './managers/LiveNotificationsManager';
import LocationsManager from './managers/LocationsManager';
import NotesManager from './managers/NotesManager';
import ProjectNotesManager from './managers/ProjectNotesManager';
import ProjectsManager from './managers/ProjectsManager';
import RemindersManager from './managers/RemindersManager';
import TemplatesManager from './managers/TemplatesManager';
import UploadsManager from './managers/UploadsManager';
import UserManager from './managers/UserManager';
// models
import Collaborator from './models/Collaborator';
import CollaboratorState from './models/CollaboratorState';
import Filter from './models/Filter';
import Item from './models/Item';
import Label from './models/Label';
import LiveNotification from './models/LiveNotification';
import Note from './models/Note';
import Project from './models/Project';
import ProjectNote from './models/ProjectNote';
import Reminder from './models/Reminder';

import { generate_uuid } from './utils/uuid';

require("babel-polyfill");
/**
* @class Session
*/
class API {
  constructor(token) {
    this.api_endpoint = 'https://todoist.com';
    // Session instance for requests
    this.session = new Session({ token });
    // Requests to be sent are appended here
    this.queue = [];
    // Mapping of temporary ids to real ids
    this.temp_ids = {};

    // managers
    this.projects = new ProjectsManager(this);
    this.project_notes = new ProjectNotesManager(this);
    this.items = new ItemsManager(this);
    this.labels = new LabelsManager(this);
    this.filters = new FiltersManager(this);
    this.notes = new NotesManager(this);
    this.live_notifications = new LiveNotificationsManager(this);
    this.reminders = new RemindersManager(this);
    this.locations = new LocationsManager(this);
    this.invitations = new InvitationsManager(this);
    this.biz_invitations = new BizInvitationsManager(this);
    this.user = new UserManager(this);
    this.collaborators = new CollaboratorsManager(this);
    this.collaborator_states = new CollaboratorStatesManager(this);
    this.completed = new CompletedManager(this);
    this.uploads = new UploadsManager(this);
    this.activity = new ActivityManager(this);
    this.business_users = new BusinessUsersManager(this);
    this.templates = new TemplatesManager(this);
    this.backups = new BackupsManager(this);
    // Local copy of all of the user's objects
    this.state = {
      collaborator_states: [],
      collaborators: [],
      day_orders: {},
      day_orders_timestamp: '',
      filters: [],
      items: [],
      labels: [],
      live_notifications: [],
      live_notifications_last_read_id: -1,
      locations: [],
      notes: [],
      project_notes: [],
      projects: [],
      reminders: [],
      settings_notifications: {},
      user: {},
    };
  }

  /**
  * Performs a GET request prepending the API endpoint.
  * @param {string} resource Requested resource
  * @param {Object} params
  * @return {Promise}
  */
  get(resource, params) {
    return this.session.get(
      this.get_api_url(resource),
      params
    );
  }

  /**
  * Performs a POST request prepending the API endpoint.
  * @param {string} resource Requested resource
  * @param {Object} params
  * @return {Promise}
  */
  post(resource, params) {
    return this.session.post(
      this.get_api_url(resource),
      params
    );
  }

  /**
  * Sends to the server the changes that were made locally, and also
  *   fetches the latest updated data from the server.
  * @param {Array.<object>} commands List of commands to be processed.
  * @param {Object} params
  * @return {Object} Server response
  */
  async sync(commands = []) {
    const response = await this.session.post(
      this.get_api_url('sync'),
      {
        day_orders_timestamp: this.state.day_orders_timestamp,
        include_notification_settings: 1,
        resource_types: JSON.stringify(['all']),
        commands: JSON.stringify(commands),
      }
    );

    const temp_keys = Object.keys(response.temp_id_mapping || {});
    if (temp_keys.length > 0) {
      temp_keys.forEach((temp_id) => {
        const new_id = response.temp_id_mapping[temp_id];
        this.temp_ids[temp_id] = new_id;
        this.replace_temp_id(temp_id, new_id);
      });
    }
    await this.update_state(response);

    return response;
  }

  /**
  * Performs a server query
  * @param {Array.<Object>} params List of parameters to query
  * @return {Promise}
  */
  query(params = []) {
    return this.session.get(
      this.get_api_url('query'),
      { queries: JSON.stringify(params) }
    );
  }

  /**
  * Updates the local state, with the data returned by the server after a
  *   sync.
  * @param {Object} syncdata Data returned by {@code this.sync}.
  */
  async update_state(syncdata) {
    // It is straightforward to update these type of data, since it is
    // enough to just see if they are present in the sync data, and then
    // either replace the local values or update them.
    const keys = ['day_orders', 'day_orders_timestamp', 'live_notifications_last_read_id', 'locations', 'settings_notifications', 'user'];
    keys.map((key) => {
      if (syncdata[key]) {
        this.state[key] = syncdata[key];
      }
    });

    const resp_models_mapping = {
      collaborator: Collaborator,
      collaborator_states: CollaboratorState,
      filters: Filter,
      items: Item,
      labels: Label,
      live_notifications: LiveNotification,
      notes: Note,
      project_notes: ProjectNote,
      projects: Project,
      reminders: Reminder,
    };

    // Updating these type of data is a bit more complicated, since it is
    // necessary to find out whether an object in the sync data is new,
    // updates an existing object, or marks an object to be deleted.  But
    // the same procedure takes place for each of these types of data.
    let promises = [];
    Object.keys(resp_models_mapping).forEach((datatype) => {
      // Process each object of this specific type in the sync data.
      // Collect a promise for each object due to some this.find_object are asynchronous
      // since they hit the server looking for remote objects
      const typePromises = (syncdata[datatype] || []).map((remoteObj) => {
        return Promise.resolve().then(async() => {
          // Find out whether the object already exists in the local state.
          const localObj = await this.find_object(datatype, remoteObj);
          if (localObj) {
            // If the object is already present in the local state, then
            // we either update it
              Object.assign(localObj.data, remoteObj);
          } else {
            // If not, then the object is new and it should be added
              const newobj = new resp_models_mapping[datatype](remoteObj, this);
              this.state[datatype].push(newobj);
          }
        });
      });

      promises = [...promises, ...typePromises];
    });
    // await for all promises to resolve and continue.
    await Promise.all(promises);

    // since sync response isn't including deleted objects, we'll rid of from state
    // all those items marked as to be deleted
    Object.keys(resp_models_mapping).forEach((datatype) => {
      if (this.state[datatype]) {
        this.state[datatype] = this.state[datatype].filter(stateObj => stateObj.is_deleted !== 1);
      }
    });
  }

  /**
  * Searches for an object in the local state, depending on the type of object, and then on its primary key is.
  *   If the object is found it is returned, and if not, then null is returned.
  * @param {string} objtype Name for the type of the searching object.
  * @param {Object} obj Object from where to take search paramters.
  * @return {Object|null} Depending on search result.
  */
  find_object(objtype, obj) {
    if (objtype === 'collaborators') {
      return this.collaborators.get_by_id(obj.id);
    } else if (objtype === 'collaborator_states') {
      return this.collaborator_states.get_by_ids(obj.project_id, obj.user_id);
    } else if (objtype === 'filters') {
      return this.filters.get_by_id(obj.id, true);
    } else if (objtype === 'items') {
      return this.items.get_by_id(obj.id, true);
    } else if (objtype === 'labels') {
      return this.labels.get_by_id(obj.id, true);
    } else if (objtype === 'live_notifications') {
      return this.live_notifications.get_by_id(obj.id);
    } else if (objtype === 'notes') {
      return this.notes.get_by_id(obj.id, true);
    } else if (objtype === 'project_notes') {
      return this.project_notes.get_by_id(obj.id, true);
    } else if (objtype === 'projects') {
      return this.projects.get_by_id(obj.id, true);
    } else if (objtype === 'reminders') {
      return this.reminders.get_by_id(obj.id, true);
    } else {
      return null;
    }
  }

  /**
  * Replaces the temporary id generated locally when an object was first
  *   created, with a real Id supplied by the server. True is returned if
  *   the temporary id was found and replaced, and false otherwise.
  * @param {string} temp_id Temporary item id.
  * @param {number} new_id New item id.
  * @return {boolean} Whether temporary id was found or not.
  */
  replace_temp_id(temp_id, new_id) {
    const datatypes = ['filters', 'items', 'labels', 'notes', 'project_notes', 'projects', 'reminders'];
    datatypes.forEach((type) => {
      this.state[type].forEach((obj, objIndex) => {
        if (obj.temp_id === temp_id) {
          this.state[type][objIndex].id = new_id;
        }
      });
    });
  }

  /**
  * Generates a uuid.
  * @return {string}
  */
  generate_uuid() {
    return generate_uuid();
  }

  /**
  * Returns the full API url to hit.
  * @param {string} resource The API resource.
  * @return {string}
  */
  get_api_url(resource = '') {
    return `${this.api_endpoint}/API/v7/${resource}`;
  }

  /**
  * Adds a new task.
  * @param {string} content The description of the task.
  * @param {Object} params All other paramters to set in the new task.
  * @return {Promise}
  */
  add_item(content, params = {}) {
    Object.assign(params, { content });
    if (params.labels) {
      params.labels = JSON.stringify(params.labels);
    }
    return this.get('add_item', params);
  }

  /**
  * Commits all requests that are queued.  Note that, without calling this
  * method none of the changes that are made to the objects are actually
  * synchronized to the server, unless one of the aforementioned Sync API
  * calls are called directly.
  */
  async commit(raise_on_error = true) {
    if (!this.queue.length) return;

    const response = await this.sync(this.queue);
    this.queue = [];
    if (response.sync_status) {
      if (raise_on_error) {
        Object.keys(response.sync_status).forEach((key) => {
          if (response.sync_status[key] != 'ok') {
            throw new Error(`sync fail (${key}, ${JSON.stringify(response.sync_status[key])})`);
          }
        });
      }
    }
    return response;
  }
};


export default API;
