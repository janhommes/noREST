import { prepare } from './_prepare';
import { RestController } from '../../rest/rest.controller';

let restController: RestController;
const reqMock = {
  auth: {
    user: 'foo',
  },
};

const sampleEntity = {
  _id: 'existing',
  test: '1',
  _readonly: 'bar',
  '#_test': {},
};

beforeAll(async () => {
  const { module } = await prepare();
  restController = module.get<RestController>(RestController);
});

describe('ApiController -> delete() and deleteByFragnent()', () => {
  it('should delete an existing one and return the delete entity', async () => {
    // given
    const id = 'existing';
    await restController.create(sampleEntity, reqMock);

    // when
    const result = await restController.delete(id, reqMock);

    // then
    expect(result._id).toBe(id);
  });

  it('should throw a 404 if the deleted entity is unknown', async () => {
    // given
    const id = 'unknown';
    await restController.create(sampleEntity, reqMock);

    // when
    try {
      await restController.delete(id, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });

  it('deleteByFragment() -> should throw a 404 if the fragment is unknown', async () => {
    // given
    sampleEntity._id = 'existing1';
    const fragment = 'unknown';
    await restController.create(sampleEntity, reqMock);

    // when
    try {
      await restController.deleteByFragment(sampleEntity._id, fragment, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });

  it('deleteByFragment() -> should be able to delete a entity', async () => {
    // given
    sampleEntity._id = 'existing2';
    const fragment = 'test';
    await restController.create(sampleEntity, reqMock);

    // when
    const result = await restController.deleteByFragment(
      sampleEntity._id,
      fragment,
      reqMock,
    );

    // then
    expect(result._id).toBe(sampleEntity._id);
  });

  it('deleteByFragment() -> should be able to delete a entity by its key', async () => {
    // given
    sampleEntity._id = 'existing3';
    sampleEntity._readonly = 'bar3';
    const fragment = 'test';
    const key = 'bar3';
    await restController.create(sampleEntity, reqMock);

    // when
    const result = await restController.deleteByFragment(key, fragment, reqMock);

    // then
    expect(result._id).toBe(sampleEntity._id);
  });
});
