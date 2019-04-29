import { BadRequestException, HttpService, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SensorModel } from '../../shared/models/sensor/sensor.model';
import { State } from '../../shared/models/switch/state.enum';
import { HostService } from '../host/host.service';
import { SwitchService } from '../switch/switch.service';

interface SensorStateResponse {
    state: number;
}

interface SensorCreatedResponse {
    pin: number;
    state: number;
}

@Injectable()
export class SensorService {

    constructor(@InjectModel('Sensor') private sensorModel: Model<SensorModel>,
                private hostService: HostService,
                private httpService: HttpService,
                private switchService: SwitchService) {

        from(this.sensorModel.find())
            .subscribe(sensors => {
                sensors.forEach(sensor => {
                    this.setCorrectSensorState(sensor._id);
                });
            });
    }

    getSensors(hostId: string): Observable<SensorModel[]> {
        return from(this.sensorModel.find({}, null, {
            path: 'host',
            select: 'created _id hostName status',
            match: {_id: hostId}
        })).pipe(map(sensors => sensors.length ? sensors : []));
    }

    addSensor(pin: number, hostname: string, name: string, targetId?: string): Observable<SensorModel> {
        if (!pin || !hostname || !name) {
            throw new BadRequestException('Should set pin, hostId and name!');
        }

        return this.hostService.getHost(hostname)
            .pipe(switchMap(h =>
                this.httpService.post<SensorCreatedResponse>(`http://${h.ip}:${h.port}/api/sensor`, {pin: pin})
                    .pipe(switchMap(createdSensor => {
                            const newSensor = {
                                pin: createdSensor.data.pin,
                                host: h._id,
                                name: name,
                                targetId: targetId
                            };

                            return this.sensorModel.findOneAndUpdate({pin: pin, host: h._id}, newSensor, {
                                upsert: true,
                                new: true
                            });
                        }
                    ))
            ));
    }

    deleteSensor(sensorId: string): Observable<void> {
        return from(this.sensorModel.findOneAndRemove({_id: sensorId}))
            .pipe(switchMap(deletedSensor =>
                this.hostService.deleteHost(deletedSensor.host)
                    .pipe(switchMap(host =>
                        this.httpService.delete<void>(`http://${host.ip}:${host.port}/api/sensor/${deletedSensor.pin}`)
                            .pipe(map(() => {
                            }))
                    ))));
    }

    changeState(hostId: string, pin: string, state: State): Observable<void> {
        return from(this.sensorModel.findOne({pin: pin}, null, {path: 'host', match: {_id: hostId}}))
            .pipe(switchMap(foundSensor =>
                this.switchService.changeState(foundSensor.targetId, state)
            ));
    }

    addTarget(sensorId: string, targetId: string): Observable<SensorModel> {
        return from(this.sensorModel.findOneAndUpdate({_id: sensorId}, {targetId: targetId}));
    }

    private setCorrectSensorState(sensorId: string): void {
        from(this.sensorModel.findOne({_id: sensorId}, null, {path: 'host'}))
            .pipe(switchMap(foundSensor =>
                this.httpService.get<SensorStateResponse>(`http://${foundSensor.host.ip}:${foundSensor.host.port}/api/sensor/state/${foundSensor.pin}`)
                    .pipe(switchMap(sensorState => this.switchService.changeState(foundSensor.targetId, sensorState.data.state))))
            ).subscribe(() => {
        }, error => {
            if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                console.error(`Host ${error.address} appears to be offline, so getting state for ${sensorId} has failed`);
            } else {
                console.error(error);
            }
        });
    }
}
