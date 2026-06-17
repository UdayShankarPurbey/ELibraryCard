import { Book } from "../models/book.model.js";
import { BookCopy } from "../models/bookCopy.model.js";
import { Institution } from "../models/institution.model.js";
import { ApiError } from "../utils/ApiError.js";

const BARCODE_SEQ_PAD = 5;

const assertBook = async (institutionId: string, bookId: string) => {
  const exists = await Book.exists({ _id: bookId, institution: institutionId });
  if (!exists) throw new ApiError(404, "Book not found");
};

export const listCopies = async (institutionId: string, bookId: string) => {
  await assertBook(institutionId, bookId);
  return BookCopy.find({ book: bookId, institution: institutionId }).sort({ createdAt: 1 });
};

export const addCopies = async (institutionId: string, bookId: string, barcodes: string[]) => {
  await assertBook(institutionId, bookId);
  const unique = [...new Set(barcodes)];
  const docs = unique.map((barcode) => ({ book: bookId, institution: institutionId, barcode }));
  return BookCopy.insertMany(docs, { ordered: true });
};

export const addCopiesByQuantity = async (
  institutionId: string,
  bookId: string,
  quantity: number,
) => {
  await assertBook(institutionId, bookId);
  for (let attempt = 0; attempt < 5; attempt++) {
    const inst = await Institution.findByIdAndUpdate(
      institutionId,
      { $inc: { "settings.barcodeSeq": quantity } },
      { new: true },
    ).select("settings");
    if (!inst) throw new ApiError(404, "Institution not found");

    const end = inst.settings.barcodeSeq;
    const prefix = inst.settings.barcodePrefix ?? "";
    const barcodes: string[] = [];
    for (let n = end - quantity + 1; n <= end; n++) {
      barcodes.push(`${prefix}${String(n).padStart(BARCODE_SEQ_PAD, "0")}`);
    }

    if (await BookCopy.exists({ barcode: { $in: barcodes } })) continue;
    const docs = barcodes.map((barcode) => ({ book: bookId, institution: institutionId, barcode }));
    return BookCopy.insertMany(docs, { ordered: true });
  }
  throw new ApiError(409, "Could not generate unique barcodes; set a distinct barcode prefix");
};

export const updateCopyStatus = async (
  institutionId: string,
  bookId: string,
  copyId: string,
  status: "available" | "lost" | "damaged",
) => {
  const copy = await BookCopy.findOne({ _id: copyId, book: bookId, institution: institutionId });
  if (!copy) throw new ApiError(404, "Copy not found");
  if (copy.status === "issued") {
    throw new ApiError(409, "Copy is issued; manage it through circulation");
  }
  copy.status = status;
  await copy.save();
  return copy;
};

export const deleteCopy = async (institutionId: string, bookId: string, copyId: string) => {
  const copy = await BookCopy.findOne({ _id: copyId, book: bookId, institution: institutionId });
  if (!copy) throw new ApiError(404, "Copy not found");
  if (copy.status === "issued") throw new ApiError(409, "Cannot delete an issued copy");
  await copy.deleteOne();
};
