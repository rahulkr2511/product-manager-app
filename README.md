# Product Manager App

![Status](https://img.shields.io/badge/status-done-brightgreen)

A full-stack inventory/product management tool. A React (Vite) single-page
frontend talks to a Spring Boot REST backend, which persists products (name,
description, brand, price, quantity, colors, release date, availability, and
an image stored directly in the database) to an in-memory H2 database.

## What it does

- Browse all products as cards, each with an image, availability badge,
  brand, description, color chips, price (INR), quantity, and release date.
- Add a new product, including an image upload.
- Update or delete an existing product.
- Search products by name.

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18 + Vite, plain CSS |
| Backend  | Spring Boot 4 (Java 17+), Spring Web MVC, Spring Security, Spring Data JPA |
| Database | H2, in-memory (`jdbc:h2:mem:testdb`), recreated on every restart |

## Authentication

The backend uses **HTTP Basic Auth** via Spring Security:

- Public (no login required): `GET` requests under `/product-manager/products/**`
  — browsing and searching products is open.
- Protected (login required): `POST`, `PUT`, and `DELETE` under
  `/product-manager/**` — adding, updating, deleting products, and image
  upload all require an authenticated user.
- Passwords are stored BCrypt-hashed; two users are seeded at startup if the
  `users` table is empty:

  | Username | Default password |
  |----------|-------------------|
  | `admin`  | `admin123`        |
  | `user`   | `user123`         |

- **The React app has no login page.** It sends the `admin` / `admin123`
  credentials as a Basic Auth header on mutation requests from `src/api.js`.

## URLs (default local setup)

| What | URL |
|------|-----|
| Frontend (UI) | http://localhost:5173 |
| Backend API | http://localhost:8080/product-manager |
| H2 console | http://localhost:8080/h2-console |

**H2 console login:**
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: *(leave blank)*

## Running the Application

Requires **Java 17+ (or Java 21)** and **Node.js with npm** installed. The backend and frontend run as separate processes in their respective terminals.

### 1. Start the Backend (Spring Boot)

Open a terminal and run:

```bash
cd productManagerApp
./mvnw spring-boot:run