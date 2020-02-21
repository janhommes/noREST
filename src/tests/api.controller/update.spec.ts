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
    await apiController.create(
      { _id: 'bar5', '#_category': {}, name: 'a' },
      reqMock,
    );

    // when
    const result = await apiController.update(
      'foo5',
      {
        '#_test': {},
        '@': [{ id: 'bar5', fragment: '@_category', oneToOne: true }],
      },
      reqMock,
    );
    const ref = await apiController.detailReferences(
      'test',
      'foo5',
      'category',
      reqMock,
    );

    // then
    expect(result['@']).toBeDefined();
    expect(ref.name).toBe('a');
  });

  it('should throw if the ref is unknown', async () => {
    // given
    await apiController.create({ _id: 'foo6', '#_test': {} }, reqMock);

    try {
      // when
      await apiController.update(
        'foo6',
        {
          '#_test': {},
          '@': [{ id: 'unknown!', fragment: '@_category', oneToOne: true }],
        },
        reqMock,
      );
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });

  it('should throw if you try to set metadata', async () => {
    // given
    await apiController.create({ _id: 'foo7', '#_test': {} }, reqMock);

    try {
      // when
      await apiController.update(
        'foo7',
        {
          '#_test': {},
          _: {
            no: 'nono',
          },
        },
        reqMock,
      );
    } catch (ex) {
      // then
      expect(ex.status).toBe(422);
    }
  });

  it('should update the metadata -> should update the owner', async () => {
    // given
    const create = await apiController.create(
      { _id: 'foo8', '#_test': {} },
      reqMock,
    );

    // when
    const result = await apiController.update(
      'foo8',
      {
        '#_changed': {},
      },
      {
        auth: {
          user: 'bar',
        },
      },
    );

    // then
    expect(create._.changedBy).toBe('foo');
    expect(result._.changedBy).toBe('bar');
    expect(create._.owner).toBe('foo');
    expect(result._.owner).toBe('bar');

    expect(create._.created).toBeDefined();
    expect(create._.changed).toBeDefined();
    expect(result._.created).toBeDefined();
    expect(result._.changed).toBeDefined();
  });

  it('should change the created date on PUT', async () => {
    // given
    const create = await apiController.create(
      { _id: 'foo9', '#_test': {} },
      reqMock,
    );

    await setTimeout(async () => {
      // when
      const result = await apiController.update(
        'foo9',
        {
          '#_changed': {},
        },
        reqMock,
      );

      // then
      expect(create._.created).not.toBe(result._.created);
      expect(create._.owner).toBe(result._.owner);
    }, 10);
  });
});
