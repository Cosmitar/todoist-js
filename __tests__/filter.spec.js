require('dotenv').config();
require("babel-polyfill");

import API from './../todoist/Api';
const api = new API(process.env.ACCESS_TOKEN);

let filter1;
let filter2;

test('Manager should add a filter', async () => {
  await api.sync();

  filter1 = api.filters.add('Filter1', 'no due date');
  const response = await api.commit();

  expect(response.filters.some(n => n.name === 'Filter1')).toBe(true);
  expect(api.state.filters.some(n => n.name === 'Filter1')).toBe(true);
  expect(await api.filters.get_by_id(filter1.id)).toEqual(filter1);
});

test('Filter should update itself', async () => {
  filter1.update({ name: 'UpdatedFilter1' });
  const response = await api.commit();

  expect(response.filters.some(n => n.name === 'UpdatedFilter1')).toBe(true);
  expect(api.state.filters.some(n => n.name === 'UpdatedFilter1')).toBe(true);
  expect(await api.filters.get_by_id(filter1.id)).toEqual(filter1);
});

test('Manager should update filter order', async () => {
  filter2 = api.filters.add('Filter2', 'today');
  await api.commit();

  api.filters.update_orders({ [filter1.id]: 2, [filter2.id]: 1 });
  const response = await api.commit();

  response.filters.forEach((filter) => {
    if (filter.id === filter1.id) {
      expect(filter1.item_order).toBe(2);
    }
    if (filter.id === filter2.id) {
      expect(filter2.item_order).toBe(1);
    }
  });

  expect(api.state.filters.find(f => f.id === filter1.id).item_order).toBe(2);
  expect(api.state.filters.find(f => f.id === filter2.id).item_order).toBe(1);
});

test('Filter should delete itself', async () => {
  filter1.delete();
  const name = filter1.name;
  const response = await api.commit();

  expect(response.filters.some(f => f.id === filter1.id)).toBe(false);
  expect(filter1.is_deleted).toBe(1);
  expect(api.state.filters.some(f => f.name === name)).toBe(false);
});

test('Manager should update a filter', async () => {
  api.filters.update(filter2.id, { name: 'UpdatedFilter2' });
  const response = await api.commit();

  expect(response.filters.some(n => n.name === 'UpdatedFilter2')).toBe(true);
  expect(api.state.filters.some(n => n.name === 'UpdatedFilter2')).toBe(true);
});

test('Manager should delete a filter', async () => {
  api.filters.delete(filter2.id);
  const name = filter2.name;
  const response = await api.commit();

  expect(response.filters.some(f => f.id === filter2.id)).toBe(false);
  expect(filter2.is_deleted).toBe(1);
  expect(api.state.filters.some(f => f.name === name)).toBe(false);
});
