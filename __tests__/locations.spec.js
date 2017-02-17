require('dotenv').config();
require("babel-polyfill");

import API from './../todoist/Api';
const api = new API(process.env.ACCESS_TOKEN);

test('Manager should clear locations', async () => {
  await api.sync();
  api.locations.clear();
  await api.commit();

  expect(api.state.locations).toEqual([]);
});
