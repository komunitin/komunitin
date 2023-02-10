import { initializeApp } from "firebase/app";
import { getMessaging, getToken, MessagePayload, Messaging, onMessage } from "firebase/messaging"
import { KOptions } from "../boot/koptions"
import axios from "axios";

import { Member, NotificationsSubscription, ResourceResponse, User } from "src/store/model";
import KError, { KErrorCode } from "src/KError";

import firebaseConfig from "./FirebaseConfig";

export interface SubscriptionSettings {
  locale: string
}

export class Notifications {

  /**
   * @returns The Firebase Messaging class, to be called from the main thread.
   */
  private getMessaging() : Messaging {
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);
    return messaging;
  }

  /**
   * Subscribe the current device, user and member to push notifications.
  */
  public async subscribe(user: User, member: Member, settings: SubscriptionSettings, accessToken: string): Promise<NotificationsSubscription> {
    // Initialize Firebase
    const messaging = this.getMessaging();
    const vapidKey = process.env.PUSH_SERVER_KEY;
    const serviceWorkerRegistration = await window.navigator.serviceWorker.getRegistration()
    try {
      // Get registration token. Initially this makes a network call, once retrieved
      // subsequent calls to getToken will return from cache.
      const token = await getToken(messaging, { 
        vapidKey,
        serviceWorkerRegistration
      });
      const message = {
        data: {
          type: "subscriptions",
          attributes: {
            token,
            settings
          },
          relationships: {
            user: {
              data: {
                id: user.id,
                type: "users",
                meta: {
                  external: true,
                  href: user.links.self
                }
              }
            },
            member: {
              data: {
                id: member.id,
                type: "members",
                meta: {
                  external: true,
                  href: member.links.self
                }
              }
            }
          }
        }
      }
      // Send token to the server.
      const response = await axios.post<ResourceResponse<NotificationsSubscription>>(
        KOptions.url.notifications + '/subscriptions', 
        message, {
          headers: {
            Accept: "application/vnd.api+json",
            "Content-Type": "application/vnd.api+json",
            Authorization: `Bearer ${accessToken}` 
          }
        });

      /**
       * Push Message handler.
       */
      onMessage(messaging, this.onMessage)

      return response.data.data

    } catch (err) {
      // The user doesn't grant the app to receive notifications.
      throw new KError(KErrorCode.NotificationsPermissionDenied, 'An error occurred while retrieving token.' + err);
    }
  }

 

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onMessage(payload: MessagePayload) : void {
    // TODO
    // console.log("Received foreground message.", payload);
  }
}