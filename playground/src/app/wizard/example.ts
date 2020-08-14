export const exampleData: {method: string, data: any[], url: string}[] = [
  {
    method: 'POST',
    data: [
      {
        _id: 'ratingFoo1',
        '#_ratings': {},
        from: 'John Doo',
        text: 'Awesome product. Comparable with the original foo for a way cheaper price.',
        starts: 5
      },
      {
        _id: 'ratingFoo2',
        '#_ratings': {},
        from: 'Stardust Bold',
        text: 'Liked it, but a bit to expensive for the quality.',
        starts: 4
      },
      {
        _id: 'ratingBar1',
        '#_ratings': {},
        from: 'Stardust Bold',
        text: 'Cannot recommend it.',
        starts: 1
      },
    ],
    url: 'ratings',
  },
  {
    method: 'POST',
    data: [
      {
        _id: 'foo',
        '#_products': {},
        name: 'Foo',
        price: 1.99,
        stock: 100,
        rating: 4.3,
        '@_ratings': ['ratingFoo1', 'ratingFoo2']
      },
      {
        _id: 'bar',
        '#_products': {},
        name: 'Bar',
        price: 2.99,
        stock: 10,
        rating: 2.3,
        '@_ratings': ['ratingBar1']
      },
      {
        _id: 'foobar',
        '#_products': {},
        name: 'Foo Bar',
        price: 12.99,
        stock: 0,
        rating: 2.9,
        '@_ratings': []
      },
    ],
    url: 'products',
  },
  {
    method: 'POST',
    data: [
      {
        _id: 'barCategory',
        '#_categories': {},
        name: 'Bar products',
        '@_products': ['bar']
      },
      {
        _id: 'fooCategory',
        '#_categories': {},
        name: 'Foo products',
        '@_products': ['foo']
      },
      {
        _id: 'foobarCategory',
        '#_categories': {},
        '@_categories': 'fooCategory',
        name: 'Foo Bar products',
        '@_products': ['foo', 'foobar', 'bar']
      },
    ],
    url: 'categories',
  },
];
