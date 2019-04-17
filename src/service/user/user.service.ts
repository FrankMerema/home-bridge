import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcrypt';
import { Model } from 'mongoose';
import { from, Observable, throwError } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { UserDto } from '../../models/user/user.dto';
import { UserModel } from '../../models/user/user.model';

@Injectable()
export class UserService {

    constructor(@InjectModel('User') private userModel: Model<UserModel>) {
    }

    getUser(username: string): Observable<UserModel> {
        return from(this.userModel.findOne({username: username}));
    }

    addUser(username: string, password: string): Observable<UserDto> {
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
                        from(new this.userModel({username: username, password: encryptedPassword}).save())
                            .pipe(map(newUser =>
                                ({username: newUser.username, twoFactorSecretConfirmed: false})))))
                ));
    }

    updateUser(username: string, updateProps: any, options: any): Observable<UserModel> {
        return from(this.userModel.findOneAndUpdate({username: username}, updateProps, options));
    }
}
