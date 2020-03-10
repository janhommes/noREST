import { ApiController } from '../api/api.controller';
import { prepare } from './api.controller/_prepare';

let apiController: ApiController;
let reqMock = {
  auth: {
    user: 'foo',
  },
};

beforeAll(async () => {
  const { module } = await prepare();
  apiController = module.get<ApiController>(ApiController);
});

describe('ApiController', () => {
  // TODO: add test that verify the right setup
  // of the controller.
  it('should exist', () => {
    expect(apiController).toBeDefined();
  });
});
