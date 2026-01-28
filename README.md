## Hotel / Restaurant Reservation System

Audience: Backend, Frontend, Product, QA  
Status: Developer-ready, no assumptions

---

# 1. SYSTEM FOUNDATIONS

## 1.1 Core Rules

1. **Time + Duration define occupancy**
2. **Tables cannot overlap reservations or holds**
3. **Preferences never block booking**
4. **Admin overrides everything**
5. **All admin actions are auditable**

---

# 2. DATABASE SCHEMA (TABLE-BY-TABLE, FIELD-BY-FIELD)

---

## 2.1 restaurants

```sql
restaurants (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  opening_time TIME NOT NULL,
  closing_time TIME NOT NULL,
  default_duration_minutes INT NOT NULL,
  buffer_minutes INT NOT NULL,
  otp_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
)
````

### Why

* Defines operating rules per outlet
* Enables accurate availability calculation

---

## 2.2 zones

```sql
zones (
  id BIGSERIAL PRIMARY KEY,
  restaurant_id BIGINT REFERENCES restaurants(id),
  name VARCHAR(50),            -- indoor, poolside
  is_active BOOLEAN DEFAULT true
)
```

### Why

* Seating preferences
* Grouping tables logically

---

## 2.3 tables

```sql
tables (
  id BIGSERIAL PRIMARY KEY,
  restaurant_id BIGINT REFERENCES restaurants(id),
  zone_id BIGINT REFERENCES zones(id),
  name VARCHAR(50),
  min_capacity INT NOT NULL,
  max_capacity INT NOT NULL,
  combinable BOOLEAN DEFAULT false,
  priority_score INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
)
```

### Why

* Capacity validation
* Auto-assignment logic
* VIP handling

---

## 2.4 table_holds

```sql
table_holds (
  id BIGSERIAL PRIMARY KEY,
  table_id BIGINT REFERENCES tables(id),
  start_datetime TIMESTAMP,
  end_datetime TIMESTAMP,
  reason VARCHAR(100),
  created_by_admin BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Why

* Maintenance
* VIP blocks
* Prevents booking

---

## 2.5 guests

```sql
guests (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100),
  phone VARCHAR(20) UNIQUE,
  email VARCHAR(100)
)
```

### Why

* Contact
* OTP
* Repeat bookings

---

## 2.6 reservations

```sql
reservations (
  id BIGSERIAL PRIMARY KEY,
  restaurant_id BIGINT REFERENCES restaurants(id),
  guest_id BIGINT REFERENCES guests(id),
  reservation_date DATE,
  start_time TIME,
  end_time TIME,
  duration_minutes INT,
  party_size INT,
  assigned_table_id BIGINT REFERENCES tables(id),
  booking_source VARCHAR(20), -- user/admin
  status VARCHAR(20),         -- pending_otp/confirmed/cancelled
  overbooked BOOLEAN DEFAULT false,
  occasion VARCHAR(100),
  special_request TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Why

* Central business object
* Lifecycle tracking
* Admin overrides

---

## 2.7 reservation_preferences

```sql
reservation_preferences (
  id BIGSERIAL PRIMARY KEY,
  reservation_id BIGINT REFERENCES reservations(id),
  zone_id BIGINT REFERENCES zones(id),
  preference_rank INT
)
```

### Why

* Store soft preferences
* Analytics (preference met vs not)

---

## 2.8 dietary_restrictions

```sql
dietary_restrictions (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50),
  description TEXT
)
```

---

## 2.9 reservation_dietary

```sql
reservation_dietary (
  id BIGSERIAL PRIMARY KEY,
  reservation_id BIGINT REFERENCES reservations(id),
  dietary_id BIGINT REFERENCES dietary_restrictions(id),
  guest_index INT
)
```

### Why

* Kitchen prep
* Per-guest tracking

---

## 2.10 otp_verifications

```sql
otp_verifications (
  id BIGSERIAL PRIMARY KEY,
  reservation_id BIGINT REFERENCES reservations(id),
  otp_code VARCHAR(6),
  expires_at TIMESTAMP,
  verified_at TIMESTAMP
)
```

---

## 2.11 payments

```sql
payments (
  id BIGSERIAL PRIMARY KEY,
  reservation_id BIGINT REFERENCES reservations(id),
  amount DECIMAL(10,2),
  payment_type VARCHAR(20),
  status VARCHAR(20),
  provider VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## 2.12 audit_logs

```sql
audit_logs (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(50),
  entity_id BIGINT,
  action VARCHAR(50),
  old_value JSONB,
  new_value JSONB,
  admin_id BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

# 3. API CONTRACTS (WITH SQL & EDGE CASES)

---

## 3.1 Check Availability

### API

```
POST /api/availability
```

### Request

```json
{
  "restaurant_id": 1,
  "date": "2025-12-18",
  "start_time": "19:30",
  "duration_minutes": 120,
  "party_size": 4,
  "preferred_zones": ["indoor","poolside"]
}
```

### SQL

```sql
SELECT t.*
FROM tables t
JOIN zones z ON z.id=t.zone_id
WHERE t.is_active=true
AND t.min_capacity<=:party_size
AND t.max_capacity>=:party_size
AND z.name IN (:preferred_zones)
AND t.id NOT IN (
  SELECT assigned_table_id
  FROM reservations
  WHERE reservation_date=:date
  AND status IN ('confirmed','pending_otp')
  AND start_time < :end_time
  AND end_time > :start_time
)
AND t.id NOT IN (
  SELECT table_id
  FROM table_holds
  WHERE start_datetime < :end_datetime
  AND end_datetime > :start_datetime
);
```

### Response (Available)

```json
{
  "status": "available",
  "options": [
    {
      "zone": "indoor",
      "table_id": 12,
      "confidence": "high"
    }
  ]
}
```

### Edge Cases

* No table → suggest alternate time
* Admin call → allow overbook flag

---

## 3.2 Create Reservation

```
POST /api/reservations
```

### Request

```json
{
  "booking_source": "user",
  "date": "2025-12-18",
  "start_time": "19:30",
  "duration_minutes": 120,
  "party_size": 4,
  "preferred_zones": ["indoor"],
  "guest": {
    "name": "John",
    "phone": "+44xxx",
    "email": "john@test.com"
  }
}
```

### SQL

```sql
-- guest
INSERT INTO guests (...) RETURNING id;

-- reservation
INSERT INTO reservations (...) RETURNING id;

-- preferences
INSERT INTO reservation_preferences (...);
```

### Response

```json
{
  "reservation_id": 991,
  "status": "pending_otp"
}
```

---

## 3.3 OTP Verify

```
POST /api/reservations/{id}/otp/verify
```

### SQL

```sql
UPDATE otp_verifications
SET verified_at=NOW()
WHERE reservation_id=:id
AND otp_code=:otp
AND expires_at>NOW();

UPDATE reservations
SET status='confirmed'
WHERE id=:id;
```

---

## 3.4 Admin Override Reservation

```
PATCH /api/admin/reservations/{id}
```

### Request

```json
{
  "start_time": "20:00",
  "duration_minutes": 90,
  "assigned_table_id": 15,
  "override_reason": "Guest request"
}
```

### SQL

```sql
UPDATE reservations SET ... WHERE id=:id;
INSERT INTO audit_logs (...);
```

---

## 3.5 Cancel Reservation

```
POST /api/admin/reservations/{id}/cancel
```

```sql
UPDATE reservations SET status='cancelled' WHERE id=:id;
```

---

## 3.6 Hold Table

```
POST /api/admin/table-holds
```

```sql
INSERT INTO table_holds (...);
```

---

# 4. UI FLOWS (USER & ADMIN)

---

## 4.1 USER FLOW

### Screen 1

Inputs → Date, Time, Guests, Duration
API → `/availability`

### Screen 2

Inputs → Preferences
(No API)

### Screen 3

Inputs → Guest details
API → `/reservations`

### Screen 4

OTP
API → `/otp/verify`

### Screen 5

Payment (optional)

---

## 4.2 ADMIN FLOW (CALL / WALK-IN)

### Screen 1

Inputs → Date, Time, Guests
API → `/admin/availability`

### Screen 2

Select option
(No API)

### Screen 3

Guest details
API → `/reservations (admin)`

### Screen 4

Actions
Edit / Cancel / Hold

---

# 5. EDGE CASE MATRIX

| Case             | Handling             |
| ---------------- | -------------------- |
| Duration changed | Recheck availability |
| Table hold       | Block                |
| Admin force      | Allow + audit        |
| OTP expiry       | Auto cancel          |
| Overbooking      | Flag reservation     |

---

# 6. BUILD ORDER

1. Database
2. Availability engine
3. Reservation APIs
4. Admin overrides
5. Holds
6. OTP
7. Payments

---
