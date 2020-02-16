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
  // connectorService = module.get<ConnectorService>(ConnectorService);
});

describe('ApiController -> detailReferences()', () => {
  it('should return a reference', async () => {
    // given
    const fragment = 'product';
    const id = '3';
    const ref = 'category';

    // when
    const result = await apiController.detailReferences(
      fragment,
      id,
      ref,
      reqMock,
    );

    // then
    expect(result.data.length).toBe(1);
    expect(result.data[0].name).toBe('position7');
  });

  it('should return a one to one reference', async () => {
    // given
    const fragment = 'category';
    const id = '6';
    const ref = 'product';

    // when
    const result = await apiController.detailReferences(
      fragment,
      id,
      ref,
      reqMock,
    );

    // then
    expect(result._id).toBe('8');
    expect(result.name).toBe('position8');
  });

  it('should throw 404 if fragment is unknown', async () => {
    // given
    const fragment = 'foo';
    const id = '3';

    try {
      // when
      await apiController.detailByKey(fragment, id, reqMock);
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
      await apiController.detailByKey(fragment, id, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });
});
