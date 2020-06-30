import { prepare } from './_prepare';
import { RestController } from '../../rest/rest.controller';

let restController: RestController;
const reqMock = {
  auth: {
    user: 'foo',
  },
  protocol: 'http',
  get() {
    return 'localhost';
  }
};

beforeAll(async () => {
  const { module } = await prepare();
  restController = module.get<RestController>(RestController);
});

describe('ApiController -> createFragment()', () => {
  it('should create an entity with an fragment attached', async () => {
    // given
    const data = {
      _id: 'test',
      test: '1',
    };
    await restController.create({ _id: 'foo', '#_test': {} }, reqMock);

    // when
    const result = await restController.createFragment('test', data, reqMock);

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
    await restController.create({ _id: 'foobar', '#_test': {} }, reqMock);

    // when
    const result = await restController.createFragment('test', data, reqMock);

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
      await restController.createFragment('test2', data, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });
});
