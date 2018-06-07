import { Collection, Database } from 'abstract-database';
import axios from 'axios';
import { HostModel, HostSchema } from '../model/host.model';
import { SensorModel, SensorSchema } from '../model/sensor.model';
import { State } from '../model/state.enum';
import { SwitchModel } from '../model/switch.model';
import { SwitchHandler } from './switch-handler';

const config = require('../../service.config.json');

export class SensorHandler {

    private sensorCollection: Collection<SensorModel>;
    private hostCollection: Collection<HostModel>;
    private switchHandler: SwitchHandler;

    constructor(switchHandler: SwitchHandler) {
        const connection = new Database(config.database.host, config.database.port, config.database.name, config.database.config).getConnection();
        this.sensorCollection = new Collection<SensorModel>(connection, 'sensor', SensorSchema, 'sensors');
        this.hostCollection = new Collection<HostModel>(connection, 'host', HostSchema, 'hosts');

        this.switchHandler = switchHandler;

        this.sensorCollection.find({})
            .then(sensors => {
                sensors.forEach(sensor => {
                    this.getSensorState(sensor._id)
                        .catch(error => {
                            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                                console.error(`Host ${error.address} appears to be offline, so getting state for ${sensor.name} has failed`);
                            } else {
                                console.error(error);
                            }
                        });
                });
            });
    }

    getSensorState(sensorId: string): Promise<any> {
        return this.sensorCollection.findOne({_id: sensorId}, null, {path: 'host'})
            .then(foundSensor => {
                return axios.get(`http://${foundSensor.host.ip}:${foundSensor.host.port}/api/sensor/state/${foundSensor.pin}`)
                    .then(response => this.switchHandler.changeState(foundSensor.targetId, response.data.state))
                    .catch(error => {
                        throw(error.response && error.response.data ? error.response.data : error);
                    });
            }).catch(error => {
                throw(error);
            });
    }

    getSensors(hostId: string): Promise<Array<SensorModel>> {
        return this.sensorCollection.find({}, null, {
            path: 'host',
            select: 'created _id hostName status',
            match: {_id: hostId}
        });
    }

    addSensor(pin: number, hostId: string, name: string, targetId?: string): Promise<SensorModel> {
        if (!pin || !hostId || !name) {
            return Promise.reject({error: 'Should set pin, hostId and name!'});
        }

        return this.hostCollection.findOne({_id: hostId})
            .then(h => {
                return axios.post<SensorModel>(`http://${h.ip}:${h.port}/api/sensor`, {pin: pin})
                    .then((createdSensor) => {
                        const newSensor = createdSensor.data;
                        newSensor.host = h._id;
                        newSensor.name = name;
                        newSensor.targetId = targetId;

                        return this.sensorCollection
                            .findOneAndUpdate({pin: pin, host: h._id}, newSensor, {upsert: true, new: true});
                    }).catch(error => {
                        throw(error.response && error.response.data ? error.response.data : error);
                    });
            }).catch(error => {
                throw(error);
            });
    }

    removeSensor(sensorId: string): Promise<any> {
        return this.sensorCollection.findOneAndRemove({_id: sensorId})
            .then((deletedSensor) => {
                return this.hostCollection.findOne({_id: deletedSensor.host})
                    .then(host => {
                        return axios.delete(`http://${host.ip}:${host.port}/api/sensor/${deletedSensor.pin}`)
                            .catch(error => {
                                throw(error.response && error.response.data ? error.response.data : error);
                            });
                    }).catch(error => {
                        throw(error);
                    });
            });
    }

    changeState(hostId: string, pin: string, state: State): Promise<SwitchModel> {
        return this.sensorCollection.findOne({pin: pin}, null, {path: 'host', match: {_id: hostId}})
            .then(foundSensor => {
                return this.switchHandler.changeState(foundSensor.targetId, state);
            }).catch(error => {
                throw(error);
            });
    }

    addTarget(sensorId: string, targetId: string): Promise<SensorModel> {
        return this.sensorCollection.findOne({_id: sensorId})
            .then(sensor => {
                sensor.targetId = targetId;

                return this.sensorCollection.save(sensor);
            });
    }
}
