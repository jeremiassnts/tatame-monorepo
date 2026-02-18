# Server API Endpoints

Reference for migrating the frontend from Supabase to the backend REST API.

- **Base URL:** `/api`
- **Auth:** All routes (except **Webhooks**, **Versions**, and **App Stores**) require a Clerk JWT in the `Authorization` header:  
  `Authorization: Bearer <clerk_jwt_token>`
- **Content-Type:** `application/json` for JSON bodies.

---

## Users — `/api/users`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/users` | Create a user. Body: `clerkUserId`, `role`, `email`, `firstName`, `lastName`, `profilePicture?`. |
| `GET` | `/api/users/:userId` | Get user by numeric ID. |
| `GET` | `/api/users/clerk/:clerkUserId` | Get user by Clerk user ID. |
| `PUT` | `/api/users/:userId` | Update user. Body: `first_name?`, `last_name?`, `email?`, `phone?`, `birth_day?`, `profile_picture?`, `gym_id?`, `role?`. |
| `PATCH` | `/api/users/:userId/expo-push-token` | Update user Expo push token. Body: `expoPushToken`. |
| `GET` | `/api/users/:userId/notification-recipients` | Resolve notification recipients (returns push tokens). Query: `recipientIds` (array of user IDs). |
| `DELETE` | `/api/users/:userId` | Delete user by ID. |
| `POST` | `/api/users/clerk/:clerkUserId/profile-image` | Upload profile image (multipart/form-data, field `file`). |
| `GET` | `/api/users/gym/:gymId/students` | List students for a gym. |
| `GET` | `/api/users/gym/:gymId/instructors` | List instructors for a gym. |
| `GET` | `/api/users/birthdays/today` | List users with birthday today. |
| `POST` | `/api/users/approve` | Approve a student. Body: `userId`. |
| `POST` | `/api/users/deny` | Deny a student. Body: `userId`. |
| `GET` | `/api/users/:userId/approval-status` | Get student approval status (`isApproved`). |

---

## Gyms — `/api/gyms`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/gyms` | Create a gym. Body: `name`, `address?`, `since?`, `logo?`, and `userId` (manager). |
| `GET` | `/api/gyms` | List all gyms. |
| `GET` | `/api/gyms/user/:userId` | Get gym by manager/user ID. |
| `POST` | `/api/gyms/associate` | Associate a gym to a user. Body: `gymId`, `userId`. |

---

## Class — `/api/class`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/class` | Create a class. Body: `gym_id`, `instructor_id`, `created_by?`, `day`, `start`, `end`, `description?`. |
| `GET` | `/api/class/:classId` | Get class by ID. |
| `GET` | `/api/class/gym/:gymId` | List classes for a gym. |
| `GET` | `/api/class/next/:gymId` | Get next class for a gym. |
| `GET` | `/api/class/check-in/available` | Get class available for check-in. Query: `gymId`, `time`, `day`. |
| `PUT` | `/api/class/:classId` | Update a class. |
| `DELETE` | `/api/class/:classId` | Delete a class. |

---

## Check-ins — `/api/checkins`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/checkins` | Create a check-in. Body: `userId`, `classId`, `date?` (ISO string). |
| `DELETE` | `/api/checkins/:checkinId` | Delete a check-in. |
| `GET` | `/api/checkins/user/:userId` | List check-ins by user. |
| `GET` | `/api/checkins/user/:userId/last` | List last check-ins by user. |
| `GET` | `/api/checkins/user/:userId/last-month` | List last month check-ins by user. |
| `GET` | `/api/checkins/class/:classId` | List check-ins by class. |
| `GET` | `/api/checkins/class/:classId/user/:userId` | List check-ins by class and user. |

---

## Assets — `/api/assets`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/assets/videos` | List all assets of type `video` (newest first). |
| `POST` | `/api/assets` | Create an asset (linked to a class). Body: `class_id?`, `title?`, `content?`, `type?`, `valid_until?` (ISO string). |
| `DELETE` | `/api/assets/:assetId` | Delete an asset by ID. |

---

## Notifications — `/api/notifications`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/notifications` | Create a notification. Body: `title`, `content`, `recipients`, `channel`, `sent_by`, `status?`, `viewed_by?`. |
| `GET` | `/api/notifications/user/:userId` | List notifications by user. |
| `GET` | `/api/notifications/user/:userId/unread` | List unread notifications by user. |
| `PUT` | `/api/notifications/:notificationId` | Update a notification. |
| `POST` | `/api/notifications/:notificationId/resend` | Resend a notification. |
| `POST` | `/api/notifications/:notificationId/view` | Mark as viewed. Body: `userId`. |

---

## Graduations — `/api/graduations`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/graduations/user/:userId` | Get graduation by user ID. |
| `POST` | `/api/graduations` | Create a graduation. Body: `userId`, `belt`, `degree`, `modality`. |
| `PUT` | `/api/graduations/:graduationId` | Update a graduation. |

---

## Versions — `/api/versions` (no auth)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/versions` | Get current app version (public, no auth). |

---

## App Stores — `/api/app-stores` (no auth)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/app-stores` | List app store entries (e.g. iOS/Android links). Returns only non-disabled entries. Public, no auth. |

---

## Attachments — `/api/attachments`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/attachments/image` | Upload an image. Multipart/form-data, field `file`. Allowed: png, jpg, jpeg. |

---

## Stripe — `/api/stripe`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/stripe/products` | List Stripe products. Query: `active?`, `limit?`. |
| `POST` | `/api/stripe/customers` | Create Stripe customer. Body: `email`, `name`, `userId?`, `metadata?`. |
| `POST` | `/api/stripe/subscriptions` | Create subscription. Body: `customerId`, `priceId`, `userId`. |
| `GET` | `/api/stripe/subscriptions/:subscriptionId` | Get subscription by ID. |
| `GET` | `/api/stripe/subscriptions/customer/:customerId` | Get subscription by customer ID. |
| `DELETE` | `/api/stripe/subscriptions/:subscriptionId` | Cancel subscription. |
| `POST` | `/api/stripe/payment-intents` | Create payment intent. Body: `amount`, `currency`, `customerId`. |
| `POST` | `/api/stripe/setup-intents` | Create setup intent. Body: `customerId`. |
| `POST` | `/api/stripe/ephemeral-keys` | Create ephemeral key. Body: `customerId`. |

---

## Webhooks — `/api/webhooks` (no Clerk auth)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/webhooks/stripe` | Stripe webhook. Handles subscription and invoice events. **Not protected by Clerk.** |

---

## Response shapes (typical)

- **Single resource:** `{ data: T }`
- **List:** `{ data: T[], count: number }`
- **Create:** `{ data: T, created: true }` (often 201)
- **Success:** `{ success: true, message: string }`
- **Error:** `{ error: string }` (4xx/5xx)

Replace Supabase client calls (e.g. `supabase.from('users').select()`) with `fetch` or your HTTP client to these endpoints, sending the Clerk JWT in `Authorization: Bearer <token>`.
