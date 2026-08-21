# Product Manager App

![Status](https://img.shields.io/badge/status-done-brightgreen)

A full-stack inventory/product management tool. A React (Vite) single-page
frontend talks to a Spring Boot REST backend, which persists products (name,
description, brand, price, quantity, colors, release date, availability, and
an image stored directly in the database) to an in-memory H2 database. The
backend publishes Kafka events on product creation, caches read-heavy
endpoints in Redis, and rate-limits incoming requests.

## What it does

- Browse all products as cards, each with an image, availability badge,
  brand, description, color chips, price (INR), quantity, and release date.
- Add a new product, including an image upload — publishes a Kafka event on
  successful creation.
- Update or delete an existing product — invalidates the relevant Redis
  cache entries.
- Search products by name.
- Get all products / get a product by ID — served from Redis cache on
  repeat reads.

## Stack

| Layer      | Tech |
|------------|------|
| Frontend   | React 18 + Vite, plain CSS |
| Backend    | Spring Boot 4 (Java 17+), Spring Web MVC, Spring Security, Spring Data JPA |
| Database   | H2, in-memory (`jdbc:h2:mem:testdb`), recreated on every restart |
| Messaging  | Apache Kafka — product-create events |
| Caching    | Redis — cached reads for `getAll` and `getById` |
| Resiliency | Custom rate limiter on incoming requests |

## Kafka — product create events

- On every successful product creation, the backend publishes a message to
  a Kafka topic so downstream consumers can react to new products without
  polling the database.
- This decouples "a product was created" from anything that needs to know
  about it (notifications, search indexing, analytics, etc.) — the producer
  just fires the event and moves on.

## Redis caching

- **`getAll` and `getById`** are cached in Redis, so repeat reads are served
  from cache instead of hitting H2 on every request.
- **`update` and `delete`** evict (or replace) the corresponding cache
  entries so the cache never serves stale product data after a write.
- This follows a standard cache-aside pattern: read through the cache,
  write through the database, and invalidate on mutation.

## Rate limiting

- Incoming requests are rate-limited to a **capacity of 5 requests, refilled
  at a rate of 5 per 30 seconds** — protecting the API from bursts and
  giving predictable throughput under load.
- Requests beyond the limit are rejected until the window allows more
  capacity, rather than queuing or silently dropping them.

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

Requires **Java 17+ (or Java 21)**, **Node.js with npm**, a running **Redis**
instance, and a running **Kafka** broker. The backend and frontend run as
separate processes in their respective terminals.

### 1. Start the Backend (Spring Boot)

Open a terminal and run:

```bash
cd productManagerApp
./mvnw spring-boot:run
```