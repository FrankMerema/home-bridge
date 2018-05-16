import { Collection, Database } from 'abstract-database';
import axios from 'axios';
import { HostModel, HostSchema, HostStatus } from '../model/host.model';

const config = require('../../service.config.json');

export class HostHandler {

    private collection: Collection<HostModel>;
    private readonly outputFields = {hostName: true, ip: true, port: true, status: true, _id: false};

    constructor() {
        const connection = new Database(config.database.host, config.database.port,
            config.database.name, config.database.config).getConnection();
        this.collection = new Collection<HostModel>(connection, 'host', HostSchema, 'hosts');

        this.getAllHosts().then(hosts => {
            hosts.forEach(host => {
                axios.get(`http://${host.ip}:${host.port}/api/status`)
                    .then(() => {
                        this.updateHostStatus(host.ip, 'online');
                    }).catch(() => {
                    this.updateHostStatus(host.ip, 'offline');
                    console.error(`${host.ip} didn't respond so set to 'offline'`);
                });
            });
        });
    }

    getHost(ip: string): Promise<HostModel> {
        return this.collection.findOne({ip: ip}, this.outputFields);
    }

    getHostStatus(ip: string): Promise<HostModel> {
        return this.collection.findOne({ip: ip}, {_id: false, status: true});
    }

    getAllHosts(): Promise<Array<HostModel>> {
        return this.collection.find({}, this.outputFields);
    }

    addHost(hostName: string, ip: string, port: number): Promise<HostModel> {
        if (!hostName || !ip || !port) {
            return Promise.reject('Should set hostName, ip and port!');
        }

        const newHost = <HostModel>{hostName: hostName, ip: ip, port: port, status: 'online'};

        return this.collection.findOneAndUpdate({ip: ip}, newHost, {upsert: true, new: true});
    }

    removeHost(ip: string): Promise<any> {
        return this.collection.findOneAndRemove({ip: ip});
    }

    updateHostStatus(ip: string, status: HostStatus) {
        return this.collection.findOneAndUpdate({ip: ip}, {status: status});
    }
}
