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
]

const INTERPOLATED_MESSAGES = [
  { text: "Hello {name}, welcome back", vars: ["name"] },
  { text: "Logged in as {username}", vars: ["username"] },
  { text: "Your balance is {amount}", vars: ["amount"] },
  { text: "Last login: {date}", vars: ["date"] },
  { text: "Sent to {email}", vars: ["email"] },
  { text: "{name} liked your post", vars: ["name"] },
  { text: "Shared by {username} on {date}", vars: ["username", "date"] },
  { text: "Invoice #{id} for {amount}", vars: ["id", "amount"] },
  { text: "Welcome to {team}, {name}", vars: ["team", "name"] },
  { text: "Expires on {date}", vars: ["date"] },
  { text: "Created by {name}", vars: ["name"] },
  { text: "Assigned to {username}", vars: ["username"] },
  { text: "Total: {amount} ({currency})", vars: ["amount", "currency"] },
  { text: "Page {current} of {total}", vars: ["current", "total"] },
  { text: "{name} commented on your photo", vars: ["name"] },
  { text: "Hi {name}, your order is on the way", vars: ["name"] },
  { text: "{count} items in your cart", vars: ["count"] },
  { text: "Search results for {query}", vars: ["query"] },
  { text: "Showing {count} of {total} results", vars: ["count", "total"] },
  { text: "Last updated by {name} at {time}", vars: ["name", "time"] },
  { text: "Delivered to {address}", vars: ["address"] },
  { text: "Scheduled for {date} at {time}", vars: ["date", "time"] },
  { text: "Replied to {name}", vars: ["name"] },
  { text: "{name} started following you", vars: ["name"] },
  { text: "Welcome aboard, {name}!", vars: ["name"] },
  { text: "Updated {count} records", vars: ["count"] },
  { text: "Discount code: {code}", vars: ["code"] },
  { text: "{name} invited you to join {team}", vars: ["name", "team"] },
  { text: "Your plan: {plan} (renews {date})", vars: ["plan", "date"] },
  {
    text: "Error in file {filename} at line {line}",
    vars: ["filename", "line"],
  },
]

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
]

export type MessageEntry =
  | { type: "simple"; text: string }
  | { type: "interpolated"; text: string; vars: string[] }
  | { type: "plural"; text: string; counterVar: string }

export function getMessageAtIndex(
  index: number,
  isPlural: boolean,
): MessageEntry {
  if (isPlural) {
    const pluralIdx = index % PLURAL_MESSAGES.length
    const msg = PLURAL_MESSAGES[pluralIdx]!
    return { type: "plural", text: msg.text, counterVar: msg.counterVar }
  }

  const totalNonPlural = SIMPLE_MESSAGES.length + INTERPOLATED_MESSAGES.length
  const normalizedIdx = index % totalNonPlural

  if (normalizedIdx < SIMPLE_MESSAGES.length) {
    return { type: "simple", text: SIMPLE_MESSAGES[normalizedIdx]! }
  }

  const interpIdx = normalizedIdx - SIMPLE_MESSAGES.length
  const msg = INTERPOLATED_MESSAGES[interpIdx]!
  return { type: "interpolated", text: msg.text, vars: msg.vars }
}
