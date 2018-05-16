import { Collection, Database } from 'abstract-database';
import axios from 'axios';
import { State } from '../model/state.enum';
import { SwitchModel, SwitchSchema } from '../model/switch.model';

const config = require('../../service.config.json');

export class SwitchHandler {

    private switchCollection: Collection<SwitchModel>;

    constructor() {
        const connection = new Database(config.database.host, config.database.port,
            config.database.name, config.database.config).getConnection();
        this.switchCollection = new Collection<SwitchModel>(connection, 'switch', SwitchSchema, 'switches');

        this.switchCollection.find({})
            .then(allSwitches => {
                allSwitches.forEach(sw => {
                    this.getSwitchState(sw._id)
                        .catch(error => {
                            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                                console.error(`Host ${error.address} appears to be offline, so getting state for ${sw.name} has failed`);
                            } else {
                                console.error(error);
                            }
                        });
                });
            });
    }

    addSwitch(pin: number, direction: string, host: string, port: number, name: string): Promise<SwitchModel> {
        if (!pin || !direction || !host || !port || !name) {
            return Promise.reject({error: 'Should set pin, direction, host, port and name!'});
        }

        return axios.post<SwitchModel>(`http://${host}:${port}/api/switch`, {pin: pin, direction: direction})
            .then((createdSwitch) => {
                const newSwitch = createdSwitch.data;
                newSwitch.host = host;
                newSwitch.port = port;
                newSwitch.name = name;

                return this.switchCollection
                    .findOneAndUpdate({pin: pin, host: host, port: port}, newSwitch, {upsert: true, new: true});
            }).catch(error => {
                throw(error.response && error.response.data ? error.response.data : error);
            });
    }

    removeSwitch(switchId: string): Promise<any> {
        return this.switchCollection.findOneAndRemove({_id: switchId})
            .then((deletedSwitch) => {
                return axios.delete(`http://${deletedSwitch.host}:${deletedSwitch.port}/api/switch/${deletedSwitch.pin}`)
                    .catch(error => {
                        throw(error.response && error.response.data ? error.response.data : error);
                    });
            });
    }

    getSwitches(host: string, port: string): Promise<Array<SwitchModel>> {
        return this.switchCollection.find({host: host, port: port});
    }

    getSwitchState(switchId: string): Promise<SwitchModel> {
        return this.switchCollection.findOne({_id: switchId})
            .then(foundSwitch => {
                return axios.get(`http://${foundSwitch.host}:${foundSwitch.port}/api/switch/state/${foundSwitch.pin}`)
                    .then(response => {
                        foundSwitch.state = response.data.state;

                        return this.switchCollection.save(foundSwitch);
                    }).catch(error => {
                        throw(error.response && error.response.data ? error.response.data : error);
                    });
            });
    }

    changeStatus(switchId: string): Promise<SwitchModel> {
        return this.switchCollection.findOne({_id: switchId})
            .then(foundSwitch => {
                if (foundSwitch) {
                    const newState = {state: foundSwitch.state === State.ON ? State.OFF : State.ON};
                    return axios.post(`http://${foundSwitch.host}:${foundSwitch.port}/api/switch/state/${foundSwitch.pin}`, newState)
                        .then(() => {
                            foundSwitch.state = newState.state;
                            foundSwitch.stateHistory.push({
                                state: newState.state,
                                executed: new Date(),
                                executedBy: 'system'
                            });

                            return this.switchCollection.save(foundSwitch);
                        }).catch(error => {
                            throw(error.response && error.response.data ? error.response.data : error);
                        });
                } else {
                    return Promise.reject({error: `Switch not found for ID: ${switchId}`});
                }
            });
    }
}
