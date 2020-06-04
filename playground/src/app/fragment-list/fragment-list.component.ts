import { Component } from '@angular/core';
import { QueryService } from '../query.service';
import { flatten, uniq, orderBy } from 'lodash-es';

@Component({
  selector: 'nr-fragment-list',
  templateUrl: './fragment-list.component.html',
  styleUrls: ['./fragment-list.component.scss'],
})
export class FragmentListComponent {
  fragments = ['a'];

  constructor(public queryService: QueryService) {
    const socket = new WebSocket(
      'ws://localhost:3030/api/?limit=200&auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJKb2huIERvZSJ9.oNawxKMyxc1U6LU2qeySPSLfOeeantwiPDrGuscs28U',
    );
    socket.onopen = () => {
      socket.onmessage = msg => {
        const { data } = JSON.parse(msg.data);
        const fragments = [];
        data.forEach(item => {
          fragments.push(
            Object.keys(item).filter(k => {
              return k.startsWith('#_');
            }),
          );
        });
        this.fragments = orderBy(uniq(flatten(fragments)).map(fragment =>
          fragment.replace('#_', ''),
        ));
      };
    };
  }
}
