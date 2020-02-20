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

describe('ApiController -> createFragment()', () => {
  it('should create an entity with an fragment attached', async () => {
    // given
    const data = {
      _id: 'test',
      test: '1',
    };
    await apiController.create({ _id: 'foo', '#_test': {} }, reqMock);

    // when
    const result = await apiController.createFragment('test', data, reqMock);

    // then
    expect(result['#_test']).toBeDefined();
  });

  it('should create an entity with an fragment attached even if the data already defines it', async () => {
    // given
    const data = {
      _id: 'test2',
      test: '1',
      '#_test': {},
    };
    await apiController.create({ _id: 'foobar', '#_test': {} }, reqMock);

    // when
    const result = await apiController.createFragment('test', data, reqMock);

    // then
    expect(result['#_test']).toBeDefined();
  });

  it('should throw 404 if the fragment is unknown', async () => {
    // given
    const data = {
      _id: 'test',
      test: '1',
    };

    try {
      // when
      await apiController.createFragment('test2', data, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });
});
