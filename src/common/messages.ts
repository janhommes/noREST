export enum Messages {
  NOT_FOUND = 'Entity not found',
  NO_REF_FOUND = 'Reference not found',
  NO_REF_FOUND_CREATE = 'Reference not found for: ',
  NO_ROUTE_FOUND = 'Route not found',
  NO_INDEX_SET = 'No index fragment set',
  VALIDATION_CONFLICT = 'The given entity conflicts with an existing one',
  VALIDATION_METADATA_IMMUTABLE = 'Adding or changing metadata is not allowed',
  VALIDATION_READABLE_IMMUTABLE = "Changing readonly properties (prefixed with '_') is not allowed.",
  VALIDATION_DUPLICATED_ID = 'Duplicated id',
  SKIP_QUERY_NO_POSITIVE_NUMBER = 'The skip and query parameter needs to be a positive number.',
  VALIDATION_ORDER = 'Invalid orderBy query parameter',
}
