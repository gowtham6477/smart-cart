package org.example.service;

import org.example.dto.InventoryUpdateRequest;
import org.example.entity.InventoryItem;
import org.example.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    public List<InventoryItem> getAll() {
        return inventoryRepository.findAll();
    }

    public InventoryItem getByServiceId(String serviceId) {
        return inventoryRepository.findByServiceId(serviceId).orElse(null);
    }

    public InventoryItem upsert(String serviceId, InventoryUpdateRequest request) {
        InventoryItem item = inventoryRepository.findByServiceId(serviceId).orElse(new InventoryItem());
        item.setServiceId(serviceId);
        if (request.getServiceName() != null) {
            item.setServiceName(request.getServiceName());
        }
        if (request.getStock() != null) {
            item.setStock(request.getStock());
        }
        if (request.getBufferStock() != null) {
            item.setBufferStock(request.getBufferStock());
        }
        return inventoryRepository.save(item);
    }

    public boolean hasAvailableStock(String serviceId, int requestedQty, int buffer) {
        InventoryItem item = getByServiceId(serviceId);
        if (item == null) {
            return false;
        }
        int stock = item.getStock() != null ? item.getStock() : 0;
        int bufferStock = item.getBufferStock() != null ? item.getBufferStock() : 0;
        int effectiveBuffer = Math.max(buffer, bufferStock);
        return (stock - effectiveBuffer) >= requestedQty;
    }

    public void deductStock(String serviceId, int qty) {
        InventoryItem item = getByServiceId(serviceId);
        if (item == null) {
            throw new RuntimeException("Inventory item not found");
        }
        int stock = item.getStock() != null ? item.getStock() : 0;
        if (stock < qty) {
            throw new RuntimeException("Insufficient stock");
        }
        item.setStock(stock - qty);
        inventoryRepository.save(item);
    }
}
