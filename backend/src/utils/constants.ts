export const USER_STATUS = { ACTIVE: "active", INACTIVE: "inactive" } as const;

export const INSTITUTION_STATUS = { ACTIVE: "active", SUSPENDED: "suspended" } as const;

export const BOOK_STATUS = { ACTIVE: "active", ARCHIVED: "archived" } as const;

export const COPY_STATUS = {
  AVAILABLE: "available",
  ISSUED: "issued",
  LOST: "lost",
  DAMAGED: "damaged",
} as const;

export const ISSUE_STATUS = {
  ISSUED: "issued",
  RETURNED: "returned",
  OVERDUE: "overdue",
  LOST: "lost",
} as const;

export const FIELD_DATA_TYPES = ["string", "number", "boolean", "date", "enum"] as const;

export const DEFAULT_LOAN_DAYS = 14;
export const FINE_PER_DAY = 5;

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
  { key: "bookfield.manage", label: "Manage book fields", group: "catalog" },
  { key: "issue.create", label: "Issue books", group: "circulation" },
  { key: "issue.return", label: "Return books", group: "circulation" },
  { key: "issue.view", label: "View issues", group: "circulation" },
];

export const TOKEN_COOKIES = {
  ACCESS: "accessToken",
  REFRESH: "refreshToken",
} as const;

export const CACHE_KEYS = {
  userPermissions: (userId: string) => `perms:${userId}`,
  institutionPermissions: (institutionId: string) => `instperms:${institutionId}`,
  bookFields: (institutionId: string) => `bookfields:${institutionId}`,
};

export const CACHE_TTL = {
  PERMISSIONS: 60 * 10,
  BOOK_FIELDS: 60 * 30,
};
