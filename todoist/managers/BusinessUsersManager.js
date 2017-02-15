import Manager from './Manager';

class BusinessUsersManager extends Manager {
  /**
  * Sends a business user invitation.
  * @param {string} email_list
  * @return {Promise}
  */
  invite(email_list) {
    return this.api.get('business/users/invite', { email_list });
  }

  /**
  * Accepts a business user invitation.
  * @param {number} id
  * @param {string} secret
  * @return {Promise}
  */
  accept_invitation(id, secret) {
    const params = { id, secret };
    return this.api.get('business/users/accept_invitation', params);
  }

  /**
  * Rejects a business user invitation.
  * @param {number} id
  * @param {string} secret
  * @return {Promise}
  */
  reject_invitation(id, secret) {
    const params = { id, secret };
    return this.api.get('business/users/reject_invitation', params);
  }
}

export default BusinessUsersManager;
