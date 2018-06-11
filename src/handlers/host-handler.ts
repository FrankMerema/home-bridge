import { Collection, Database } from 'abstract-database';
import axios from 'axios';
import { HostDto, HostModel, HostSchema, HostStatus } from '../model/host.model';

const config = require('../../service.config.json');

export class HostHandler {

    private hostCollection: Collection<HostModel>;

    constructor() {
        const connection = new Database(config.database.host, config.database.port,
            config.database.name, config.database.config).getConnection();
        this.hostCollection = new Collection<HostModel>(connection, 'host', HostSchema, 'hosts');

        this.hostCollection.find({})
            .then(hosts => {
                hosts.forEach(host => {
                    axios.get(`http://${host.ip}:${host.port}/api/status`)
                        .then(() => {
                            this.updateHostStatus(host.ip, 'online');
                        }).catch(() => {
                        this.updateHostStatus(host.ip, 'offline');
                        console.error(`${host.hostName} didn't respond so set to 'offline'`);
                    });
                });
            });
    }

    getHost(id: string): Promise<HostModel> {
        return this.hostCollection.aggregateOne({_id: id}, HostDto);
    }

    getHostStatus(id: string): Promise<HostModel> {
        return this.hostCollection.findOne({_id: id}, {status: true});
    }

    getAllHosts(): Promise<Array<HostModel>> {
        return this.hostCollection.aggregate({}, HostDto);
    }

    addHost(hostName: string, name: string, ip: string, port: number): Promise<HostModel> {
        if (!hostName || !name || !ip || !port) {
            return Promise.reject('Should set hostName, name, ip and port!');
        }

        const newHost = <HostModel>{hostName: hostName, name: name, ip: ip, port: port, status: 'online'};
        console.info(`New host added: ${newHost.name}`);

        return this.hostCollection.findOneAndUpdate({ip: ip}, newHost, {upsert: true, new: true});
    }

    removeHost(id: string): Promise<any> {
        console.info(`Removing host with ip: ${id}`);
        return this.hostCollection.findOneAndRemove({_id: id});
    }

    updateHostStatus(ip: string, status: HostStatus) {
        return this.hostCollection.findOneAndUpdate({ip: ip}, {status: status});
    }
}
