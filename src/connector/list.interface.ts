/**
 * Represents a list of data
 */
export interface List {

  /**
   * The metadata.
   */
  _: {
    total: number;
    skip: number;
    limit: number;
  };
  /**
   * The data itself as array.
   */
  data: any[];
}