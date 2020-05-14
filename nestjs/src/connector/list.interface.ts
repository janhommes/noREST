/**
 * Represents a list of data
 */
export interface List {

  /**
   * The metadata.
   */
  _: {
    /**
     * The total amount of data
     */
    total: number;
    /**
     * How many elements are skipped.
     */
    skip: number;
    /**
     * What is the limit of total elements to show.
     */
    limit: number;
    /**
     * A websocket event information.
     */
    event?: any;
  };
  /**
   * The data itself as array.
   */
  data: any[];
}