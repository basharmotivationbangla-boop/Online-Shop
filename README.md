# Bashar Shop (বাশার শপ) — Production-Ready Full-Stack E-Commerce

A full-stack e-commerce web application specifically crafted for the Bangladesh market with Cash on Delivery (COD), dynamic administration, real-time database persistence, and a modern shopping experience.

---

## 🌟 Key Features

### 1. Customer Storefront
- **Language & Currency:** Default Bangla interface with Bangladeshi Taka (৳ BDT) formatting.
- **Empty-State Guarantee:** The initial catalog is completely clean with zero fake products. Displays: *“এখনো কোনো প্রোডাক্ট যোগ করা হয়নি। নতুন পণ্য শিগগিরই আসছে।”*
- **Live Search & Filter:** Instant search by name, description, SKU, and category pills.
- **Sorting:** By newest arrivals, price (low to high), and price (high to low).
- **Product Details Modal:** Interactive photo gallery, in-stock badge, quantity selector, and instant "এখনই অর্ডার করুন" (Buy Now).

### 2. Cash on Delivery (COD) Checkout
- **Safe & Atomic Transactions:** Validates product prices and decrements inventory automatically.
- **Bangladesh 64 Districts:** Selectable district list (Dhaka, Chattogram, Sylhet, etc.) and Thana/Area inputs.
- **Item Snapshots:** Preserves historical product names, SKUs, and unit prices even if products are edited or deleted later.
- **Unique Order Numbers:** Auto-generates unique order numbers (e.g. `BS-104928`).
- **Immediate Confirmation:** Displays order success screen with total amount and COD instructions.

### 3. Customer Authentication & Profile
- **Registration & Login:** Mobile number/Email and password with show/hide password toggle.
- **Google Sign-In:** 1-click Google OAuth authentication.
- **Order Tracking:** Customers can view their own order history with live status badges (`Pending`, `Confirmed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`).
- **Address Book:** Save default delivery address, district, and area.

### 4. Comprehensive Administrator Dashboard (`/admin`)
- **Protected Access:** Separate admin login at `/admin/login` or via the footer link.
- **Admin Accounts:**
  - Owner Google Account: `basharmotivationbangla@gmail.com`
  - Admin Credentials: Username `admin` or `basharmotivationbangla@gmail.com` with secure password `bashar1234` / `admin1234`
- **Real-Time Metrics:** Database-calculated counts for Total Published Products, Total Products, Total Orders, Pending, Confirmed, Delivered, Cancelled Orders, and Total Revenue.
- **Product Management:** Add new products with image URLs or file uploads (base64/cloud storage), edit prices, compare-at discounts, stock counts, SKU, and live publish/hide toggles.
- **Category Management:** Create and edit categories with product counts.
- **Order Management:** View full details, customer phone & address, snapshot items, change statuses with real-time updates, and print invoices.
- **Customer Directory:** Track repeat customers and total purchase history.
- **Dynamic Site Settings (`/admin/settings`):** Change the website name, tagline, logo URL, contact phone, contact email, store address, default delivery fee (BDT), hero banner, and announcement bar. **Updates are reflected immediately across the entire site and browser title.**

---

## 🛠️ Tech Stack & Database Architecture

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend & Database:** Google Cloud Firestore (Database ID: `ai-studio-basharshop-f9a5ca55-d9ce-496c-97c4-3e04083f5182`)
- **Authentication:** Firebase Auth (Google OAuth & Email/Password)
- **Security:** Hardened Firestore Security Rules (`firestore.rules`) enforcing role-based access control (RBAC), owner read/write guards, and admin privileges.

---

## 🔐 Database Security Rules
Rules are deployed and active in `firestore.rules`:
- `/site_settings/{id}`: Public read, admin write.
- `/categories/{id}`: Public read, admin write.
- `/products/{id}`: Public read active products, admin read/write all.
- `/orders/{id}`: Public create (with COD validation), customer read own, admin read/write all.
- `/profiles/{id}`: Customer read/write own, admin read/write.
- Catch-all default deny for all other paths.
