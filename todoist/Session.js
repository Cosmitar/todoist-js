/**
* @fileoverview Handles session related actions like configuration,
*   requests, tokens and responses.
* @author Cosmitar
*/
import 'fetch-everywhere';
/**
* @class Session
*/
class Session {
  /**
  * @param {Object} config Configuration object with optional params:
  *   app_token, client_id, client_secret, token.
  * @constructor
  */
  constructor(config = {}) {
    this._app_token = config.app_token || '';
    this._client = config.client_id || '';
    this._secret = config.client_secret || '';
    this._token = config.token || '';
    this._sync_token = '*';
    this._exchange_toke_endpoint = 'https://todoist.com/oauth/access_token';
  }

  /**
  * Requests an access token to the server.
  * @return {Promise}
  */
  getAccessToken() {
    return this.request(this._exchange_toke_endpoint, 'POST', {
      client_id: this._client,
      client_secret: this._secret,
      code: this._code,
    });
  }

  /**
  * Sets a token for current session.
  * @param {string} token
  */
  setAccessToken(token) {
    this._token = token;
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

    const query = Object.keys(data)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
    .join('&');

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
