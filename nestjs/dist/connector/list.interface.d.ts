export interface List {
    _: {
        total: number;
        skip: number;
        limit: number;
        event?: any;
    };
    data: any[];
}
