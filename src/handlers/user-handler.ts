import { Collection } from '@frankmerema/abstract-database';
import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { bindNodeCallback, from, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { setupMongoConnection } from '../helpers/mongo-connection/mongo-connection';
import { UserModel, UserSchema } from '../model';

const config = require('../../service.config.json');

export class UserHandler {

    private userCollection: Collection<UserModel>;

    constructor() {
        this.userCollection = new Collection<UserModel>(setupMongoConnection(), 'user', UserSchema, 'users');
    }

    getUser(username: string): Observable<UserModel> {
        return this.userCollection.findOne({username: username});
    }

    addUser(username: string, password: string): Observable<{ user: UserModel, hasTwoFactorEnabled: boolean }> {
        if (!username || !password) {
            return throwError('Username and password are required!');
        }

        return this.getUser(username)
            .pipe(tap(user => {
                    if (user) {
                        throwError('User already exists');
                    }
                }),
                switchMap(_ => from(hash(password, 12))
                    .pipe(switchMap(encryptedPassword =>
                        this.userCollection.save(<UserModel>{username: username, password: encryptedPassword})
                            .pipe(map(newUser =>
                                ({user: newUser, hasTwoFactorEnabled: false})))
                    ))
                ));
    }

    authenticateUser(username: string, password: string): Observable<{ user: UserModel, hasTwoFactorEnabled: boolean }> {
        if (!username || !password) {
            return throwError('Username and password are required!');
        }

        return this.getUser(username)
            .pipe(switchMap(user => from(compare(password, user.password))
                .pipe(switchMap(success => {
                    if (success) {
                        return of({
                            user: user,
                            hasTwoFactorEnabled: !!user.twoFactorAuthSecret && user.twoFactorSecretConfirmed
                        });
                    } else {
                        return throwError('Username / Password incorrect');
                    }
                }))
            ), catchError(() => throwError('Username / Password incorrect')));
    }

    create2FactorAuthUrl(username: string): Observable<string> {
        const toDataUrl = bindNodeCallback(toDataURL);

        return this.userCollection
            .findOneAndUpdate({username: username}, {twoFactorAuthSecret: authenticator.generateSecret()}, {new: true})
            .pipe(switchMap(user => {
                    const otpAuthPath = authenticator.keyuri(encodeURIComponent(user.username), encodeURIComponent('Home-Bridge'), user.twoFactorAuthSecret);

                    return toDataUrl(otpAuthPath) as Observable<string>;
                })
            );
    }

    verify2FactorAuthCode(username: string, code: string): Observable<{ jwt: string }> {
        return this.getUser(username)
            .pipe(switchMap(user => {
                if (authenticator.check(code, user.twoFactorAuthSecret)) {
                    if (!user.twoFactorSecretConfirmed) {
                        this.userCollection.findOneAndUpdate({username: username}, {twoFactorSecretConfirmed: true})
                            .subscribe();
                    }
                    return of({jwt: this.createJWT(user)});
                } else {
                    return throwError('The code is expired or not valid, please try again.');
                }
            }), catchError(() => throwError(`Cannot verify the token for ${username}`)));
    }

    private createJWT(user: UserModel): string {
        return sign({username: user.username}, config.applicationSecret, {
            expiresIn: 3600
        });
    }
}
