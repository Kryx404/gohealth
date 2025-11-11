# 🩺 GoHealth - E-Commerce Platform for Health Products

A modern, full-stack e-commerce platform built with Next.js 15, specializing in health and wellness products. Features comprehensive admin management, real-time order tracking, automated invoicing, and secure payment processing.

![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat&logo=supabase)
![Redux](https://img.shields.io/badge/Redux-Toolkit-purple?style=flat&logo=redux)

## ✨ Features

### 🛒 Customer Features

-   **Product Browsing** - Browse health products with detailed information and images
-   **Advanced Search** - Search products by name, category, and filters
-   **Shopping Cart** - Add/remove items with real-time quantity management
-   **User Authentication** - Secure registration and login system
-   **Order Management** - Track order status from placement to delivery
-   **Invoice Generation** - Automatic PDF invoice generation and email delivery
-   **User Profile** - View and manage personal information
-   **Address Management** - Store delivery addresses with Indonesian region support
-   **Auto-Logout** - Automatic logout after 10 minutes of inactivity

### 👨‍💼 Admin Features

-   **Dashboard Analytics** - View total products, revenue, orders, and delivered orders
-   **Product Management** - Add, edit, delete, and manage product inventory
-   **Order Management** - Update order status (Order Received → Processing → Shipped → Delivered)
-   **User Management** - View all users, toggle roles (user/admin), delete users
-   **Sales Analytics** - Area chart showing delivered orders per day
-   **Real-time Updates** - Instant reflection of changes across the platform

### 🔐 Security Features

-   **Role-Based Access Control** - Separate admin and user access
-   **Protected Routes** - Middleware protection for admin-only pages
-   **Session Management** - Cookie-based authentication with auto-expiry
-   **Password Validation** - Real-time password matching validation
-   **Activity Tracking** - Automatic logout on inactivity

### 📧 Communication Features

-   **Email Invoices** - Automated invoice delivery via email (Mailtrap/SMTP)
-   **Customer Questions** - Direct inquiry form with email notifications
-   **Order Notifications** - Toast notifications for order updates

## 🛠️ Tech Stack

### Frontend

-   **Framework:** Next.js 15.3.5 (App Router)
-   **UI Library:** React 19
-   **Styling:** Tailwind CSS 3.4.1
-   **State Management:** Redux Toolkit
-   **Icons:** Lucide React
-   **Notifications:** React Toastify, SweetAlert2
-   **Charts:** Recharts
-   **PDF Generation:** jsPDF + jspdf-autotable

### Backend

-   **Database:** PostgreSQL (via Supabase)
-   **ORM:** Prisma
-   **Authentication:** Custom JWT with cookies
-   **Email Service:** Nodemailer + Mailtrap
-   **Image Storage:** Supabase Storage

### Development Tools

-   **Package Manager:** npm
-   **Linting:** ESLint
-   **Type Checking:** JavaScript (JSDoc)

## 🔑 Key Features Implementation

### Order Flow

1. User adds products to cart
2. Selects delivery address
3. Chooses payment method (COD/Transfer)
4. Places order → Creates record in `pembelian` table
5. System generates PDF invoice
6. Invoice sent to user's email
7. Cart cleared, redirect to orders page

### Admin Order Management

1. Admin views all orders in dashboard
2. Can update order status via dropdown
3. Status progression: ORDER_RECEIVED → PROCESSING → SHIPPED → DELIVERED
4. Only DELIVERED orders count toward revenue

### Invoice Generation

-   Automatic PDF creation using jsPDF
-   Professional layout with company branding
-   Includes order details, customer info, and itemized list
-   Email delivery with Nodemailer + Mailtrap

## 🎨 UI/UX Features

-   **Responsive Design** - Works on mobile, tablet, and desktop
-   **Real-time Validation** - Password matching, form validation
-   **Toast Notifications** - User feedback for all actions
-   **Loading States** - Skeleton screens and spinners
-   **Color-coded Status** - Visual order status indicators
-   **Search & Filter** - Advanced product discovery
-   **Empty States** - Helpful messages when no data

## 🔒 Security Best Practices

-   ✅ No passwords stored in cookies/localStorage
-   ✅ Bcrypt password hashing in database
-   ✅ JWT tokens for authentication
-   ✅ Middleware route protection
-   ✅ Role-based access control
-   ✅ Input validation on all forms
-   ✅ CSRF protection via SameSite cookies
-   ✅ Automatic session timeout

## 📊 Admin Dashboard Metrics

-   **Total Products** - Count of all products in inventory
-   **Total Revenue** - Sum of DELIVERED orders only (Rupiah format)
-   **Total Orders** - All orders regardless of status
-   **Delivered Orders** - Successfully completed orders
-   **Orders/Day Chart** - Visual representation of delivered orders over time

## 🤝 Contributing

We welcome contributions from the community! Please follow these guidelines:

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards

-   Follow the existing code style
-   Write meaningful commit messages
-   Add comments for complex logic
-   Test your changes thoroughly
-   Update documentation as needed

### Reporting Issues

Found a bug? Please create an issue with:

-   Clear description of the problem
-   Steps to reproduce
-   Expected vs actual behavior
-   Screenshots if applicable

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**

-   GitHub: [@Kryx404](https://github.com/Kryx404)

## 🙏 Acknowledgments

-   Next.js team for the amazing framework
-   Supabase for the backend infrastructure
-   Vercel for hosting platform
-   Open source community for various libraries used

## 📞 Support

For support, email your-email@example.com or create an issue in the GitHub repository.

---

**Built with ❤️ using Next.js 15**
