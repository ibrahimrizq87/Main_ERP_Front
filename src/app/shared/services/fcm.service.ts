import { Injectable, inject } from '@angular/core';
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { environment } from "../../environments/environment";

import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FcmService {
  

  title = 'af-notification';
  message:any = null;
  constructor() {}
  ngOnInit(): void {
    this.requestPermission();
    this.listen();
  }
  requestPermission() {
    const messaging = getMessaging();
    getToken(messaging, 
     { vapidKey: environment.firebase.vapidKey}).then(
       (currentToken) => {
         if (currentToken) {
           console.log("Hurraaa!!! we got the token.....");
           console.log(currentToken);
         } else {
           console.log('No registration token available. Request permission to generate one.');
         }
     }).catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
    });
  }
  listen() {
    const messaging = getMessaging();
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      this.message=payload;
    });
  }



}
