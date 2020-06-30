import { prepare } from './_prepare';
import { RestController } from '../../rest/rest.controller';

let apiController: RestController;
const reqMock = {
  auth: {
    user: 'foo',
  },
  protocol: 'http',
  get() {
    return 'localhost';
  }
};

const sampleEntity = {
  _id: 'test',
  test: '1',
  _readonly: 'bar',
  '#_test': {},
};

beforeAll(async () => {
  const { module } = await prepare();
  apiController = module.get<RestController>(RestController);
  await apiController.create(sampleEntity, reqMock);
});

describe('RestController -> change()', () => {
  it('should partial update', async () => {
    // given
    const alteredData = { test: '2', added: 'yes' };

    // when
    const result = await apiController.change(
      sampleEntity._id,
      alteredData,
      reqMock,
    );

    // then
    expect(result.test).toBe('2');
    expect(result.added).toBe('yes');
  });

  it('should throw 404 if unknown', async () => {
    // given
    const id = 'unknown';
    // when
    try {
      await apiController.change(id, { test: '2' }, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });

  it('should throw 422 if trying to alter metadata', async () => {
    // given
    const alteredData = { _: { owner: '2' } };

    // when
    try {
      await apiController.change(sampleEntity._id, alteredData, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(422);
    }
  });

  it('should throw 409 if trying to alter readonly', async () => {
    // given
    const alteredData = { _readonly: 'nono' };

    // when
    try {
      await apiController.change(sampleEntity._id, alteredData, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(409);
    }
  });

  it('should allow to set new index fragments', async () => {
    // given
    const alteredData = { '#_category': {} };
    // when
    const response = await apiController.change(
      sampleEntity._id,
      alteredData,
      reqMock,
    );
    // then
    expect(response['#_category']).toBeDefined();
  });

  it('should allow to remove index fragments', async () => {
    // given
    const alteredData = { '#_category': null };
    await apiController.change(sampleEntity._id, { '#_category': {} }, reqMock);
    // when
    const response = await apiController.change(
      sampleEntity._id,
      alteredData,
      reqMock,
    );
    // then
    expect(response['#_category']).not.toBeDefined();
  });

  it('should throw 422 if trying to remove the last index fragment', async () => {
    // given
    const alteredData = { '#_test': null };

    // when
    try {
      await apiController.change(sampleEntity._id, alteredData, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(422);
    }
  });

  it('should throw 404 if trying to add an unknown ref', async () => {
    // given
    const alteredData = { '@': [{ id: 'unknown', fragment: 'test' }] };

    // when
    try {
      await apiController.change(sampleEntity._id, alteredData, reqMock);
    } catch (ex) {
      // then
      expect(ex.status).toBe(404);
    }
  });

  it('should add a reference if trying to add an known ref', async () => {
    // given
    await apiController.create({ _id: 'bar', '#_test': {} }, reqMock);
    const alteredData = {
      '@': [{ id: 'bar', fragment: 'test', oneToOne: true }],
    };

    // when
    const result = await apiController.change(
      sampleEntity._id,
      alteredData,
      reqMock,
    );

    // then
    expect(result['@'].length).toBe(1);
  });

  it('should be able to remove a reference', async () => {
    // given
    await apiController.create({ _id: 'foo', '#_test': {} }, reqMock);
    const alteredData = {
      '@': [],
    };
    await apiController.change(
      sampleEntity._id,
      { '@': [{ id: 'foo', fragment: 'test', oneToOne: true }] },
      reqMock,
    );

    // when
    const result = await apiController.change(
      sampleEntity._id,
      alteredData,
      reqMock,
    );

    // then
    expect(result['@'].length).toBe(0);
  });

  it('should be able to alter a reference', async () => {
    // given
    await apiController.create({ _id: 'foo1', '#_test': {} }, reqMock);
    await apiController.create({ _id: 'foo2', '#_test': {} }, reqMock);
    const alteredData = {
      '@': [{ id: 'foo2', fragment: 'test', oneToOne: true }],
    };
    await apiController.change(
      sampleEntity._id,
      { '@': [{ id: 'foo1', fragment: 'test', oneToOne: true }] },
      reqMock,
    );

    // when
    const result = await apiController.change(
      sampleEntity._id,
      alteredData,
      reqMock,
    );

    // then
    expect(result['@'].length).toBe(1);
    expect(result['@'][0].id).toBe('foo2');
  });
});
