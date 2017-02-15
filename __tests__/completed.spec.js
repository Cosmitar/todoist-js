require('dotenv').config();
require("babel-polyfill");

import API from './../todoist/Api';
const api = new API(process.env.DEVEL_ACCESS_TOKEN);

test('Should get productivity stats)', async () => {
  const response = await api.completed.get_stats();
  expect(response.days_items).toBeDefined();
  expect(response.week_items).toBeDefined();
  expect(response.karma_trend).toBeDefined();
  expect(response.karma_last_update).toBeDefined();
});

// 403 Forbidden, seems to be an "only premium" restriction
test('Should get all completed items)', async () => {
  const response = await api.completed.get_all();
  expect(response.items).toBeDefined();
  expect(response.projects).toBeDefined();
});
