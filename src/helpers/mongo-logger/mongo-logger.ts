import { Collection } from '@frankmerema/abstract-database';
import { LogModel, LogSchema, LogType } from '../../model/log.model';
import { setupMongoConnection } from '../mongo-connection/mongo-connection';

export class MongoLogger {

    private logCollection: Collection<LogModel>;

    constructor() {
        this.logCollection = new Collection<LogModel>(setupMongoConnection(), 'log', LogSchema, 'logs');
    }

    writeLogRecord(message: string, messageType: LogType): void {
        this.logCollection.save(<LogModel>{message: message, type: messageType}).subscribe();
    }
}
