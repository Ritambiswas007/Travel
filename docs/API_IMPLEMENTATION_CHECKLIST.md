# API implementation checklist (Postman → React / Next.js)

All endpoints from `Travel-Pilgrimage-API.postman_collection.json` are implemented as follows.

---

## Health
| Endpoint | Admin (React) | User (Next.js) |
|----------|----------------|----------------|
| GET /health | ✅ healthApi.check | ✅ healthApi.check |

## Auth
| Endpoint | Admin | User |
|----------|--------|------|
| POST /auth/register | — | ✅ authApi.register |
| POST /auth/login/email | ✅ authApi.login | ✅ authApi.login |
| POST /auth/login/phone | — | ✅ authApi.loginPhone |
| POST /auth/send-otp | — | ✅ authApi.sendOtp |
| POST /auth/refresh | ✅ authApi.refresh | ✅ authApi.refresh |
| POST /auth/logout | ✅ authApi.logout | ✅ authApi.logout |
| POST /auth/forgot-password | — | ✅ authApi.forgotPassword |
| POST /auth/reset-password | — | ✅ authApi.resetPassword |
| POST /auth/logout-all | — | ✅ authApi.logoutAll |

## Users
| Endpoint | Admin | User |
|----------|--------|------|
| GET /users/me | — | ✅ usersApi.getMe |
| PATCH /users/me | — | ✅ usersApi.updateMe (name, email, phone) |
| GET /users/admin/users | ✅ usersApi.list | — |

## Packages
| Endpoint | Admin | User |
|----------|--------|------|
| GET /packages | ✅ list (items, total, search, isFeatured, cityId, isActive) | ✅ list (same) |
| GET /packages/slug/:slug | ✅ getBySlug | ✅ getBySlug |
| GET /packages/:id | ✅ getById | ✅ getById |
| POST /packages | ✅ create | — |
| PATCH /packages/:id | ✅ update | — |
| DELETE /packages/:id | ✅ delete | — |
| POST /packages/:id/variants | ✅ addVariant | — |
| POST /packages/:id/itineraries | ✅ addItinerary | — |
| POST /packages/:id/schedules | ✅ addSchedule | — |

## Cities
| Endpoint | Admin | User |
|----------|--------|------|
| GET /cities | ✅ list | ✅ list |
| GET /cities/slug/:slug | ✅ getBySlug | ✅ getBySlug |
| GET /cities/:id | ✅ getById | ✅ getById |
| POST /cities | ✅ create | — |
| PATCH /cities/:id | ✅ update | — |
| DELETE /cities/:id | ✅ delete | — |

## Staff
| Endpoint | Admin | User |
|----------|--------|------|
| POST /staff | ✅ create | — |
| GET /staff | ✅ list | — |
| GET /staff/:id | ✅ getById | — |
| PATCH /staff/:id | ✅ update | — |

## Coupons
| Endpoint | Admin | User |
|----------|--------|------|
| POST /coupons | ✅ create | — |
| GET /coupons | ✅ list | — |
| GET /coupons/:id | ✅ getById | — |
| PATCH /coupons/:id | ✅ update | — |

## Banners
| Endpoint | Admin | User |
|----------|--------|------|
| GET /banners | ✅ listActive | ✅ listActive |
| GET /banners/admin | ✅ listAll | — |
| GET /banners/:id | ✅ getById | — |
| POST /banners | ✅ create | — |
| PATCH /banners/:id | ✅ update | — |
| DELETE /banners/:id | ✅ delete | — |

## Reviews
| Endpoint | Admin | User |
|----------|--------|------|
| GET /reviews | ✅ list (packageId) | ✅ reviewsUserApi.list |
| POST /reviews | — | ✅ create |
| GET /reviews/:id | ✅ getById | ✅ getById |
| PATCH /reviews/:id | — | ✅ update |

## Support
| Endpoint | Admin | User |
|----------|--------|------|
| POST /support | — | ✅ create |
| GET /support | ✅ list | ✅ listMy |
| GET /support/:id | ✅ getById | ✅ getById |
| POST /support/:id/reply | ✅ reply | ✅ reply |
| POST /support/:id/close | ✅ close | — (can add if API allows user) |

## Reports
| Endpoint | Admin | User |
|----------|--------|------|
| POST /reports | ✅ create | — |
| GET /reports | ✅ list | — |
| GET /reports/bookings | ✅ bookings | — |
| GET /reports/revenue | ✅ revenue | — |
| GET /reports/:id | ✅ getById | — |

## Bookings
| Endpoint | Admin | User |
|----------|--------|------|
| POST /bookings | — | ✅ create |
| GET /bookings/my | — | ✅ listMy (data.items) |
| GET /bookings/admin | ✅ listAll (data.items) | — |
| GET /bookings/:id | ✅ getById | ✅ getById |
| PATCH /bookings/:id/step | ✅ updateStep | — |
| POST /bookings/:id/apply-coupon | ✅ applyCoupon | ✅ applyCoupon |
| POST /bookings/:id/confirm | ✅ confirm | ✅ confirm |
| POST /bookings/:id/cancel | ✅ cancel | ✅ cancel |

## Payments
| Endpoint | Admin | User |
|----------|--------|------|
| POST /payments/orders | — | ✅ createOrder |
| GET /payments/booking/:id | ✅ getByBooking | ✅ getByBooking |
| GET /payments/:id | ✅ getById | ✅ getById |
| POST /payments/refunds | ✅ initiateRefund | — |

## Transport
| Endpoint | Admin | User |
|----------|--------|------|
| POST /transport/flight | ✅ addFlight | — |
| POST /transport/train | ✅ addTrain | — |
| POST /transport/bus | ✅ addBus | — |

## Visa
| Endpoint | Admin | User |
|----------|--------|------|
| POST /visa | — | ✅ create |
| GET /visa/my | — | ✅ listMy |
| GET /visa/:id | — | ✅ getById |
| PATCH /visa/:id | — | ✅ update |
| POST /visa/:id/submit | — | ✅ submit |
| POST /visa/:id/documents | — | ✅ addDocument |

## Documents
| Endpoint | Admin | User |
|----------|--------|------|
| GET /documents/types | ✅ listTypes | ✅ listTypes |
| GET /documents/my | — | ✅ listMy |
| POST /documents/upload | — | ✅ upload (FormData) |
| GET /documents/checklist/pdf | — | ✅ checklistPdf |
| GET /documents/:id | — | ✅ getById (documentsUserApi) |
| POST /documents/types | ✅ createType | — |
| GET /documents/types/:id | ✅ getTypeById | — |
| PATCH /documents/:id/status | ✅ updateDocumentStatus | — |

## Forms
| Endpoint | Admin | User |
|----------|--------|------|
| GET /forms/code/:code | ✅ getByCode | ✅ getByCode |
| POST /forms/:id/submit | — | ✅ submit |
| POST /forms | ✅ create | — |
| GET /forms | ✅ list | — |
| GET /forms/:id | ✅ getById | — |
| POST /forms/:id/fields | ✅ addField | — |

## Notifications
| Endpoint | Admin | User |
|----------|--------|------|
| GET /notifications | — | ✅ listMy |
| POST /notifications/mark-read/:id | — | ✅ markRead |
| POST /notifications/send | ✅ send | — |

## Leads
| Endpoint | Admin | User |
|----------|--------|------|
| POST /leads | — | ✅ create (public) |
| GET /leads | ✅ list | — |
| GET /leads/:id | ✅ getById | — |
| PATCH /leads/:id | ✅ update | — |
| POST /leads/:id/assign | ✅ assign | — |

## AI (optional)
| Endpoint | Admin | User |
|----------|--------|------|
| POST /ai/recommendations | — | (add to user if needed) |
| POST /ai/faq | — | (add to user if needed) |
| POST /ai/booking-assistant | — | (add to user if needed) |

---

## Response shapes (backend)

- **List responses** use `{ items, total }` (packages, bookings admin, bookings my, reviews). Admin and user apps use `data.items` and `data.total`.
- **Single resource** responses use `{ success, data: <resource> }`.
