import { DbConfig } from './db-config.interface';
import { Request } from 'express';
import { List } from './list.interface';
import { Reference } from './reference.interface';

/**
 * A connector allows to connect any datasource to
 * the noREST API.
 */
export interface Connector {
  connect(config: DbConfig);
  /**
   * A function that is called before each request goes to the database. It can
   * be used to resolve the collection for multi-tenancy.
   */
  resolveCollection(req: Request);

  /**
   * Returns true, if the given fragment is a valid index.
   * @param fragment The fragment to check.
   */
  isIndex(fragment: any);

  /**
   * Reads a dataset by ids id.
   * @param id The id to read
   */
  read(id: string);

  /**
   * This operation finds the first key match. A key match
   * is any property that starts with an underscore. Note,
   * as the full collection must be read and iterated, that
   * is considered as slow.
   *
   * @param fragment The fragment to read.
   * @param key The key to read.
   */
  readByKey(fragment: string, key: string);

  /**
   * List all data in the current collection.
   * @param skip How many docs should be skipped.
   * @param limit How many docs should be requested.
   * @param orderby How should the docs be ordered e.g. name,size DESC.
   */
  list(skip: number, limit: number, orderBy?: string): Promise<List>;

  /**
   * Lists all data by the index fragment.
   *
   * @param fragment The fragment to read.
   * @param skip How many docs should be skipped.
   * @param limit How many docs should be requested.
   * @param orderby How should the docs be ordered e.g. name,size DESC.
   */
  listByIndexFragment(fragment: string, skip: number, limit: number, orderBy?: string): Promise<List>;

  /**
   * List all references by passing a map of
   * references. Can throw if non is found.
   * @param references The references ids to list.
   * @param skip How many docs should be skipped.
   * @param limit How many docs should be requested.
   */
  listByRef(references: Reference[], skip: number, limit: number): Promise<List>;

  /**
   * Creates a new entity in the connector.
   * @param data The data that should be created.
   */
  create(data: any);

  /**
   * Updates an existing entity. The update should be
   * done by a complete replace.
   * @param id The id of the entity.
   * @param data The data to set. It usually contains the full entity.
   */
  update(id: string, data: any);

  /**
   * Deletes a entity. References should be
   * cleaned up automatically.
   * @param id The id to delete.
   */
  delete(id: string);
}
