package com.app.productManagerApp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.app.productManagerApp.dto.ProductDTO;
import com.app.productManagerApp.model.Product;

@Service
public class KafkaService {

    private String consumptionMessage;

    @Autowired(required = false)
    private KafkaTemplate<String, ProductDTO> kafkaTemplate;

    @Async
    public void publish(Product product){

        ProductDTO productDTO = ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .brand(product.getBrand())
                .quantity(product.getQuantity())
                .build();
        try {
        kafkaTemplate.send("product-topic", productDTO);
        }catch(Exception e){
            System.out.println(e.getMessage());
        }
    }

    @KafkaListener(topics = "product-topic", groupId = "product-group-1")
    public void consume(ProductDTO product){
        consumptionMessage = "Product added with product name: " + product.getName();
    }

    public String getMessage(){
        return consumptionMessage;
    }
}
