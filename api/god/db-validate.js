export function validateDBAction(action) {
  const allowed = ["create_table", "add_column", "add_index"];

  if (!allowed.includes(action.type)) {
    throw new Error("ACTION_NOT_ALLOWED");
  }

  if (!/^[a-z_]+$/.test(action.table)) {
    throw new Error("INVALID_TABLE_NAME");
  }
}
