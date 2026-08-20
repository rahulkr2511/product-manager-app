package com.app.productManagerApp.controller;

import com.app.productManagerApp.service.KafkaService;
import com.app.productManagerApp.service.ProductService;
import com.app.productManagerApp.model.Product;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {
    private final ProductService productService;
    private final KafkaService kafkaService;

    public ProductController(ProductService productService, KafkaService kafkaService) {
        this.productService = productService;
        this.kafkaService = kafkaService;
    }

    @GetMapping("product-manager/products")
    public ResponseEntity<List<Product>> getProducts() {
        String message = kafkaService.getMessage();
        System.out.println("Kafka: " + message);
        return ResponseEntity.ok(productService.getProducts());
    }

    @GetMapping("product-manager/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable int id) {
        Product product = productService.getProductById(id);
        if (product != null) {
            return ResponseEntity.ok(product);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("product-manager/addproduct")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product savedProduct = productService.createProduct(product);
        kafkaService.publish(savedProduct);
        return ResponseEntity.status(201).body(savedProduct);
    }

    @PostMapping("product-manager/upload-image/{id}")
    public ResponseEntity<String> uploadImage(@PathVariable int id, @RequestParam("imageFile") MultipartFile imageFile) {
        Product result;
        try {
            result = productService.uploadImage(id, imageFile);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Image upload failed: " + e.getMessage());
        }
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.status(200).body("Image uploaded successfully");
    }

    @PutMapping("product-manager/updateproduct/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable int id, @RequestBody Product updatedProduct) {
        try {
        Product updated = productService.updateProduct(id, updatedProduct);
        return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("product-manager/deleteproduct/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable int id) {
        Product existingProduct = productService.getProductById(id);
        if (existingProduct == null) {
            return ResponseEntity.notFound().build();
        }
        productService.deleteProduct(id);
        return ResponseEntity.ok().body("Product deleted successfully");
    }


    @GetMapping("product-manager/products/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword) {
        List<Product> products = productService.searchProducts(keyword);
        return ResponseEntity.ok(products);
    }   

}
