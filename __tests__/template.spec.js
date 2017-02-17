const request = require('request');
require('dotenv').config();
require("babel-polyfill");

import API from './../todoist/Api';
const api = new API(process.env.ACCESS_TOKEN);

test('Manager should add a label', async () => {
  await api.sync();
  const project1 = api.projects.add('Project1_template');
  const project2 = api.projects.add('Project2_template');
  await api.commit();

  const item1 = api.items.add('Item1_template', project1.id);
  await api.commit();

  const template_url = await api.templates.export_as_url(project1.id);

  const fileResponse = await (() => {
    return new Promise((resolve, reject) => {
      request.get(template_url.file_url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          resolve(body);
        }
      });
    });
  })();

  expect(/task,Item1_template,4,1/.test(fileResponse)).toBe(true);

  item1.delete();
  project1.delete();
  project2.delete();
  await api.commit();
});
