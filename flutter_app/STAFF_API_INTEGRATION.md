# Staff API Integration - Complete Guide

## ✅ All Staff APIs Integrated

### Service Classes Created

1. **BookingService** (`lib/core/services/booking_service.dart`)
   - `getAllBookings()` - List all bookings (STAFF)
   - `getBookingById()` - Get booking details
   - `confirmBooking()` - Confirm booking
   - `cancelBooking()` - Cancel booking
   - `updateBookingStep()` - Update booking step

2. **LeadService** (`lib/core/services/lead_service.dart`)
   - `listLeads()` - List all leads (STAFF)
   - `getLeadById()` - Get lead details
   - `updateLead()` - Update lead status/score
   - `assignLead()` - Assign lead to staff

3. **ReportService** (`lib/core/services/report_service.dart`)
   - `createReport()` - Create report (STAFF)
   - `listReports()` - List reports (STAFF)
   - `getBookingsReport()` - Get bookings report (STAFF)
   - `getRevenueReport()` - Get revenue report (STAFF)
   - `getReportById()` - Get report by ID (STAFF)

4. **SupportService** (`lib/core/services/support_service.dart`)
   - `listTickets()` - List all tickets (STAFF)
   - `getTicketById()` - Get ticket details
   - `replyToTicket()` - Reply to ticket (STAFF)
   - `closeTicket()` - Close ticket (STAFF)

5. **PaymentService** (`lib/core/services/payment_service.dart`)
   - `getPaymentByBooking()` - Get payment by booking ID
   - `getPaymentById()` - Get payment by ID
   - `initiateRefund()` - Initiate refund (STAFF)

6. **TransportService** (`lib/core/services/transport_service.dart`)
   - `addFlight()` - Add flight booking (STAFF)
   - `addTrain()` - Add train booking (STAFF)
   - `addBus()` - Add bus booking (STAFF)

7. **DocumentService** (`lib/core/services/document_service.dart`)
   - `listDocumentTypes()` - List document types (public)
   - `getDocumentTypeById()` - Get document type (STAFF)
   - `createDocumentType()` - Create document type (STAFF)
   - `getDocumentById()` - Get document (USER/STAFF)
   - `updateDocumentStatus()` - Update document status (STAFF)

8. **FormService** (`lib/core/services/form_service.dart`)
   - `listForms()` - List forms (STAFF)
   - `getFormById()` - Get form by ID (STAFF)
   - `createForm()` - Create form (STAFF)
   - `addFieldToForm()` - Add field to form (STAFF)

9. **NotificationService** (`lib/core/services/notification_service.dart`)
   - `listMyNotifications()` - List notifications (USER/STAFF)
   - `markAsRead()` - Mark notification as read
   - `sendNotification()` - Send notification (STAFF)

10. **UserService** (`lib/core/services/user_service.dart`)
    - `getMyProfile()` - Get my profile
    - `updateMyProfile()` - Update my profile

## 📱 UI Screens Created

### Main Navigation (Bottom Nav)
1. **Dashboard** (`lib/screens/home/home_screen.dart`)
   - Overview metrics (bookings, leads, revenue)
   - Quick action cards
   - Pull-to-refresh

2. **Bookings** (`lib/screens/bookings/bookings_screen.dart`)
   - List all bookings with filters
   - Search functionality
   - Status filtering
   - Navigate to booking details

3. **Leads** (`lib/screens/leads/leads_screen.dart`)
   - List all leads with filters
   - Search functionality
   - Status filtering
   - Navigate to lead details

4. **Reports** (`lib/screens/reports/reports_screen.dart`)
   - Date range selector
   - Revenue report display
   - Bookings report display
   - Key metrics cards

5. **Profile** (`lib/screens/profile/profile_screen.dart`)
   - View/edit staff profile
   - Access to additional features:
     - Support Tickets
     - Documents
     - Forms
     - Notifications
   - Logout

### Detail Screens
1. **Booking Detail** (`lib/screens/bookings/booking_detail_screen.dart`)
   - View booking information
   - View payment information
   - Confirm/Cancel booking actions

2. **Lead Detail** (`lib/screens/leads/lead_detail_screen.dart`)
   - View lead information
   - Edit status and score
   - Update lead details

3. **Support Detail** (`lib/screens/support/support_detail_screen.dart`)
   - View ticket details
   - View message history
   - Reply to ticket
   - Close ticket

### Additional Screens (Accessible from Profile)
1. **Support Tickets** (`lib/screens/support/support_screen.dart`)
   - List all support tickets
   - Filter by status
   - Navigate to ticket details

2. **Documents** (`lib/screens/documents/documents_screen.dart`)
   - List document types
   - View document type details
   - Create document type (placeholder)

3. **Forms** (`lib/screens/forms/forms_screen.dart`)
   - List forms
   - View form details
   - Create form (placeholder)

4. **Notifications** (`lib/screens/notifications/notifications_screen.dart`)
   - List notifications
   - Mark as read
   - Send notification (placeholder)

## 🛣️ Routes Configured

All routes are configured in `lib/app_router.dart`:
- `/login` - Staff login
- `/` - Main navigation shell (dashboard)
- `/booking/:id` - Booking detail
- `/lead/:id` - Lead detail
- `/support/:id` - Support ticket detail
- `/support-list` - Support tickets list
- `/documents` - Documents management
- `/forms` - Forms management
- `/notifications` - Notifications

## 🔐 Authentication

- Only STAFF and ADMIN roles can log in
- Role validation on login
- Role check in route redirect
- Secure token storage using `flutter_secure_storage`

## 📋 Features Implemented

### Bookings Management
- ✅ List all bookings (with pagination)
- ✅ Filter by status
- ✅ Search bookings
- ✅ View booking details
- ✅ Confirm booking
- ✅ Cancel booking
- ✅ View payment information

### Leads Management
- ✅ List all leads (with pagination)
- ✅ Filter by status
- ✅ Search leads
- ✅ View lead details
- ✅ Update lead status
- ✅ Update lead score
- ✅ Assign lead to staff (API ready, UI placeholder)

### Reports
- ✅ Date range selection
- ✅ Bookings report
- ✅ Revenue report
- ✅ Key metrics display

### Support Tickets
- ✅ List all tickets
- ✅ Filter by status
- ✅ View ticket details
- ✅ Reply to ticket
- ✅ Close ticket
- ✅ View message history

### Profile
- ✅ View profile information
- ✅ Edit profile (name, email, phone)
- ✅ Access to additional features
- ✅ Logout

### Additional Features
- ✅ Document types listing
- ✅ Forms listing
- ✅ Notifications listing and marking as read

## 🎨 UI/UX Features

- Modern, clean design
- Status color coding
- Pull-to-refresh on list screens
- Loading states
- Error handling with SnackBars
- Confirmation dialogs for destructive actions
- Search functionality
- Filter chips for status filtering
- Responsive layouts

## 📝 Notes

- Some features have placeholder UI (create document type, create form, send notification, assign lead)
- These can be implemented later with proper dialogs/forms
- All API endpoints are integrated and ready to use
- Error handling is implemented throughout
- The app is fully functional for staff operations

## 🚀 Next Steps (Optional Enhancements)

1. Add create/edit dialogs for:
   - Document types
   - Forms
   - Send notifications
   - Assign leads

2. Add transport booking management UI
3. Add document status update UI
4. Add form field management UI
5. Add pagination controls for lists
6. Add export functionality for reports
