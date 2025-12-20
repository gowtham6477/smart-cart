package org.example.controller;

import org.example.dto.ApiResponse;
import org.example.entity.Service;
import org.example.entity.ServicePackage;
import org.example.service.ServiceManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class ServiceController {

    @Autowired
    private ServiceManagementService serviceManagementService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Service>>> getAllServices() {
        List<Service> services = serviceManagementService.getActiveServices();
        return ResponseEntity.ok(ApiResponse.success("Services retrieved successfully", services));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Service>> getServiceById(@PathVariable String id) {
        try {
            Service service = serviceManagementService.getServiceById(id);
            return ResponseEntity.ok(ApiResponse.success("Service retrieved successfully", service));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<Service>>> getServicesByCategory(@PathVariable String category) {
        List<Service> services = serviceManagementService.getServicesByCategory(category);
        return ResponseEntity.ok(ApiResponse.success("Services retrieved successfully", services));
    }

    @GetMapping("/{serviceId}/packages")
    public ResponseEntity<ApiResponse<List<ServicePackage>>> getPackages(@PathVariable String serviceId) {
        List<ServicePackage> packages = serviceManagementService.getPackagesByServiceId(serviceId);
        return ResponseEntity.ok(ApiResponse.success("Packages retrieved successfully", packages));
    }
}

