import { prepare } from './_prepare';
import { ApiController } from '../../api/api.controller';

let apiController: ApiController;
const reqMock = {
  auth: {
    user: 'foo',
  },
};

beforeAll(async () => {
  const { module } = await prepare();
  apiController = module.get<ApiController>(ApiController);
});

describe('ApiController -> update() (PUT)', () => {
  it('should add a new property', async () => {
    // given
    await apiController.create({ _id: 'foo', '#_test': {} }, reqMock);

    // when
    const result = await apiController.update(
      'foo',
      { '#_test': {}, name: 'a' },
      reqMock,
    );

    // then
    expect(result.name).toBe('a');
  });

  it('should be able to alter a fragment', async () => {
    // given
    await apiController.create({ _id: 'foo2', '#_test': {} }, reqMock);

    // when
    const result = await apiController.update('foo2', { '#_bar': {} }, reqMock);

    // then
    expect(result['#_bar']).toBeDefined();
  });

  it('should be able to alter a fragment and find it afterwards', async () => {
    // given
    await apiController.create({ _id: 'foo3', '#_test': {} }, reqMock);

    // when
    await apiController.update('foo3', { '#_bar': {}, name: 'a' }, reqMock);
    const result = await apiController.detailByKey('bar', 'foo3', reqMock);

    // then
    expect(result.name).toBe('a');
  });

  it('should throw a 404 when the id is not found', async () => {
    // given
    const id = 'unknown';

    // when
    try {
      await apiController.update(id, { '#_bar': {}, name: 'a' }, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });

  it('should throw a 404 when the id is not found', async () => {
    // given
    await apiController.create({ _id: 'foo4', '#_test': {} }, reqMock);

    // when
    try {
      await apiController.update(
        'foo4',
        { _id: 'newNotAllowed', '#_bar': {}, name: 'a' },
        reqMock,
      );
    } catch (ex) {
      // then
      expect(ex.status).toBe(409);
    }
  });

  it('should add a reference to another entity', async () => {
    // given
    await apiController.create({ _id: 'foo5', '#_test': {} }, reqMock);
    await apiController.create({ _id: 'bar5', '#_category': {}, name: 'a' }, reqMock);

    // when
    const result = await apiController.update(
      'foo5',
      { '#_test': {}, '@': [{ id: 'bar5', fragment: '@_category', oneToOne: true }] },
      reqMock,
    );
    const ref = await apiController.detailReferences('test', 'foo5', 'category', reqMock);

    // then
    expect(result['@']).toBeDefined();
    expect(ref.name).toBe('a');
  });
  
  // TODO: add more tests
});
