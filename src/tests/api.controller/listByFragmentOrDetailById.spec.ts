import { prepare, createFakeData } from './_prepare';
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
  await createFakeData(apiController, reqMock);
});

describe('listByFragmentOrDetailById()', () => {
  it('should list all data associated to the fragment', async () => {
    // given
    const fragment = 'product';

    // when
    const result = await apiController.listByFragmentOrDetailById(
      fragment,
      reqMock,
    );

    // then
    expect(result._.total).toBe(3);
  });

  it('should only list associated to the fragment -> called with prefix', async () => {
    // given
    const fragment = '#_user';

    // when
    const result = await apiController.listByFragmentOrDetailById(
      fragment,
      reqMock,
    );

    // then
    expect(result._.total).toBe(1);
  });

  it('should return detail if unknown fragment', async () => {
    // given
    const id = '1';

    // when
    const result = await apiController.listByFragmentOrDetailById(id, reqMock);

    // then
    expect(result.name).toBe('position5');
  });

  it('should return 404 if an unknown fragment/id', async () => {
    // given
    const id = 'cannotFind';

    // when
    try {
      await apiController.listByFragmentOrDetailById(id, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });

  it('should still skip and limit on fragment', async () => {
    // given
    const fragment = 'product';
    const limit = 1;
    const skip = 1;

    // when
    const result = await apiController.listByFragmentOrDetailById(
      fragment,
      reqMock,
      skip,
      limit,
    );

    // then
    expect(result.data.length).toBe(1);
    expect(result._.total).toBe(3);
    expect(result.data[0].name).toBe('position3');
  });

  it('should skip and limit on fragment correctly', async () => {
    // given
    const fragment = 'product';
    const limit = 2;
    const skip = 0;

    // when
    const result = await apiController.listByFragmentOrDetailById(
      fragment,
      reqMock,
      skip,
      limit,
    );

    // then
    expect(result._.total).toBe(3);
    expect(result.data.length).toBe(2);
  });

  it('should still orderBy on fragment', async () => {
    // given
    const fragment = 'product';
    const orderBy = 'name desc';

    // when
    const result = await apiController.listByFragmentOrDetailById(
      fragment,
      reqMock,
      undefined,
      undefined,
      orderBy,
    );

    // then
    expect(result._.total).toBe(3);
    expect(result.data[0].name).toBe('position8');
  });

  it('should still ignore orderBy on detail', async () => {
    // given
    const id = '1';
    const orderBy = 'name desc';

    // when
    const result = await apiController.listByFragmentOrDetailById(
      id,
      reqMock,
      undefined,
      undefined,
      orderBy,
    );

    // then
    expect(result.name).toBe('position5');
  });
});
