package com.service.project.minitasker.controller;


import com.service.project.minitasker.dto.ApiResponse;
import com.service.project.minitasker.dto.AuthDTO;
import com.service.project.minitasker.dto.RegisterDTO;
import com.service.project.minitasker.entity.User;
import com.service.project.minitasker.service.AuthService;
import com.service.project.minitasker.service.Impl.EmailService;
import com.service.project.minitasker.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {
    private final AuthService authServiceImpl;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(@RequestBody RegisterDTO registerDTO) {
        try {
            String newUser = authServiceImpl.register(registerDTO);
            return ResponseEntity.ok(new ApiResponse(200, "User registered successfully", newUser));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(400, ex.getMessage(), null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody AuthDTO authDTO) {
        System.out.println(authDTO.username);
        return ResponseEntity.ok(
                new ApiResponse(200, "OK", authServiceImpl.authenticate(authDTO))
        );
    }
    @GetMapping("/user")
    public ResponseEntity<?> getUserDetails(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7); // remove "Bearer "
            String username = jwtUtil.extractUsername(token);

            User user = authServiceImpl.findByUsername(username);
            return ResponseEntity.ok(user);

        } catch (Exception ex) {
            return ResponseEntity.status(401).body("Invalid or expired token");
        }
    }
    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getAllUsers() {
        try {
            List<User> users = authServiceImpl.getAllUsers(); // fetch from service

            return ResponseEntity.ok(
                    new ApiResponse(
                            200,
                            "Users fetched successfully",
                            users
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    new ApiResponse(
                            500,
                            "Failed to fetch users: " + e.getMessage(),
                            null
                    )
            );
        }
    }

    @GetMapping("/confirm")
    public ResponseEntity<ApiResponse> confirmEmail(@RequestParam String token) {
        try {
            String message = emailService.confirmEmail(token);
            return ResponseEntity.ok(new ApiResponse(200, message, null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(400, e.getMessage(), null));
        }
    }
}
