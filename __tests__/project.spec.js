require('dotenv').config();
require("babel-polyfill");

import API from './../todoist/Api';
const api = new API(process.env.DEVEL_ACCESS_TOKEN);

let project1 = null;
let project2 = null;
test('Manager should create a project', async () => {
  await api.sync();
  project1 = api.projects.add('Project1');
  const response = await api.commit();
  expect(response.projects.some(p => p.name === 'Project1')).toBe(true);
  expect(api.state.projects.some(p => p.name === 'Project1')).toBe(true);
  expect(await api.projects.get_by_id(project1.id)).toEqual(project1);
});

test('Project should archive itself', async () => {
  project1.archive();
  const response = await api.commit();
  expect(api.state.projects.find(p => p.name === 'Project1').is_archived).toBeTruthy();
  expect(response.projects.some(p => p.name === 'Project1')).toBe(false);
});

test('Project should unarchive itself', async () => {
  project1.unarchive();
  const response = await api.commit();
  expect(response.projects.some(p => p.name === 'Project1')).toBe(true);
  expect(api.state.projects.find(p => p.name === 'Project1').is_archived).toBeFalsy();
});

test('Project should update itself', async () => {
  project1.update({ name: 'UpdatedProject1' });
  const response = await api.commit();
  expect(response.projects.some(p => p.name === 'UpdatedProject1')).toBe(true);
  expect(api.state.projects.some(p => p.name === 'UpdatedProject1')).toBe(true);
  expect(await api.projects.get_by_id(project1.id)).toEqual(project1);
});

test('Manager should update projects order and indent', async () => {
  project2 = api.projects.add('Project2');
  let response = await api.commit();
  expect(response.projects.some(p => p.name === 'Project2')).toBe(true);
  api.projects.update_orders_indents({
    [project1.id]: [1, 2],
    [project2.id]: [2, 3]
  });
  response = await api.commit();

  response.projects.forEach((project) => {
    if (project.id === project1.id) {
      expect(project.item_order).toBe(1);
      expect(project.indent).toBe(2);
    }

    if (project.id === project2.id) {
      expect(project.item_order).toBe(2);
      expect(project.indent).toBe(3);
    }
  });

  expect(api.state.projects.find(p => p.id === project1.id).item_order).toBe(1);
  expect(api.state.projects.find(p => p.id === project1.id).indent).toBe(2);
  expect(api.state.projects.find(p => p.id === project2.id).item_order).toBe(2);
  expect(api.state.projects.find(p => p.id === project2.id).indent).toBe(3);
});

test('Project should delete itself', async () => {
  project1.delete();
  const response = await api.commit();

  expect(response.projects.some(p => p.id === project1.id)).toBe(false);
  expect(project1.is_deleted).toBeTruthy();
  expect(api.state.projects.some(p => p.name === 'Project1')).toBe(false);
});

test('Manager should archive a project', async () => {
  api.projects.archive(project2.id);
  const response = await api.commit();
  expect(api.state.projects.find(p => p.id === project2.id).is_archived).toBeTruthy();
  expect(response.projects.some(p => p.id === project2.id)).toBe(false);
});

test('Manager should unarchive a project', async () => {
  api.projects.unarchive(project2.id);
  const response = await api.commit();
  expect(api.state.projects.find(p => p.name === 'Project2').is_archived).toBeFalsy();
  expect(response.projects.some(p => p.name === 'Project2')).toBe(true);
});

test('Manager should update a project', async () => {
  api.projects.update(project2.id, { name: 'UpdatedProject2' });
  const response = await api.commit();
  expect(response.projects.some(p => p.name === 'UpdatedProject2')).toBe(true);
  expect(api.state.projects.some(p => p.name === 'UpdatedProject2')).toBe(true);
  expect(await api.projects.get_by_id(project2.id)).toEqual(project2);
});

test('Manager should delete a project', async () => {
  api.projects.delete([project2.id]);
  const response = await api.commit();

  expect(response.projects.some(p => p.id === project2.id)).toBe(false);
  expect(project2.is_deleted).toBeTruthy();
  expect(api.state.projects.some(p => p.id === project2.id)).toBe(false);
});
