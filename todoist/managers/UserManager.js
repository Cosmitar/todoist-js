import Manager from './Manager';

class UserManager extends Manager {
  /**
  * Updates the user data.
  * @param {Object} params
  */
  update(params) {
    this.queueCmd('user_update', params);
  }

  /**
  * Updates the user's karma goals.
  * @param {Object} params
  */
  update_goals(params) {
    this.queueCmd('update_goals', params);
  }

  get(key = false, is_default = false) {
    let ret = this.api.state.user;
    if (key) {
      ret = ret.get(key, is_default);
    }

    return ret;
  }

  get_id() {
    return this.api.state.user.id;
  }

  /**
  * Logins user, and returns the response received by the server.
  *   Note: this method was migrated from Python but is useless
  *   for 3rd party apps.
  * @param {string} email
  * @param {string} password
  * @return {Promise}
  */
  login(email, password) {
    return this.api.post('user/login', { email, password }).then((response) => {
      if (response.token) {
        this.api.session.accessToken = response.token;
      }

      return response;
    });
  }

  /**
  * Logins user with Google account, and returns the response received by
  *   the server.
  *   Note: this method was migrated from Python but is useless
  *   for 3rd party apps.
  * @param {string} email
  * @param {string} oauth2_token
  * @param {Object} params
  * @return {Promise}
  */
  login_with_google(email, oauth2_token, params) {
    const args = Object.assign({}, params, { email, oauth2_token });
    return this.api.post('user/login_with_google', args).then((response) => {
      if (response.token) {
        this.api.session.accessToken = response.token;
      }

      return response;
    });
  }

  /**
  * Registers a new user.
  *   Note: this method was migrated from Python but is useless
  *   for 3rd party apps.
  * @param {string} email
  * @param {string} full_name
  * @param {string} password
  * @param {Object} params
  * @return {Promise}
  */
  register(email, full_name, password, params) {
    const args = Object.assign({}, params, { email, full_name, password });
    return this.api.post('user/register', args).then((response) => {
      if (response.token) {
        this.api.session.accessToken = response.token;
      }

      return response;
    });
  }

  /**
  * Updates the user's notification settings.
  * @param {string} notification_type
  * @param {string} service
  * @param {boolen} dont_notify
  * @return {Promise}
  */
  update_notification_setting(notification_type, service, dont_notify) {
    return this.api.post('user/update_notification_setting', {
      notification_type,
      service,
      dont_notify,
    });
  }
}

export default UserManager;
