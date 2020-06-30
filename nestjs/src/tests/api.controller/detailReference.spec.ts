import { prepare, createFakeData } from './_prepare';
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
  await createFakeData(restController, reqMock);
});

describe('ApiController -> detailReferences()', () => {
  it('should return a reference', async () => {
    // given
    await restController.create({ _id: 'b', '#_category': {} }, reqMock);
    const data = await restController.create(
      {
        _id: 'a',
        '#_product': {},
        '@': [{ id: 'b', fragment: '@_category', oneToOne: false }],
      },
      reqMock,
    );

    // when
    const result = await restController.detailReferences(
      'product',
      data._id,
      'category',
      reqMock,
    );

    // then
    expect(result.data.length).toBe(1);
    expect(result.data[0]._id).toBe('b');
  });

  it('should return a one to one reference', async () => {
    // given
    await restController.create(
      { _id: 'c', name: 'foo', '#_category': {} },
      reqMock,
    );
    const data = await restController.create(
      {
        _id: 'd',
        '#_product': {},
        '@': [{ id: 'c', fragment: '@_category', oneToOne: true }],
      },
      reqMock,
    );

    // when
    const result = await restController.detailReferences(
      'product',
      data._id,
      'category',
      reqMock,
    );

    // then
    expect(result._id).toBe('c');
    expect(result.name).toBe('foo');
  });

  it('should throw 404 if fragment is unknown', async () => {
    // given
    const fragment = 'foo';
    const id = '3';

    try {
      // when
      await restController.detailByKey(fragment, id, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });

  it('should throw 404 if id is not found', async () => {
    // given
    const fragment = 'product';
    const id = '100';

    try {
      // when
      await restController.detailByKey(fragment, id, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });

  it('should throw 404 if ref is not found', async () => {
    // given
    const fragment = 'category';

    try {
      // when
      await restController.detailByKey(fragment, '1', reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });
});
