import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { exampleData } from './example';
import { Query } from '../common/query.interface';
import { QueryService } from '../query.service';
import { flatten } from 'lodash-es';

@Component({
  selector: 'nr-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
})
export class WizardComponent {
  private readonly DEFAULT_JWT =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJKb2huIERvZSJ9.oNawxKMyxc1U6LU2qeySPSLfOeeantwiPDrGuscs28U';
  public isLoading = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private queryService: QueryService,
  ) {}

  async createPlayground(isCreateSampleData = false) {
    this.isLoading = true;
    const key = (+new Date()).toString(32);
    try {
      console.log(`${this.queryService.getProtocol()}${environment.httpUri}${environment.path}/nr-${key}/`);
      const result = await this.http
        .request<{ data: [] }>(
          'GET',
          `${this.queryService.getProtocol()}${environment.httpUri}${environment.path}/nr-${key}/`,
        )
        .toPromise();
      if (result.data.length === 0) {
        await this.finalize(key, isCreateSampleData);
      } else {
        await this.createPlayground(isCreateSampleData);
      }
    } catch (ex) {
      this.snackBar.open(`❌ Create failed: ${ex.message}`, 'dismiss', {
        duration: 4000,
        panelClass: 'warn',
      });
      this.isLoading = false;
    }
  }

  async finalize(key: string, isCreateSampleData: boolean) {
    if (isCreateSampleData) {
      this.queryService.key = `nr-${key}`;
      const queries = exampleData.map(example => {
        return example.data.map(e => {
          const query: Query = {
            method: example.method,
            uri: example.url,
            body: JSON.stringify(e),
            options: {
              useAuthentication: true,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.DEFAULT_JWT}`,
              },
            },
          };
          return query;
        });
      });

      for (const query of flatten(queries)) {
        await this.queryService
          .execute(query, false)
          .toPromise()
          .then()
          .catch(ex => {
            console.log(ex);
          });
      }
    }
    this.queryService.isLoading = false;
    this.isLoading = false;
    this.router.navigateByUrl(`/nr-${key}`);
  }
}
