export const USER_STATUS = { ACTIVE: "active", INACTIVE: "inactive" };

export const INSTITUTION_STATUS = { ACTIVE: "active", SUSPENDED: "suspended" };

export const BOOK_STATUS = { ACTIVE: "active", ARCHIVED: "archived" };

export const COPY_STATUS = {
  AVAILABLE: "available",
  ISSUED: "issued",
  LOST: "lost",
  DAMAGED: "damaged",
};

export const ISSUE_STATUS = {
  ISSUED: "issued",
  RETURNED: "returned",
  OVERDUE: "overdue",
  LOST: "lost",
};

export const FIELD_DATA_TYPES = ["string", "number", "boolean", "date", "enum"];

export const DEFAULT_PERMISSION_TEMPLATE = [
  { key: "role.manage", label: "Manage roles", group: "access" },
  { key: "role.view", label: "View roles", group: "access" },
  { key: "user.manage", label: "Manage users", group: "users" },
  { key: "user.view", label: "View users", group: "users" },
  { key: "book.create", label: "Add books", group: "catalog" },
  { key: "book.update", label: "Edit books", group: "catalog" },
  { key: "book.delete", label: "Delete books", group: "catalog" },
  { key: "book.view", label: "View books", group: "catalog" },
  { key: "copy.manage", label: "Manage copies", group: "catalog" },
  { key: "issue.create", label: "Issue books", group: "circulation" },
  { key: "issue.return", label: "Return books", group: "circulation" },
  { key: "issue.view", label: "View issues", group: "circulation" },
];

export const TOKEN_COOKIES = {
  ACCESS: "accessToken",
  REFRESH: "refreshToken",
};

export const CACHE_KEYS = {
  userPermissions: (userId) => `perms:${userId}`,
  institutionPermissions: (institutionId) => `instperms:${institutionId}`,
  bookFields: (institutionId) => `bookfields:${institutionId}`,
};

export const CACHE_TTL = {
  PERMISSIONS: 60 * 10,
  BOOK_FIELDS: 60 * 30,
};
