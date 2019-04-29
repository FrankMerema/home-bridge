import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EMPTY, from, Observable, of } from 'rxjs';
import { catchError, defaultIfEmpty, mergeMap } from 'rxjs/operators';
import { SwitchModel } from '../../shared/models/switch/switch.model';
import { HostService } from '../host/host.service';

@Injectable()
export class SwitchService {

    constructor(@InjectModel('Switch') private switchModel: Model<SwitchModel>,
                private hostService: HostService) {

        from(this.switchModel.find({}))
            .pipe(mergeMap(allSwitches => {
                    return allSwitches.map(sw => this.getSwitchState(sw._id)
                        .pipe(catchError(error => {
                            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                                console.error(`Host ${error.address} appears to be offline, so getting state for ${sw.name} has failed`);
                            } else {
                                console.error(error);
                            }

                            return error;
                        })));
                }),
                defaultIfEmpty(EMPTY));
    }

    changeState(targetId: string, state: number): Observable<void> {
        return undefined;
    }

    private getSwitchState(_id: any): Observable<any> {
        return of();
    }
}
