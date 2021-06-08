declare type RemoteLoaderMessages<T> = string | Record<string, any> | T;
export declare function remoteLoader<T>(locale: string, messages: RemoteLoaderMessages<T>, fallbackMessages?: RemoteLoaderMessages<T>): any;
export {};
