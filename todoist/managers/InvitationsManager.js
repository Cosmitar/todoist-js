import Manager from './Manager';

class InvitationsManager extends Manager {
  get object_type() { return 'share_invitation'; }

  /**
  * Accepts an invitation to share a project.
  * @param {number} invitation_id
  * @param {string} invitation_secret
  */
  accept(invitation_id, invitation_secret) {
    this.queueCmd('accept_invitation', { invitation_id, invitation_secret });
  }

  /**
  * Rejets an invitation to share a project.
  * @param {number} invitation_id
  * @param {string} invitation_secret
  */
  reject(invitation_id, invitation_secret) {
    this.queueCmd('reject_invitation', { invitation_id, invitation_secret });
  }

  /**
  * Delete an invitation to share a project.
  * @param {number} invitation_id
  */
  delete(invitation_id) {
    this.queueCmd('delete_invitation', { invitation_id });
  }
}

export default InvitationsManager;
