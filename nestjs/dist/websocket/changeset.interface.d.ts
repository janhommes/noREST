export interface Changeset {
    method: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';
    _id: string;
    data?: any;
}
