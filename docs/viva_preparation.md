# Phase 16: Viva Preparation
## 100 Questions & Answers for Final Project Viva Voce

---

### Section 1: HTML & CSS (Q1 - Q15)

#### Q01: What is the purpose of semantic HTML elements?
Semantic HTML tags (like `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`) clearly describe their meaning to both the browser and the developer. This helps search engines index the content (SEO) and assists assistive technologies (screen readers) in navigating the structure.

#### Q02: What is viewport-meta-tag and why is it important in your landing page?
`<meta name="viewport" content="width=device-width, initial-scale=1.0">` tells the browser how to control the page's dimensions and scaling on different screen sizes. It is essential for responsive CSS media queries.

#### Q03: Explain the difference between absolute, relative, fixed, and sticky positioning in CSS.
* `static`: Default flow.
* `relative`: Positioned relative to its normal flow.
* `absolute`: Positioned relative to its closest positioned ancestor.
* `fixed`: Positioned relative to the browser viewport; stays in place during scroll.
* `sticky`: Toggles between relative and fixed depending on scroll position.

#### Q04: How did you implement responsiveness in your project?
Using Tailwind CSS mobile-first utility classes (e.g., `grid-cols-1 md:grid-cols-3` or `hidden md:block`) combined with standard flexbox and grid layouts.

#### Q05: What is Flexbox and when is it preferred over CSS Grid?
Flexbox is a one-dimensional layout system (row or column) ideal for aligning items like navbars or inline form groups. CSS Grid is a two-dimensional layout system (rows and columns) best suited for overall dashboard structures.

#### Q06: What is the purpose of the `aria-label` attribute?
It defines a string value that labels an interactive element (such as an icon-only button) for screen readers, improving web accessibility (WCAG compliance).

#### Q07: Explain CSS box model properties.
Every element is represented as a box consisting of Content, Padding (space around content), Border, and Margin (outer space separating elements). We use `box-sizing: border-box` to include padding/borders within the total width/height.

#### Q08: How do CSS variables (custom properties) work?
They allow you to define reusable design tokens in the `:root` level, e.g., `--color-primary: #4f46e5`. These values can be updated dynamically via JS or CSS classes.

#### Q09: What is z-index and how does it determine element stack order?
`z-index` specifies the stack order of positioned elements (relative, absolute, fixed, or sticky). Higher values appear on top of lower ones within the same stacking context.

#### Q10: How do you optimize web fonts to prevent page layout shifts (CLS)?
By using `font-display: swap` in the `@font-face` definition, instructing the browser to display a fallback font until the custom Google font is fully loaded.

#### Q11: What is CSS specificity and how is it calculated?
It is a rule browser engines use to determine which CSS selector applies to an element. Inline styles have the highest weight, followed by IDs, classes/attributes/pseudo-classes, and lastly, element names.

#### Q12: What is the purpose of the HTML5 `<template>` tag?
It holds client-side content that is not rendered on page load but can be instantiated and inserted into the DOM later using JavaScript.

#### Q13: Explain CSS Transitions vs Animations.
Transitions smoothly interpolate property values when an element state changes (e.g., hover). Animations use `@keyframes` to create multi-stage visual effects independently of user input.

#### Q14: How does dark mode work in a Tailwind CSS setup?
By adding the `dark` class to the `<html>` or `<body>` element. Classes prefixed with `dark:` (e.g., `bg-white dark:bg-slate-900`) will take effect automatically when that class is active.

#### Q15: What is the difference between local storage, session storage, and cookies?
* **LocalStorage**: Persistent storage on the client (up to 5MB), never expires automatically.
* **SessionStorage**: Cleared when the browser tab is closed.
* **Cookies**: Small strings sent with every HTTP request, containing expiration details; used for session tracking.

---

### Section 2: JavaScript & ES6+ (Q16 - Q30)

#### Q16: What is the difference between `var`, `let`, and `const`?
* `var` is function-scoped, hoisted, and allows redeclaration.
* `let` is block-scoped, not redeclarable in the same block, and is not hoisted.
* `const` is block-scoped like `let` but binds a value that cannot be reassigned.

#### Q17: What is a Promise in JavaScript?
An object representing the eventual completion or failure of an asynchronous operation. It has three states: Pending, Fulfilled, or Rejected.

#### Q18: Explain `async/await`.
Syntactic sugar built over Promises. An `async` function returns a Promise, and `await` pauses execution until the promise resolves, yielding a clean, synchronous-looking code structure.

#### Q19: What is the event loop in JavaScript?
A mechanism that enables single-threaded JS to perform non-blocking I/O operations. It coordinates execution between the Call Stack, Web APIs, Task Queue, and Microtask Queue.

#### Q20: What is closure in JavaScript?
A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). It allows an inner function to access variables of its outer function even after the outer function has finished executing.

#### Q21: Explain Destructuring assignment.
A feature allowing you to unpack values from arrays or properties from objects into distinct variables, e.g., `const { name, destination } = req.body;`.

#### Q22: What is the difference between `==` and `===`?
`==` performs type coercion before comparison, whereas `===` (strict equality) checks both value and data type without conversion.

#### Q23: What is the spread operator `...` and how did you use it?
It expands an iterable (like an array or object) into individual elements. Used in React state updates, e.g., `setGreetings([...greetings, newGreeting])`.

#### Q24: What are ES Modules (ESM) vs CommonJS (CJS)?
* **CommonJS**: Uses `require()` and `module.exports`, loaded synchronously.
* **ES Modules**: Uses `import` and `export`, parsed statically, enabling tree-shaking optimizations.

#### Q25: How does JavaScript handle errors asynchronously?
Using `try/catch` blocks surrounding `await` calls, or by chaining `.catch()` to Promise chains.

#### Q26: What is functional programming in JS? Give examples of array functions.
A programming paradigm that treats computation as the evaluation of mathematical functions, avoiding state changes and mutable data. Examples include `.map()`, `.filter()`, and `.reduce()`.

#### Q27: What is the difference between null and undefined?
* `undefined`: A variable has been declared but has not yet been assigned a value.
* `null`: An intentional assignment representing the absence of any object value.

#### Q28: How does Event Delegation work?
Instead of adding event listeners to multiple child elements, a single listener is added to a parent element. The event bubbles up, and we check the event target (`e.target`) to respond.

#### Q29: What is throttling and debouncing?
* **Debouncing**: Delays processing an event until a certain idle time passes (e.g., search search-box keystroke inputs).
* **Throttling**: Ensures a function is called at most once within a specified time limit (e.g., scroll handler).

#### Q30: What is CORS?
Cross-Origin Resource Sharing is a browser security feature that uses HTTP headers to restrict which domains can request resources from an API hosting server.

---

### Section 3: React (Q31 - Q50)

#### Q31: What is the Virtual DOM and how does React use it?
A lightweight, in-memory representation of the real DOM. When state changes, React creates a new virtual tree, compares it with the previous tree (diffing), and batch updates only the changed elements in the real DOM (reconciliation).

#### Q32: Explain the React Component Lifecycle.
In modern functional components, hooks replace lifecycle methods:
* `useEffect` with an empty dependency array `[]` corresponds to `componentDidMount`.
* `useEffect` with variables `[deps]` corresponds to `componentDidUpdate`.
* Returning a clean-up function inside `useEffect` corresponds to `componentWillUnmount`.

#### Q33: What is state in React, and how does it differ from props?
* **State** is a private, mutable data structure managed within a component.
* **Props** (properties) are read-only inputs passed down by parent components.

#### Q34: What is the purpose of the `key` prop in React lists?
It helps React identify which items have changed, been added, or been removed. This is crucial for efficient Virtual DOM diffing.

#### Q35: How does the Context API work?
It provides a way to share global values (like user session details or configuration settings) between components without manually passing props down through multiple levels (prop drilling).

#### Q36: What is a React Hook?
A special function that lets you use state and other React features in functional components without writing a class (e.g., `useState`, `useEffect`, `useContext`).

#### Q37: What does the dependency array in `useEffect` do?
It controls when the hook runs. If omitted, the hook runs on every render. If empty `[]`, it runs once on mount. If populated `[stateVar]`, it runs only when the specified variables change.

#### Q38: What is React Router and how does it work?
A routing library that enables client-side page transitions in a Single Page Application without reloading the browser. It parses the URL path and renders the corresponding component.

#### Q39: What are controlled vs uncontrolled components in React?
* **Controlled**: The component's form data is handled by a React state hook.
* **Uncontrolled**: Form data is handled directly by the DOM via references (`useRef`).

#### Q40: How do you handle loading states on the frontend during API calls?
By maintaining a boolean state (e.g., `const [loading, setLoading] = useState(false)`). We set it to `true` before dispatching the API call, and set it to `false` in a `finally` block, rendering spinner widgets conditionally in between.

#### Q41: Explain React.memo and useMemo.
* `React.memo`: A higher-order component that prevents re-rendering a component if its props haven't changed.
* `useMemo`: A hook that memoizes the result of an expensive calculation between renders.

#### Q42: What is useCallback and when should you use it?
It returns a memoized version of a callback function. Use it when passing callbacks to optimized child components to prevent unnecessary re-renders from function recreation.

#### Q43: How do you handle authentication persistence in React?
On a successful login, the backend JWT is saved to `localStorage`. On application mount, an AuthContext provider reads the token, validates it, updates state, and sets up interceptors.

#### Q44: What is the purpose of React Portal?
It lets you render child components (like modals or tooltips) into a DOM node that exists outside the main hierarchy of the parent component.

#### Q45: Explain strict mode in React.
A development-only tool that highlights potential problems, such as unsafe lifecycles or side-effects, by rendering components twice to verify consistency.

#### Q46: What are custom React Hooks?
JavaScript functions whose names start with `use` and can call other hooks. They allow you to extract component logic into reusable functions (e.g., `useFetch`).

#### Q47: What is prop drilling and how did you avoid it?
Prop drilling is the process of passing data through several nested components just to reach a deeply nested child. We avoided this by using the React Context API.

#### Q48: How does Axios handle request/response interceptors?
Interceptors allow you to run code before a request is sent (e.g., attaching authorization headers) or before a response is handled by `.then()` or `.catch()` (e.g., handling global errors).

#### Q49: What is code splitting in React?
A technique that loads only the JavaScript bundles needed for the current route, reducing initial page load times. This is implemented using `React.lazy` and `Suspense`.

#### Q50: How do you handle form validations in React?
By implementing state-driven event handlers (`onChange`) that run validation checks (e.g., checking for empty strings, validating emails) and save error messages to local state to render conditionally under the inputs.

---

### Section 4: Node.js & Express (Q51 - Q65)

#### Q51: What is Node.js and how does it work?
Node.js is an open-source, cross-platform JavaScript runtime environment built on Chrome's V8 engine. It uses an event-driven, non-blocking I/O model that makes it lightweight and efficient.

#### Q52: What is Express.js?
A minimal and flexible web application framework for Node.js, providing a robust set of features to build single-page, multi-page, and hybrid web applications and REST APIs.

#### Q53: Explain middleware in Express.
Middlewares are functions that have access to the request object (`req`), response object (`res`), and the next middleware function in the application’s request-response cycle. They can modify requests, execute code, or terminate the connection.

#### Q54: What is the purpose of `package.json`?
It serves as the manifest of a Node.js project. It holds metadata, script definitions, and lists project dependencies and devDependencies with semantic versioning constraints.

#### Q55: What is npm?
Node Package Manager is the default package manager for Node.js. It manages downloading and installing dependencies, version control, and running custom task scripts.

#### Q56: How do you handle configuration variables in Node.js?
Using environmental variables stored in a `.env` file, loaded at runtime via the `dotenv` package and accessed using `process.env.VARIABLE_NAME`.

#### Q57: What is the difference between `fs.readFile` and `fs.readFileSync`?
* `fs.readFile` is asynchronous and non-blocking, delegating the operation to the libuv threadpool.
* `fs.readFileSync` is synchronous and blocking, halting the execution thread until the file is read.

#### Q58: What is the difference between `res.send()` and `res.json()`?
* `res.json()` explicitly formats the response as a JSON string, sets the correct `Content-Type` header to `application/json`, and dispatches it.
* `res.send()` is a general-purpose response dispatcher that automatically detects and converts strings, buffers, or HTML.

#### Q59: Explain the role of the `cors` middleware in Express.
It configures HTTP headers (like `Access-Control-Allow-Origin`) to control which external client domains can make API requests to the Express server, protecting against malicious cross-domain requests.

#### Q60: How does error handling middleware differ from regular middleware in Express?
Error handling middleware takes exactly four arguments: `(err, req, res, next)`. If any route handler throws an error or calls `next(error)`, Express skips all remaining middleware and executes this error handler.

#### Q61: What is PM2?
A production process manager for Node.js applications. It keeps applications online, provides built-in clustering, and handles auto-restarts on system failure or file updates.

#### Q62: What is the difference between cluster and worker threads in Node.js?
* **Cluster module**: Spawns multiple instances of the application on the same port, sharing the load across different CPU cores.
* **Worker Threads**: Executes intensive CPU-bound tasks in separate threads within the same process instance.

#### Q63: Explain how REST API design patterns are structured.
They follow standard resource routing conventions using HTTP methods:
* `POST /api/resources` (Create)
* `GET /api/resources` (Read List)
* `GET /api/resources/:id` (Read Single)
* `PUT /api/resources/:id` (Update)
* `DELETE /api/resources/:id` (Delete)

#### Q64: What is payload validation and why did you use `joi` / `yup` patterns?
It is the process of verifying that incoming request body properties conform to expected schemas (types, formats, constraints) before executing business logic, preventing database corruption and server failures.

#### Q65: What is the purpose of standard body-parsers in Express?
`express.json()` and `express.urlencoded()` are built-in middlewares that parse incoming request payloads, formatting the raw data into key-value pairs attached to `req.body`.

---

### Section 5: AI Integration & Engineering (Q66 - Q75)

#### Q66: What is a System Prompt in Generative AI?
An instruction block defined at the start of a model session that sets the AI's identity, rules, boundaries, tone, and formatting constraints, ensuring it behaves reliably.

#### Q67: Explain Few-Shot Prompting.
Providing the AI model with a few concrete examples of inputs and desired outputs within the prompt template to guide the structure, tone, and formatting of its responses.

#### Q68: What is hallucination in LLMs and how did you prevent it?
A phenomenon where an LLM generates facts that are false, unsupported, or irrelevant. We prevent this by writing highly detailed system prompts with explicit negative constraints (e.g., "Do not invent travel details not provided in the input").

#### Q69: How does the Google Gemini SDK generate responses?
It connects to Google's API endpoints using the `GoogleGenAI` initialization client and calls `model.generateContent()`, passing a text prompt or system instructions.

#### Q70: What is the difference between OpenAI's GPT models and Gemini models?
* **GPT (Generative Pre-trained Transformer)**: Created by OpenAI, focusing on text completion, chat structures, and code logic.
* **Gemini**: Built from the ground up by Google as a native multimodal model, supporting text, code, image, and audio combinations.

#### Q71: Explain Rate Limiting and how you handled it for the AI API.
API providers restrict the number of requests per minute (RPM). We handle this by setting up a retry service layer with exponential backoff and providing fallback greeting generators if the API is temporarily unavailable.

#### Q72: How does prompt templating work?
It replaces placeholders in a base template string with actual user variables at runtime, ensuring consistent structures for the AI, e.g., `Template: "Draft greeting for ${customerName} to ${destination}"`.

#### Q73: Why is a structured JSON output parser useful?
It instructs the model to return data in a reliable, parsable format (like JSON). This allows backend code to extract specific variables directly instead of parsing raw text blocks.

#### Q74: What is the temperature setting in Generative AI APIs?
A parameter between `0` and `2` that controls randomness. A setting close to `0` makes the output deterministic and focused, while values closer to `1` or higher increase creativity and variety.

#### Q75: How do you optimize AI API costs?
By keeping prompt templates concise to reduce input token counts, limiting the maximum output tokens (`maxOutputTokens`), and caching frequent outputs.

---

### Section 6: Database & SQL (Q76 - Q85)

#### Q76: What is PostgreSQL and how does it differ from MongoDB?
PostgreSQL is a relational database management system (RDBMS) that uses structured tables, SQL queries, and ACID transactions. MongoDB is a NoSQL document database that stores data in flexible, JSON-like documents.

#### Q77: What is Referencing Integrity / Foreign Key constraint?
A database rule that ensures relationships between tables remain consistent. For example, a greeting record cannot be created with a `user_id` that does not exist in the `users` table.

#### Q78: Explain database indexing and why it is important.
Indexes are lookup tables that help the database search engine find records quickly without scanning the entire table. We index fields like `destination`, `user_id`, and `created_at` to improve query performance.

#### Q79: What is database normalization?
A design technique that organizes tables to minimize data redundancy and dependency. It involves splitting large tables into smaller ones and defining relationships between them.

#### Q80: What is the difference between an Inner Join and a Left Join?
* **Inner Join**: Returns only the rows that have matching values in both tables.
* **Left Join**: Returns all rows from the left table, plus any matching rows from the right table (returning nulls if no match exists).

#### Q81: Explain transactions and ACID properties.
A transaction is a sequence of database operations treated as a single unit of work. ACID properties guarantee reliable database transactions:
* **Atomicity**: All operations succeed, or all fail.
* **Consistency**: Changes bring the database from one valid state to another.
* **Isolation**: Transactions run independently without interference.
* **Durability**: Completed changes are permanently saved, even in a system failure.

#### Q82: What are database constraints?
Rules enforced on table columns to restrict the values that can be stored, ensuring data integrity (e.g., `NOT NULL`, `UNIQUE`, `CHECK`).

#### Q83: What is the purpose of database migrations?
Version control files for your database schema. They document changes (like adding tables or columns) over time, allowing schemas to be updated consistently across different environments.

#### Q84: How do SQL injection attacks work and how do you prevent them?
An attack where malicious SQL statements are inserted into input fields. We prevent them by using parameterized queries (prepared statements), where input values are separated from the SQL code structure.

#### Q85: What is connection pooling?
A cache of database connections maintained by the server. Instead of opening and closing a new connection for every request, connections are reused from the pool, reducing latency and database load.

---

### Section 7: Security, Testing & DevOps (Q86 - Q100)

#### Q86: What is JWT authentication and how does it work?
JSON Web Token is an open standard (RFC 7519) for securely transmitting information between parties as a JSON object. It consists of a Header (metadata), Payload (user claims), and a Signature (verifying integrity using a secret key).

#### Q87: What is bcrypt and why is it used?
A password-hashing function that uses a salt to protect against rainbow table attacks. It is intentionally slow (adaptive work factor) to resist brute-force cracking attempts.

#### Q88: What is Cross-Site Scripting (XSS) and how do you prevent it?
An attack where malicious scripts are injected into trusted websites and run in the user's browser. We prevent it by sanitizing inputs on the server and escaping outputs in the React client.

#### Q89: What is CSRF and how does it work?
Cross-Site Request Forgery is an exploit where a malicious site tricks a user's browser into performing unwanted actions on a trusted site where the user is currently authenticated.

#### Q90: What is rate limiting and why is it important?
A security control that limits the number of requests a user can make to an API within a given timeframe, protecting against denial-of-service (DoS) attacks and brute-force attempts.

#### Q91: What is the OWASP Top 10?
A standard awareness document listing the most critical security risks to web applications, helping developers write secure code.

#### Q92: Explain Unit Testing vs Integration Testing.
* **Unit Testing**: Tests individual functions or components in isolation (e.g., validating form helper functions).
* **Integration Testing**: Tests how multiple parts of the application work together (e.g., testing if an API endpoint successfully updates the database).

#### Q93: What is CI/CD?
Continuous Integration (CI) automates building and testing code changes. Continuous Deployment (CD) automatically deploys approved code changes to production environments.

#### Q94: How does GitHub Actions work?
A platform that automates workflows (like building, testing, and deploying projects) directly from your GitHub repository using YAML files configured in the `.github/workflows/` directory.

#### Q95: What are security headers?
HTTP response headers (configured using middleware like Helmet) that instruct browsers how to handle the site's content, preventing attacks like clickjacking and MIME-type sniffing.

#### Q96: What is a reverse proxy?
A server that sits in front of backend servers and forwards client requests to them, providing security, load balancing, and caching benefits (e.g., Nginx).

#### Q97: What is Render.com and how does it differ from Vercel?
* **Render**: A cloud platform suited for hosting backend web servers, databases, and cron jobs.
* **Vercel**: Optimized for hosting frontend static single-page applications and serverless functions.

#### Q98: How do you manage secrets in production?
Secrets are set as environment variables in the hosting platform's dashboard, ensuring sensitive credentials (like database passwords and API keys) are never committed to version control.

#### Q99: What is a rollback strategy in deployment?
A plan to quickly redeploy the last stable version of an application if a new release causes unexpected bugs or downtime in production.

#### Q100: Why do we use Semantic Commit Messages?
A convention for commit messages (using prefixes like `feat:`, `fix:`, `docs:`) that makes the repository history easy to read and allows for automated versioning and changelog generation.
