import { Collection, MongoAtlasDatabase } from 'abstract-database';
import { compare, hash } from 'bcrypt';
import { UserModel, UserSchema } from '../model/user.model';

const config = require('../../service.config.json');

export class UserHandler {

    private userCollection: Collection<UserModel>;

    constructor() {
        const connection = new MongoAtlasDatabase(config.database.username, config.database.password,
            config.database.host, config.database.name, config.database.config).getConnection();

        this.userCollection = new Collection<UserModel>(connection, 'user', UserSchema, 'users');
    }

    addUser(username: string, password: string): Promise<UserModel> {
        if (!username || !password) {
            return Promise.reject('Username and password are required!');
        }

        return this.userCollection.findOne({username: username})
            .then(user => {
                if (!user) {
                    return hash(password, 12).then(encryptedPassword => {
                        return this.userCollection.save(<UserModel>{
                            username: username,
                            password: encryptedPassword,
                        });
                    });
                } else {
                    return Promise.reject('User already exists');
                }
            }).catch(error => {
                throw(error);
            });
    }

    authenticateUser(username: string, password: string): Promise<UserModel> {
        if (!username || !password) {
            return Promise.reject('Username and password are required!');
        }

        return this.userCollection.findOne({username: username})
            .then(user => {
                if (user) {
                    return compare(password, user.password).then(success => {
                        if (success) {
                            return Promise.resolve(user);
                        } else {
                            return Promise.reject('Username / Password incorrect');
                        }
                    });
                } else {
                    return Promise.reject('Username / Password incorrect');
                }
            }).catch(error => {
                throw(error);
            });
    }
}
