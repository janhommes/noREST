export interface ChangesetInterface {
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';
  _id: string;
  data?: any;
}
