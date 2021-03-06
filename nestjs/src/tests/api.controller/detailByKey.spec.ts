import { createFakeData, prepare } from './_prepare';
import { RestController } from '../../rest/rest.controller';

let restController: RestController;
const reqMock = {
  auth: {
    user: 'foo',
  },
  protocol: 'http',
  originalUrl: '/api',
  get() {
    return 'localhost:3030';
  }
};

beforeAll(async () => {
  const { module } = await prepare();
  restController = module.get<RestController>(RestController);
  await createFakeData(restController, reqMock);
});

describe('ApiController -> detailByKey()', () => {
  it('should show the detail by an fragment and an id', async () => {
    // given
    const fragment = 'product';
    const id = '3';

    // when
    const result = await restController.detailByKey(fragment, id, reqMock);

    // then
    expect(result.name).toBe('position3');
  });

  it('should throw if not found', async () => {
    // given
    const fragment = 'unknown';
    const id = '3';

    try {
      // when
      await restController.detailByKey(fragment, id, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });

  it('should throw if not found', async () => {
    // given
    const fragment = 'unknown';
    const id = '3';

    try {
      // when
      await restController.detailByKey(fragment, id, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });

  it('should show the detail by an fragment and an key', async () => {
    // given
    const fragment = 'option';
    const id = 'test';

    // when
    const result = await restController.detailByKey(fragment, id, reqMock);

    // then
    expect(result.name).toBe('position1');
  });

  it('should throw if id is undefined', async () => {
    // given
    const fragment = 'option';
    const id = undefined;

    try {
      // when
      await restController.detailByKey(fragment, id, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });

  it('should throw if fragment is undefined', async () => {
    // given
    const fragment = undefined;
    const id = '3';

    try {
      // when
      await restController.detailByKey(fragment, id, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });

  it('should throw if fragment is unknown', async () => {
    // given
    const fragment = 'abc';
    const id = '3';

    try {
      // when
      await restController.detailByKey(fragment, id, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });
});
