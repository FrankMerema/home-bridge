import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserModel } from '@shared/models';
import { hash } from 'bcrypt';
import { Model } from 'mongoose';
import { from, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Injectable()
export class UserService {

    constructor(@InjectModel('User') private userModel: Model<UserModel>) {
    }

    getUser(username: string): Observable<UserModel> {
        return from(this.userModel.findOne({username: username}));
    }

    addUser(username: string, password: string): Observable<UserModel> {
        if (!username || !password) {
            throw new BadRequestException('Username and password are required!');
        }

        return this.getUser(username)
            .pipe(tap(user => {
                    if (user) {
                        throw new BadRequestException('User already exists');
                    }
                }),
                switchMap(() => from(hash(password, 12))
                    .pipe(switchMap(encryptedPassword => from(new this.userModel({
                        username: username,
                        password: encryptedPassword
                    }).save())))
                )
            );
    }

    updateUser(username: string, updateProps: any, options?: any): Observable<UserModel> {
        return from(this.userModel.findOneAndUpdate({username: username}, updateProps, options));
    }
}
