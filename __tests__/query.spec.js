require('dotenv').config();
require("babel-polyfill");

import API from './../todoist/Api';
const api = new API(process.env.DEVEL_ACCESS_TOKEN);

let inbox = null;
let item1 = null;
let item2 = null;

it('Should create an item for tomorrow and another with priority 4', async () => {
  await api.sync();
  inbox = api.state.projects.find(project => project.name === 'Inbox');
  item1 = api.items.add('ItemI', inbox['id'], { date_string: 'tomorrow'});
  item2 = api.items.add('ItemII', inbox['id'], { priority: 4 });
  await api.commit();
});

it('Should query items and they should be into proper response group', async () => {
  const queries = ['tomorrow', 'p1'];
  const response = await api.query(queries);

  response.forEach((query) => {
    if (query.query === 'tomorrow') {
      expect(query.data.some(i => i.content === 'ItemI')).toBe(true);
      expect(query.data.some(i => i.content === 'ItemII')).toBe(false);
    }

    if (query.query === 'p1') {
      expect(query.data.some(i => i.content === 'ItemI')).toBe(false);
      expect(query.data.some(i => i.content === 'ItemII')).toBe(true);
    }
  });

  item1.delete();
  item2.delete();
  await api.commit();
});
