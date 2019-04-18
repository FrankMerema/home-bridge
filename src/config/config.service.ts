const config = require('../../service.config.json');

export class ConfigService {

    get(key: string): string {
        return config[key];
    }
}
