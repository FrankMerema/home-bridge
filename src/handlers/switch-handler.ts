import { Collection, Database } from 'abstract-database';
import { from, Observable, throwError } from 'rxjs';
import { catchError, mergeMap, switchMap } from 'rxjs/operators';
import { hbAxios } from '../helpers/axios-observable';
import { HostModel, HostSchema } from '../model/host.model';
import { State } from '../model/state.enum';
import { SwitchModel, SwitchSchema } from '../model/switch.model';

const config = require('../../service.config.json');

export class SwitchHandler {

    private switchCollection: Collection<SwitchModel>;
    private hostCollection: Collection<HostModel>;

    constructor() {
        const connection = new Database('localhost', 27017,
            config.database.name, config.database.config).getConnection();

        // const connection = new MongoAtlasDatabase(config.database.username, config.database.password,
        //     config.database.host, config.database.name, config.database.config).getConnection();

        this.switchCollection = new Collection<SwitchModel>(connection, 'switch', SwitchSchema, 'switches');
        this.hostCollection = new Collection<HostModel>(connection, 'host', HostSchema, 'hosts');
    }

    initialize(): Observable<{} | SwitchModel> {
        return from(this.switchCollection.find({}))
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
            }));
    }

    addSwitch(pin: number, hostId: string, name: string): Observable<{} | SwitchModel> {
        if (!pin || !hostId || !name) {
            return throwError('Should set pin, host and name!');
        }

        return from(this.hostCollection.findOne({_id: hostId}))
            .pipe(switchMap(host => {
                return hbAxios.post<SwitchModel>(`http://${host.ip}:${host.port}/api/switch`, {pin: pin})
                    .pipe(switchMap(createdSwitch => {
                            const newSwitch = createdSwitch.data;
                            newSwitch.host = host._id;
                            newSwitch.name = name;

                            return from(this.switchCollection
                                .findOneAndUpdate({pin: pin, host: host._id}, newSwitch, {upsert: true, new: true}));
                        }),
                        catchError(error => error.response && error.response.data ? error.response.data : error));
            }));
    }

    removeSwitch(switchId: string): Observable<any> {
        return from(this.switchCollection.findOneAndRemove({_id: switchId}))
            .pipe(switchMap(deletedSwitch => {
                return from(this.hostCollection.findOne({_id: deletedSwitch.host}))
                    .pipe(switchMap(host => {
                        return hbAxios.delete(`http://${host.ip}:${host.port}/api/switch/${deletedSwitch.pin}`)
                            .pipe(catchError(error => error.response && error.response.data ? error.response.data : error));
                    }));
            }));
    }

    getSwitches(hostId: string): Observable<Array<SwitchModel>> {
        return from(this.switchCollection.find({}, null, {
            path: 'host',
            select: 'created _id hostName status',
            match: {_id: hostId}
        }));
    }

    getSwitchState(switchId: string): Observable<{} | SwitchModel> {
        return from(this.switchCollection.findOne({_id: switchId}, null, {path: 'host'}))
            .pipe(switchMap(foundSwitch => {
                return hbAxios.get(`http://${foundSwitch.host.ip}:${foundSwitch.host.port}/api/switch/state/${foundSwitch.pin}`)
                    .pipe(switchMap(response => {
                            foundSwitch.state = response.data.state;

                            return from(this.switchCollection.save(foundSwitch));
                        }),
                        catchError(error => error.response && error.response.data ? error.response.data : error));
            }));
    }

    changeState(switchId: string, state?: State): Observable<SwitchModel> {
        return from(this.switchCollection.findOne({_id: switchId}, null, {path: 'host'}))
            .pipe(switchMap(foundSwitch => {
                if (foundSwitch) {
                    const newState = {
                        state: state !== undefined ? state :
                            foundSwitch.state === State.ON ?
                                State.OFF : State.ON
                    };

                    return hbAxios.post(`http://${foundSwitch.host.ip}:${foundSwitch.host.port}/api/switch/state/${foundSwitch.pin}`, newState)
                        .pipe(switchMap(() => {
                            foundSwitch.state = newState.state;
                            foundSwitch.stateHistory.push({
                                state: newState.state,
                                executed: new Date(),
                                executedBy: 'system'
                            });

                            return from(this.switchCollection.save(foundSwitch));
                        }));
                } else {
                    return throwError(`Switch not found for ID: ${switchId}`);
                }
            }));
    }
}
