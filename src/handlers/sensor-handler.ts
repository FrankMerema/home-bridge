import { Collection, MongoAtlasDatabase } from '@frankmerema/abstract-database';
import { Observable, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { hbAxios } from '../helpers/axios-observable';
import { setupMongoConnection } from '../helpers/mongo-connection/mongo-connection';
import { HostModel, HostSchema, SensorModel, SensorSchema, State, SwitchModel } from '../model';
import { SwitchHandler } from './switch-handler';

export class SensorHandler {

    private sensorCollection: Collection<SensorModel>;
    private hostCollection: Collection<HostModel>;
    private switchHandler: SwitchHandler;

    constructor(switchHandler: SwitchHandler) {
        this.sensorCollection = new Collection<SensorModel>(setupMongoConnection(), 'sensor', SensorSchema, 'sensors');
        this.hostCollection = new Collection<HostModel>(setupMongoConnection(), 'host', HostSchema, 'hosts');

        this.switchHandler = switchHandler;

        this.sensorCollection.find({})
            .subscribe(sensors => {
                sensors.forEach(sensor => {
                    this.getSensorState(sensor._id)
                        .subscribe(() => {
                        }, error => {
                            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                                console.error(`Host ${error.address} appears to be offline, so getting state for ${sensor.name} has failed`);
                            } else {
                                console.error(error);
                            }
                        });
                });
            });
    }

    getSensorState(sensorId: string): Observable<SwitchModel> {
        return this.sensorCollection.findOne({_id: sensorId}, null, {path: 'host'})
            .pipe(switchMap(foundSensor => {
                    return hbAxios.get(`http://${foundSensor.host.ip}:${foundSensor.host.port}/api/sensor/state/${foundSensor.pin}`)
                        .pipe(switchMap(response => this.switchHandler.changeState(foundSensor.targetId, response.data.state)));

                })
            );
    }

    getSensors(hostId: string): Observable<Array<SensorModel>> {
        return this.sensorCollection.find({}, null, {
            path: 'host',
            select: 'created _id hostName status',
            match: {_id: hostId}
        });
    }

    addSensor(pin: number, hostId: string, name: string, targetId?: string): Observable<SensorModel> {
        if (!pin || !hostId || !name) {
            return throwError('Should set pin, hostId and name!');
        }

        return this.hostCollection.findOne({_id: hostId})
            .pipe(switchMap(h => {
                return hbAxios.post<SensorModel>(`http://${h.ip}:${h.port}/api/sensor`, {pin: pin})
                    .pipe(switchMap(createdSensor => {
                        const newSensor = createdSensor.data;
                        newSensor.host = h._id;
                        newSensor.name = name;
                        newSensor.targetId = targetId;

                        return this.sensorCollection
                            .findOneAndUpdate({pin: pin, host: h._id}, newSensor, {upsert: true, new: true});
                    }));
            }));
    }

    removeSensor(sensorId: string): Observable<any> {
        return this.sensorCollection.findOneAndRemove({_id: sensorId})
            .pipe(switchMap(deletedSensor =>
                this.hostCollection.findOne({_id: deletedSensor.host})
                    .pipe(switchMap(host =>
                        hbAxios.delete(`http://${host.ip}:${host.port}/api/sensor/${deletedSensor.pin}`)))
            ));
    }

    changeState(hostId: string, pin: string, state: State): Observable<SwitchModel> {
        return this.sensorCollection.findOne({pin: pin}, null, {path: 'host', match: {_id: hostId}})
            .pipe(switchMap(foundSensor => {
                return this.switchHandler.changeState(foundSensor.targetId, state);
            }));
    }

    addTarget(sensorId: string, targetId: string): Observable<SensorModel> {
        return this.sensorCollection.findOne({_id: sensorId})
            .pipe(switchMap(sensor => {
                sensor.targetId = targetId;

                return this.sensorCollection.save(sensor);
            }));
    }
}
