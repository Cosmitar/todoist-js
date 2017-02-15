import Model from './Model';

/**
* Implements a live notification.
*/
class LiveNotification extends Model {

  get definition() {
    return {
      created: 0,
      from_uid: 0,
      id: 0,
      invitation_id: 0,
      invitation_secret: '',
      notification_key: '',
      notification_type: '',
      seq_no: 0,
      state: '',
    };
  }

}

export default LiveNotification;
