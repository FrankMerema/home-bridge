import { Collection, MongoAtlasDatabase } from 'abstract-database';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { UserModel, UserSchema } from '../model/user.model';

const config = require('../../service.config.json');

export class UserHandler {

    private userCollection: Collection<UserModel>;

    constructor() {
        const connection = new MongoAtlasDatabase(config.database.username, config.database.password,
            config.database.host, config.database.name, config.database.config).getConnection();

        this.userCollection = new Collection<UserModel>(connection, 'user', UserSchema, 'users');
    }

    getUser(username: string) {
        return this.userCollection.findOne({username: username});
    }

    addUser(username: string, password: string): Promise<{ user: UserModel, token: string }> {
        if (!username || !password) {
            return Promise.reject('Username and password are required!');
        }

        return this.userCollection.findOne({username: username})
            .then(user => {
                if (!user) {
                    return hash(password, 12).then(encryptedPassword => {
                        return this.userCollection.save(<UserModel>{username: username, password: encryptedPassword})
                            .then(user => {
                                return Promise.resolve({user: user, token: this.createJWT(user)});
                            }).catch(error => {
                                throw(error);
                            });
                    });
                } else {
                    return Promise.reject('User already exists');
                }
            }).catch(error => {
                throw(error);
            });
    }

    authenticateUser(username: string, password: string): Promise<{ user: UserModel, token: string }> {
        if (!username || !password) {
            return Promise.reject('Username and password are required!');
        }

        return this.userCollection.findOne({username: username})
            .then(user => {
                if (user) {
                    return compare(password, user.password).then(success => {
                        if (success) {
                            return Promise.resolve({user: user, token: this.createJWT(user)});
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

    private createJWT(user: UserModel): string {
        return sign({username: user.username}, config.applicationSecret, {
            expiresIn: 3600
        });
    }
}
