package com.service.project.minitasker.dto;

import com.service.project.minitasker.entity.Task;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String status;
    private String message;

    public TaskResponse(Long i, String ok, Task task) {
        this.id=i;
        this.title=ok;
        this.status=ok;
    }
}
