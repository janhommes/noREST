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
  _id: '1234',
  test: '1',
  _readonly: 'bar',
  '#_test': {},
};

beforeAll(async () => {
  const { module } = await prepare();
  apiController = module.get<RestController>(RestController);
  await apiController.create(sampleEntity, reqMock);
});

describe('RestController -> changeByFragment()', () => {
  it('should partial update if called with the right fragment', async () => {
    // given
    const alteredData = { test: '2', added: 'yes' };
    const fragment = 'test';

    // when
    const result = await apiController.changeByFragment(
      sampleEntity._id,
      fragment,
      alteredData,
      reqMock,
    );

    // then
    expect(result.test).toBe('2');
    expect(result.added).toBe('yes');
  });

  it('should partial update if called with the right fragment (also if the fragment has a hash)', async () => {
    // given
    const alteredData = { test: '2', added: 'yes' };
    const fragment = '#_test';

    // when
    const result = await apiController.changeByFragment(
      sampleEntity._id,
      fragment,
      alteredData,
      reqMock,
    );

    // then
    expect(result.test).toBe('2');
    expect(result.added).toBe('yes');
  });

  it('partial updates are also possible with readonly keys', async () => {
    // given
    const alteredData = { test: '2', added: 'yes' };
    const fragment = '#_test';
    const readOnlyId = 'bar';

    // when
    const result = await apiController.changeByFragment(
      readOnlyId,
      fragment,
      alteredData,
      reqMock,
    );

    // then
    expect(result._readonly).toBe('bar');
  });
});
