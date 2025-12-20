package org.example.service;

import org.example.dto.ServicePackageRequest;
import org.example.dto.ServiceRequest;
import org.example.entity.Service;
import org.example.entity.ServicePackage;
import org.example.repository.ServicePackageRepository;
import org.example.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@org.springframework.stereotype.Service
public class ServiceManagementService {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ServicePackageRepository packageRepository;

    public List<Service> getAllServices() {
        return serviceRepository.findAll();
    }

    public List<Service> getActiveServices() {
        return serviceRepository.findByActiveTrue();
    }

    public Service getServiceById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));
    }

    public List<Service> getServicesByCategory(String category) {
        return serviceRepository.findByCategoryAndActiveTrue(category);
    }

    @Transactional
    public Service createService(ServiceRequest request) {
        Service service = new Service();
        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setCategory(request.getCategory());
        service.setImageUrl(request.getImageUrl());
        service.setActive(request.getActive());
        return serviceRepository.save(service);
    }

    @Transactional
    public Service updateService(Long id, ServiceRequest request) {
        Service service = getServiceById(id);
        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setCategory(request.getCategory());
        service.setImageUrl(request.getImageUrl());
        service.setActive(request.getActive());
        return serviceRepository.save(service);
    }

    @Transactional
    public void deleteService(Long id) {
        serviceRepository.deleteById(id);
    }

    // Package Management
    public List<ServicePackage> getPackagesByServiceId(Long serviceId) {
        return packageRepository.findByServiceIdAndActiveTrue(serviceId);
    }

    public ServicePackage getPackageById(Long id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found with id: " + id));
    }

    @Transactional
    public ServicePackage createPackage(ServicePackageRequest request) {
        Service service = getServiceById(request.getServiceId());

        ServicePackage pkg = new ServicePackage();
        pkg.setService(service);
        pkg.setName(request.getName());
        pkg.setDescription(request.getDescription());
        pkg.setPrice(request.getPrice());
        pkg.setDurationMinutes(request.getDurationMinutes());
        pkg.setActive(request.getActive());

        return packageRepository.save(pkg);
    }

    @Transactional
    public ServicePackage updatePackage(Long id, ServicePackageRequest request) {
        ServicePackage pkg = getPackageById(id);
        Service service = getServiceById(request.getServiceId());

        pkg.setService(service);
        pkg.setName(request.getName());
        pkg.setDescription(request.getDescription());
        pkg.setPrice(request.getPrice());
        pkg.setDurationMinutes(request.getDurationMinutes());
        pkg.setActive(request.getActive());

        return packageRepository.save(pkg);
    }

    @Transactional
    public void deletePackage(Long id) {
        packageRepository.deleteById(id);
    }
}

