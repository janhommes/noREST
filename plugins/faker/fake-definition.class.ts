export class FakeDefinition {
  namespace = 'createCard';
  collection: string;
  local = 'en';
  amount = 10;
  fragment: string;

  constructor(definition) {
    Object.assign(this, definition);
  }
}
