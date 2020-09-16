import { Component, OnDestroy } from '@angular/core';
import { QueryService } from '../query.service';
import { flatten, uniq, orderBy } from 'lodash-es';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Realtime } from '../realtime/realtime';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'nr-fragment-list',
  templateUrl: './fragment-list.component.html',
  styleUrls: ['./fragment-list.component.scss'],
})
export class FragmentListComponent implements OnDestroy {
  fragments = [];

  private rtMessageSub: Subscription;
  private rtStatusSub: Subscription;

  constructor(
    public queryService: QueryService,
    snackBar: MatSnackBar,
    activeRoute: ActivatedRoute,
  ) {
    const key = activeRoute.snapshot.params.key;
    const rt = new Realtime(
      key,
      '/?limit=200&auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJKb2huIERvZSJ9.oNawxKMyxc1U6LU2qeySPSLfOeeantwiPDrGuscs28U',
    );
    rt.connect();
    this.rtMessageSub = rt.message$.subscribe(({ payload }) => {
      const fragments = [];
      payload.data.forEach(item => {
        fragments.push(
          Object.keys(item).filter(k => {
            return k.startsWith('#_');
          }),
        );
      });
      this.fragments = orderBy(
        uniq(flatten(fragments)).map(fragment => fragment.replace('#_', '')),
      );
    });
    this.rtStatusSub = rt.status$.subscribe(({ hasError, errorMsg }) => {
      if (hasError) {
        snackBar.open(errorMsg, 'dismiss', {
          duration: 4000,
          panelClass: 'warn',
        });
      }
    });
  }

  unsubscribeObservables() {
    if (this.rtMessageSub) {
      this.rtMessageSub.unsubscribe();
    }
    if (this.rtStatusSub) {
      this.rtStatusSub.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeObservables();
  }
}
