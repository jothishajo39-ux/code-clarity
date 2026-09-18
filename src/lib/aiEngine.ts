import type {
  ErrorExplanation,
  ProjectPlan,
  CodeReview,
  GeneratedDocs,
} from "./types";

// Simulate network latency for a realistic loading experience
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ====================================================================
// ERROR DECODER
// Analyzes error messages and stack traces to produce plain-English
// explanations, likely causes, and suggested fixes.
// ====================================================================

interface ErrorPattern {
  match: RegExp;
  errorType: string;
  plainEnglish: string;
  likelyCauses: string[];
  suggestedFix: string;
  codeSnippet: string;
  language: string;
  prevention: string[];
}

const ERROR_PATTERNS: ErrorPattern[] = [
  {
    match: /TypeError:\s*(.+)/i,
    errorType: "TypeError",
    plainEnglish:
      "Your code is trying to use a value in a way that doesn't match its type — for example, calling a method on undefined, or treating a non-function as a function.",
    likelyCauses: [
      "A variable is undefined or null when you expected it to hold an object",
      "You're calling a function that doesn't exist on the current object",
      "A property name is misspelled or doesn't exist",
    ],
    suggestedFix:
      "Add a guard check before accessing the property. Verify the variable is defined and has the expected type before using it.",
    codeSnippet: `// Before
const name = user.profile.name;

// After — guard against undefined
const name = user?.profile?.name ?? 'Unknown';

// Or with explicit check
if (user && user.profile) {
  const name = user.profile.name;
}`,
    language: "javascript",
    prevention: [
      "Use optional chaining (?.) to safely access nested properties",
      "Initialize variables with default values instead of leaving them undefined",
      "Add TypeScript types to catch these at compile time",
    ],
  },
  {
    match: /ReferenceError:\s*(\w+)\s+is\s+not\s+defined/i,
    errorType: "ReferenceError",
    plainEnglish:
      "You're using a variable or function that hasn't been declared yet. JavaScript doesn't know what name to look up.",
    likelyCauses: [
      "The variable is misspelled (e.g. 'cont' instead of 'const')",
      "The variable is declared in a different scope (inside a function or block)",
      "You forgot to import a module or dependency",
    ],
    suggestedFix:
      "Check the spelling of the variable. Make sure it's declared in the current scope before you use it. If it comes from another file, add the import.",
    codeSnippet: `// Error: myVaraible is not defined (misspelled)
console.log(myVaraible);

// Fix: correct the spelling
console.log(myVariable);

// Or if it's from another module:
import { myVariable } from './myModule';`,
    language: "javascript",
    prevention: [
      "Use a linter (ESLint) to catch undefined variables automatically",
      "Enable TypeScript for compile-time checking",
      "Declare variables at the top of their scope",
    ],
  },
  {
    match: /SyntaxError/i,
    errorType: "SyntaxError",
    plainEnglish:
      "Your code has a structural problem — a missing bracket, a typo in a keyword, or malformed syntax that the interpreter can't parse.",
    likelyCauses: [
      "Missing closing bracket, brace, or parenthesis",
      "Missing or extra comma in an array or object",
      "Incorrect keyword usage (e.g. 'functio' instead of 'function')",
    ],
    suggestedFix:
      "Look at the line number in the error. Check for matching brackets and parentheses. A missing closing brace often causes the error to appear on the line AFTER the actual problem.",
    codeSnippet: `// Error: Missing closing bracket
const arr = [1, 2, 3;

// Fix: Add the closing bracket
const arr = [1, 2, 3];

// Error: Missing closing brace in function
function greet() {
  return 'hello';

// Fix: Close the function
function greet() {
  return 'hello';
}`,
    language: "javascript",
    prevention: [
      "Use a code editor with bracket-matching and syntax highlighting",
      "Run a linter to catch syntax errors before execution",
      "Format code consistently with Prettier",
    ],
  },
  {
    match: /cannot read propert(?:y|ies) of (?:undefined|null)/i,
    errorType: "TypeError (Property Access on Null/Undefined)",
    plainEnglish:
      "You're trying to read a property from a value that is undefined or null. This usually means an object you expected to exist hasn't been initialized or was never assigned.",
    likelyCauses: [
      "An API response didn't return the expected nested object",
      "A DOM element lookup returned null (element doesn't exist yet)",
      "An array or object was accessed at the wrong index/key before data loaded",
    ],
    suggestedFix:
      "Check that the object exists before accessing its properties. Use optional chaining or add a null check.",
    codeSnippet: `// Problem: data might be undefined
const userName = data.user.name;

// Fix 1: Optional chaining
const userName = data?.user?.name ?? 'Guest';

// Fix 2: Explicit guard
if (data?.user) {
  const userName = data.user.name;
}

// Fix 3: For DOM elements
const el = document.getElementById('myEl');
if (el) {
  el.addEventListener('click', handleClick);
}`,
    language: "javascript",
    prevention: [
      "Always check API responses for expected shape before accessing nested data",
      "Use optional chaining (?.) for deeply nested property access",
      "Initialize state with proper default values (not just empty undefined)",
    ],
  },
  {
    match: /is not a function/i,
    errorType: "TypeError (Not a Function)",
    plainEnglish:
      "You're calling something as a function, but it isn't one. This can happen when a method doesn't exist on an object, or when a value is the wrong type.",
    likelyCauses: [
      "You're calling a method that doesn't exist on the object's type",
      "A variable was overwritten with a non-function value",
      "The function exists but is not exported/imported correctly",
    ],
    suggestedFix:
      "Check that the function exists on the object you're calling it on. Verify imports and check the type of the variable.",
    codeSnippet: `// Error: calling .map() on a non-array
const data = fetchData(); // returns an object, not array
data.map(item => item.name);

// Fix: check that it's an array first
if (Array.isArray(data)) {
  data.map(item => item.name);
}

// Or access the correct array property
const items = data.items ?? [];
items.map(item => item.name);`,
    language: "javascript",
    prevention: [
      "Verify the type of values before calling methods on them",
      "Use TypeScript to enforce correct method calls",
      "Check API documentation for return types",
    ],
  },
  {
    match: /ModuleNotFoundError|Module not found|Cannot find module/i,
    errorType: "ModuleNotFoundError",
    plainEnglish:
      "Your code is trying to import a module or package that isn't installed or can't be found at the specified path.",
    likelyCauses: [
      "The package hasn't been installed (npm install / yarn add)",
      "The import path is incorrect (wrong relative path or package name)",
      "The package is installed but not in the correct node_modules",
    ],
    suggestedFix:
      "Install the missing package, or fix the import path. If the package is installed, try reinstalling node_modules.",
    codeSnippet: `# Install the missing package
npm install <package-name>
# or
yarn add <package-name>

# If path is wrong, fix it:
// Wrong: import { foo } from './myModule';
// Right: import { foo } from '../utils/myModule';

# If node_modules is corrupted:
rm -rf node_modules package-lock.json
npm install`,
    language: "bash",
    prevention: [
      "Keep package.json and lock files committed to version control",
      "Use IDE auto-import features to avoid typos in paths",
      "Run npm install after pulling new changes",
    ],
  },
  {
    match: /ConnectionError|ECONNREFUSED|connect ECONNREFUSED/i,
    errorType: "Connection Error",
    plainEnglish:
      "Your application tried to connect to a server or database, but the connection was refused. The target service is likely not running or not reachable.",
    likelyCauses: [
      "The server/database isn't running on the expected port",
      "Wrong host or port number in the connection string",
      "A firewall or network configuration is blocking the connection",
    ],
    suggestedFix:
      "Verify the service is running and the host/port are correct. Check that no firewall is blocking the connection.",
    codeSnippet: `# Check if the service is running
# For a database on port 5432:
lsof -i :5432

# Start the service
# PostgreSQL:
sudo service postgresql start

# Node.js server:
node server.js

# Verify connection details
# Check your .env:
DATABASE_URL=postgresql://localhost:5432/mydb
# Make sure host and port match the running service`,
    language: "bash",
    prevention: [
      "Add connection retry logic with exponential backoff",
      "Use environment variables for connection strings and validate them at startup",
      "Add health checks before starting dependent services",
    ],
  },
  {
    match: /Maximum call stack size exceeded|stack overflow/i,
    errorType: "Stack Overflow (Infinite Recursion)",
    plainEnglish:
      "A function is calling itself (or a chain of functions calling each other) without ever reaching a stopping condition. Each call adds to the call stack until it overflows.",
    likelyCauses: [
      "Missing or incorrect base case in a recursive function",
      "A recursive call uses the same arguments every time (no progress toward termination)",
      "Two functions call each other in a loop",
    ],
    suggestedFix:
      "Add a base case that stops the recursion. Make sure each recursive call moves closer to the base case.",
    codeSnippet: `// Problem: No base case — infinite recursion
function countdown(n) {
  console.log(n);
  countdown(n); // same n every time!
}

// Fix: Add base case + decrease n
function countdown(n) {
  if (n <= 0) return; // base case
  console.log(n);
  countdown(n - 1);   // progress toward base case
}`,
    language: "javascript",
    prevention: [
      "Always define a clear base case before the recursive call",
      "Ensure each recursive call reduces the problem size",
      "Consider iterative solutions for deep recursion to avoid stack limits",
    ],
  },
  {
    match: /404|Not Found/i,
    errorType: "404 Not Found",
    plainEnglish:
      "The server couldn't find what was requested — either a URL route that doesn't exist, or a file/resource that isn't at the expected location.",
    likelyCauses: [
      "The URL path is misspelled or the route isn't defined on the server",
      "A static file (image, CSS, JS) is referenced but doesn't exist at that path",
      "The API endpoint moved or was renamed",
    ],
    suggestedFix:
      "Check the URL or file path for typos. Verify the route is registered on the server. If it's an API, check the documentation for the correct endpoint.",
    codeSnippet: `// Express route not found — make sure it's registered
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Fetch with correct URL
fetch('/api/users')
  .then(res => {
    if (!res.ok) throw new Error('Not found');
    return res.json();
  });

// For static files, check the path:
// Wrong: <img src="/images/logo.png">
// Right: <img src="/assets/images/logo.png">`,
    language: "javascript",
    prevention: [
      "Use a catch-all route handler to return proper 404 responses",
      "Keep a central list of all API routes and validate them",
      "Use relative paths for static assets to avoid path mismatches",
    ],
  },
  {
    match: /CORS|Cross-Origin/i,
    errorType: "CORS Error",
    plainEnglish:
      "Your browser is blocking a request because the server's security policy doesn't allow requests from your app's origin. This is a server-side configuration issue, not a bug in your frontend code.",
    likelyCauses: [
      "The server isn't sending the Access-Control-Allow-Origin header",
      "The allowed origins list doesn't include your app's domain",
      "You're making a request to a different port (e.g. localhost:3000 → localhost:5432)",
    ],
    suggestedFix:
      "Configure CORS on the server side to allow your origin. This must be fixed where the API is hosted, not in your frontend.",
    codeSnippet: `// Express — enable CORS
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', // your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Or allow all origins (for development only!)
app.use(cors());`,
    language: "javascript",
    prevention: [
      "Configure CORS on the server from the start, not as an afterthought",
      "Use environment variables to manage allowed origins per environment",
      "Avoid wildcard (*) in production — specify exact allowed origins",
    ],
  },
  {
    match: /NullPointer|NullPointerException|NullReference/i,
    errorType: "NullReferenceException",
    plainEnglish:
      "Your code is trying to use a reference that points to null/Nothing — accessing a member, method, or property on an object that was never set.",
    likelyCauses: [
      "An object wasn't initialized before being used",
      "A method returned null and the result wasn't checked",
      "A dependency injection or configuration value is missing",
    ],
    suggestedFix:
      "Add null checks before accessing members. Initialize objects with default values, and validate that method results aren't null before using them.",
    codeSnippet: `// Java — before
String name = user.getName().trim();

// Java — after (null-safe)
String name = (user != null && user.getName() != null)
  ? user.getName().trim()
  : "Unknown";

// C# — null-conditional operator
string name = user?.Name?.Trim() ?? "Unknown";`,
    language: "java",
    prevention: [
      "Use nullable reference types or Optional<T> to make nullability explicit",
      "Validate inputs and return values at method boundaries",
      "Prefer returning empty collections/objects over null",
    ],
  },
  {
    match: /ImportError|ModuleSpecifierError/i,
    errorType: "ImportError",
    plainEnglish:
      "A module can't be imported — either it doesn't exist, the name is wrong, or there's a version mismatch in your dependencies.",
    likelyCauses: [
      "The module name is misspelled or uses the wrong casing",
      "The export you're importing doesn't exist in the module",
      "Circular imports — two modules importing each other",
    ],
    suggestedFix:
      "Check the module name and the exported names. For Python, make sure the package is installed. For JS, verify the export exists.",
    codeSnippet: `# Python — install missing package
pip install package_name

# Python — correct import
from package_name import ClassName

// JavaScript — check exports
// module.js:
export const myFunc = () => {};
export default class MyClass {}

// importing.js:
import myFunc, { MyClass } from './module'; // Wrong!
import { myFunc } from './module';           // Correct
import MyClass from './module';              // Correct (default)`,
    language: "python",
    prevention: [
      "Pin dependency versions in requirements.txt / package.json",
      "Use IDE auto-complete to verify export names",
      "Avoid circular dependencies by restructuring shared logic",
    ],
  },
];

export function decodeError(input: string): ErrorExplanation {
  // Try to find a matching error pattern
  for (const pattern of ERROR_PATTERNS) {
    if (pattern.match.test(input)) {
      const match = input.match(pattern.match);
      const specificPart = match?.[1] || "";
      return {
        summary: `${pattern.errorType}: ${specificPart || "detected in your error message"}`,
        errorType: pattern.errorType,
        plainEnglish: pattern.plainEnglish,
        likelyCauses: pattern.likelyCauses,
        suggestedFix: pattern.suggestedFix,
        codeSnippet: pattern.codeSnippet,
        language: pattern.language,
        prevention: pattern.prevention,
      };
    }
  }

  // Generic fallback — analyze the text for common signals
  const lines = input.trim().split("\n");
  const firstLine = lines[0] || input;

  // Detect language from file extensions or keywords
  const isPython = /\.py|Traceback|Python/i.test(input);
  const isJava = /\.java|Exception|at java\./i.test(input);
  const isJS = /\.js|node|TypeError|ReferenceError/i.test(input);

  const detectedLang = isPython ? "python" : isJava ? "java" : isJS ? "javascript" : "text";

  // Try to extract error type from common patterns
  const errorTypeMatch = input.match(/(\w+Error|\w+Exception|Error:\s*\w+)/);
  const detectedType = errorTypeMatch ? errorTypeMatch[1] : "Unknown Error";

  return {
    summary: detectedType,
    errorType: detectedType,
    plainEnglish:
      "This is an error your program encountered. While we couldn't match it to a specific known pattern, here's what the message is telling you: something in your code didn't work as expected, and the error message above describes what went wrong and where.",
    likelyCauses: [
      "A value didn't match what the code expected at runtime",
      "An external resource (file, network, database) was unavailable",
      "A logic error — the code ran but produced an unexpected state",
    ],
    suggestedFix:
      "Read the error message carefully — it usually points to the file and line number where the problem occurred. Start there. Look at the values of variables on that line and trace backwards to find where the unexpected value came from.",
    codeSnippet: `# General debugging approach:

1. Read the full error message — note the file and line number
2. Look at the code on that line
3. Add console.log / print statements to see variable values:

   console.log('variableName:', variableName);
   # or in Python:
   print(f"variableName: {variableName}")

4. Trace where the unexpected value originated
5. Add a check or fix the logic that produced it

# If the error is in a stack trace, the FIRST line
# (your code) is usually where to start — library
# frames below it show the call chain that led there.`,
    language: detectedLang,
    prevention: [
      "Add input validation at the boundaries of your functions",
      "Write tests for edge cases (empty inputs, null values, boundary numbers)",
      "Use a linter and type checker to catch issues before runtime",
    ],
  };
}

// ====================================================================
// PROJECT PLANNER
// Takes a project description and produces a structured plan with
// features, tech stack, milestones, and file structure.
// ====================================================================

export function planProject(input: string): ProjectPlan {
  const desc = input.trim();
  const lower = desc.toLowerCase();

  // Extract a title — use the first few words or a cleaned version
  const words = desc.split(/\s+/).slice(0, 6).join(" ");
  const title = words.charAt(0).toUpperCase() + words.slice(1);

  // Detect project type for smarter recommendations
  const isWebApp = /web app|website|web application|landing page|dashboard|portal/i.test(desc);
  const isMobile = /mobile|ios|android|react native|flutter/i.test(desc);
  const isApi = /api|backend|rest|graphql|microservice/i.test(desc);
  const isEcommerce = /shop|store|e-commerce|ecommerce|product|cart|checkout/i.test(desc);
  const isSocial = /social|chat|message|community|feed|post/i.test(desc);
  const isDataApp = /data|analytics|chart|report|dashboard|visualiz/i.test(desc);
  const isGame = /game|play|score|level|player/i.test(desc);

  // Build features based on project type
  const features: ProjectPlan["features"] = [
    {
      name: "User Authentication",
      description: "Sign up, log in, password reset, and session management",
      priority: "High",
    },
    {
      name: "Core Data Model",
      description: "Define the main entities and their relationships for your application",
      priority: "High",
    },
    {
      name: "Main User Interface",
      description: isMobile
        ? "Mobile screens with navigation and responsive layouts"
        : "Pages with navigation, responsive layout, and core interactions",
      priority: "High",
    },
  ];

  if (isEcommerce) {
    features.push(
      { name: "Product Catalog", description: "Browse, search, and filter products with categories", priority: "High" },
      { name: "Shopping Cart", description: "Add/remove items, quantity management, cart total", priority: "High" },
      { name: "Checkout & Payments", description: "Shipping info, payment processing, order confirmation", priority: "High" },
      { name: "Order Management", description: "View order history, track status, reorder", priority: "Medium" },
    );
  }

  if (isSocial) {
    features.push(
      { name: "User Profiles", description: "View and edit profile, avatar, bio", priority: "High" },
      { name: "Feed / Timeline", description: "Display posts in reverse chronological order", priority: "High" },
      { name: "Create / Edit Posts", description: "Compose, edit, and delete content", priority: "High" },
      { name: "Likes & Comments", description: "Interact with posts through comments and reactions", priority: "Medium" },
      { name: "Follow / Friend System", description: "Connect with other users", priority: "Medium" },
    );
  }

  if (isDataApp) {
    features.push(
      { name: "Data Ingestion", description: "Import or fetch data from sources (API, CSV, database)", priority: "High" },
      { name: "Data Visualization", description: "Charts, graphs, and tables to present data clearly", priority: "High" },
      { name: "Filtering & Search", description: "Filter by date range, category, or custom criteria", priority: "Medium" },
      { name: "Export Reports", description: "Download reports as PDF or CSV", priority: "Medium" },
    );
  }

  if (isGame) {
    features.push(
      { name: "Game Loop", description: "Main update and render cycle running at consistent FPS", priority: "High" },
      { name: "Game State Management", description: "Track score, level, player health, game progress", priority: "High" },
      { name: "Controls / Input", description: "Keyboard, touch, or controller input handling", priority: "High" },
      { name: "Collision Detection", description: "Detect and respond to object overlaps", priority: "Medium" },
    );
  }

  // Default features for any project
  features.push(
    { name: "Input Validation & Error Handling", description: "Validate all user inputs and show clear error messages", priority: "Medium" },
    { name: "Responsive Design", description: "Works smoothly on mobile, tablet, and desktop screens", priority: "Medium" },
    { name: "Search & Filtering", description: "Let users find content quickly with search and filters", priority: "Low" },
    { name: "Settings / Preferences", description: "User-configurable options and theme", priority: "Low" },
  );

  // Tech stack recommendations
  let techStack: ProjectPlan["techStack"] = [];

  if (isMobile) {
    techStack = [
      { category: "Framework", recommendation: "React Native or Flutter", reason: "Cross-platform — one codebase for iOS and Android" },
      { category: "Navigation", recommendation: "React Navigation / Flutter Navigator", reason: "Standard routing for mobile apps" },
      { category: "State Management", recommendation: "Redux Toolkit or Zustand", reason: "Lightweight, predictable state updates" },
      { category: "Backend", recommendation: "Supabase or Firebase", reason: "Auth, database, and storage out of the box" },
      { category: "Styling", recommendation: "NativeWind or Styled Components", reason: "Utility-first styling for mobile" },
    ];
  } else if (isApi) {
    techStack = [
      { category: "Runtime", recommendation: "Node.js with Express", reason: "Fast setup, huge ecosystem, JavaScript everywhere" },
      { category: "Database", recommendation: "PostgreSQL with Prisma ORM", reason: "Type-safe database access, migrations built in" },
      { category: "Authentication", recommendation: "JWT + Supabase Auth", reason: "Stateless auth, secure session management" },
      { category: "Validation", recommendation: "Zod", reason: "Runtime type validation with TypeScript inference" },
      { category: "Testing", recommendation: "Vitest + Supertest", reason: "Fast unit and integration testing for APIs" },
    ];
  } else {
    techStack = [
      { category: "Frontend Framework", recommendation: "React with Vite", reason: "Fast dev server, huge community, component-based" },
      { category: "Styling", recommendation: "Tailwind CSS", reason: "Utility-first, rapid styling without leaving JSX" },
      { category: "State Management", recommendation: "React Context + useReducer", reason: "Built-in, no extra dependency for most apps" },
      { category: "Backend / Database", recommendation: "Supabase (PostgreSQL)", reason: "Auth, database, realtime, and storage in one platform" },
      { category: "Routing", recommendation: "React Router", reason: "De facto standard for client-side routing in React" },
      { category: "Icons", recommendation: "Lucide React", reason: "Clean, consistent, tree-shakeable icon set" },
    ];
  }

  if (isEcommerce) {
    techStack.push(
      { category: "Payments", recommendation: "Stripe", reason: "Industry standard, excellent docs, handles PCI compliance" },
    );
  }

  if (isDataApp) {
    techStack.push(
      { category: "Charts", recommendation: "Recharts or Chart.js", reason: "Responsive, customizable charts for React" },
    );
  }

  // Milestones
  const milestones: ProjectPlan["milestones"] = [
    {
      name: "M1: Project Setup & Architecture",
      duration: "2-3 days",
      tasks: [
        "Initialize project with chosen framework and tooling",
        "Set up version control (Git) and project structure",
        "Configure linting, formatting, and TypeScript",
        "Create base layout and navigation shell",
      ],
    },
    {
      name: "M2: Authentication & Core Models",
      duration: "3-5 days",
      tasks: [
        "Set up authentication (sign up, log in, log out)",
        "Design and create database schema",
        "Build protected routes and auth guards",
        "Create reusable form components with validation",
      ],
    },
    {
      name: "M3: Main Features",
      duration: "5-8 days",
      tasks: [
        `Build the core features: ${features.filter((f) => f.priority === "High").map((f) => f.name).join(", ")}`,
        "Connect frontend to backend with API calls",
        "Add loading and error states for all async operations",
        "Implement search and filtering where needed",
      ],
    },
    {
      name: "M4: Polish & Testing",
      duration: "3-4 days",
      tasks: [
        "Make the UI fully responsive (mobile + desktop)",
        "Add empty states, transitions, and micro-interactions",
        "Write tests for critical user flows",
        "Fix bugs and test across browsers",
      ],
    },
    {
      name: "M5: Deployment",
      duration: "1-2 days",
      tasks: [
        "Set up environment variables for production",
        "Deploy frontend (Vercel / Netlify) and backend",
        "Configure custom domain and HTTPS",
        "Test the production deployment end-to-end",
      ],
    },
  ];

  // File structure
  const fileStructure: string[] = [
    "project-root/",
    "├── src/",
    "│   ├── components/     # Reusable UI components",
    "│   ├── pages/          # Route-level page components",
    "│   ├── lib/            # Utilities, API client, helpers",
    "│   ├── hooks/          # Custom React hooks",
    "│   ├── types/          # TypeScript type definitions",
    "│   ├── App.tsx         # Root component + router",
    "│   └── main.tsx        # Entry point",
    "├── public/             # Static assets (images, icons)",
    "├── package.json",
    "├── tailwind.config.js",
    "└── vite.config.ts",
  ];

  // Next steps
  const nextSteps: string[] = [
    "Create a new project with your chosen framework's CLI tool",
    "Set up a Git repository and make your first commit",
    "Write down your data model — what entities do you need?",
    "Build the authentication flow first — everything else depends on it",
    "Implement one core feature end-to-end before adding more",
  ];

  return {
    projectTitle: title,
    summary: `This project involves building ${lower.startsWith("a ") || lower.startsWith("an ") ? desc : "a " + desc}. The plan below breaks it into manageable features, a recommended tech stack, and milestones you can follow step by step.`,
    features,
    techStack,
    milestones,
    fileStructure,
    nextSteps,
  };
}

// ====================================================================
// CODE REVIEW ASSISTANT
// Analyzes pasted code for bugs, readability issues, and best practices.
// ====================================================================

export function reviewCode(input: string): CodeReview {
  const code = input.trim();
  const lines = code.split("\n");

  const bugs: CodeReview["bugs"] = [];
  const readability: CodeReview["readability"] = [];
  const bestPractices: CodeReview["bestPractices"] = [];
  const improvements: string[] = [];

  // --- Bug detection ---

  // == instead of ===
  if (/[^=!]==[^=]/.test(code) || /[^!=]==["']/.test(code)) {
    bugs.push({
      severity: "Medium",
      description: "Using loose equality (==) instead of strict equality (===)",
      suggestion: "Use === to avoid unexpected type coercion. == can produce surprising results like 0 == '' being true.",
    });
  }

  // var usage
  if (/\bvar\s+/.test(code)) {
    bugs.push({
      severity: "Medium",
      description: "Using 'var' for variable declaration",
      suggestion: "Use 'let' for variables that change and 'const' for variables that don't. 'var' is function-scoped and can lead to confusing behavior.",
    });
  }

  // Missing error handling around async
  if (/\bawait\b/.test(code) && !/try\s*{/.test(code) && !/\.catch\s*\(/.test(code)) {
    bugs.push({
      severity: "High",
      description: "Async/await code without error handling",
      suggestion: "Wrap await calls in try/catch blocks or chain .catch() to handle potential failures gracefully.",
    });
  }

  // console.log left in code
  const consoleLogCount = (code.match(/console\.log/g) || []).length;
  if (consoleLogCount > 2) {
    readability.push({
      issue: `${consoleLogCount} console.log statements found`,
      suggestion: "Remove debug console.log statements before production, or use a logging library with log levels.",
    });
  }

  // InnerHTML — potential XSS
  if (/\.innerHTML\s*=/.test(code)) {
    bugs.push({
      severity: "High",
      description: "Using innerHTML to set content — potential XSS vulnerability",
      suggestion: "Use textContent for plain text, or sanitize HTML before assignment. Never insert untrusted data via innerHTML.",
    });
  }

  // eval usage
  if (/\beval\s*\(/.test(code)) {
    bugs.push({
      severity: "High",
      description: "Using eval() — serious security risk",
      suggestion: "Avoid eval entirely. It executes arbitrary code and is a major injection vector. Use JSON.parse for data, or restructure your logic.",
    });
  }

  // Missing semicolons (simple heuristic)
  const codeLines = lines.filter((l) => l.trim() && !l.trim().startsWith("//") && !l.trim().startsWith("*") && !l.trim().startsWith("/*"));
  const missingSemicolons = codeLines.filter((l) => {
    const trimmed = l.trim();
    return (
      !trimmed.endsWith(";") &&
      !trimmed.endsWith("{") &&
      !trimmed.endsWith("}") &&
      !trimmed.endsWith("(") &&
      !trimmed.endsWith(",") &&
      !trimmed.endsWith("=>") &&
      !trimmed.endsWith(":") &&
      !trimmed.endsWith("|") &&
      !trimmed.endsWith("&") &&
      !trimmed.endsWith(".") &&
      !trimmed.includes("=>") &&
      !trimmed.startsWith("if") &&
      !trimmed.startsWith("for") &&
      !trimmed.startsWith("while") &&
      !trimmed.startsWith("function") &&
      !trimmed.startsWith("class") &&
      !trimmed.startsWith("interface") &&
      !trimmed.startsWith("type") &&
      !trimmed.startsWith("import") &&
      !trimmed.startsWith("export") &&
      !trimmed.startsWith("return") &&
      !trimmed.endsWith(")")
    );
  });

  if (missingSemicolons.length > 3) {
    readability.push({
      issue: "Inconsistent semicolon usage",
      suggestion: "Use semicolons consistently (or omit them entirely with a linter that enforces it). Mixing styles can cause subtle bugs.",
    });
  }

  // Long lines
  const longLines = lines.filter((l) => l.length > 120);
  if (longLines.length > 0) {
    readability.push({
      issue: `${longLines.length} line(s) exceed 120 characters`,
      suggestion: "Break long lines for readability. Most formatters (Prettier) handle this automatically.",
    });
  }

  // Deeply nested callbacks
  const maxIndent = Math.max(...lines.map((l) => (l.match(/^\s*/)?.[0].length || 0) / 2));
  if (maxIndent > 5) {
    readability.push({
      issue: `Deeply nested code (indent level ${maxIndent})`,
      suggestion: "Extract nested logic into separate functions. Deep nesting makes code hard to follow and test.",
    });
  }

  // any type usage (TypeScript)
  const anyCount = (code.match(/:\s*any\b/g) || []).length;
  if (anyCount > 0) {
    bugs.push({
      severity: "Medium",
      description: `${anyCount} usage(s) of 'any' type — defeats TypeScript's type safety`,
      suggestion: "Replace 'any' with specific types. If the type is truly unknown, use 'unknown' which is safer.",
    });
  }

  // --- Best practices checks ---

  const usesConst = /\bconst\s+/.test(code);
  bestPractices.push({
    practice: "Use const by default",
    status: usesConst ? "Good" : "Needs Work",
    note: usesConst ? "Code uses const declarations." : "Prefer const over let/var. Only use let when reassignment is needed.",
  });

  const usesArrowFunctions = /=>/.test(code);
  bestPractices.push({
    practice: "Arrow functions for callbacks",
    status: usesArrowFunctions ? "Good" : "Needs Work",
    note: usesArrowFunctions ? "Arrow functions are used." : "Consider arrow functions for callbacks — they inherit 'this' from the enclosing scope.",
  });

  const hasComments = /\/\/|\/\*/.test(code);
  bestPractices.push({
    practice: "Code comments",
    status: hasComments ? "Good" : "Needs Work",
    note: hasComments ? "Comments are present." : "Add comments for complex logic. Focus on WHY, not WHAT the code does.",
  });

  const usesTemplateLiterals = /`.*\$\{.*\}`/.test(code);
  const usesStringConcat = /\+\s*["'].*["']|["'].*["']\s*\+/.test(code);
  bestPractices.push({
    practice: "Template literals for string interpolation",
    status: usesTemplateLiterals ? "Good" : usesStringConcat ? "Needs Work" : "Good",
    note: usesTemplateLiterals
      ? "Template literals are used for string building."
      : usesStringConcat
        ? "Use template literals (backticks) instead of string concatenation with +."
        : "No string concatenation detected.",
  });

  const hasErrorHandling = /try\s*{|catch\s*\(|\.catch\s*\(/.test(code);
  bestPractices.push({
    practice: "Error handling",
    status: hasErrorHandling ? "Good" : "Needs Work",
    note: hasErrorHandling ? "Error handling is present." : "Add try/catch or .catch() for operations that can fail (API calls, file I/O).",
  });

  // --- Improvements ---
  if (bugs.length === 0 && readability.length === 0) {
    improvements.push("Code looks clean! Consider adding tests to ensure it keeps working as expected.");
  }

  if (bugs.filter((b) => b.severity === "High").length > 0) {
    improvements.push("Fix the high-severity issues first — they could cause bugs or security problems in production.");
  }

  if (readability.length > 0) {
    improvements.push("Run a formatter like Prettier to automatically fix most readability issues.");
  }

  improvements.push("Consider extracting reusable logic into helper functions or custom hooks.");
  improvements.push("Add TypeScript types if you haven't — they catch bugs at compile time.");

  // Calculate score
  let score = 100;
  bugs.forEach((b) => {
    score -= b.severity === "High" ? 20 : b.severity === "Medium" ? 10 : 5;
  });
  readability.forEach(() => (score -= 5));
  bestPractices.forEach((bp) => {
    if (bp.status === "Needs Work") score -= 5;
  });
  score = Math.max(0, Math.min(100, score));

  const summary =
    score >= 80
      ? "Good code quality overall. A few improvements would make it even better."
      : score >= 50
        ? "Code works but has some issues worth addressing. Focus on the high-severity items first."
        : "This code needs attention. Several issues could cause bugs or maintainability problems.";

  return {
    overallScore: score,
    summary,
    bugs,
    readability,
    bestPractices,
    improvements,
  };
}

// ====================================================================
// DOC GENERATOR
// Analyzes code and generates README-style documentation.
// ====================================================================

export function generateDocs(input: string): GeneratedDocs {
  const code = input.trim();
  const lines = code.split("\n");

  // Try to detect the language
  const isPython = /\bdef\s+\w+|import\s+\w+|from\s+\w+\s+import|print\(/.test(code);
  const isJS = /\bfunction\s+\w+|const\s+\w+\s*=|=>|console\.log/.test(code);
  const language = isPython ? "Python" : isJS ? "JavaScript/TypeScript" : "Code";

  // Extract title — look for function/class names or use generic
  const funcMatches = code.match(/(?:function|def|class)\s+(\w+)/g) || [];
  const funcNames = funcMatches.map((m) => m.replace(/(?:function|def|class)\s+/, ""));
  const mainName = funcNames[0] || "Module";

  // Extract functions
  const functions: GeneratedDocs["functions"] = [];

  // JS/TS functions: function name() {} or const name = () => {}
  const jsFuncPattern = /(?:function\s+(\w+)\s*\(([^)]*)\)|const\s+(\w+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>)/g;
  let jsMatch;
  while ((jsMatch = jsFuncPattern.exec(code)) !== null) {
    const name = jsMatch[1] || jsMatch[3];
    const paramsStr = jsMatch[2] || jsMatch[4] || "";
    const params = paramsStr
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => {
        const [pname, ptype] = p.split(":").map((s) => s.trim());
        return {
          name: pname || p,
          type: ptype || "any",
          description: `The ${pname || p} parameter`,
        };
      });

    functions.push({
      name,
      description: `${name} performs an operation${params.length > 0 ? ` using the provided ${params.length === 1 ? "parameter" : "parameters"}` : ""}.`,
      params,
      returns: "The result of the operation",
      example: isPython ? `${name}(${params.map((p) => p.name).join(", ")})` : `${name}(${params.map((p) => p.name).join(", ")});`,
    });
  }

  // Python functions: def name():
  const pyFuncPattern = /def\s+(\w+)\s*\(([^)]*)\)/g;
  let pyMatch;
  while ((pyMatch = pyFuncPattern.exec(code)) !== null) {
    const name = pyMatch[1];
    const paramsStr = pyMatch[2] || "";
    const params = paramsStr
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean)
      .filter((p) => p !== "self")
      .map((p) => {
        const [pname, ptype] = p.split(":").map((s) => s.trim());
        return {
          name: pname || p,
          type: ptype || "any",
          description: `The ${pname || p} parameter`,
        };
      });

    functions.push({
      name,
      description: `${name} performs an operation${params.length > 0 ? ` using the provided ${params.length === 1 ? "parameter" : "parameters"}` : ""}.`,
      params,
      returns: "The result of the operation",
      example: `${name}(${params.map((p) => p.name).join(", ")})`,
    });
  }

  // If no functions found, create a generic description
  if (functions.length === 0) {
    functions.push({
      name: mainName,
      description: "This code block contains logic that processes data and produces a result.",
      params: [],
      returns: "Varies based on input",
      example: "See the code snippet above for usage.",
    });
  }

  // Detect imports/dependencies
  const dependencies: string[] = [];
  const importPattern = /(?:import\s+(\w+)|from\s+(\w+)\s+import|require\(['"]([^'"]+)['"]\)|import\s+['"]([^'"]+)['"])/g;
  let impMatch;
  while ((impMatch = importPattern.exec(code)) !== null) {
    const dep = impMatch[1] || impMatch[2] || impMatch[3] || impMatch[4];
    if (dep && !dependencies.includes(dep)) {
      dependencies.push(dep);
    }
  }

  // Build code structure description
  const hasClasses = /\bclass\s+\w+/.test(code);
  const hasFunctions = functions.length > 0;
  const hasImports = dependencies.length > 0;

  const structureParts: string[] = [];
  if (hasImports) structureParts.push(`Imports ${dependencies.length} module(s)`);
  if (hasClasses) structureParts.push("Defines one or more classes");
  if (hasFunctions) structureParts.push(`Contains ${functions.length} function(s)`);

  const codeStructure =
    structureParts.length > 0
      ? structureParts.join(", ") + "."
      : "A code block with procedural logic.";

  // Generate description
  const description = `This ${language.toLowerCase()} ${hasClasses ? "module defines classes and methods" : "module provides functions"} for ${mainName.toLowerCase()}. ${functions.length > 1 ? `It contains ${functions.length} functions that work together to process data.` : "It contains a primary function that handles the core logic."}`;

  // Installation
  const installation = isPython
    ? `# Install Python (if not already installed)\n# Then save this file and import it:\n\nfrom ${mainName.toLowerCase()} import ${funcNames.join(", ") || mainName}\n\n# Or run directly:\npython ${mainName.toLowerCase()}.py`
    : `# Using npm\nnpm install\n\n# Or with yarn\nyarn install\n\n# Then import in your project:\nimport { ${funcNames.join(", ") || mainName} } from './${mainName.toLowerCase()}';`;

  // Usage
  const usageExamples = functions
    .slice(0, 3)
    .map((f) => {
      const paramStr = f.params.map((p) => p.name).join(", ");
      return isPython
        ? `from ${mainName.toLowerCase()} import ${f.name}\n\nresult = ${f.name}(${paramStr})\nprint(result)`
        : `import { ${f.name} } from './${mainName.toLowerCase()}';\n\nconst result = ${f.name}(${paramStr});\nconsole.log(result);`;
    })
    .join("\n\n---\n\n");

  const usage = usageExamples || `// Basic usage\nconst result = ${mainName}();`;

  // Notes
  const notes: string[] = [];
  if (dependencies.length > 0) {
    notes.push(`This module depends on: ${dependencies.join(", ")}. Make sure these are installed.`);
  }
  notes.push("Add error handling around function calls in production code.");
  if (functions.length > 0) {
    notes.push(`All ${functions.length} function${functions.length > 1 ? "s" : ""} should be tested with edge cases.`);
  }
  notes.push("Consider adding TypeScript types or Python type hints for better developer experience.");

  return {
    title: `${mainName} Module`,
    description,
    installation,
    usage,
    functions,
    codeStructure,
    dependencies,
    notes,
  };
}

// ====================================================================
// MAIN ANALYSIS ROUTER
// Routes to the correct analyzer based on the tool type.
// ====================================================================

export async function analyze(tool: string, input: string): Promise<Record<string, unknown>> {
  // Simulate AI processing time for realistic UX
  await delay(800 + Math.random() * 700);

  if (!input.trim()) {
    throw new Error("Please provide some input to analyze.");
  }

  switch (tool) {
    case "error_decoder":
      return decodeError(input) as unknown as Record<string, unknown>;
    case "project_planner":
      return planProject(input) as unknown as Record<string, unknown>;
    case "code_review":
      return reviewCode(input) as unknown as Record<string, unknown>;
    case "doc_generator":
      return generateDocs(input) as unknown as Record<string, unknown>;
    default:
      throw new Error(`Unknown tool type: ${tool}`);
  }
}
