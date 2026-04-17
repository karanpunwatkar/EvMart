# EVMart — E-Commerce Platform for Electric Vehicles

## Original Problem Statement
Student seminar project by Yash Mahatale, Sudanshu Zade, Mayur Kawale (B.Com Computer Applications, GH Raisoni College of Engineering and Management, Session 2025–2026). Guide: Mrs. Bhagyashree Ambulkar. Co-Guide: Mrs. Rekha Israni. Build a basic but impressive e-commerce website for electric scooters (4-5 products) with add-to-cart, that's easy for the student to explain to the teacher.

## Architecture
- **Backend**: FastAPI + MongoDB (Motor) + JWT (PyJWT) + bcrypt — single `server.py`
- **Frontend**: React 19 + React Router 7 + Tailwind + Shadcn UI + Lucide icons + Sonner toasts
- **Fonts**: Outfit (display), IBM Plex Sans (body), JetBrains Mono
- **Theme**: Organic & Earthy (light) with emerald green primary (#166534) and amber accents

## User Personas
1. **Customer** — browses scooters, adds to cart, registers/logs in, places order (mock checkout)
2. **Admin** — seeded as `admin@evmart.com / admin123`, manages products + views all orders
3. **Teacher/Reviewer** — inspects full credits in footer, clear project flow for explanation

## Core Requirements (from PPT)
- Online e-commerce platform for EVs (MERN-style, here FastAPI replaces Node/Express)
- Detailed vehicle info: price, battery capacity, driving range, charging time, motor
- User-friendly, responsive UI
- Secure backend for users/products/orders
- Admin CRUD for EV listings
- Promote sustainable transportation

## What's been implemented (2026-02)
- ✅ 5 seeded EV scooters (Aero EV1, Velocity X, EcoRider Pro, City Glide, Urban Bolt)
- ✅ JWT auth (register / login / me) with localStorage Bearer token
- ✅ Products CRUD (public read, admin-only write) with admin seed on startup
- ✅ Orders (authenticated create, user history, admin list-all)
- ✅ Pages: Home (hero + features + product grid + sustainability + CTA), Products, ProductDetail, Cart, Checkout, OrderSuccess, Login, Register, Admin (Products + Orders tabs)
- ✅ Cart stored in localStorage (works even before login)
- ✅ Mock checkout flow with address form + 4 payment method options
- ✅ Footer with full project credits (students, guide, co-guide, institution, session)
- ✅ 21/21 backend API tests pass · All frontend flows tested successfully

## Backlog (deferred P1/P2)
- P1: Product gallery (multiple images per scooter)
- P1: User order history page (`/my-orders`)
- P1: Wishlist / compare scooters side-by-side
- P2: Real payment gateway (Stripe / Razorpay)
- P2: Email confirmation on order (Resend / SendGrid)
- P2: Product reviews & ratings
- P2: Charging-station locator
- P2: Admin dashboard with revenue/order charts

## Next Tasks (if user asks for more)
1. Add user's "My Orders" page so the customer flow is round-tripped
2. Add basic hero search (search from landing page)
3. Optional: Razorpay integration to convert mock checkout to real payment
