import bcrypt from "bcrypt";
import type { Types } from "mongoose";
import { Institution } from "../models/institution.model.js";
import { Permission } from "../models/permission.model.js";
import { Role } from "../models/role.model.js";
import { User } from "../models/user.model.js";
import { DEFAULT_PERMISSION_TEMPLATE } from "../utils/constants.js";
import { logger } from "../utils/logger.js";

// Permission key sets that compose each seeded role, built from DEFAULT_PERMISSION_TEMPLATE.
const ALL_KEYS = DEFAULT_PERMISSION_TEMPLATE.map((p) => p.key);
const LIBRARIAN_KEYS = [
  "book.view",
  "book.create",
  "book.update",
  "book.delete",
  "copy.manage",
  "issue.create",
  "issue.return",
  "issue.view",
  "user.view", // needed to look up members when issuing
];
const MEMBER_KEYS = ["book.view", "issue.view"]; // browse catalog + view own loans

const ROLE_TEMPLATES = [
  { name: "Institution Admin", description: "Full administrative access", permissions: ALL_KEYS },
  { name: "Librarian", description: "Catalog and circulation staff", permissions: LIBRARIAN_KEYS },
  { name: "Teacher", description: "Faculty member", permissions: MEMBER_KEYS },
  { name: "Student", description: "Student member", permissions: MEMBER_KEYS },
];

interface SeedUser {
  fullName: string;
  email: string;
  password: string;
  role: string; // role name within the institution
}

interface SeedInstitution {
  name: string;
  slug: string;
  users: SeedUser[];
}

// Platform-level super admins (no institution).
const SUPER_ADMINS = [
  { fullName: "Super Admin", email: "superadmin@elibraryOne.com", password: "superADMIN@123test" },
  { fullName: "Admin", email: "admin@elibraryOne.com", password: "ADMIN@123test" },
];

const INSTITUTIONS: SeedInstitution[] = [
  {
    name: "Institution One",
    slug: "institution-one",
    users: [
      { fullName: "Institution One Admin", email: "institution1@elibraryOne.com", password: "institution1@123test", role: "Institution Admin" },
      { fullName: "Librarian 1 (Institution 1)", email: "librarian1institution1@elibraryOne.com", password: "librarian1institution1@123test", role: "Librarian" },
      { fullName: "Librarian 2 (Institution 1)", email: "librarian2institution1@elibraryOne.com", password: "librarian2institution1@123test", role: "Librarian" },
      { fullName: "Teacher 1 (Institution 1)", email: "teacher1institution1@elibraryOne.com", password: "teacher1institution1@123test", role: "Teacher" },
      { fullName: "Student 1 (Institution 1)", email: "student1institution1@elibraryOne.com", password: "student1institution1@123test", role: "Student" },
      { fullName: "Student 2 (Institution 1)", email: "student2institution1@elibraryOne.com", password: "student2institution1@123test", role: "Student" },
    ],
  },
  {
    name: "Institution Two",
    slug: "institution-two",
    users: [
      { fullName: "Institution Two Admin", email: "institution2@elibraryOne.com", password: "institution2@123test", role: "Institution Admin" },
      { fullName: "Librarian 1 (Institution 2)", email: "librarian1institution2@elibraryOne.com", password: "librarian1institution2@123test", role: "Librarian" },
      { fullName: "Teacher 1 (Institution 2)", email: "teacher1institution2@elibraryOne.com", password: "teacher1institution2@123test", role: "Teacher" },
      { fullName: "Teacher 2 (Institution 2)", email: "teacher2institution2@elibraryOne.com", password: "teacher2institution2@123test", role: "Teacher" },
      { fullName: "Student 1 (Institution 2)", email: "student1institution2@elibraryOne.com", password: "student1institution2@123test", role: "Student" },
      { fullName: "Student 2 (Institution 2)", email: "student2institution2@elibraryOne.com", password: "student2institution2@123test", role: "Student" },
      { fullName: "Student 3 (Institution 2)", email: "student3institution2@elibraryOne.com", password: "student3institution2@123test", role: "Student" },
      { fullName: "Student 4 (Institution 2)", email: "student4institution2@elibraryOne.com", password: "student4institution2@123test", role: "Student" },
    ],
  },
];

const counts = { institutions: 0, permissions: 0, roles: 0, users: 0 };

const ensureUser = async (
  data: { fullName: string; email: string; password: string },
  extra: { isSuperAdmin?: boolean; institution?: Types.ObjectId | null; roles?: Types.ObjectId[] },
) => {
  const email = data.email.toLowerCase();
  if (await User.exists({ email })) return;
  const passwordHash = await bcrypt.hash(data.password, 10);
  await User.create({
    fullName: data.fullName,
    email,
    passwordHash,
    isSuperAdmin: extra.isSuperAdmin ?? false,
    institution: extra.institution ?? null,
    roles: extra.roles ?? [],
  });
  counts.users += 1;
};

const ensurePermissions = async (institutionId: Types.ObjectId) => {
  const existing = await Permission.find({ institution: institutionId }).select("key");
  const have = new Set(existing.map((p) => p.key));
  const toAdd = DEFAULT_PERMISSION_TEMPLATE.filter((p) => !have.has(p.key)).map((p) => ({
    ...p,
    institution: institutionId,
  }));
  if (toAdd.length) {
    await Permission.insertMany(toAdd);
    counts.permissions += toAdd.length;
  }
};

// Returns a map of role name -> role _id for the institution.
const ensureRoles = async (institutionId: Types.ObjectId) => {
  const byName = new Map<string, Types.ObjectId>();
  for (const tpl of ROLE_TEMPLATES) {
    const existing = await Role.findOne({ institution: institutionId, name: tpl.name });
    if (existing) {
      byName.set(tpl.name, existing._id as Types.ObjectId);
      continue;
    }
    const role = await Role.create({ institution: institutionId, ...tpl });
    byName.set(tpl.name, role._id as Types.ObjectId);
    counts.roles += 1;
  }
  return byName;
};

export const seedData = async () => {
  for (const admin of SUPER_ADMINS) {
    await ensureUser(admin, { isSuperAdmin: true, institution: null, roles: [] });
  }

  for (const inst of INSTITUTIONS) {
    let institution = await Institution.findOne({ slug: inst.slug });
    if (!institution) {
      institution = await Institution.create({ name: inst.name, slug: inst.slug });
      counts.institutions += 1;
    }
    const institutionId = institution._id as Types.ObjectId;
    await ensurePermissions(institutionId);
    const roleIds = await ensureRoles(institutionId);

    for (const u of inst.users) {
      const roleId = roleIds.get(u.role);
      await ensureUser(u, { institution: institutionId, roles: roleId ? [roleId] : [] });
    }
  }

  const created =
    counts.institutions + counts.permissions + counts.roles + counts.users > 0;
  if (created) {
    logger.info(
      `Seed complete — institutions:${counts.institutions} permissions:${counts.permissions} roles:${counts.roles} users:${counts.users}`,
    );
  } else {
    logger.info("Seed skipped — demo data already present");
  }
};
