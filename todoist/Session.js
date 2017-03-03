/**
* @fileoverview Handles session related actions like configuration,
*   requests, tokens and responses.
* @author Cosmitar
*/
import 'fetch-everywhere';
import { generate_uuid } from './utils/uuid';
/**
* @class Session
*/
class Session {
  /**
  * @param {Object} config Configuration object with optional params:
  *   app_token
  *   client_id
  *   scope
  *   state
  *   client_secret
  *   token <- this is the access token
  * @constructor
  */
  constructor(config = {}) {
    this._app_token = config.app_token || '';
    this._client = config.client_id || '';
    this._scope = config.scope || 'data:read_write,data:delete,project:delete';
    this._state = config.state || generate_uuid();
    this._secret = config.client_secret || '';
    this._token = config.token || ''; // access token
    this._sync_token = '*';
    this._auth_url = 'https://todoist.com/oauth/authorize';
    this._exchange_token_url = 'https://todoist.com/oauth/access_token';
  }

  /**
  * Simplifies deferred config after creating an instance
  *   of a session.
  * @param {Object} config An object that can contain
  *   app_token
  *   client_id
  *   scope
  *   state
  *   client_secret
  */
  config(config = {}) {
    this._app_token = config.app_token || this._app_token;
    this._client = config.client_id || this._client;
    this._scope = config.scope || this._scope;
    this._state = config.state || this._state;
    this._secret = config.client_secret || this._secret;
  }

  /**
  * Sets an access token for current session.
  * @param {string} token
  */
  set accessToken(token) {
    this._token = token;
  }

  /**
  * Sets the authorization code needed later for access token exchange.
  * @param {string} token
  */
  set code(code) {
    this._code = code;
  }

  /**
  * Returns the authorization url based on configurations.
  * @return string The full authorization url.
  */
  requestAuthorizationUrl() {
    const query = this._dataToQueryString({
      client_id: this._client,
      scope: this._scope,
      state: this._state,
    });
    return `${this._auth_url}?${query}`;
  }

  /**
  * Requests an access token to the server.
  * @return {Promise}
  */
  getAccessToken() {
    return this.request(this._exchange_toke_url, 'POST', {
      client_id: this._client,
      client_secret: this._secret,
      code: this._code,
    });
  }


  /**
  * Performs a GET request for the given url and parameters.
  * @param {string} url
  * @param {Object} data
  * @return {Promise}
  */
  get(url, data = {}) {
    return this.request(url, 'GET', data);
  }

  /**
  * Performs a POST request for the given url and parameters.
  * @param {string} url
  * @param {Object} data
  * @return {Promise}
  */
  post(url, data = {}) {
    return this.request(url, 'POST', data);
  }

  _dataToQueryString(data) {
    return Object.keys(data)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
      .join('&');
  }

  /**
  * Executes a request, handling headers, tokens and response.
  * @param {string} url The URL to fetch.
  * @param {string} method An http verb, for this API only GET or POST.
  * @param {Object} data
  */
  request(url, method = 'GET', data = {}) {
    let headers = {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': method === 'GET'
        ? 'application/json'
        : 'application/x-www-form-urlencoded',
    };

    if (this._token) {
      data.token = this._token;
    }

    if (method === 'POST') {
      data.sync_token = this._sync_token;
    }

    const query = this._dataToQueryString(data);

    const request_url = `${url}?${query}`;
    return fetch(request_url, {
      method: method,
      headers: headers,
      body: JSON.stringify(data),
      credentials: 'include',
    }).then(response => {
      if (response.sync_token) {
        this._sync_token = response.sync_token;
      }

      // Todoist API always returns a JSON, even on error (except on templates as files)
      if (/attachment/.test(response.headers._headers['content-disposition'])) {
        return response;
      } else {
        return response.json();
      }
    }).then((response) => {
      if (response.error_code) {
        throw new Error(`(cod: ${response.error_code}) ${response.error}`);
      }
      return response;
    });
  }
}

export default Session;
