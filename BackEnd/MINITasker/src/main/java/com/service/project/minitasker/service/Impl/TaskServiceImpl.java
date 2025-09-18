package com.service.project.minitasker.service.Impl;

import com.service.project.minitasker.dto.TaskDTO;
import com.service.project.minitasker.entity.Task;
import com.service.project.minitasker.entity.User;
import com.service.project.minitasker.repo.TaskRepository;
import com.service.project.minitasker.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    public Task createTask(TaskDTO taskDTO, String imageName) {
        String uploadedImageUrl = null;

        // Use the image name from the DTO
        String originalImageName = taskDTO.getImageName(); // ✅ this will not be null if frontend sends it

        if (taskDTO.getImageBase64() != null && !taskDTO.getImageBase64().isEmpty()) {
            try {
                // Remove "data:image/...;base64," prefix if present
                String base64Image = taskDTO.getImageBase64();
                if (base64Image.contains(",")) {
                    base64Image = base64Image.split(",")[1];
                }

                // Prepare HTTP request to ImgBB
                String apiKey = "b56b8866f0ddb6ccb4adcf435a94347b"; // 🔑 put your API key here
                String url = "https://api.imgbb.com/1/upload?key=" + apiKey;

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

                MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
                body.add("image", base64Image);

                HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

                RestTemplate restTemplate = new RestTemplate();
                ResponseEntity<Map> response = restTemplate.exchange(
                        url, HttpMethod.POST, requestEntity, Map.class
                );

                if (response.getStatusCode() == HttpStatus.OK) {
                    Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                    uploadedImageUrl = (String) data.get("url"); // ✅ Hosted image URL
                } else {
                    throw new RuntimeException("Failed to upload image to ImgBB");
                }

            } catch (Exception e) {
                throw new RuntimeException("Error uploading image to ImgBB", e);
            }
        }
        System.out.println(uploadedImageUrl);
        // Build Task entity
        Task task = Task.builder()
                .title(taskDTO.getTitle())                  // ✅ matches
                .description(taskDTO.getDescription())      // ✅ matches
                .rewardPerTask(taskDTO.getRewardPerTask()) // ✅ matches
                .totalQuantity(taskDTO.getTotalQuantity()) // ✅ matches
                .availableQuantity(taskDTO.getAvailableQuantity()) // ✅ matches
                .status(taskDTO.getStatus())               // ✅ matches
                .totalPrice(taskDTO.getTotalPrice())      // ✅ matches
                .imageName(uploadedImageUrl)              // ⚠️ this is different (cloud URL)// ⚠️ extra field not in your snippet
                .client(taskDTO.getClient())
                .build();

        return taskRepository.save(task);
    }


    public List<Task> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(task -> Task.builder()
                        .id(task.getId())
                        .title(task.getTitle())
                        .description(task.getDescription())
                        .rewardPerTask(task.getRewardPerTask())
                        .totalQuantity(task.getTotalQuantity())
                        .availableQuantity(task.getAvailableQuantity())
                        .imageName(task.getImageName())
                        .status(task.getStatus())
                        .totalPrice(task.getTotalPrice())
                        .client(task.getClient()) // keep reference to User entity
                        .build()
                ).toList();
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(Math.toIntExact(id))
                .map(task -> Task.builder()
                        .id(task.getId())
                        .title(task.getTitle())
                        .description(task.getDescription())
                        .rewardPerTask(task.getRewardPerTask())
                        .totalQuantity(task.getTotalQuantity())
                        .availableQuantity(task.getAvailableQuantity())
                        .imageName(task.getImageName())
                        .status(task.getStatus())
                        .totalPrice(task.getTotalPrice())
                        .client(task.getClient()) // reference to User
                        .build()
                )
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    }

    @Override
    public List<Task> getAllApprovedTasks(Long currentUserId) {
        return taskRepository.findByStatusAndClientIdNot("APPROVED", currentUserId);
    }
}