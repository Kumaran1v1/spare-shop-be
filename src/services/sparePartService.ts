import { SparePart, ISparePart } from '../models/SparePart';
import { CreateSparePartInput, UpdateSparePartInput } from '../validators/sparePartValidator';

export interface SparePartQueryParams {
  search?: string;
  category?: string;
  brand?: string;
  machineType?: string;
  status?: string; // 'ALL' | 'ACTIVE' | 'INACTIVE' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  page?: number;
  limit?: number;
}

export class SparePartService {
  static async getAll(params: SparePartQueryParams, userId: string) {
    const {
      search,
      category,
      brand,
      machineType,
      status,
      page = 1,
      limit = 10,
    } = params;

    // Scope queries to the logged-in user for multi-tenant data separation
    const filter: any = { createdBy: userId };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { partNumber: searchRegex },
        { name: searchRegex },
        { category: searchRegex },
        { brand: searchRegex },
        { machineType: searchRegex },
      ];
    }

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (machineType) filter.machineType = machineType;

    if (status) {
      if (status === 'ACTIVE') filter.isActive = true;
      if (status === 'INACTIVE') filter.isActive = false;
      if (status === 'OUT_OF_STOCK') filter.currentStock = 0;
      if (status === 'LOW_STOCK') {
        filter.$expr = {
          $and: [
            { $lte: ['$currentStock', '$minimumStock'] },
            { $gt: ['$currentStock', 0] },
          ],
        };
      }
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      SparePart.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SparePart.countDocuments(filter),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getById(id: string, userId: string) {
    const spare = await SparePart.findOne({ _id: id, createdBy: userId }).lean();
    if (!spare) {
      throw { statusCode: 404, message: 'Spare part not found' };
    }
    return spare;
  }

  static async create(data: any, userId: string) {
    const existing = await SparePart.findOne({
      partNumber: data.partNumber.toUpperCase(),
      createdBy: userId,
    }).lean();

    if (existing) {
      throw { statusCode: 409, message: `Part number '${data.partNumber}' already exists in your catalog` };
    }

    const newSpare = new SparePart({
      ...data,
      partNumber: data.partNumber.toUpperCase(),
      currentStock: 0, // Stock modified only via Purchases
      createdBy: userId,
    });

    return await newSpare.save();
  }

  static async update(id: string, data: UpdateSparePartInput, userId: string) {
    const spare = await SparePart.findOne({ _id: id, createdBy: userId });
    if (!spare) {
      throw { statusCode: 404, message: 'Spare part not found' };
    }

    if (data.partNumber && data.partNumber.toUpperCase() !== spare.partNumber) {
      const existing = await SparePart.findOne({
        partNumber: data.partNumber.toUpperCase(),
        createdBy: userId,
        _id: { $ne: id },
      }).lean();
      if (existing) {
        throw { statusCode: 409, message: `Part number '${data.partNumber}' already exists in your catalog` };
      }
    }

    delete (data as any).currentStock;

    Object.assign(spare, {
      ...data,
      ...(data.partNumber && { partNumber: data.partNumber.toUpperCase() }),
    });

    return await spare.save();
  }

  static async toggleStatus(id: string, userId: string) {
    const spare = await SparePart.findOne({ _id: id, createdBy: userId });
    if (!spare) {
      throw { statusCode: 404, message: 'Spare part not found' };
    }

    spare.isActive = !spare.isActive;
    return await spare.save();
  }
}
