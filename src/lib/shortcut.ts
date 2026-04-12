export const SHORTCUT_HINT =
  "Single letter/number (a, 1), combination (a+b), or Cmd+letter/number (cmd+a)";

export const SHORTCUT_VALIDATION_ERROR =
  "Invalid shortcut. Only letters, numbers, combinations (a+b), or Cmd+letter/number (cmd+a) are allowed.";

export function isValidShortcut(sc: string): boolean {
  if (!sc) return true;
  if (/^cmd\+[a-z0-9]$/i.test(sc)) return true;
  if (/^[a-z0-9](\+[a-z0-9])*$/i.test(sc)) return true;
  return false;
}
