package com.service.project.minitasker.dto;

import com.mysql.cj.xdevapi.Client;
import com.service.project.minitasker.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.PrivilegedAction;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskDTO {
    private String title;
    private String description;
    private Double rewardPerTask;
    private Integer totalQuantity;
    private Integer availableQuantity;
    private String imageName;
    private String status;
    private Double totalPrice;
    private String imageBase64;
    private User client;
}
