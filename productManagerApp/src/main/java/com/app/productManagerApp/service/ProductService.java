package com.app.productManagerApp.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.app.productManagerApp.model.Product;
import com.app.productManagerApp.repository.ProductRepo;

@Service
public class ProductService {

    @Autowired
    ProductRepo productRepo;
    
    @Cacheable(value = "products", key = "'all'")
    public List<Product> getProducts() {
        return productRepo.findAll();
    }

    public Product getProductById(int id) {
        return productRepo.findById(id).orElse(null);
    }

    @CacheEvict(value = "products", key = "'all'")
    @CachePut(value = "product", key = "#result.id")
    public Product createProduct(Product product) {
        return productRepo.save(product);
    }
    
    @CacheEvict(value = "products", key = "'all'")
    @CachePut(value = "product", key = "#id")
    public Product updateProduct(int id, Product updatedProduct) {
        
        Product existingProduct = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setBrand(updatedProduct.getBrand());
        existingProduct.setQuantity(updatedProduct.getQuantity());
        existingProduct.setColors(updatedProduct.getColors());
        existingProduct.setReleaseDate(updatedProduct.getReleaseDate());
        existingProduct.setAvailable(updatedProduct.isAvailable());

        // Preserves existing imageData/imageName/imageType automatically
        return productRepo.save(existingProduct);
    }

    @Caching(evict = {
        @CacheEvict(value = "products", key = "'all'"),
        @CacheEvict(value = "product", key = "#id")
    })    
    public void deleteProduct(int id) {
        productRepo.deleteById(id);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "products", key = "'all'"),
        @CacheEvict(value = "product", key = "#id")
    })
    public Product uploadImage(int id, MultipartFile imageFile) throws Exception {
        
        // 1. Guard against empty files
        if (imageFile == null || imageFile.isEmpty()) {
            throw new IllegalArgumentException("Image file cannot be empty");
        }

        // 2. Fetch or throw 404-friendly exception
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        // 3. Update image details
        product.setImageName(imageFile.getOriginalFilename());
        product.setImageType(imageFile.getContentType());
        product.setImageData(imageFile.getBytes());
        return productRepo.save(product);

    }

    public List<Product> searchProducts(String keyword) {
        return productRepo.searchProducts(keyword);
    }
}


