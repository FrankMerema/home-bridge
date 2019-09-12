export class ConfigService {
  private config = require('../../service.config.json');

  get(key: string): string {
    return this.config[key];
  }
}
