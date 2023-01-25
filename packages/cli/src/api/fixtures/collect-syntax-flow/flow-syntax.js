// @flow
function truthy(a: ?string, b: ?string): boolean %checks {
  return a != null && b != null;
}

