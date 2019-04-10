import { Database, MongoAtlasDatabase } from '@frankmerema/abstract-database';
import { Mongoose } from 'mongoose';
import { Observable } from 'rxjs';

const config = require('../../../service.config.json');

export const setupMongoConnection = (): Observable<Mongoose> => {
    if (process.argv.indexOf('--prod') === -1) {
        return new Database('localhost', 27017,
            config.database.name, config.database.config).getConnection();
    } else {
        return new MongoAtlasDatabase(config.database.username, config.database.password,
            config.database.host, config.database.name, config.database.config).getConnection();
    }
};
