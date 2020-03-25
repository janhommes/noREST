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

describe('ApiController -> list()', () => {
  it('Should list all when not fixed', async () => {
    // when
    const result = await apiController.list(reqMock);

    // expect
    expect(result._.total).toBe(8);
  });

  it('should throw 412 if skip is not a number', async () => {
    // given
    const skip = 'x';

    // when
    let status;
    try {
      await apiController.list(reqMock, skip);
    } catch (ex) {
      status = ex.getStatus();
    }

    // then
    expect(status).toBe(412);
  });

  it('should throw 412 if skip is a negative number', async () => {
    // given
    const skip = '-1';

    // when
    let status;
    try {
      await apiController.list(reqMock, skip);
    } catch (ex) {
      status = ex.getStatus();
    }

    // then
    expect(status).toBe(412);
  });

  it('should throw 412 if limit is not a number', async () => {
    // given
    const limit = 'x';

    // when
    let status;
    try {
      await apiController.list(reqMock, 0, limit);
    } catch (ex) {
      status = ex.getStatus();
    }

    // then
    expect(status).toBe(412);
  });

  it('should throw 412 if limit is a negative number', async () => {
    // given
    const limit = '-1';

    // when
    let status;
    try {
      await apiController.list(reqMock, 0, limit);
    } catch (ex) {
      status = ex.getStatus();
    }

    // then
    expect(status).toBe(412);
  });

  it('should skip data correctly', async () => {
    // given
    const skip = '3';

    // when
    const result = await apiController.list(reqMock, skip);

    // then
    expect(result._.skip).toBe(3);
    expect(result._.total).toBe(8);
    expect(result.data.length).toBe(5);
    expect(result.data[0].name).toBe('position2');
  });

  it('should limit data correctly', async () => {
    // given
    const limit = '2';

    // when
    const result = await apiController.list(reqMock, 0, limit);

    // then
    expect(result._.limit).toBe(2);
    expect(result._.total).toBe(8);
    expect(result.data.length).toBe(2);
    expect(result.data[0].name).toBe('position5');
  });

  it('should skip and limit data correctly', async () => {
    // given
    const skip = 2;
    const limit = '2';

    // when
    const result = await apiController.list(reqMock, skip, limit);

    // then
    expect(result._.limit).toBe(2);
    expect(result._.limit).toBe(2);
    expect(result._.total).toBe(8);
    expect(result.data.length).toBe(2);
    expect(result.data[0].name).toBe('position3');
  });

  it('should skip and limit data correctly and start at 0 if no skip is given', async () => {
    // given
    const skip = undefined;
    const limit = 3;

    // when
    const result = await apiController.list(reqMock, skip, limit);

    // then
    expect(result._.skip).toBe(0);
    expect(result._.limit).toBe(3);
    expect(result._.total).toBe(8);
    expect(result.data.length).toBe(3);
  });

  it('should order data correctly asc', async () => {
    // given
    const orderStr = 'name asc';

    // when
    const result = await apiController.list(reqMock, 0, undefined, orderStr);

    // then
    expect(result.data[0].name).toBe('position1');
    expect(result.data[0]._id).toBe('5'); // ensure stable sort
  });

  it('should order data correctly desc', async () => {
    // given
    const orderStr = 'name desc';

    // when
    const result = await apiController.list(reqMock, 0, undefined, orderStr);

    // then
    expect(result.data[0].name).toBe('position8');
  });

  it('should order data correctly mixed', async () => {
    // given
    const orderStr = 'name asc, _id desc';

    // when
    const result = await apiController.list(reqMock, 0, undefined, orderStr);

    // then
    expect(result.data[0].name).toBe('position1');
    expect(result.data[0]._id).toBe('6');
  });

  it('should throw on error', async () => {
    // given
    const orderFail = 123;

    try {
      // when
      await apiController.list(reqMock, 0, undefined, orderFail);
    } catch (ex) {
      // then
      expect(ex.status).toBe(400);
    }
  });

  xit('Should throw 404 if current api is fixed', async () => {
    // given
    // apiConfig.config.fixed = true;

    // when
    let status;
    try {
      await apiController.list(reqMock);
    } catch (ex) {
      status = ex.getStatus();
    }

    // expect
    expect(status).toBe(404);
  });
});
