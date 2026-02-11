package org.example.repository;

import org.example.entity.TaskImage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskImageRepository extends MongoRepository<TaskImage, String> {
    List<TaskImage> findByTaskId(String taskId);
    List<TaskImage> findByTaskIdAndImageType(String taskId, TaskImage.ImageType imageType);
    void deleteByTaskId(String taskId);
}

