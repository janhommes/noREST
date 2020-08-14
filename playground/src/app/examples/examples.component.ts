import { Component } from '@angular/core';
import { QueryService } from '../query.service';
import { Query } from '../common/query.interface';
import { Methods } from '../common/methods';

@Component({
  selector: 'nr-examples',
  templateUrl: './examples.component.html',
  styleUrls: ['./examples.component.scss'],
})
export class ExamplesComponent {
  methods = Methods;
  examples: Query[] = [
    {
      method: 'GET',
      uri: 'products',
      options: {
        title: 'List all products',
        description: `A simple GET to the /api/nr-key/products endpoint. Returns all Products with the #_products fragment.`,
      },
    },
    {
      method: 'GET',
      uri: 'categories',
      options: {
        useAuthentication: true,
        title: 'List all categories (authenticated)',
        description: 'List all categories and as it is authenticated also shows the index fragments',
      },
    },
    {
      method: 'GET',
      uri: 'products?limit=2&orderBy=rating desc',
      options: {
        title: 'Read the top two highest rated products',
        description: 'Reads all products, orders them by rating and limits it to 2.',
      },
    },
    {
      method: 'POST',
      uri: 'products',
      body: JSON.stringify(
        {
          _id: 'barfoo',
          name: 'barfoo',
          description: 'barfoo enlightens your day',
          price: 9.99,
          rating: 0,
          '#_products': {},
        },
        null,
        2,
      ),
      options: {
        useAuthentication: true,
        title: 'Create a new barfoo product',
        description: 'Creates a new product with the a custom id.',
      },
    },
    {
      method: 'GET',
      uri: 'products/barfoo',
      options: {
        title: 'Get the barfoo product',
        description: 'Reads the barfoo product.',
      },
    },
    {
      method: 'PATCH',
      uri: 'products/barfoo',
      body: JSON.stringify(
        {
          '#_featuredProducts': {},
        },
        null,
        2,
      ),
      options: {
        useAuthentication: true,
        title: 'Update the barfoo product to be featured',
        description: 'Updates the barfoo product to add a featuredProducts fragment, so that it can be reached via the /api/nr-key/featuredProducts endpoint.',
      },
    },
    {
      method: 'GET',
      uri: 'featuredProducts',
      options: {
        title: 'Get all featured products',
        description: 'Reads all products that have an additional featuredProducts fragment.',
      },
    },
    {
      method: 'POST',
      uri: 'categories',
      body: JSON.stringify(
        {
          _id: 'barfooCategory',
          name: 'foobar',
          '#_categories': {},
        },
        null,
        2,
      ),
      options: {
        useAuthentication: true,
        title: 'Create a foobar category',
        description: 'Creates a new category which can be referenced in the following PATCH requests.',
      },
    },
    {
      method: 'PATCH',
      uri: 'categories/barfooCategory',
      body: JSON.stringify(
        {
          '@_products': ['barfoo'],
        },
        null,
        2,
      ),
      options: {
        useAuthentication: true,
        title: 'Reference foo product to bar category',
        description: 'Adds a reference. Note: To add multiple reference each reference must be repeated.',
      },
    },
    {
      method: 'GET',
      uri: 'categories/barfooCategory/products',
      options: {
        title: 'Read all products of the barfoo category',
        description: 'Reads the references and returns the result.',
      },
    },
    {
      method: 'DELETE',
      uri: 'products/barfoo',
      options: {
        useAuthentication: true,
        title: 'Delete the barfoo product',
        description: 'Deletes the created foo product. All references should be removed as well.',
      },
    },
  ];

  constructor(private queryService: QueryService) {}

  triggerQuery(event: Event, example: Query) {
    event.stopPropagation();
    example.autoExecute = true;
    this.queryService.trigger(example);
    return false;
  }

  prepareQuery(example: Query) {
    example.autoExecute = false;
    this.queryService.trigger(example);
  }
}
