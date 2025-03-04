export interface SocketEvent<T> {
    event: string;
    data: T;
}