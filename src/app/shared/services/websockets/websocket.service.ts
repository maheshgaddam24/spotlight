import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket;

  constructor() { }

  connect(url: string): WebSocket {
    this.socket = new WebSocket(url);

    this.socket.onopen = (event) => {
      console.log('WebSocket connection opened:', event);
    };

    this.socket.onmessage = (event) => {
       console.log('WebSocket message received:', event.data);
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
    };

    return this.socket;
  }
}
