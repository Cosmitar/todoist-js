require('dotenv').config();
require("babel-polyfill");
import {
  getDateString,
} from './helpers';

import API from './../todoist/Api';
const api = new API(process.env.ACCESS_TOKEN);


afterAll(async () => {
  // Cleaning the room
  project1.delete();
  await api.commit();
});

let item1;
let item2;
let inbox;
let project1;
test('API should add an item', async () => {
  await api.sync();
  const response = await api.add_item('Item1');
  expect(response.content).toBe('Item1');

  await api.sync();
  expect(api.state.items.some(i => i.content === 'Item1')).toBe(true);
  item1 = api.state.items.find(i => i.content === 'Item1');
  expect(await api.items.get_by_id(item1.id)).toEqual(item1);
  item1.delete();
  await api.commit();
});

test('Manager should add an item', async () => {
  await api.sync();
  inbox = api.state.projects.find(project => project.name === 'Inbox');
  item1 = api.items.add('Item1', inbox.id);
  const response = await api.commit();
  expect(response.items.some(i => i.content === 'Item1')).toBe(true);
  expect(api.state.items.some(i => i.content === 'Item1')).toBe(true);
  expect(await api.items.get_by_id(item1.id)).toEqual(item1);
});

test('Item should complete itself', async () => {
  item1.complete();
  const response = await api.commit();
  expect(api.state.items.find(i => i.id === item1.id).checked).toBeTruthy();
  expect(response.items.some(i => i.id === item1.id)).toBe(false);
});

test('Item should uncomplete itself', async () => {
  item1.uncomplete();
  const response = await api.commit();
  expect(response.items.some(i => i.content === 'Item1')).toBe(true);
  expect(response.items.find(i => i.content === 'Item1').checked).toBeFalsy();
  expect(api.state.items.find(i => i.id === item1.id).checked).toBeFalsy();
});

test('Item should move itself into a project', async () => {
  project1 = api.projects.add('Project1_items');
  await api.commit();

  item1.move(project1.id);
  const response = await api.commit();
  expect(response.items.some(i => i.content === 'Item1')).toBe(true);
  expect(response.items.find(i => i.content === 'Item1').project_id).toBe(project1.id);
  expect(api.state.items.find(i => i.id === item1.id).project_id).toBe(project1.id);
});

test('Item should update its content', async () => {
  item1.update({ content: 'UpdatedItem1' });
  const response = await api.commit();
  expect(api.state.items.some(i => i.content === 'UpdatedItem1')).toBe(true);
  expect(await api.items.get_by_id(item1.id)).toEqual(item1);
});

test('Item should update its date info', async () => {
  await api.sync();
  inbox = api.state.projects.find(project => project.name === 'Inbox');
  const date = new Date(2038, 1, 19, 3, 14, 7);
  const date_string = getDateString(date);

  item2 = api.items.add('Item2', inbox.id, { date_string });
  let response = await api.commit();

  const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  const new_date_utc = getDateString(tomorrow);
  api.items.update_date_complete(item1.id, new_date_utc, 'every day', 0);
  response = await api.commit();
  // Note: in Python's test date_string is expected to be 'every day' but we're recieving the date in string format YYYY-MM-DDTHH:MM:SS
  expect(response.items.find(i => i.id === item2.id).date_string).toBe(date_string);
  expect(api.state.items.find(i => i.id === item2.id).date_string).toBe(date_string);
});

test('Manager should update items order and indent', async () => {
  api.items.update_orders_indents({
    [item1.id]: [2, 2],
    [item2.id]: [1, 3],
  });

  let response = await api.commit();
  await api.sync();

  response.items.forEach((item) => {
    if (item.id === item1.id) {
      expect(item.item_order).toBe(2);
      expect(item.indent).toBe(2);
    }

    if (item.id === item2.id) {
      expect(item.item_order).toBe(1);
      expect(item.indent).toBe(3);
    }
  });

  expect(api.state.items.find(i => i.id === item1.id).item_order).toBe(2);
  expect(api.state.items.find(i => i.id === item1.id).indent).toBe(2);
  expect(api.state.items.find(i => i.id === item2.id).item_order).toBe(1);
  expect(api.state.items.find(i => i.id === item2.id).indent).toBe(3);
});

test('Manager should update items day orders', async () => {
  api.items.update_day_orders({ [item1.id]: 1, [item2.id]: 2 });
  const response = await api.commit();
  response.items.forEach((item) => {
    if (item.id === item1.id) {
      expect(item1.day_order).toBe(1);
    }
    if (item.id === item2.id) {
      expect(item2.day_order).toBe(2);
    }
  });

  expect(api.state.day_orders[item1.id]).toBe(1);
  expect(api.state.day_orders[item2.id]).toBe(2);
});

test('Item should delete itself', async () => {
  const content = item1.content;
  item1.delete();
  const response = await api.commit();
  expect(response.items.some(i => i.id === item1.id)).toBe(false);
  expect(item1.is_deleted).toBe(1);
  expect(api.state.items.some(i => i.content === content)).toBe(false);
});

test('Manager should complete an item', async () => {
  api.items.complete([item2.id]);
  const response = await api.commit();
  expect(response.items.some(i => i.content === 'Item2')).toBe(true);
  expect(response.items.find(i => i.content === 'Item2').checked).toBeTruthy();
  expect(api.state.items.find(i => i.content === 'Item2').checked).toBeTruthy();
});

test('Manager should uncomplete an item', async () => {
  api.items.uncomplete([item2.id]);
  const response = await api.commit();
  expect(response.items.some(i => i.content === 'Item2')).toBe(true);
  expect(response.items.find(i => i.content === 'Item2').checked).toBeFalsy();
  expect(api.state.items.find(i => i.content === 'Item2').checked).toBeFalsy();
});

test('Manager should move an item into a project', async () => {
  api.items.move({ [item2.project_id]: [item2.id] }, project1.id);
  const response = await api.commit();
  expect(response.items.some(i => i.content === 'Item2')).toBe(true);
  expect(response.items.find(i => i.content === 'Item2').project_id).toBe(project1.id);
  expect(api.state.items.find(i => i.id === item2.id).project_id).toBe(project1.id);
});

test('Manager should update an item', async () => {
  api.items.update(item2.id, { content: 'UpdatedItem2' });
  const response = await api.commit();
  expect(response.items.some(i => i.content === 'UpdatedItem2')).toBe(true);
  expect(api.state.items.some(i => i.content === 'UpdatedItem2')).toBe(true);
});

test('Manager should delete an item', async () => {
  const content = item2.content;
  api.items.delete([item2.id]);
  const response = await api.commit();

  expect(response.items.some(i => i.id === item2.id)).toBe(false);
  expect(item2.is_deleted).toBe(1);
  expect(api.state.items.some(i => i.content === content)).toBe(false);
});
