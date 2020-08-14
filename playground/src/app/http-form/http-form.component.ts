import { Component, OnInit, ViewChild } from '@angular/core';
import { QueryService } from '../query.service';
import { Query } from '../common/query.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { MatTabGroup } from '@angular/material/tabs';
import { Methods } from '../common/methods';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'nr-http-form',
  templateUrl: './http-form.component.html',
  styleUrls: ['./http-form.component.scss'],
})
export class HttpFormComponent implements OnInit {
  methods = Methods;
  editorOptionsBody = {
    theme: 'vs-light',
    language: 'json',
    readOnly: false,
    automaticLayout: true,
  };
  editorOptionsResponse = {
    theme: 'vs-light',
    language: 'json',
    readOnly: true,
    automaticLayout: true,
  };
  response = `
  /**
   * -- 👨🏻‍💻 Welcome to the noREST playground 👩🏻‍💻 --
   *
   * You can:
   *  - Click on an index fragment to see it's content.
   *  - Run an crud operation by entering the URI,
   *    a method and a body into this window (note:
   *    Authorization and more can be configured in
   *    the "Options" tab).
   *  - Open an example to get predefined e-commerce
   *    examples that you can directly run.
   *  - Connect and see the results of the websocket
   *    realtime connection.
   *
   * Documentation can be found on Github:
   * 👉 http://github.com/janhommes/noREST
   *    (don't forget to give us a ⭐ if you enjoyed it)
   *
   **/`;
  body = '{}';
  method = 'GET';
  uri = '';
  status = 200;
  @ViewChild(MatTabGroup)
  tabs: MatTabGroup;
  options = {
    useAuthentication: false,
    type: 'cookie',
    jwt:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJKb2huIERvZSJ9.oNawxKMyxc1U6LU2qeySPSLfOeeantwiPDrGuscs28U',
  };

  constructor(
    private queryService: QueryService,
    private activeRoute: ActivatedRoute,
  ) {
    this.activeRoute.params.subscribe(({ key }) => {
      if (key) {
        this.queryService.key = key;
      }
    });
  }

  getUrl() {
    return this.queryService.getBaseUrl();
  }

  ngOnInit(): void {
    this.queryService.query$.pipe(
      filter(Boolean)
    ).subscribe((query: Query) => {
      if (query) {
        const desc = this.generateDescription(query);
        this.method = query.method;
        this.uri = query.uri;
        this.options.useAuthentication = query.options.useAuthentication;
        this.body = query.body;
        if (query.autoExecute !== false) {
          this.query(desc);
        } else {
          this.response = desc;
        }
      }
    });
  }

  query(desc = '') {
    this.queryService
      .execute({
        method: this.method,
        uri: this.uri,
        body: this.body,
        options: {
          useAuthentication: this.options.useAuthentication,
          headers: this.getHeaders(),
        },
      } as Query)
      .toPromise()
      .then(response => {
        this.tabs.selectedIndex = 0;
        this.status = 200;
        this.response = desc + JSON.stringify(response, null, 2);
      })
      .catch((error: HttpErrorResponse) => {
        this.tabs.selectedIndex = 0;
        this.status = error.status;
        this.response = JSON.stringify(error.error, null, 2);
      });
  }

  private getHeaders() {
    if (!this.options.useAuthentication) {
      return { 'Content-Type': 'application/json' };
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.options.jwt}`,
    };
  }

  private generateDescription(query: Query) {
    if (!query.options.description) {
      return '';
    }
    const spliced = query.options.description.match(/.{1,50}[^\s]*/g);
    return `/**\n * Example: ${query.options.title}\n * \n * ${spliced.join(
      '\n *',
    )} ${
      query.autoExecute === false
        ? `\n * \n * -> hit the ${query.method}-button to execute the request.`
        : ''
    }\n **/\n`;
  }
}
