import { Collection, Database } from 'abstract-database';
import axios from 'axios';
import { SensorModel, SensorSchema } from '../model/sensor.model';
import { State } from '../model/state.enum';
import { SwitchHandler } from './switch-handler';

const config = require('../../service.config.json');

export class SensorHandler {

    private sensorCollection: Collection<SensorModel>;
    private switchHandler: SwitchHandler;

    constructor(switchHandler: SwitchHandler) {
        const connection = new Database(config.database.host, config.database.port,
            config.database.name, config.database.config).getConnection();
        this.sensorCollection = new Collection<SensorModel>(connection, 'sensor', SensorSchema, 'sensors');
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
        return this.sensorCollection.findOne({_id: sensorId})
            .then(foundSensor => {
                return axios.get(`http://${foundSensor.host}:${foundSensor.port}/api/sensor/state/${foundSensor.pin}`)
                    .then(response => this.switchHandler.changeState(foundSensor.targetId, response.data.state))
                    .catch(error => {
                        throw(error.response && error.response.data ? error.response.data : error);
                    });
            });
    }

    getSensors(host: string, port: number): Promise<Array<SensorModel>> {
        return this.sensorCollection.find({host: host, port: port});
    }

    addSensor(pin: number, host: string, port: number, name: string, targetId?: string): Promise<SensorModel> {
        if (!pin || !host || !port || !name) {
            return Promise.reject({error: 'Should set pin, host, port and name!'});
        }

        return axios.post<SensorModel>(`http://${host}:${port}/api/sensor`, {pin: pin})
            .then((createdSensor) => {
                const newSensor = createdSensor.data;
                newSensor.host = host;
                newSensor.port = port;
                newSensor.name = name;
                newSensor.targetId = targetId;

                return this.sensorCollection
                    .findOneAndUpdate({pin: pin, host: host, port: port}, newSensor, {upsert: true, new: true});
            }).catch(error => {
                throw(error.response && error.response.data ? error.response.data : error);
            });
    }

    removeSensor(sensorId: string): Promise<any> {
        return this.sensorCollection.findOneAndRemove({_id: sensorId})
            .then((deletedSensor) => {
                return axios.delete(`http://${deletedSensor.host}:${deletedSensor.port}/api/sensor/${deletedSensor.pin}`)
                    .catch(error => {
                        throw(error.response && error.response.data ? error.response.data : error);
                    });
            });
    }

    changeState(host: string, port: string, pin: string, state: State): Promise<any> {
        return this.sensorCollection.findOne({host: host, port: port, pin: pin})
            .then(foundSensor => {
                return this.switchHandler.changeState(foundSensor.targetId, state);
            });
    }
}
