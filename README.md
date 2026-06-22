# Pagination Assignment - CodeVector Internship Take-Home Task

## Overview

This project is a backend system that enables efficient browsing of products with fast cursor-based pagination, category filtering, and consistency guarantees during concurrent data changes. Built as a take-home assignment for the CodeVector Internship.


## Technology Stack

- **Backend:** Node.js with Express
- **Database:** PostgreSQL (hosted on RENDER)
- **ORM/Migrations:** node-pg-migrate
- **Frontend:** Vanilla HTML/JavaScript (bonus UI)
- **Hosting:** Render (backend)

## Architecture

### Database Schema

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    price INT NOT NULL CHECK (price > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

CREATE INDEX idx_products_cursor ON products(created_at DESC, id DESC);
```

### Key Design Decisions

1. **Cursor-based Pagination:** Instead of OFFSET/LIMIT, uses (created_at, id) tuple cursors for O(1) performance regardless of page depth
2. **Snapshotting:** Initial request establishes a timestamp snapshot; subsequent queries filter to `created_at <= snapshot` to prevent seeing duplicates/missing items during concurrent writes
3. **Compound Index:** Index on (created_at DESC, id DESC) optimizes the pagination query pattern
4. **Efficient Seeding:** Uses SQL's `generate_series()` for bulk insertion instead of slow row-by-row loops

## Project Structure

```
.
├── backend/
│   ├── migrations/
│   │   ├── 1782104910575_init-users-table.js    # Initial schema
│   │   └── 1782130426560_add-idx.js             # Performance index
│   ├── src/
│   │   ├── config-db.js                         # PostgreSQL connection
│   │   ├── index.js                             # Express server
│   │   ├── product-controller.js                 # Pagination logic
│   │   ├── product-route.js                     # API routes
│   │   └── seed-db.js                           # Data generation script
│   ├── .env.example
│   └── package.json
└── client/
    └── index.html                               # Simple UI (bonus)
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL database (hosted on RENDER)

### Backend Setup

1. Clone the repository
2. Navigate to backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL and CLIENT_URL
   ```
5. Run migrations:
   ```bash
   npx node-pg-migrate up
   ```
6. Seed database (generates 200,000 products):
   ```bash
   node src/seed-db.js
   ```
7. Start server:
   ```bash
   node src/index.js
   ```

### Frontend Setup

Simply open `client/index.html` in a browser, or serve it with any static file server.

## API Documentation

### GET /api/items

Retrieve paginated products with optional filtering.

**Query Parameters:**
- `limit` (optional): Items per page (max 50, default 50)
- `category` (optional): Comma-separated categories (e.g., "Electronics,Beauty")
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `snapshot` (optional): ISO timestamp for consistency (auto-set on first request)
- `cursor` (optional): JSON cursor from previous page's `nextCursor`

**Response:**
```json
{
  "data": [
    {
      "id": 200000,
      "name": "product 200000",
      "category": "Electronics",
      "price": 542,
      "created_at": "2025-01-15T10:30:45Z",
      "updated_at": "2025-01-15T10:30:45Z"
    }
  ],
  "nextCursor": {
    "created_at": "2025-01-15T10:30:44Z",
    "id": 199950
  },
  "snapshot": "2025-01-15T10:30:50Z"
}
```

**Example Requests:**
```bash
# First page, no filters
curl "https://cursor-pagination-api.onrender.com/api/items?limit=50"

# Filter by category
curl "https://cursor-pagination-api.onrender.com/api/items?category=Electronics,Computers&limit=20"

# Price range filter
curl "https://cursor-pagination-api.onrender.com/api/items?minPrice=100&maxPrice=500"

# Next page using cursor
curl "https://cursor-pagination-api.onrender.com/api/items?cursor=%7B%22created_at%22%3A%222025-01-15T10%3A30%3A44Z%22%2C%22id%22%3A199950%7D"
```

## Achievement Checklist

### Core Requirements ✅

- [x] **Backend built with Node.js and Express**
  - RESTful API with proper error handling
  - CORS enabled for frontend integration
  - Environment-based configuration

- [x] **PostgreSQL database with proper schema**
  - Products table with required fields (id, name, category, price, created_at, updated_at)
  - Data integrity constraints (NOT NULL, CHECK for positive prices)
  - Proper timestamp handling with TIMESTAMPTZ

- [x] **Efficient data seeding script**
  - Generates 200,000 products in a single SQL query using `generate_series()`
  - Random category assignment from 8 categories
  - Random price generation between 1-1000
  - Auto-generated timestamps

- [x] **Fast pagination implementation**
  - Cursor-based pagination using (created_at, id) tuple
  - O(1) query performance regardless of page depth
  - No expensive OFFSET operations
  - Compound index on (created_at DESC, id DESC)

- [x] **Category filtering**
  - Multi-category selection support
  - Efficient index-backed filtering
  - Comma-separated category parsing

- [x] **Price range filtering**
  - Min/max price filters
  - Optional parameters (can specify one or both)
  - Index-compatible queries

- [x] **Consistency during concurrent changes**
  - Snapshot-based isolation using timestamps
  - Prevents duplicate/missing items during pagination
  - `created_at <= snapshot` filter ensures stable result set
  - Cursor-based ordering prevents reordering issues

- [x] **Proper database migrations**
  - Version-controlled schema changes with node-pg-migrate
  - Up/down migration scripts
  - Performance index as separate migration

### Bonus Features ✅

- [x] **Simple UI for browsing data**
  - Clean, responsive HTML/JavaScript interface
  - Category selection with toggle buttons
  - Price range inputs
  - Previous/Next pagination controls
  - Loading states and error handling
  - Page information display
  - Protection against duplicate requests during loading

- [x] **Hosted on free platform**
  - Backend deployed on Render
  - Public URL accessible for testing

- [x] **Online database**
  - PostgreSQL hosted on free tier (Neon/Supabase compatible)

### Additional Quality ✅

- [x] **Code quality**
  - Clean, modular code structure
  - Proper separation of concerns (routes, controllers, config)
  - Environment variable configuration
  - Error handling and logging

- [x] **Performance optimizations**
  - Database indexing for pagination queries
  - Efficient bulk data generation
  - Limit enforcement (max 50 items per page)
  - Fetch one extra item to determine if more pages exist

- [x] **Security considerations**
  - Input validation (limit parsing, integer conversion)
  - SQL injection prevention (parameterized queries)
  - CORS configuration

## Design Rationale

### Why Cursor-Based Pagination?

Traditional OFFSET/LIMIT pagination becomes slow at high page numbers because the database must scan and discard all previous rows. Cursor-based pagination uses the last seen item's values as a starting point, making every query equally fast regardless of depth.

### Why Snapshot Consistency?

When data is being inserted/updated while a user browses, traditional pagination can show:
- **Duplicates:** New items inserted before the current page
- **Missing items:** Items moved to previous pages due to ordering changes

By establishing a timestamp snapshot on the first request and filtering `created_at <= snapshot`, we ensure a stable view of the data as it existed when browsing began.

### Why This Index?

The compound index on `(created_at DESC, id DESC)` perfectly matches our ORDER BY clause and WHERE conditions, allowing the database to satisfy the query entirely from the index without accessing the table data (index-only scan).

### Why SQL generate_series() for Seeding?

Row-by-row insertion in a loop would require 200,000 round-trips to the database, taking minutes or hours. Using `generate_series()` in a single INSERT statement creates all rows in one transaction, completing in seconds.

## What I'd Improve With More Time

1. **Caching Layer:** Add Redis caching for frequent category/filter combinations
2. **More Filtering Options:** Search by name, sort by price/date, additional filters
3. **Rate Limiting:** Add API rate limiting to prevent abuse
4. **Comprehensive Tests:** Unit and integration tests for all endpoints
5. **Better Error Messages:** More granular error responses with validation details
6. **Database Connection Pooling:** Tune pool settings for production load
7. **API Documentation:** OpenAPI/Swagger documentation
8. **Monitoring:** Add logging, metrics, and health check endpoints
9. **Frontend Enhancements:** Infinite scroll, keyboard navigation, better mobile UX
10. **Data Validation:** More robust input validation and sanitization

## How I Used AI

### What AI Helped With:

1. **Initial Architecture Discussion:** Explored different pagination approaches (OFFSET vs cursor vs keyset) and their trade-offs
2. **Database Indexing Strategy:** Got guidance on optimal index design for the pagination query pattern
3. **SQL Query Optimization:** Refined the cursor pagination SQL for better performance
4. **Frontend UI Structure:** Got help with the HTML/CSS layout and JavaScript state management
5. **Deployment Guidance:** Steps for deploying to Render and configuring environment variables



### Learning Process:

I used AI as a collaborator rather than a solution generator. For each major decision, I:
- Researched the problem myself first
- Discussed approaches with AI to understand trade-offs
- Implemented the solution myself
- Tested and validated the implementation
- Iterated based on actual results

This ensured I understood every line of code and could explain it during the interview round.


## Conclusion
The cursor-based pagination with snapshotting ensures users get reliable results even as the underlying data changes, while the database optimizations keep queries fast regardless of dataset size.
