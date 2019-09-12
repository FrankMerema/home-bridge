import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HostModel, HostStatus } from '@shared/models';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class HostService {
  constructor(@InjectModel('Host') private hostModel: Model<HostModel>) {}

  getHost(name: string): Observable<HostModel> {
    return from(this.hostModel.findOne({ name }));
  }

  getHostById(hostId: string): Observable<HostModel> {
    return from(this.hostModel.findOne({ _id: hostId }));
  }

  getHostStatus(name: string): Observable<{ status: HostStatus }> {
    return from(this.hostModel.findOne({ name }, { status: true }));
  }

  getAllHosts(): Observable<HostModel[]> {
    return from(this.hostModel.find()).pipe(map(hosts => (hosts.length ? hosts : [])));
  }

  addHost(hostName: string, name: string, ip: string, port: number): Observable<HostModel> {
    if (!hostName || !name || !ip || !port) {
      throw new BadRequestException('Should set hostName, name, ip and port!');
    }

    const newHost = { hostName, name, ip, port, status: 'online' } as HostModel;
    console.info(`New host added: ${newHost.name}`);

    return from(
      this.hostModel.findOneAndUpdate({ name }, newHost, {
        upsert: true,
        new: true
      })
    );
  }

  deleteHost(name: string): Observable<HostModel> {
    console.info(`Removing host: ${name}`);
    return from(this.hostModel.findOneAndDelete({ name }));
  }

  updateHostStatus(name: string, status: HostStatus): Observable<HostModel> {
    return from(this.hostModel.findOneAndUpdate({ name }, { status }));
  }
}
