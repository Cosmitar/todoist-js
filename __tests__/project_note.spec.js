require('dotenv').config();
require("babel-polyfill");

import API from './../todoist/Api';
const api = new API(process.env.DEVEL_ACCESS_TOKEN);

afterAll(async () => {
  project.delete();
  await api.commit();
});

let note1;
let project;

test('Manager should add a project note', async () => {
  await api.sync();

  project = api.projects.add('Project1_notes');
  await api.commit();

  note1 = api.project_notes.add(project.id, 'ProjectNote1');
  const response = await api.commit();

  expect(response.project_notes.some(n => n.content === 'ProjectNote1')).toBe(true);
  expect(api.state.project_notes.some(n => n.content === 'ProjectNote1')).toBe(true);
  expect(await api.project_notes.get_by_id(note1.id)).toEqual(note1);
});

test('Project note should update itself', async () => {
  note1.update({ content: 'UpdatedProjectNote1' });
  const response = await api.commit();

  expect(response.project_notes.some(n => n.content === 'UpdatedProjectNote1')).toBe(true);
  expect(api.state.project_notes.some(n => n.content === 'UpdatedProjectNote1')).toBe(true);
  expect(await api.project_notes.get_by_id(note1.id)).toEqual(note1);
});

test('Project note should delete itself', async () => {
  note1.delete();
  const content = note1.content;
  const response = await api.commit();

  expect(response.project_notes.some(n => n.id === note1.id)).toBe(false);
  expect(note1.is_deleted).toBe(1);
  expect(api.state.project_notes.some(n => n.content === content)).toBe(false);
});

test('Manager should delete a project note', async () => {
  // but first we need to create it
  const note2 = api.project_notes.add(project.id, 'ProjectNote2');
  let response = await api.commit();

  expect(response.project_notes.some(n => n.content === 'ProjectNote2')).toBe(true);
  expect(api.state.project_notes.some(n => n.content === 'ProjectNote2')).toBe(true);

  // now lets delete it
  const content = note2.content;
  api.project_notes.delete(note2.id);
  response = await api.commit();

  expect(response.project_notes.some(n => n.id === note2.id)).toBe(false);
  expect(note2.is_deleted).toBe(1);
  expect(api.state.project_notes.some(n => n.content === content)).toBe(false);
});
