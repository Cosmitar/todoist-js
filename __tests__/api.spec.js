require('dotenv').config();
require("babel-polyfill");

import API from './../todoist/Api';
const api = new API(process.env.ACCESS_TOKEN);

test('Should get api url', () => {
  const resource = 'test';
  expect(api.get_api_url(resource)).toBe(`${api.api_endpoint}/API/v7/${resource}`);
});

test('Should make a valid request (getting productivity stats)', async () => {
  const response = await api.session.request(api.get_api_url('completed/get_stats'), 'POST');
  expect(response.karma_trend).toBeDefined();
});

test('Should sync', async () => {
  const response = await api.sync();
  expect(response.sync_token).toBeDefined();
});

test('Should update user profile. (test_user)', async () => {
  await api.sync();
  const date_format = api.state.user.date_format;
  const date_format_new = 1 - date_format;
  api.user.update({ date_format: date_format_new });
  await api.commit();
  expect(date_format_new).toBe(api.state.user.date_format);
  api.user.update_goals({ vacation_mode: 1 });
  await api.commit();
  api.user.update_goals({ vacation_mode: 0 });
  await api.commit();
});
