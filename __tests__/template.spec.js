const request = require('request');
require('dotenv').config();
require('babel-polyfill');
// increase timeout for remote response delay
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

import API from './../todoist/Api';
const api = new API(process.env.ACCESS_TOKEN);

let item1;
let project1;

afterAll(async () => {
  item1.delete();
  project1.delete();
  await api.commit();
});

test('Manager should export project as file', async () => {
  await api.sync();
  project1 = api.projects.add('Project1_template');
  await api.commit();

  item1 = api.items.add('Item1_template', project1.id);
  await api.commit();

  const template_file = await api.templates.export_as_file(project1.id);
  const fileContent = await template_file.text();

  expect(fileContent).toEqual(expect.stringMatching(/task,Item1_template,4,1,/));
});

test('Manager should export project as url', async () => {
  // requires project1 and item1

  const template_url = await api.templates.export_as_url(project1.id);
  // validates returned object structure and data
  expect(template_url).toHaveProperty('file_name', expect.stringMatching(/_Project1_template\.csv$/));
  expect(template_url).toHaveProperty('file_url', expect.stringMatching(/(http(s?):)|([\/|.|\w|\s])*_Project1_template\.(?:csv)/));

  // tests service by requesting file and checking its content.
  const getFile = () => {
    return new Promise((resolve, reject) => {
      request.get(template_url.file_url, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          resolve(body);
        } else {
          reject(error);
        }
      });
    });
  };
  const fileResponse = await getFile();

  expect(fileResponse).toEqual(expect.stringMatching(/task,Item1_template,4,1,/));
});
