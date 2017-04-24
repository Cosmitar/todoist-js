require('dotenv').config();
require("babel-polyfill");

import API from './../todoist/Api';
const api = new API(process.env.ACCESS_TOKEN);

let label1;
let label2;

test('Manager should add a label', async () => {
  await api.sync();
  label1 = api.labels.add('Label1');
  const response = await api.commit();

  expect(response.labels.some(l => l.name === 'Label1')).toBe(true);
  expect(api.state.labels.some(l => l.name === 'Label1')).toBe(true);
  expect(await api.labels.get_by_id(label1.id)).toEqual(label1);
});

test('Label should update itself', async () => {
  label1.update({ name: 'UpdatedLabel1' });
  const response = await api.commit();

  expect(response.labels.some(l => l.name === 'UpdatedLabel1')).toBe(true);
  expect(api.state.labels.some(l => l.name === 'UpdatedLabel1')).toBe(true);
  expect(await api.labels.get_by_id(label1.id)).toEqual(label1);
});

test('Manager should update label order', async () => {
  label2 = api.labels.add('Label2');
  await api.commit();

  api.labels.update_orders({ [label1.id]: 1, [label2.id]: 2 });
  const response = await api.commit();

  response.labels.forEach((label) => {
    if (label.id === label1.id) {
      expect(label.item_order).toBe(1);
    }

    if (label.id === label2.id) {
      expect(label.item_order).toBe(2);
    }
  });

  expect(api.state.labels.find(l => l.id === label1.id).item_order).toBe(1);
  expect(api.state.labels.find(l => l.id === label2.id).item_order).toBe(2);
});

test('Label should delete itself', async () => {
  const name = label1.name;
  label1.delete();
  const response = await api.commit();

  expect(response.labels.some(l => l.id === label1.id)).toBe(false);
  expect(label1.is_deleted).toBe(1);
  expect(api.state.labels.some(l => l.name === name)).toBe(false);
});

test('Manager should update a label', async () => {
  api.labels.update(label2.id, { name: 'UpdatedLabel2' });
  const response = await api.commit();

  expect(response.labels.some(l => l.name === 'UpdatedLabel2')).toBe(true);
  expect(api.state.labels.some(l => l.name === 'UpdatedLabel2')).toBe(true);
});

test('Manager should delete a label', async () => {
  const name = label2.name;
  api.labels.delete(label2.id);
  const response = await api.commit();

  expect(response.labels.some(l => l.id === label2.id)).toBe(false);
  expect(label2.is_deleted).toBe(1);
  expect(api.state.labels.some(l => l.name === name)).toBe(false);
});
