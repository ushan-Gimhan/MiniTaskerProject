package com.service.project.minitasker.service.Impl;

import com.service.project.minitasker.dto.TaskDTO;
import com.service.project.minitasker.entity.Payment;
import com.service.project.minitasker.entity.Task;
import com.service.project.minitasker.entity.User;
import com.service.project.minitasker.repo.PaymentRepository;
import com.service.project.minitasker.repo.SubmissionRepository;
import com.service.project.minitasker.repo.TaskRepository;
import com.service.project.minitasker.service.TaskService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final SubmissionRepository submissionRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public Task createTask(TaskDTO taskDTO, String imageName) {
        String uploadedImageUrl = null;

        // --- Upload image to ImgBB ---
        if (taskDTO.getImageBase64() != null && !taskDTO.getImageBase64().isEmpty()) {
            try {
                String base64Image = taskDTO.getImageBase64();
                if (base64Image.contains(",")) {
                    base64Image = base64Image.split(",")[1];
                }

                String apiKey = "b56b8866f0ddb6ccb4adcf435a94347b";
                String url = "https://api.imgbb.com/1/upload?key=" + apiKey;

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

                MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
                body.add("image", base64Image);

                HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);
                RestTemplate restTemplate = new RestTemplate();
                ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, Map.class);

                if (response.getStatusCode() == HttpStatus.OK) {
                    Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                    uploadedImageUrl = (String) data.get("url");
                } else {
                    throw new RuntimeException("Failed to upload image to ImgBB");
                }

            } catch (Exception e) {
                throw new RuntimeException("Error uploading image to ImgBB", e);
            }
        }

        // --- Build and save Task first ---
        Task task = Task.builder()
                .title(taskDTO.getTitle())
                .description(taskDTO.getDescription())
                .rewardPerTask(taskDTO.getRewardPerTask())
                .totalQuantity(taskDTO.getTotalQuantity())
                .availableQuantity(taskDTO.getAvailableQuantity())
                .status(taskDTO.getStatus())
                .totalPrice(taskDTO.getTotalPrice())
                .imageName(uploadedImageUrl)
                .client(taskDTO.getClient())
                .build();

        Task savedTask = taskRepository.save(task); // ✅ save task first

        // --- Now create Payment linked to saved Task ---
        Payment payment = new Payment();
        payment.setTask(savedTask); // ✅ task is now persisted
        payment.setUser(taskDTO.getClient());
        payment.setAmount(taskDTO.getTotalPrice());
        payment.setMethod("CARD");
        payment.setDate(LocalDateTime.now());

        paymentRepository.save(payment);

        return savedTask;
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
        return taskRepository.findById(id)
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
                        .client(task.getClient())
                        .submissionStatus(task.getSubmissionStatus())
                        .payments(task.getPayments())// reference to User
                        .build()
                )
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    }

    @Override
    public List<Task> getAllApprovedTasks(Long currentUserId) {
//        return taskRepository.findByStatusAndClientIdNot("APPROVED", currentUserId);
        // 1️⃣ Get all tasks approved by admin and NOT created by the current user
        List<Task> approvedTasks = taskRepository.findByStatusAndClientIdNot("APPROVED", currentUserId);

        // 2️⃣ Filter out tasks where the user has already submitted (pending or approved)
        List<Task> availableTasks = approvedTasks.stream()
                .filter(task -> !submissionRepository.existsByTask_IdAndUser_Id(task.getId(), currentUserId))
                .collect(Collectors.toList());

        return availableTasks;
    }

    @Override
    public List<Task> getTasksByUserId(Long userId) {
        return taskRepository.findByClientId(userId);
    }

    @Override
    public Task updateTask(Long id, Task updatedTask) {
        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        existingTask.setStatus(updatedTask.getStatus());

        return taskRepository.save(existingTask);
    }

}