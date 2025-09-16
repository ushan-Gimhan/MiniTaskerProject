package com.service.project.minitasker.controller;


import com.service.project.minitasker.dto.ApiResponse;
import com.service.project.minitasker.dto.AuthDTO;
import com.service.project.minitasker.dto.RegisterDTO;
import com.service.project.minitasker.entity.User;
import com.service.project.minitasker.service.AuthService;
import com.service.project.minitasker.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AuthController {
    private final AuthService authServiceImpl;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(
            @RequestBody RegisterDTO registerDTO){
        System.out.println(registerDTO.getUsername());
        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "User registered successfully",
                        authServiceImpl.register(registerDTO)
                )
        );
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
}
