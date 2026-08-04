/**
 * src/types/notifications.ts
 *
 * TypeScript definitions and contracts mirroring the Go/Gin backend structures
 * for WebPush notifications, browser VAPID subscriptions, and offline/morning sync.
 */

/**
 * Cryptographic keys returned by the browser's PushManager subscription.
 */
export interface PushSubscriptionKeysDTO {
  p256dh: string;
  auth: string;
}

/**
 * Request body for POST /public/notifications/subscribe.
 * Binds a client's push endpoint to their specific work order and security code.
 */
export interface WebPushSubscribeRequestDTO {
  workOrderId: string;        // UUID of the work order
  securityCode: string;       // WOVIK-XXXXX verification code
  endpoint: string;           // Push service provider URL (FCM, Mozilla, Apple Push)
  keys: PushSubscriptionKeysDTO;
  userAgent: string;          // Browser / OS identification string
}

/**
 * Request body for POST /public/notifications/unsubscribe.
 * Unbinds the browser endpoint from active push alerts.
 */
export interface WebPushUnsubscribeRequestDTO {
  endpoint: string;
}

/**
 * Event classification emitted by the backend notification engine.
 */
export type NotificationEventType =
  | "STATUS_CHANGE"
  | "DIAGNOSTIC_POINT"
  | "WORK_ORDER_UPDATE"
  | string;

/**
 * Response object returned inside the history array by GET /public/notifications/history.
 * Ordered chronologically by createdAt DESC.
 */
export interface NotificationHistoryResponseDTO {
  id: string;                 // Notification UUID
  title: string;              // Client-friendly pre-formatted title
  body: string;               // Debounced / consolidated notification message
  type: NotificationEventType;
  targetUrl: string;          // Target navigation URL inside the PWA
  isRead: boolean;            // Status flag for unread indicator badges
  createdAt: string;          // ISO-8601 timestamp string
}

/**
 * Response returned by POST /public/notifications/mark-read upon successful badge reset.
 */
export interface NotificationMarkReadResponseDTO {
  status: string;             // e.g. "marked_as_read"
}

/**
 * Raw data payload structure intercepted by the Service Worker (sw.js) push event.
 */
export interface ServiceWorkerPushPayloadDTO {
  title: string;
  body: string;
  targetUrl?: string;
  timestamp?: number;
}

/**
 * Lightweight local session stored in localStorage to rehydrate the PWA
 * and synchronize notification feed during morning opening without re-typing credentials.
 */
export interface ActiveWorkOrderSessionDTO {
  workOrderId: string;
  securityCode: string;
  clientDni?: number;
  clientName?: string;
  updatedAt: number;
}
