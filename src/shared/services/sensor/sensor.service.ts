import { BadRequestException, HttpService, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HardwareCreatedResponse, SensorModel, State, StateResponse } from '@shared/models';
import { HostService, SwitchService } from '@shared/service';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable()
export class SensorService {

    constructor(@InjectModel('Sensor') private sensorModel: Model<SensorModel>,
                private httpService: HttpService,
                private hostService: HostService,
                private switchService: SwitchService) {
        from(this.sensorModel.find())
            .subscribe(sensors => {
                sensors.forEach(sensor => {
                    this.setCorrectSensorState(sensor._id);
                });
            });
    }

    getSensors(name: string): Observable<SensorModel[]> {
        return from(this.sensorModel.find({}, null, {
            path: 'host',
            select: 'created name hostName status',
            match: {name: name}
        })).pipe(map(sensors => sensors.length ? sensors : []));
    }

    addSensor(pin: number, hostname: string, name: string, targetId?: string): Observable<SensorModel> {
        if (!pin || !hostname || !name) {
            throw new BadRequestException('Should set pin, hostname and name!');
        }

        return this.hostService.getHost(hostname)
            .pipe(switchMap(host =>
                this.httpService.post<HardwareCreatedResponse>(`http://${host.ip}:${host.port}/api/sensor`, {pin: pin})
                    .pipe(switchMap(createdSensor => {
                            const newSensor = {
                                pin: createdSensor.data.pin,
                                host: host._id,
                                name: name,
                                targetId: targetId
                            };

                            return this.sensorModel.findOneAndUpdate({pin: pin, host: host._id}, newSensor, {
                                upsert: true,
                                new: true
                            });
                        }
                    ), catchError(() => {
                        throw new BadRequestException(`No host found/online for hostname: ${hostname}`);
                    }))
            ), catchError(() => {
                throw new BadRequestException(`No host found for hostname: ${hostname}`);
            }));
    }

    deleteSensor(sensorId: string): Observable<void> {
        return from(this.sensorModel.findOneAndDelete({_id: sensorId}))
            .pipe(switchMap(deletedSensor =>
                this.hostService.deleteHost(deletedSensor.host)
                    .pipe(switchMap(host =>
                        this.httpService.delete<void>(`http://${host.ip}:${host.port}/api/sensor/${deletedSensor.pin}`)
                            .pipe(map(() => {
                            }))
                    ))));
    }

    updateState(name: string, pin: string, state: State): Observable<void> {
        return from(this.sensorModel.findOne({pin: pin}, null, {path: 'host', match: {name: name}}))
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
                this.httpService.get<StateResponse>(`http://${foundSensor.host.ip}:${foundSensor.host.port}/api/sensor/state/${foundSensor.pin}`)
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
