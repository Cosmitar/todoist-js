import Manager from './Manager';

class BizInvitationsManager extends Manager {
  /**
  * Accepts a business invitation to share a project.
  * @param {number} invitation_id
  * @param {number} invitation_secret
  */
  accept(invitation_id, invitation_secret) {
    this.queueCmd('biz_accept_invitation', { invitation_id, invitation_secret });
  }

  /**
  * Rejects a business invitation to share a project.
  * @param {number} invitation_id
  * @param {number} invitation_secret
  */
  reject(invitation_id, invitation_secret) {
    this.queueCmd('biz_reject_invitation', { invitation_id, invitation_secret });
  }
}

export default BizInvitationsManager;
