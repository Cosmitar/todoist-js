require('dotenv').config();
require("babel-polyfill");

import API from './../todoist/Api';
const api = new API(process.env.DEVEL_ACCESS_TOKEN);
const api2 = new API(process.env.ALT_ACCOUNT_API_TOKEN);

afterAll(async () => {
  // from api
  project1.delete();
  project2.delete();
  await api.commit();
  // from api2
  api2.projects.delete([api2_project1_id, api2_project2_id]);
  await api2.commit();
});

let project1;
let project2;
let response;
let response2;
let invitation1;
let invitation2;
let invitation1resp;
let api2_project1_id;
let api2_project2_id;
test('Manager should share a project', async () => {
  await api.sync();
  await api2.sync();

  // accept
  project1 = api.projects.add('Project1_share');
  await api.commit();

  api.projects.share(project1.id, api2.state.user.email);
  response = await api.commit();

  expect(response.projects.find(p => p.id === project1.id).name).toBe(project1.name);
  expect(response.projects.find(p => p.id === project1.id).shared).toBeTruthy();

  response2 = await api2.sync();
  // can't compare response2.live_notification[i].project_id against project1.id
  // because 2 different projects are created on each users and they have individual ids
  invitation1 = response2.live_notifications.find(
    ln => ln.project_name === project1.name && ln.notification_type === 'share_invitation_sent'
  );
  api2_project1_id = invitation1.project_id;

  expect(invitation1.project_name).toBe(project1.name);
  expect(invitation1.from_user.email).toBe(api.state.user.email);
});

test('Manager should accept an invitation', async () => {
  // auto accepted?
  if (invitation1.state !== 'accepted') {
    // this wasn't tested due to API auto accept my invitations
    api2.invitations.accept(invitation1.id, invitation1.invitation_secret);
    response2 = await api2.commit();

    invitation1resp = response2.live_notifications.find(ln => ln.id === invitation1.id);
    expect(invitation1resp.id).toBe(invitation1.id);
    expect(invitation1resp.state).toBe('accepted');
    expect(response2.projects[0].shared).toBeTruthy();
    expect(response2.collaborator_states.some(c => c.user_id === api.state.user.id)).toBe(true);
    expect(response2.collaborator_states.some(c => c.user_id === api2.state.user.id)).toBe(true);

    response = await api.sync();
    invitation1resp = response2.live_notifications.find(ln => ln.id === invitation1.id);
    expect(invitation1resp.id).toBe(invitation1.id);
    expect(invitation1resp.notification_type).toBe('share_invitation_accepted');
    expect(response.projects.find(p => p.id === project1.id).shared).toBeTruthy();
  }
});

test('Manager should reject an invitation', async () => {
  // reject
  project2 = api.projects.add('Project2_share');
  await api.commit();

  api.projects.share(project2.id, api2.state.user.email);
  response = await api.commit();

  expect(response.projects.find(p => p.id === project2.id).name).toBe(project2.name);
  expect(response.projects.find(p => p.id === project2.id).shared).toBeTruthy();

  response2 = await api2.sync();

  invitation2 = response2.live_notifications.find(
    ln => ln.project_name === project2.name && ln.notification_type === 'share_invitation_sent'
  );
  api2_project2_id = invitation2.project_id;
  expect(invitation2.project_name).toBe(project2.name);
  expect(invitation2.from_user.email).toBe(api.state.user.email);

  // auto accepted?
  if (invitation1.state !== 'accepted') {
    // this wasn't tested due to API auto accept my invitations
    api2.invitations.reject(invitation2.id, invitation2.invitation_secret);
    response2 = await api2.commit();

    expect(response2.projects.length).toBe(0);
    expect(response2.collaborator_states.length).toBe(0);
  }
});

test('Manager should delete an invitation', async () => {
  // delete
  api.invitations.delete(invitation1.id);
  await api.commit();
});
