import { BadRequestException, HttpService, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HardwareCreatedResponse, State, StateResponse, SwitchModel } from '@shared/models';
import { Model } from 'mongoose';
import { EMPTY, from, Observable } from 'rxjs';
import { catchError, defaultIfEmpty, map, mergeMap, switchMap } from 'rxjs/operators';
import { HostService } from '../host/host.service';

@Injectable()
export class SwitchService {

    constructor(@InjectModel('Switch') private switchModel: Model<SwitchModel>,
                private hostService: HostService,
                private httpService: HttpService) {

        from(this.switchModel.find({}))
            .pipe(mergeMap(allSwitches =>
                    allSwitches.map(sw => this.getSwitchState(sw.name)
                        .pipe(catchError(error => {
                            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                                console.error(`Host ${error.address} appears to be offline, so getting state for ${sw.name} has failed`);
                            } else {
                                console.error(error);
                            }

                            return error;
                        })))),
                defaultIfEmpty(EMPTY));
    }

    addSwitch(pin: number, hostname: string, name: string): Observable<{} | SwitchModel> {
        if (!pin || !hostname || !name) {
            throw new BadRequestException('Should set pin, hostname and name!');
        }

        return this.hostService.getHost(hostname)
            .pipe(switchMap(host =>
                this.httpService.post<HardwareCreatedResponse>(`http://${host.ip}:${host.port}/api/switch`, {pin: pin})
                    .pipe(switchMap(createdSwitch => {
                        const newSwitch = {
                            pin: createdSwitch.data.pin,
                            host: host._id,
                            name: name
                        };

                        return this.switchModel.findOneAndUpdate({pin: pin, host: host._id}, newSwitch, {
                            upsert: true,
                            new: true
                        });
                    }))
            ));
    }

    deleteSwitch(name: string): Observable<void> {
        return from(this.switchModel.findOneAndDelete({name: name}))
            .pipe(switchMap(deletedSwitch =>
                this.hostService.getHostById(deletedSwitch.host)
                    .pipe(switchMap(host =>
                        this.httpService.delete(`http://${host.ip}:${host.port}/api/switch/${deletedSwitch.pin}`)
                            .pipe(map(() => {
                            }))))));
    }

    getSwitches(name: string): Observable<SwitchModel[]> {
        return from(this.switchModel.find({}, null, {
            path: 'host',
            select: 'created name hostName status',
            match: {name: name}
        })).pipe(map(switches => switches.length ? switches : []));
    }

    changeState(name: string, state: State): Observable<void> {
        return from(this.switchModel.findOne({name: name}).populate('host'))
            .pipe(switchMap(foundSwitch => {
                const newState = {
                    state: state !== undefined ? state :
                        foundSwitch.state === State.ON ?
                            State.OFF : State.ON
                };

                return this.httpService.post(`http://${foundSwitch.host.ip}:${foundSwitch.host.port}/api/switch/state/${foundSwitch.pin}`, newState)
                    .pipe(switchMap(() => {
                        foundSwitch.state = newState.state;
                        foundSwitch.stateHistory.push({
                            state: newState.state,
                            executed: new Date(),
                            executedBy: 'system'
                        });

                        return from(foundSwitch.save())
                            .pipe(map(() => {
                            }));
                    }));
            }));
    }

    private getSwitchState(name: string): Observable<{} | SwitchModel> {
        return from(this.switchModel.findOne({name: name}).populate('host'))
            .pipe(switchMap(foundSwitch =>
                this.httpService.get<StateResponse>(`http://${foundSwitch.host.ip}:${foundSwitch.host.port}/api/switch/state/${foundSwitch.pin}`)
                    .pipe(switchMap(response => {
                        foundSwitch.state = response.data.state;

                        return from(foundSwitch.save());
                    }))));
    }
}
