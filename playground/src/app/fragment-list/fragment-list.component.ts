import { Component } from '@angular/core';
import { QueryService } from '../query.service';
import { flatten, uniq, orderBy } from 'lodash-es';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'nr-fragment-list',
  templateUrl: './fragment-list.component.html',
  styleUrls: ['./fragment-list.component.scss'],
})
export class FragmentListComponent {
  fragments = [];

  constructor(
    public queryService: QueryService,
    snackBar: MatSnackBar,
    private activeRoute: ActivatedRoute,
  ) {
    const key = this.activeRoute.snapshot.params.key;
    const socket = new WebSocket(
      `${this.queryService.getProtocol('ws')}${environment.wsUri}${environment.path}/${key}/?limit=200&auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJKb2huIERvZSJ9.oNawxKMyxc1U6LU2qeySPSLfOeeantwiPDrGuscs28U`,
    );
    socket.onopen = () => {
      socket.onmessage = msg => {
        const { data, message } = JSON.parse(msg.data);
        if (!data) {
          snackBar.open(`❌ Realtime failed: ${message}`, 'dismiss', {
            duration: 4000,
            panelClass: 'warn',
          });
        } else {
          const fragments = [];
          data.forEach(item => {
            fragments.push(
              Object.keys(item).filter(k => {
                return k.startsWith('#_');
              }),
            );
          });
          this.fragments = orderBy(
            uniq(flatten(fragments)).map(fragment =>
              fragment.replace('#_', ''),
            ),
          );
        }
      };
    };
  }
}
