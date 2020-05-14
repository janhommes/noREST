import { RestController } from '../rest/rest.controller';
import { prepare } from './api.controller/_prepare';

let restController: RestController;

beforeAll(async () => {
  const { module } = await prepare();
  restController = module.get<RestController>(RestController);
});

describe('ApiController', () => {
  // TODO: add test that verify the right setup
  // of the controller.
  it('should exist', () => {
    expect(restController).toBeDefined();
  });
});
