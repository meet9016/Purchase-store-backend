const Product = require('../models/product.model');

// Service handles the business logic
class ProductService {
  async getAllProducts() {
    return await Product.find({});
  }

  async getProductById(id) {
    return await Product.findById(id);
  }

  async createProduct(data) {
    return await Product.create(data);
  }

  async updateProduct(id, data) {
    return await Product.findByIdAndUpdate(id, data, {
      new: true, // Return the updated document
      runValidators: true, // Run Mongoose validation
    });
  }

  async deleteProduct(id) {
    const product = await Product.findByIdAndDelete(id);
    return product !== null;
  }
}

module.exports = new ProductService();
