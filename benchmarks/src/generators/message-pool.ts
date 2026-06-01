const SIMPLE_MESSAGES = [
  "Welcome to our platform",
  "Your account has been created successfully",
  "Please verify your email address",
  "Settings saved",
  "Are you sure you want to continue?",
  "Loading content, please wait",
  "No results found",
  "An error occurred while processing your request",
  "Your session has expired",
  "Click here to get started",
  "Enter your password to continue",
  "Your changes have been saved",
  "This action cannot be undone",
  "Please fill in all required fields",
  "Thank you for your feedback",
  "Your subscription is active",
  "Payment was successful",
  "Download complete",
  "Upload in progress",
  "Connection lost, retrying",
  "New version available",
  "Terms and conditions updated",
  "Your profile has been updated",
  "Check your inbox for confirmation",
  "Maximum file size exceeded",
  "Invalid email format",
  "Password must be at least 8 characters",
  "Username already taken",
  "Access denied",
  "Page not found",
  "Server error, try again later",
  "Maintenance scheduled for tonight",
  "Feature coming soon",
  "Beta version available",
  "Rate limit exceeded",
  "Request timed out",
  "Data exported successfully",
  "Import complete",
  "Sync in progress",
  "Backup created",
  // Longer messages (descriptions, tooltips, error details)
  "This feature allows you to manage your team members, assign roles, and control access to different parts of the application",
  "Your payment method will be charged automatically at the beginning of each billing cycle unless you cancel your subscription",
  "We were unable to process your request because the server is currently experiencing high load. Please try again in a few minutes",
  "By continuing you agree to our terms of service and acknowledge that you have read our privacy policy and data processing agreement",
  "This action will permanently delete all associated data including files, comments, and activity history. This cannot be reversed",
  "Your account has been temporarily locked due to multiple failed login attempts. Please reset your password or contact support",
  "The export process may take several minutes depending on the amount of data. You will receive an email notification when it is ready",
  "Please ensure your browser is up to date for the best experience. Some features may not work correctly on older browser versions",
  "You are about to leave this page. Any unsaved changes will be lost. Are you sure you want to navigate away from this page?",
  "This item is currently out of stock but you can add it to your wishlist and we will notify you when it becomes available again",
  "Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password",
  "The file you are trying to upload exceeds the maximum allowed size. Please compress the file or split it into smaller parts",
  "Your trial period has ended. To continue using all features please upgrade to a paid plan. Your data will be preserved for 30 days",
  "We noticed unusual activity on your account. For your security we have temporarily restricted certain actions until you verify your identity",
  "The search index is being rebuilt. Some results may be incomplete or unavailable for the next few minutes while this process completes",
  "Collaborative editing is enabled for this document. Changes made by other team members will appear in real time as they type",
  "This report is generated based on data from the last 30 days. You can customize the date range using the filters above",
  "Push notifications are currently disabled for this device. Enable them in your browser settings to receive real-time updates",
  "Your password was last changed more than 90 days ago. We recommend updating it regularly to maintain the security of your account",
  "The API rate limit for your current plan is 1000 requests per minute. Consider upgrading if you need higher throughput for your application",
]

const INTERPOLATED_MESSAGES: InterpolatedDef[] = [
  // Simple variable interpolations
  {
    text: "Hello {name}, welcome back",
    vars: [{ name: "name", expr: "name" }],
  },
  {
    text: "Logged in as {username}",
    vars: [{ name: "username", expr: "username" }],
  },
  {
    text: "Your balance is {amount}",
    vars: [{ name: "amount", expr: "amount" }],
  },
  { text: "Last login: {date}", vars: [{ name: "date", expr: "date" }] },
  { text: "Sent to {email}", vars: [{ name: "email", expr: "email" }] },
  { text: "{name} liked your post", vars: [{ name: "name", expr: "name" }] },
  {
    text: "Shared by {username} on {date}",
    vars: [
      { name: "username", expr: "username" },
      { name: "date", expr: "date" },
    ],
  },
  {
    text: "Invoice #{id} for {amount}",
    vars: [
      { name: "id", expr: "id" },
      { name: "amount", expr: "amount" },
    ],
  },
  {
    text: "Welcome to {team}, {name}",
    vars: [
      { name: "team", expr: "team" },
      { name: "name", expr: "name" },
    ],
  },
  { text: "Expires on {date}", vars: [{ name: "date", expr: "date" }] },
  { text: "Created by {name}", vars: [{ name: "name", expr: "name" }] },
  {
    text: "Assigned to {username}",
    vars: [{ name: "username", expr: "username" }],
  },
  {
    text: "Total: {amount} ({currency})",
    vars: [
      { name: "amount", expr: "amount" },
      { name: "currency", expr: "currency" },
    ],
  },
  {
    text: "Page {current} of {total}",
    vars: [
      { name: "current", expr: "current" },
      { name: "total", expr: "total" },
    ],
  },
  {
    text: "{name} commented on your photo",
    vars: [{ name: "name", expr: "name" }],
  },
  {
    text: "Hi {name}, your order is on the way",
    vars: [{ name: "name", expr: "name" }],
  },
  {
    text: "{count} items in your cart",
    vars: [{ name: "count", expr: "count" }],
  },
  {
    text: "Search results for {query}",
    vars: [{ name: "query", expr: "query" }],
  },
  {
    text: "Showing {count} of {total} results",
    vars: [
      { name: "count", expr: "count" },
      { name: "total", expr: "total" },
    ],
  },
  {
    text: "Last updated by {name} at {time}",
    vars: [
      { name: "name", expr: "name" },
      { name: "time", expr: "time" },
    ],
  },
  {
    text: "Delivered to {address}",
    vars: [{ name: "address", expr: "address" }],
  },
  {
    text: "Scheduled for {date} at {time}",
    vars: [
      { name: "date", expr: "date" },
      { name: "time", expr: "time" },
    ],
  },
  { text: "Replied to {name}", vars: [{ name: "name", expr: "name" }] },
  {
    text: "{name} started following you",
    vars: [{ name: "name", expr: "name" }],
  },
  { text: "Welcome aboard, {name}!", vars: [{ name: "name", expr: "name" }] },
  { text: "Updated {count} records", vars: [{ name: "count", expr: "count" }] },
  { text: "Discount code: {code}", vars: [{ name: "code", expr: "code" }] },
  {
    text: "{name} invited you to join {team}",
    vars: [
      { name: "name", expr: "name" },
      { name: "team", expr: "team" },
    ],
  },
  {
    text: "Your plan: {plan} (renews {date})",
    vars: [
      { name: "plan", expr: "plan" },
      { name: "date", expr: "date" },
    ],
  },
  {
    text: "Error in file {filename} at line {line}",
    vars: [
      { name: "filename", expr: "filename" },
      { name: "line", expr: "line" },
    ],
  },
  {
    text: "Logged in from {location} using {device}",
    vars: [
      { name: "location", expr: "location" },
      { name: "device", expr: "device" },
    ],
  },
  {
    text: "Reminder: {event} starts in {time}",
    vars: [
      { name: "event", expr: "event" },
      { name: "time", expr: "time" },
    ],
  },
  {
    text: "Transfer {amount} to {recipient}",
    vars: [
      { name: "amount", expr: "amount" },
      { name: "recipient", expr: "recipient" },
    ],
  },
  {
    text: "Version {version} released on {date}",
    vars: [
      { name: "version", expr: "version" },
      { name: "date", expr: "date" },
    ],
  },
  {
    text: "Deployed to {environment} by {name}",
    vars: [
      { name: "environment", expr: "environment" },
      { name: "name", expr: "name" },
    ],
  },
  {
    text: "Repository {repo} has {count} open issues",
    vars: [
      { name: "repo", expr: "repo" },
      { name: "count", expr: "count" },
    ],
  },
  {
    text: "Build {buildId} completed in {duration}",
    vars: [
      { name: "buildId", expr: "buildId" },
      { name: "duration", expr: "duration" },
    ],
  },
  {
    text: "{reviewer} approved your pull request",
    vars: [{ name: "reviewer", expr: "reviewer" }],
  },
  {
    text: "Pipeline {pipeline} failed at stage {stage}",
    vars: [
      { name: "pipeline", expr: "pipeline" },
      { name: "stage", expr: "stage" },
    ],
  },
  {
    text: "Webhook delivered to {endpoint} in {latency}",
    vars: [
      { name: "endpoint", expr: "endpoint" },
      { name: "latency", expr: "latency" },
    ],
  },
  {
    text: "Subscription for {plan} will renew on {date} for {amount}",
    vars: [
      { name: "plan", expr: "plan" },
      { name: "date", expr: "date" },
      { name: "amount", expr: "amount" },
    ],
  },
  {
    text: "Invitation sent to {email} for role {role}",
    vars: [
      { name: "email", expr: "email" },
      { name: "role", expr: "role" },
    ],
  },
  {
    text: "Comment by {author} on {date}: {preview}",
    vars: [
      { name: "author", expr: "author" },
      { name: "date", expr: "date" },
      { name: "preview", expr: "preview" },
    ],
  },
  // Complex expression interpolations (~30% of pool)
  {
    text: "Hello {0}, welcome to your dashboard",
    vars: [{ name: "0", expr: "user.name" }],
  },
  {
    text: "Your order total is {0}",
    vars: [{ name: "0", expr: "order.total" }],
  },
  {
    text: "Signed in as {0} ({1})",
    vars: [
      { name: "0", expr: "user.name" },
      { name: "1", expr: "user.email" },
    ],
  },
  {
    text: "You have {0} items in your cart",
    vars: [{ name: "0", expr: "items.length" }],
  },
  { text: "Subtotal: {0}", vars: [{ name: "0", expr: "cart.getSubtotal()" }] },
  {
    text: "Last activity: {0}",
    vars: [{ name: "0", expr: "formatDate(user.lastLogin)" }],
  },
  {
    text: "Shipping to {0}, {1}",
    vars: [
      { name: "0", expr: "address.city" },
      { name: "1", expr: "address.country" },
    ],
  },
  {
    text: "Posted by {0} in {1}",
    vars: [
      { name: "0", expr: "post.author.name" },
      { name: "1", expr: "post.category" },
    ],
  },
  {
    text: "Payment of {0} via {1}",
    vars: [
      { name: "0", expr: "formatCurrency(payment.amount)" },
      { name: "1", expr: "payment.method" },
    ],
  },
  {
    text: "{0} remaining on your plan",
    vars: [{ name: "0", expr: "formatBytes(storage.remaining)" }],
  },
  {
    text: "Project {0} owned by {1}",
    vars: [
      { name: "0", expr: "project.name" },
      { name: "1", expr: "project.owner.displayName" },
    ],
  },
  {
    text: "Next billing date: {0}",
    vars: [{ name: "0", expr: "formatDate(subscription.nextBillingDate)" }],
  },
  {
    text: "Created {0} by {1}",
    vars: [
      { name: "0", expr: "formatRelativeTime(item.createdAt)" },
      { name: "1", expr: "item.creator.name" },
    ],
  },
  {
    text: "Your team has {0} members across {1} projects",
    vars: [
      { name: "0", expr: "team.members.length" },
      { name: "1", expr: "team.projects.length" },
    ],
  },
  {
    text: "API key {0} last used {1}",
    vars: [
      { name: "0", expr: "apiKey.name" },
      { name: "1", expr: "formatDate(apiKey.lastUsed)" },
    ],
  },
  {
    text: "Running on {0} ({1} cores, {2} memory)",
    vars: [
      { name: "0", expr: "server.hostname" },
      { name: "1", expr: "server.cpuCount" },
      { name: "2", expr: "formatBytes(server.memory)" },
    ],
  },
  {
    text: "Commit {0} by {1} on branch {2}",
    vars: [
      { name: "0", expr: "commit.sha.slice(0, 7)" },
      { name: "1", expr: "commit.author.name" },
      { name: "2", expr: "commit.branch" },
    ],
  },
  {
    text: "Document {0} was last modified {1} by {2}",
    vars: [
      { name: "0", expr: "doc.title" },
      { name: "1", expr: "formatRelativeTime(doc.updatedAt)" },
      { name: "2", expr: "doc.lastEditor.name" },
    ],
  },
  {
    text: "Usage: {0} of {1} ({2}%)",
    vars: [
      { name: "0", expr: "formatBytes(usage.current)" },
      { name: "1", expr: "formatBytes(usage.limit)" },
      { name: "2", expr: "Math.round(usage.percentage)" },
    ],
  },
  // Longer interpolated messages
  {
    text: "Hi {name}, your recent order containing {count} items has been shipped and should arrive by {date}",
    vars: [
      { name: "name", expr: "name" },
      { name: "count", expr: "count" },
      { name: "date", expr: "date" },
    ],
  },
  {
    text: "The workspace {0} has exceeded its storage limit of {1}. Please remove unused files or upgrade your plan to continue uploading",
    vars: [
      { name: "0", expr: "workspace.name" },
      { name: "1", expr: "formatBytes(workspace.storageLimit)" },
    ],
  },
  {
    text: "Welcome back {0}! You have {1} unread notifications and {2} pending tasks since your last visit on {3}",
    vars: [
      { name: "0", expr: "user.name" },
      { name: "1", expr: "notifications.unreadCount" },
      { name: "2", expr: "tasks.pendingCount" },
      { name: "3", expr: "formatDate(user.lastLogin)" },
    ],
  },
  {
    text: "Build {0} for branch {1} failed after {2}. Check the logs for details or retry the pipeline from the failed stage",
    vars: [
      { name: "0", expr: "build.number" },
      { name: "1", expr: "build.branch" },
      { name: "2", expr: "formatDuration(build.duration)" },
    ],
  },
  {
    text: "Your subscription to {plan} will expire on {date}. Renew now to keep access to premium features and avoid losing your data",
    vars: [
      { name: "plan", expr: "plan" },
      { name: "date", expr: "date" },
    ],
  },
]

interface InterpolatedDef {
  text: string
  vars: { name: string; expr: string }[]
}

const PLURAL_MESSAGES = [
  {
    text: "{count, plural, one {# item} other {# items}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# notification} other {# notifications}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# message} other {# messages}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# file selected} other {# files selected}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# day remaining} other {# days remaining}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# comment} other {# comments}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# person likes this} other {# people like this}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# new update} other {# new updates}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# task completed} other {# tasks completed}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# minute ago} other {# minutes ago}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# follower} other {# followers}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# error found} other {# errors found}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# member online} other {# members online}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# download} other {# downloads}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# warning} other {# warnings}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# result matched} other {# results matched}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# change pending} other {# changes pending}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# star} other {# stars}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# contributor} other {# contributors}}",
    counterVar: "count",
  },
  {
    text: "{count, plural, one {# open issue} other {# open issues}}",
    counterVar: "count",
  },
]

export type MessageEntry =
  | { type: "simple"; text: string }
  | {
      type: "interpolated"
      text: string
      vars: { name: string; expr: string }[]
    }
  | { type: "plural"; text: string; counterVar: string }

const QUALIFIERS = [
  "for this project",
  "in your workspace",
  "on this device",
  "for your team",
  "in this organization",
  "for this account",
  "on the current plan",
  "in the selected region",
  "for this environment",
  "on this branch",
  "in the dashboard",
  "for the selected period",
  "within this namespace",
  "across all channels",
  "during this session",
  "for the active workspace",
  "in production",
  "for external users",
  "on mobile devices",
  "in the admin panel",
]

export function getMessageAtIndex(
  fileIndex: number,
  msgIndex: number,
  isPlural: boolean,
): MessageEntry {
  if (isPlural) {
    const idx = (fileIndex * 7 + msgIndex * 3) % PLURAL_MESSAGES.length
    const msg = PLURAL_MESSAGES[idx]!
    return { type: "plural", text: msg.text, counterVar: msg.counterVar }
  }

  const totalNonPlural = SIMPLE_MESSAGES.length + INTERPOLATED_MESSAGES.length
  const idx = (fileIndex * 7 + msgIndex * 13) % totalNonPlural

  if (idx < SIMPLE_MESSAGES.length) {
    const baseText = SIMPLE_MESSAGES[idx]!
    // Make ~85% of simple messages unique by appending a file+msg specific qualifier
    const shouldQualify = (fileIndex * 3 + msgIndex * 11) % 7 !== 0
    if (shouldQualify) {
      const qualIdx = (fileIndex + msgIndex * 7) % QUALIFIERS.length
      const variant = Math.floor(fileIndex / QUALIFIERS.length) % 50
      const suffix =
        variant > 0
          ? `${QUALIFIERS[qualIdx]} (${variant})`
          : QUALIFIERS[qualIdx]
      return { type: "simple", text: `${baseText} ${suffix}` }
    }
    return { type: "simple", text: baseText }
  }

  const interpIdx = idx - SIMPLE_MESSAGES.length
  const msg = INTERPOLATED_MESSAGES[interpIdx]!
  // Make ~85% of interpolated messages unique by adding a file-specific qualifier
  const shouldExtend = (fileIndex + msgIndex) % 7 !== 0
  if (shouldExtend) {
    const qualIdx = (fileIndex + msgIndex * 3) % QUALIFIERS.length
    const variant = Math.floor(fileIndex / QUALIFIERS.length) % 50
    const suffix =
      variant > 0
        ? ` ${QUALIFIERS[qualIdx]} (${variant})`
        : ` ${QUALIFIERS[qualIdx]}`
    return {
      type: "interpolated",
      text: msg.text + suffix,
      vars: msg.vars,
    }
  }
  return { type: "interpolated", text: msg.text, vars: msg.vars }
}

export function getVariableDeclarations(): string[] {
  return [
    `const name = "Alice"`,
    `const username = "alice_dev"`,
    `const count = 5`,
    `const amount = "$99.99"`,
    `const date = "2024-01-15"`,
    `const email = "alice@example.com"`,
    `const time = "14:30"`,
    `const team = "Engineering"`,
    `const id = "ORD-1234"`,
    `const currency = "USD"`,
    `const current = 3`,
    `const total = 10`,
    `const query = "dashboard"`,
    `const address = "123 Main St"`,
    `const code = "SAVE20"`,
    `const plan = "Pro"`,
    `const filename = "app.ts"`,
    `const line = 42`,
    `const location = "San Francisco"`,
    `const device = "Chrome on macOS"`,
    `const recipient = "Bob"`,
    `const version = "2.1.0"`,
    `const environment = "production"`,
    `const repo = "js-lingui"`,
    `const buildId = "build-5678"`,
    `const duration = "3m 42s"`,
    `const reviewer = "Charlie"`,
    `const pipeline = "deploy-main"`,
    `const stage = "test"`,
    `const endpoint = "https://api.example.com/hooks"`,
    `const latency = "120ms"`,
    `const role = "editor"`,
    `const author = "Dana"`,
    `const preview = "Great work on this..."`,
    `const event = "Team standup"`,
    `const user = { name: "Alice", email: "alice@example.com", lastLogin: new Date() }`,
    `const order = { total: 149.99, id: "ORD-5678" }`,
    `const items = [{ id: 1 }, { id: 2 }, { id: 3 }]`,
    `const cart = { getSubtotal: () => 89.99 }`,
    `const post = { author: { name: "Eve" }, category: "Engineering" }`,
    `const payment = { amount: 29.99, method: "Visa" }`,
    `const storage = { remaining: 524288000 }`,
    `const project = { name: "lingui", owner: { displayName: "Team" } }`,
    `const subscription = { nextBillingDate: new Date() }`,
    `const item = { createdAt: new Date(), creator: { name: "Frank" } }`,
    `const apiKey = { name: "production-key", lastUsed: new Date() }`,
    `const server = { hostname: "web-01", cpuCount: 4, memory: 8589934592 }`,
    `const commit = { sha: "abc1234def5678", author: { name: "Grace" }, branch: "main" }`,
    `const doc = { title: "README", updatedAt: new Date(), lastEditor: { name: "Hank" } }`,
    `const usage = { current: 75000000, limit: 100000000, percentage: 75 }`,
    `const workspace = { name: "acme-corp", storageLimit: 10737418240 }`,
    `const notifications = { unreadCount: 7 }`,
    `const tasks = { pendingCount: 3 }`,
    `const build = { number: 142, branch: "feature/auth", duration: 180000 }`,
    `const formatDate = (d: any) => "Jan 15, 2024"`,
    `const formatCurrency = (n: any) => "$" + n`,
    `const formatBytes = (n: any) => n + " bytes"`,
    `const formatRelativeTime = (d: any) => "2 hours ago"`,
    `const formatDuration = (ms: any) => "3m 42s"`,
  ]
}
