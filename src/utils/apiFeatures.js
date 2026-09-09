/**
 * Universal Query Pattern Helper
 * Handles Search, Filter, Sort, Pagination for any Mongoose Model
 */
class ApiFeatures {
  constructor(query, queryString, searchFields = []) {
    this.query = query;
    this.queryString = queryString;
    this.searchFields = searchFields;
    this.paginationInfo = null;
  }

  // 1. Search across designated fields (regex, case-insensitive)
  search() {
    if (this.queryString.search && this.searchFields.length > 0) {
      const searchRegex = { $regex: this.queryString.search, $options: 'i' };
      const searchConditions = this.searchFields.map((field) => ({
        [field]: searchRegex,
      }));
      this.query = this.query.find({ $or: searchConditions });
    }
    return this;
  }

  // 2. Filter by fields (excluding pagination/sort keywords)
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering: gte, gt, lte, lt
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // 3. Sorting (e.g., ?sort=-createdAt,priority)
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // 4. Pagination
  async paginate() {
    const page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(this.queryString.limit, 10) || 20));
    const skip = (page - 1) * limit;

    // Clone query to count total matching documents
    const countQuery = this.query.model.find(this.query.getFilter());
    const total = await countQuery.countDocuments();
    const totalPages = Math.ceil(total / limit) || 1;

    this.query = this.query.skip(skip).limit(limit);

    this.paginationInfo = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return this;
  }
}

module.exports = ApiFeatures;
