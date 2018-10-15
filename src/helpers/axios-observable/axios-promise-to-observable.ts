import { AxiosPromise, AxiosResponse } from 'axios';
import { Observable, Observer } from 'rxjs';
import { AxiosObservable } from './axios-observable.model';

export const axiosPromiseToObservable = <T = any>(promise: AxiosPromise<T>): AxiosObservable<T> => {
    return Observable.create((observer: Observer<AxiosResponse<T>>) => {
        return promise
            .then((response: AxiosResponse<T>) => {
                observer.next(response);
                observer.complete();
            })
            .catch(err => {
                observer.error(err);
            });
    });
};