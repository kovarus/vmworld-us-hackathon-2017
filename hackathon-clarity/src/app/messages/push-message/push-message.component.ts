import { Component, OnInit } from '@angular/core';
import { NgServiceWorker } from '@angular/service-worker';
import {ToasterService, ToasterConfig, Toast } from 'angular2-toaster';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'clarity-icons';

@Component({
  selector: 'app-push-message',
  templateUrl: './push-message.component.html',
  styleUrls: ['./push-message.component.scss']
})
export class PushMessageComponent implements OnInit {
  private swScope: string = './';
  private apiGUrl: string = 'https://7mx9stmpja.execute-api.us-east-1.amazonaws.com/Production/establishpushconnection';
  public toastyConfig: ToasterConfig;
  constructor(private http: Http, public sw: NgServiceWorker, private toastyService: ToasterService) {
    this.toastyConfig = new ToasterConfig({
      animation: "fade",
      limit: 10,
      positionClass: "toast-bottom-full-width"
    });
  }

  async ngOnInit() {
    await this.subscribeToPush();
  }

 async subscribeToPush() {
        const that = this;
        function urlBase64ToUint8Array(base64String) {
          const padding = '='.repeat((4 - base64String.length % 4) % 4);
          const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
          const rawData = window.atob(base64);
          const outputArray = new Uint8Array(rawData.length);
          for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
          }
          return outputArray;
        }

        let vapidKeys = await that.http.get(that.apiGUrl).toPromise();
        console.log(vapidKeys);
        let vk = JSON.parse((<any>vapidKeys)._body).publicKey;
        const convertedVapidKey = urlBase64ToUint8Array(vk);

        navigator['serviceWorker']
          .getRegistration(that.swScope)
          .then(registration => {
            registration.pushManager.getSubscription().then(function (subscription) {
              if ( subscription ) {
                subscription.unsubscribe().then(success => {
                  console.log('Unsubscription successful', success);
                  registration.pushManager
                    .subscribe({ userVisibleOnly: true, applicationServerKey: convertedVapidKey })
                      .then((subs) => {
                        that.registerForPush();
                        return that.http.post(that.apiGUrl, {
                                    sub: subs
                                  }).toPromise()
                                  .then(response => {
                                    return response.json();
                                  })
                                  .then(json => {
                                    console.log('Subscription request answer', json);
                                  })
                                  .catch(error => {
                                    console.log('Subscription request failed', error);
                                  });
                      });
                }).catch(error => {
                  console.log('Unsubscription failed', error);
                });
              } else {
                registration.pushManager
                .subscribe({ userVisibleOnly: true, applicationServerKey: convertedVapidKey })
                  .then((subs) => {
                    that.registerForPush();
                    return that.http.post(that.apiGUrl, {
                                sub: subs
                              }).toPromise()
                              .then(response => {
                                return response.json();
                              })
                              .then(json => {
                                console.log('Subscription request answer', json);
                              })
                              .catch(error => {
                                console.log('Subscription request failed', error);
                              });
                  });
              }
            });
          })
          .catch(error => {
            console.log(error);
          });

      }

      registerForPush(): void {

            this
              .sw
              .registerForPush()
              .subscribe(handler => {
                console.log(JSON.stringify({
                  url: handler.url,
                  key: handler.key(),
                  auth: handler.auth()
                }));
              });

            this
              .sw
              .push
              // .map(value => JSON.stringify(value))
              .subscribe(value => {
                const toastOptions: Toast = {
                  type: "success",
                  title: "",
                  body: value.message,
                  showCloseButton: false,
                  timeout: 0
              };
                this.toastyService.pop(toastOptions);
              });

          }

}
