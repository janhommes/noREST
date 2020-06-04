import { Request } from 'express';
export declare class CollectionService {
    private request;
    constructor(request: Request);
    getCollectionName(): Promise<string>;
}
