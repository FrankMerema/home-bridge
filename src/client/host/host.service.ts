import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HostModel, HostStatus } from '../../shared/models/host/host.model';

@Injectable()
export class HostService {

    constructor(@InjectModel('Host') private hostModel: Model<HostModel>) {
    }

    getHost(ip: string): Observable<HostModel> {
        return from(this.hostModel.findOne({ip: ip}));
    }

    getHostStatus(ip: string): Observable<{ status: HostStatus }> {
        return from(this.hostModel.findOne({ip: ip}, {status: true}));
    }

    getAllHosts(): Observable<HostModel[]> {
        return from(this.hostModel.find())
            .pipe(map(hosts => hosts.length ? hosts : []));
    }

    addHost(hostName: string, name: string, ip: string, port: number): Observable<HostModel> {
        if (!hostName || !name || !ip || !port) {
            throw new BadRequestException('Should set hostName, name, ip and port!');
        }

        const newHost = <HostModel>{hostName: hostName, name: name, ip: ip, port: port, status: 'online'};
        console.info(`New host added: ${newHost.name}`);

        return from(this.hostModel.findOneAndUpdate({ip: ip}, newHost, {upsert: true, new: true}));
    }

    removeHost(id: string): Observable<{}> {
        console.info(`Removing host with ip: ${id}`);
        return from(this.hostModel.findOneAndRemove({_id: id})).pipe(map(() => ({})));
    }

    updateHostStatus(ip: string, status: HostStatus): Observable<HostModel> {
        return from(this.hostModel.findOneAndUpdate({ip: ip}, {status: status}));
    }
}
