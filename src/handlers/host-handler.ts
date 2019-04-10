import { Collection } from '@frankmerema/abstract-database';
import { Observable, throwError } from 'rxjs';
import { defaultIfEmpty } from 'rxjs/operators';
import { hbAxios } from '../helpers/axios-observable';
import { setupMongoConnection } from '../helpers/mongo-connection/mongo-connection';
import { HostDto, HostModel, HostSchema, HostStatus } from '../model';

export class HostHandler {

    private hostCollection: Collection<HostModel>;

    constructor() {
        this.hostCollection = new Collection<HostModel>(setupMongoConnection(), 'host', HostSchema, 'hosts');

        this.hostCollection.find({})
            .subscribe(hosts => {
                hosts.forEach(host => {
                    hbAxios.get(`http://${host.ip}:${host.port}/api/status`)
                        .subscribe(() => {
                            this.updateHostStatus(host.ip, 'online').subscribe();
                        }, () => {
                            this.updateHostStatus(host.ip, 'offline').subscribe();
                            console.error(`${host.hostName} didn't respond so set to 'offline'`);
                        });
                });
            });
    }

    getHost(id: string): Observable<HostModel> {
        return this.hostCollection.aggregateOne({_id: id}, HostDto);
    }

    getHostStatus(id: string): Observable<HostModel> {
        return this.hostCollection.findOne({_id: id}, {status: true});
    }

    getAllHosts(): Observable<HostModel[]> {
        return this.hostCollection.aggregate({}, HostDto)
            .pipe(defaultIfEmpty([]));
    }

    addHost(hostName: string, name: string, ip: string, port: number): Observable<HostModel> {
        if (!hostName || !name || !ip || !port) {
            return throwError('Should set hostName, name, ip and port!');
        }

        const newHost = <HostModel>{hostName: hostName, name: name, ip: ip, port: port, status: 'online'};
        console.info(`New host added: ${newHost.name}`);

        return this.hostCollection.findOneAndUpdate({ip: ip}, newHost, {upsert: true, new: true});
    }

    removeHost(id: string): Observable<HostModel> {
        console.info(`Removing host with ip: ${id}`);
        return this.hostCollection.findOneAndRemove({_id: id});
    }

    updateHostStatus(ip: string, status: HostStatus): Observable<HostModel> {
        return this.hostCollection.findOneAndUpdate({ip: ip}, {status: status});
    }
}
