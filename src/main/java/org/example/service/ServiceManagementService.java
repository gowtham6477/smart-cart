package org.example.service;

import org.example.dto.ServicePackageRequest;
import org.example.dto.ServiceRequest;
import org.example.entity.Service;
import org.example.entity.ServicePackage;
import org.example.repository.ServicePackageRepository;
import org.example.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;

@org.springframework.stereotype.Service
@Slf4j
public class ServiceManagementService {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ServicePackageRepository packageRepository;

    public List<Service> getAllServices() {
        return serviceRepository.findAll();
    }

    public List<Service> getActiveServices() {
        return serviceRepository.findAllActiveOrNull();
    }

    public Service getServiceById(String id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));
    }

    public List<Service> getServicesByCategory(String category) {
        return serviceRepository.findByCategoryActiveOrNull(category);
    }

    // Fix all services with null active field
    @Transactional
    public int fixNullActiveFields() {
        List<Service> allServices = serviceRepository.findAll();
        int count = 0;
        for (Service service : allServices) {
            if (service.getActive() == null) {
                service.setActive(true);
                serviceRepository.save(service);
                count++;
            }
        }
        return count;
    }

    @Transactional
    public Service createService(ServiceRequest request) {
        Service service = new Service();
        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setCategory(request.getCategory());
        service.setImageUrl(request.getImageUrl());
        service.setActive(request.getActive() != null ? request.getActive() : true);
        service.setBasePrice(request.getBasePrice());
        service.setEstimatedDuration(request.getEstimatedDuration());
        service.setFeatures(request.getFeatures());
        return serviceRepository.save(service);
    }

    @Transactional
    public Service updateService(String id, ServiceRequest request) {
        Service service = getServiceById(id);
        log.info("Updating service {}: active in request={}, active in db={}", 
                 id, request.getActive(), service.getActive());
        
        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setCategory(request.getCategory());
        service.setImageUrl(request.getImageUrl());
        
        // Ensure active is always set to true if not explicitly false
        Boolean newActive = request.getActive();
        if (newActive == null) {
            newActive = service.getActive() != null ? service.getActive() : true;
        }
        service.setActive(newActive);
        log.info("Setting active to: {}", newActive);
        
        service.setBasePrice(request.getBasePrice());
        service.setEstimatedDuration(request.getEstimatedDuration());
        service.setFeatures(request.getFeatures());
        service.setUpdatedAt(LocalDateTime.now());
        
        Service saved = serviceRepository.save(service);
        log.info("Saved service active={}", saved.getActive());
        return saved;
    }

    @Transactional
    public void deleteService(String id) {
        serviceRepository.deleteById(id);
    }

    // Package Management
    public List<ServicePackage> getPackagesByServiceId(String serviceId) {
        return packageRepository.findByServiceIdAndActiveTrue(serviceId, true);
    }

    public ServicePackage getPackageById(String id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found with id: " + id));
    }

    @Transactional
    public ServicePackage createPackage(ServicePackageRequest request) {
        // Verify service exists
        getServiceById(request.getServiceId());

        ServicePackage pkg = new ServicePackage();
        pkg.setServiceId(request.getServiceId());
        pkg.setName(request.getName());
        pkg.setDescription(request.getDescription());
        pkg.setPrice(request.getPrice());
        pkg.setDuration(request.getDurationMinutes());
        pkg.setActive(request.getActive());

        return packageRepository.save(pkg);
    }

    @Transactional
    public ServicePackage updatePackage(String id, ServicePackageRequest request) {
        ServicePackage pkg = getPackageById(id);

        // Verify service exists
        getServiceById(request.getServiceId());

        pkg.setServiceId(request.getServiceId());
        pkg.setName(request.getName());
        pkg.setDescription(request.getDescription());
        pkg.setPrice(request.getPrice());
        pkg.setDuration(request.getDurationMinutes());
        pkg.setActive(request.getActive());
        pkg.setUpdatedAt(LocalDateTime.now());

        return packageRepository.save(pkg);
    }

    @Transactional
    public void deletePackage(String id) {
        packageRepository.deleteById(id);
    }
}

