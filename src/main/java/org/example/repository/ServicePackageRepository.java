package org.example.repository;

import org.example.entity.ServicePackage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServicePackageRepository extends MongoRepository<ServicePackage, String> {

    List<ServicePackage> findByServiceId(String serviceId);

    List<ServicePackage> findByServiceIdAndActiveTrue(String serviceId, Boolean active);

    List<ServicePackage> findByActiveTrue();
}

