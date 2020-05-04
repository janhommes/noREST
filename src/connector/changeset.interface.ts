/**
 * A changeset is returned by an connector to inform
 * connected websocket instances about a change.
 */
export interface Changeset {
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';
  _id: string;
  data?: any;
}
