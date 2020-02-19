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

describe('ApiController -> create()', () => {
  it('should create an entity with any given id', async () => {
    // given
    const data = {
      _id: 'test',
      test: '1',
      '#_test': {},
    };

    // when
    const result = await apiController.create(data, reqMock);
    const request = await apiController.detailByKey('test', data._id, reqMock);

    // then
    expect(result._id).toBe('test');
    expect(request._id).toBe('test');
  });

  it('should create an entity -> if no id given -> create one', async () => {
    // given
    const data = {
      test: '1',
      '#_test': {},
    };

    // when
    const result = await apiController.create(data, reqMock);
    const request = await apiController.detailByKey(
      'test',
      result._id,
      reqMock,
    );

    // then
    expect(result.test).toBe('1');
    expect(request._id).toBeDefined();
  });

  it('should allow to set a reference, if the reference is known', async () => {
    // given
    const data = {
      test: 'woo',
      '#_test': {},
    };

    // when
    const ref = await apiController.create(data, reqMock);
    const request = await apiController.create(
      { ...data, '@': [{ id: ref._id, fragment: 'test' }] },
      reqMock,
    );

    // then
    expect(request['@'][0].id).toBeDefined();
    expect(request._id).toBeDefined();
  });

  it('should throw, if the reference is unknown', async () => {
    // given
    const data = {
      test: '1',
      '#_test': {},
      '@': [{ id: 'x', fragment: 'foo' }],
    };

    // when
    try {
      await apiController.create(data, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });

  it('should throw, if no index fragment is set', async () => {
    // given
    const data = {
      test: '1',
    };

    // when
    try {
      await apiController.create(data, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(422);
    }
  });
});
