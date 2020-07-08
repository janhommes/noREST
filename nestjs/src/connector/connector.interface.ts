import { ConnectorConfig } from './connector-config.interface';
import { Request } from 'express';
import { List } from './list.interface';
import { Reference } from './reference.interface';
import { Observable } from 'rxjs';
import { Changeset } from '../websocket/changeset.interface';

export interface ConnectorRequest {
  url: string;
  headers: {}
}

/**
 * Used to create the connector on each request.
 */
export interface ConnectorFactory {
  /**
   * A function that can be used to connect to the
   * database. 
   * @param config The connector configuration
   */
  connect(config: ConnectorConfig): Promise<any>;
  
  /**
   * A function that is called before each call to resolve the correct collection.
   */
  resolveConnector(req: ConnectorRequest, config: ConnectorConfig): Promise<Connector>;
}

/**
 * A connector allows to connect any data source to the noREST API.
 */
export interface Connector {
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
  listByIndexFragment(
    fragment: string,
    skip: number,
    limit: number,
    orderBy?: string,
  ): Promise<List>;

  /**
   * List all references by passing a map of
   * references. Can throw if non is found.
   * @param references The references ids to list.
   * @param skip How many docs should be skipped.
   * @param limit How many docs should be requested.
   */
  listByRef(
    references: Reference[],
    skip: number,
    limit: number,
    orderBy?: string
  ): Promise<List>;

  /**
   * Creates a new entity in the connector.
   * @param data The data that should be created.
   */
  create(data: any);

  /**
   * Updates an existing entity. The update should be
   * done by a complete replace.
   * @param id The id of the entity.
   * @param data The data to set. It contains the full entity.
   * @param data The data to set. It only contains the changed data.
   */
  update(id: string, data: any, partialData?: any);

  /**
   * Deletes a entity. References should be
   * cleaned up automatically.
   * @param id The id to delete.
   */
  delete(id: string);

  /**
   * Subscribes to changes. Used to inform websocket of data changes.
   * @param fragment The fragment to listen to (if undefined, a global list is used).
   * @param id The id to listen to (if undefined, a fragment list is used).
   * @param ref If given a re list is listened to.
   */
  listenOnChanges(fragment?, id?, ref?): Observable<Changeset>;
}
