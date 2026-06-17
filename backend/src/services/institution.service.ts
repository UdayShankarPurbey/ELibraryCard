import { Institution } from "../models/institution.model.js";
import { Permission } from "../models/permission.model.js";
import { User } from "../models/user.model.js";
import { Role } from "../models/role.model.js";
import { BookFieldDefinition } from "../models/bookFieldDefinition.model.js";
import { Book } from "../models/book.model.js";
import { BookCopy } from "../models/bookCopy.model.js";
import { BookIssue } from "../models/bookIssue.model.js";
import { ApiError } from "../utils/ApiError.js";
import { slugify } from "../utils/slugify.js";
import { withTransaction } from "../config/db.js";
import { DEFAULT_PERMISSION_TEMPLATE, DEFAULT_BOOK_FIELDS_TEMPLATE } from "../utils/constants.js";
import type {
  CreateInstitutionInput,
  UpdateInstitutionInput,
  ListInstitutionsQuery,
} from "../validators/institution.validator.js";

const ensureUniqueSlug = async (base: string, excludeId?: string): Promise<string> => {
  const root = slugify(base);
  let candidate = root;
  let n = 1;
  for (;;) {
    const existing = await Institution.findOne({ slug: candidate }).select("_id");
    if (!existing || (excludeId && String(existing._id) === excludeId)) break;
    n += 1;
    candidate = `${root}-${n}`;
  }
  return candidate;
};

export const createInstitution = async (input: CreateInstitutionInput) => {
  const slug = await ensureUniqueSlug(input.slug || input.name);
  return withTransaction(async (session) => {
    const opts = session ? { session } : {};
    const [institution] = await Institution.create(
      [{ name: input.name, slug, status: input.status ?? "active" }],
      opts,
    );
    if (input.seedPermissions !== false) {
      await Permission.insertMany(
        DEFAULT_PERMISSION_TEMPLATE.map((p) => ({ ...p, institution: institution._id })),
        opts,
      );
    }
    if (input.seedBookFields !== false) {
      await BookFieldDefinition.insertMany(
        DEFAULT_BOOK_FIELDS_TEMPLATE.map((f, i) => ({
          ...f,
          institution: institution._id,
          sortOrder: i,
        })),
        opts,
      );
    }
    return institution;
  });
};

export const listInstitutions = async (q: ListInstitutionsQuery) => {
  const page = q.page ?? 1;
  const limit = q.limit ?? 20;
  const filter: Record<string, unknown> = {};
  if (q.status) filter.status = q.status;
  if (q.search) filter.name = { $regex: q.search, $options: "i" };

  const [items, total] = await Promise.all([
    Institution.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Institution.countDocuments(filter),
  ]);
  return { items, total, page, limit };
};

export const getInstitution = async (id: string) => {
  const institution = await Institution.findById(id);
  if (!institution) throw new ApiError(404, "Institution not found");
  return institution;
};

export const updateInstitution = async (id: string, input: UpdateInstitutionInput) => {
  const update: Record<string, unknown> = {};
  if (input.name !== undefined) update.name = input.name;
  if (input.status !== undefined) update.status = input.status;
  if (input.slug !== undefined) update.slug = await ensureUniqueSlug(input.slug, id);

  const institution = await Institution.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
  if (!institution) throw new ApiError(404, "Institution not found");
  return institution;
};

export const deleteInstitution = async (id: string) => {
  const institution = await Institution.findById(id);
  if (!institution) throw new ApiError(404, "Institution not found");

  await withTransaction(async (session) => {
    const opts = session ? { session } : {};
    const instId = institution._id;
    await User.deleteMany({ institution: instId }, opts);
    await Role.deleteMany({ institution: instId }, opts);
    await Permission.deleteMany({ institution: instId }, opts);
    await BookFieldDefinition.deleteMany({ institution: instId }, opts);
    await BookCopy.deleteMany({ institution: instId }, opts);
    await BookIssue.deleteMany({ institution: instId }, opts);
    await Book.deleteMany({ institution: instId }, opts);
    await institution.deleteOne(opts);
  });
};
