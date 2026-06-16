# Phase 11: Testing Document
## 100 Detailed Test Cases for System Verification

This document compiles the verification plan and lists **100 test cases** covering the frontend, backend, database, AI prompts, security protocols, and performance metrics.

---

### Test Cases Matrix

| Test ID | Category | Description | Input | Expected Output | Status |
| --- | --- | --- | --- | --- | --- |
| **TC-01** | Unit (Valid) | Customer name regex validator | `"Ravi Kumar"` | Returns `true` (valid) | Pass |
| **TC-02** | Unit (Invalid)| Customer name with numbers | `"Ravi 123"` | Returns `false` (invalid) | Pass |
| **TC-03** | Unit (Invalid)| Empty customer name string | `""` | Returns `false` (cannot be empty) | Pass |
| **TC-04** | Unit (Valid) | Destination validation standard | `"Tirupati"` | Returns `true` | Pass |
| **TC-05** | Unit (Invalid)| Destination length exceeds limits | `String(500 characters)` | Returns `false` | Pass |
| **TC-06** | Unit (Valid) | Date validator is in future | `"2026-10-12"` | Returns `true` | Pass |
| **TC-07** | Unit (Invalid)| Date validator is in past | `"2020-01-01"` | Returns `false` (must be future date) | Pass |
| **TC-08** | Unit (Valid) | Booking history text options | `"3 Previous Trips"` | Returns `true` | Pass |
| **TC-09** | Unit (Valid) | Preferred language array check | `"Telugu"` | Returns `true` (in array) | Pass |
| **TC-10** | Unit (Invalid)| Unsupported language string | `"Klingon"` | Returns `false` (unsupported) | Pass |
| **TC-11** | Unit (Valid) | Password strength check | `"StrongPass!123"` | Returns `true` | Pass |
| **TC-12** | Unit (Invalid)| Password is too short | `"123"` | Returns `false` (min 8 chars) | Pass |
| **TC-13** | Unit (Valid) | User role check valid | `"staff"` | Returns `true` | Pass |
| **TC-14** | Unit (Invalid)| User role check invalid | `"super_user"` | Returns `false` | Pass |
| **TC-15** | Unit (Valid) | Template placeholder parser | `replace("{{Name}}", "Ravi")` | `"Hello Ravi,"` | Pass |
| **TC-16** | Unit (Valid) | Star-rating bounds check | `5` | Returns `true` | Pass |
| **TC-17** | Unit (Invalid)| Star-rating out of bounds | `6` | Returns `false` | Pass |
| **TC-18** | Unit (Invalid)| Star-rating negative value | `-1` | Returns `false` | Pass |
| **TC-19** | Unit (Valid) | Clean text XSS sanitizer | `"<script>alert(1)</script>"` | Returns sanitized string | Pass |
| **TC-20** | Unit (Valid) | URL format validator | `"https://wa.me/919999"` | Returns `true` | Pass |
| **TC-21** | Backend API | POST /api/auth/login success | `{"username":"agent","password":"password123"}`| HTTP 200, JWT token returned | Pass |
| **TC-22** | Backend API | POST /api/auth/login invalid user | `{"username":"wrong","password":"password123"}`| HTTP 401 Unauthorized | Pass |
| **TC-23** | Backend API | POST /api/auth/login invalid pass | `{"username":"agent","password":"wrong"}`| HTTP 401 Unauthorized | Pass |
| **TC-24** | Backend API | POST /api/auth/login empty input | `{"username":"","password":""}`| HTTP 400 Bad Request | Pass |
| **TC-25** | Backend API | GET /api/history without token | No Authorization Header | HTTP 401 Unauthorized | Pass |
| **TC-26** | Backend API | GET /api/history with invalid token| `Authorization: Bearer bad_token` | HTTP 401 Unauthorized | Pass |
| **TC-27** | Backend API | GET /api/history valid token | `Authorization: Bearer <valid_jwt>` | HTTP 200 array of greeting records| Pass |
| **TC-28** | Backend API | GET /api/history/:id existing record| `/api/history/g123` | HTTP 200 greeting details | Pass |
| **TC-29** | Backend API | GET /api/history/:id missing record | `/api/history/missing` | HTTP 404 Not Found | Pass |
| **TC-30** | Backend API | POST /api/generate valid payload | `{name: "Ravi", destination: "Tirupati", ...}`| HTTP 201 generated text | Pass |
| **TC-31** | Backend API | POST /api/generate missing name | `{destination: "Tirupati", ...}` | HTTP 400 validation error | Pass |
| **TC-32** | Backend API | POST /api/generate missing destination| `{name: "Ravi", ...}` | HTTP 400 validation error | Pass |
| **TC-33** | Backend API | POST /api/feedback valid payload | `{greeting_id: "g1", rating: 5, comments: "Good"}`| HTTP 201 feedback saved | Pass |
| **TC-34** | Backend API | POST /api/feedback missing ID | `{rating: 5}` | HTTP 400 Bad Request | Pass |
| **TC-35** | Backend API | GET /api/analytics aggregate | `Authorization: Bearer <valid_jwt>` | HTTP 200 charts json dataset | Pass |
| **TC-36** | Backend API | GET /api/templates read presets | `Authorization: Bearer <valid_jwt>` | HTTP 200 templates list | Pass |
| **TC-37** | Backend API | POST /api/templates create preset | `{title: "Tirupati Trip", content: "..."}`| HTTP 201 template created | Pass |
| **TC-38** | Backend API | PUT /api/templates/:id update | `{content: "updated content"}` | HTTP 200 template updated | Pass |
| **TC-39** | Backend API | DELETE /api/templates/:id remove | `/api/templates/t1` | HTTP 200 template deleted | Pass |
| **TC-40** | Backend API | GET /api/profile details | `Authorization: Bearer <valid_jwt>` | HTTP 200 user profile object | Pass |
| **TC-41** | Backend API | PUT /api/profile updates | `{email: "new@example.com"}` | HTTP 200 updated profile | Pass |
| **TC-42** | Security | SQL Injection inside Name field | `"Ravi'; DROP TABLE users;--"` | Sanitized / Parameterized query runs safely | Pass |
| **TC-43** | Security | Cross Site Scripting inside notes| `"<img src=x onerror=alert(1)>"`| Escaped character rendering on UI | Pass |
| **TC-44** | Security | Rate Limiting trigger | 100 requests in 1 minute | HTTP 429 Too Many Requests | Pass |
| **TC-45** | Security | JWT Signature Tampering | Header edit signature block | HTTP 401 Invalid Signature | Pass |
| **TC-46** | Security | Helmet security headers presence | Response Headers Check | `X-Content-Type-Options: nosniff` | Pass |
| **TC-47** | Security | Password hashing verification | Check database user row | String starts with `$2a$` (bcrypt) | Pass |
| **TC-48** | Security | Admin only endpoint block | Staff JWT to admin route | HTTP 403 Forbidden | Pass |
| **TC-49** | Database | User table primary key check | Try inserting duplicate uuid | Throws unique key violation | Pass |
| **TC-50** | Database | Foreign key constraints greetings | Save greeting with invalid user ID | Throws foreign key violation | Pass |
| **TC-51** | Database | Cascade delete feedback | Delete greeting record | Connected feedback deleted automatically| Pass |
| **TC-52** | Database | Index utilization check | Query greetings by travel date | Table scan avoided (index used) | Pass |
| **TC-53** | Database | Seeding scripts verification | Executing seeding script | Tables populated with 3 default users| Pass |
| **TC-54** | Database | Null constraints validations | Insert NULL into templates title | Throws NOT NULL constraint violation| Pass |
| **TC-55** | Database | Large TEXT field handling | Insert 50KB greeting paragraph | Text saved successfully without cuts| Pass |
| **TC-56** | AI Engine | V1-V4 Prompt output structure | Verify paragraph greeting splits | Check for welcome, body, signature | Pass |
| **TC-57** | AI Engine | Hallucination negative test | Give notes "No wheelchair" | Greetings should NOT mention wheelchair| Pass |
| **TC-58** | AI Engine | Multilingual Telugu output | Select preferred language: Telugu | Response generated in Telugu script | Pass |
| **TC-59** | AI Engine | Multilingual Hindi output | Select preferred language: Hindi | Response generated in Devanagari script| Pass |
| **TC-60** | AI Engine | API Timeout handler | Simulate Gemini API 6s delay | Server triggers retry, returns data | Pass |
| **TC-61** | AI Engine | API Failover simulator | Shutdown API Key, run generator | Local simulated engine yields greeting | Pass |
| **TC-62** | AI Engine | Loyalty personalization test | Booking History: "5 previous trips"| Outputs VIP loyalty thank you note | Pass |
| **TC-63** | AI Engine | Special Notes inclusion | Special Notes: "Elderly travelers" | Greeting warns to offer extra support | Pass |
| **TC-64** | Frontend UI | Sidebar active navigation state | Click History page link | Highlights tab and paths to history | Pass |
| **TC-65** | Frontend UI | Responsive layout collapsible menu| Resize width to 480px | Menu collapses to hamburger icon | Pass |
| **TC-66** | Frontend UI | Input form validation displays error| Submit empty customer name | Error border & text appears | Pass |
| **TC-67** | Frontend UI | Output block Copy-to-Clipboard | Click "Copy" on Output page | Clipboard contains greeting text | Pass |
| **TC-68** | Frontend UI | WhatsApp click share redirection | Click "Send WhatsApp" | Redirects to `https://api.whatsapp.com/send`| Pass |
| **TC-69** | Frontend UI | Download greeting text file | Click "Download" | Trigger text document file download | Pass |
| **TC-70** | Frontend UI | Chart loading widget spinner | Open analytics page before load | Displays loading skeletons | Pass |
| **TC-71** | Frontend UI | Ratings star clicks interaction | Click star 4 on feedback modal | Saves index value 4 to local states | Pass |
| **TC-72** | Frontend UI | Alert banner timer dismiss | Form updates notification | Alert disappears after 3 seconds | Pass |
| **TC-73** | Frontend UI | Template picker populates form | Click "Spiritual Tour" template | Preset settings loaded into form | Pass |
| **TC-74** | Frontend UI | Login route auth redirect | Open `/dashboard` while logged out| Redirects to `/login` | Pass |
| **TC-75** | Frontend UI | Logged in user redirect to dash | Open `/login` while logged in | Redirects to `/dashboard` | Pass |
| **TC-76** | Performance| API Response Latency under load | Send 10 concurrent requests | Average latency < 3500ms | Pass |
| **TC-77** | Performance| Frontend load performance | Speed index analysis | Fully interactive in < 1.5 seconds | Pass |
| **TC-78** | Performance| DB connection checkout time | High frequency queries pool | Checkout duration < 50ms | Pass |
| **TC-79** | Performance| JS heap allocations test | Continuous generation runs | No memory leak detected | Pass |
| **TC-80** | Integration| Generator outputs to History view | Generate -> Check history table | New greeting immediately visible | Pass |
| **TC-81** | Integration| Feedback updates analytics metrics| Save feedback -> Check analytics | Rating averages update | Pass |
| **TC-82** | Integration| Template edits update builder list| Edit template -> Go to generator | Picklists show updated options | Pass |
| **TC-83** | Integration| Password change updates session | Change pass -> Log out -> Log in | Login successful with new pass | Pass |
| **TC-84** | Integration| Token expiration interceptor | Wait till JWT expires -> API call | Logged out, redirected to login page| Pass |
| **TC-85** | Frontend UI | Settings updates update layout | Toggle dark mode state | Changes UI background variables | Pass |
| **TC-86** | QA Audit | Contrast ratio checks (A11y) | Check slate background text colors| Contrast ratio exceeds 4.5:1 | Pass |
| **TC-87** | QA Audit | Keyboard navigability check | Tab index forms controls | Can navigate form without mouse | Pass |
| **TC-88** | QA Audit | Error boundaries components | Force render crash in Dashboard | Fallback screen rendered gracefully | Pass |
| **TC-89** | Backend API | Health check check endpoint | GET `/api/health` | Returns status 200 `OK` | Pass |
| **TC-90** | Security | CORS rejection test | Send request from unauthorized site| Request blocked by CORS policy | Pass |
| **TC-91** | Database | SQL Index utilization feedback | Query feedback joined greetings | Index scanning on `greeting_id` | Pass |
| **TC-92** | Integration| Theme preference saved local storage| Toggle theme -> Refresh page | Dark mode preference persists | Pass |
| **TC-93** | Performance| AI API Payload compression | Inspect content headers | `gzip` encoding active | Pass |
| **TC-94** | QA Audit | W3C markup compliance | Inspect build bundles | Valid HTML5 tags generated | Pass |
| **TC-95** | Backend API | PUT /api/templates/:id bad ID | `/api/templates/invalid_uuid` | HTTP 400 Validation Error | Pass |
| **TC-96** | Backend API | POST /api/generate special char | Notes: `"@#$$%^&*()_+"` | AI outputs valid alphanumeric greeting| Pass |
| **TC-97** | AI Engine | Tone match check for Business | Travel Type: "Corporate" | Greeting uses professional greeting tone| Pass |
| **TC-98** | AI Engine | Tone match check for Honeymoon| Travel Type: "Honeymoon" | Greeting uses romantic tour tone | Pass |
| **TC-99** | Frontend UI | History search text filter | Type `"Ravi"` in history search | Displays only matching records | Pass |
| **TC-100**| Backend API | Empty body rejection | POST /api/generate empty body | HTTP 400 Bad Request | Pass |
