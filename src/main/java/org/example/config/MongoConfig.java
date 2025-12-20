package org.example.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoAuditing
@EnableMongoRepositories(basePackages = "org.example.repository")
public class MongoConfig {
    // MongoDB configuration with auditing enabled
    // This enables @CreatedDate and @LastModifiedDate annotations
}

