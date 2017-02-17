require('dotenv').config();
require("babel-polyfill");

import API from './../todoist/Api';
const api = new API(process.env.ACCESS_TOKEN);

afterAll(async () => {
  item1.delete();
  await api.commit();
});

let note1;
let item1;

// only premium
test('Manager should add a note', async () => {
  await api.sync();
  const inbox = api.state.projects.find(p => p.name === 'Inbox');
  item1 = api.items.add('Item1_notes', inbox.id);
  await api.commit();

  note1 = api.notes.add(item1.id, 'Note1');
  const response = await api.commit();
  expect(response.notes.some(n => n.content === 'Note1')).toBe(true);
  expect(api.state.notes.some(n => n.content === 'Note1')).toBe(true);
  expect(await api.notes.get_by_id(note1.id)).toEqual(note1);
});

test('Note should update itself', async () => {
  note1.update({ content: 'UpdatedNote1' });
  const response = await api.commit();

  expect(response.notes.some(n => n.content === 'UpdatedNote1')).toBe(true);
  expect(api.state.notes.some(n => n.content === 'UpdatedNote1')).toBe(true);
  expect(await api.notes.get_by_id(note1.id)).toEqual(note1);
});

test('Note should delete itself', async () => {
  const content = note1.content;
  note1.delete();
  const response = await api.commit();

  expect(response.notes.some(n => n.id === note1.id)).toBe(false);
  expect(note1.is_deleted).toBe(1);
  expect(api.state.notes.some(n => n.content === content)).toBe(false);
});

test('Manager should delete a note', async () => {
  // but first we need to create it
  const note2 = api.notes.add(item1.id, 'Note2');
  let response = await api.commit();

  expect(response.notes.some(n => n.content === 'Note2')).toBe(true);
  expect(api.state.notes.some(n => n.content === 'Note2')).toBe(true);

  // now lets delete it
  const content = note2.content;
  api.notes.delete(note2.id);
  response = await api.commit();

  expect(response.notes.some(n => n.id === note2.id)).toBe(false);
  expect(note2.is_deleted).toBe(1);
  expect(api.state.notes.some(n => n.content === content)).toBe(false);
});
