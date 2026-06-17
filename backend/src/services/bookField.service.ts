import { BookFieldDefinition } from "../models/bookFieldDefinition.model.js";
import { Institution } from "../models/institution.model.js";
import { Book } from "../models/book.model.js";
import { ApiError } from "../utils/ApiError.js";
import { DEFAULT_BOOK_FIELDS_TEMPLATE } from "../utils/constants.js";
import type {
  CreateBookFieldInput,
  UpdateBookFieldInput,
  ReorderBookFieldsInput,
} from "../validators/bookField.validator.js";

const assertInstitution = async (institutionId: string) => {
  const exists = await Institution.exists({ _id: institutionId });
  if (!exists) throw new ApiError(404, "Institution not found");
};

export const listFields = async (institutionId: string) => {
  await assertInstitution(institutionId);
  return BookFieldDefinition.find({ institution: institutionId }).sort({
    sortOrder: 1,
    createdAt: 1,
  });
};

export const createField = async (institutionId: string, input: CreateBookFieldInput) => {
  await assertInstitution(institutionId);
  return BookFieldDefinition.create({ ...input, institution: institutionId });
};

export const seedDefaultFields = async (institutionId: string) => {
  await assertInstitution(institutionId);
  const existing = await BookFieldDefinition.find({ institution: institutionId }).select(
    "fieldKey sortOrder",
  );
  const have = new Set(existing.map((f) => f.fieldKey));
  let nextOrder = existing.reduce((max, f) => Math.max(max, f.sortOrder), -1) + 1;
  const toAdd = DEFAULT_BOOK_FIELDS_TEMPLATE.filter((f) => !have.has(f.fieldKey)).map((f) => ({
    ...f,
    institution: institutionId,
    sortOrder: nextOrder++,
  }));
  if (toAdd.length) await BookFieldDefinition.insertMany(toAdd);
  return listFields(institutionId);
};

export const updateField = async (
  institutionId: string,
  fieldId: string,
  input: UpdateBookFieldInput,
) => {
  const field = await BookFieldDefinition.findOneAndUpdate(
    { _id: fieldId, institution: institutionId },
    input,
    { new: true, runValidators: true },
  );
  if (!field) throw new ApiError(404, "Book field not found");
  return field;
};

export const deleteField = async (institutionId: string, fieldId: string) => {
  const field = await BookFieldDefinition.findOne({ _id: fieldId, institution: institutionId });
  if (!field) throw new ApiError(404, "Book field not found");
  await Book.updateMany(
    { institution: institutionId },
    { $unset: { [`data.${field.fieldKey}`]: "" } },
  );
  await field.deleteOne();
};

export const reorderFields = async (institutionId: string, input: ReorderBookFieldsInput) => {
  await assertInstitution(institutionId);
  await Promise.all(
    input.order.map((fieldId, index) =>
      BookFieldDefinition.updateOne(
        { _id: fieldId, institution: institutionId },
        { sortOrder: index },
      ),
    ),
  );
  return listFields(institutionId);
};
