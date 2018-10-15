import { Collection, Database } from 'abstract-database';
import axios from 'axios';
import { from, Observable, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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

    initialize(): Promise<any> {
        return this.switchCollection.find({})
            .then(allSwitches => {
                return Promise.all(allSwitches.map(sw => {
                    return this.getSwitchState(sw._id)
                        .catch(error => {
                            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                                console.error(`Host ${error.address} appears to be offline, so getting state for ${sw.name} has failed`);
                            } else {
                                console.error(error);
                            }
                        });
                }));
            });
    }

    addSwitch(pin: number, hostId: string, name: string): Promise<SwitchModel> {
        if (!pin || !hostId || !name) {
            return Promise.reject('Should set pin, host and name!');
        }

        return this.hostCollection.findOne({_id: hostId})
            .then(h => {
                return axios.post<SwitchModel>(`http://${h.ip}:${h.port}/api/switch`, {pin: pin})
                    .then((createdSwitch) => {
                        const newSwitch = createdSwitch.data;
                        newSwitch.host = h._id;
                        newSwitch.name = name;

                        return this.switchCollection
                            .findOneAndUpdate({pin: pin, host: h._id}, newSwitch, {upsert: true, new: true});
                    }).catch(error => {
                        throw(error.response && error.response.data ? error.response.data : error);
                    });
            }).catch(error => {
                throw(error);
            });
    }

    removeSwitch(switchId: string): Promise<any> {
        return this.switchCollection.findOneAndRemove({_id: switchId})
            .then((deletedSwitch) => {
                return this.hostCollection.findOne({_id: deletedSwitch.host})
                    .then(host => {
                        return axios.delete(`http://${host.ip}:${host.port}/api/switch/${deletedSwitch.pin}`)
                            .catch(error => {
                                throw(error.response && error.response.data ? error.response.data : error);
                            });
                    }).catch(error => {
                        throw(error);
                    });
            });
    }

    getSwitches(hostId: string): Promise<Array<SwitchModel>> {
        return this.switchCollection.find({}, null, {
            path: 'host',
            select: 'created _id hostName status',
            match: {_id: hostId}
        });
    }

    getSwitchState(switchId: string): Promise<SwitchModel> {
        return this.switchCollection.findOne({_id: switchId}, null, {path: 'host'})
            .then(foundSwitch => {
                return axios.get(`http://${foundSwitch.host.ip}:${foundSwitch.host.port}/api/switch/state/${foundSwitch.pin}`)
                    .then(response => {
                        foundSwitch.state = response.data.state;

                        return this.switchCollection.save(foundSwitch);
                    }).catch(error => {
                        throw(error.response && error.response.data ? error.response.data : error);
                    });
            });
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
