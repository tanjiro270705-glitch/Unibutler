package com.unibutler.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.unibutler.service.AuthService;

@RestController
@CrossOrigin(origins = "*")
public class UploadController {

    private final AuthService authService;

    @Value("${unibutler.uploads.path:uploads}")
    private String uploadsPath;

    public UploadController(AuthService authService) {
        this.authService = authService;
    }

    // Simple ping to verify controller is registered
    @org.springframework.web.bind.annotation.GetMapping(path = {"/api/upload/ping", "/upload/ping"})
    public ResponseEntity<?> ping() {
        System.out.println("[UploadController] ping received");
        return ResponseEntity.ok(Map.of("status", "ok", "controller", "upload"));
    }

    @PostMapping(path = {"/api/upload/image", "/upload/image"})
    public ResponseEntity<?> uploadImage(
            @RequestHeader(value = "X-Auth-Token", required = false) String token,
            @RequestParam("image") MultipartFile file) {
        System.out.println("[UploadController] uploadImage called. tokenPresent=" + (token != null) + ", fileName=" + (file == null ? "null" : file.getOriginalFilename()) + ", contentType=" + (file == null ? "null" : file.getContentType()));
        try {
            // Verify user
            var user = authService.requireUser(token);
            System.out.println("[UploadController] User authenticated: " + user.getId() + ", email: " + user.getEmail());

            // Validate file
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("File is empty");
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("File must be an image");
            }

            // Create uploads directory if it doesn't exist
            Path uploadDir = Paths.get(uploadsPath, "images", user.getId());
            System.out.println("[UploadController] Creating upload directory: " + uploadDir.toAbsolutePath());
            Files.createDirectories(uploadDir);
            System.out.println("[UploadController] Upload directory created successfully");

            // Generate unique filename
            String extension = contentType.substring(contentType.lastIndexOf('/') + 1);
            String filename = UUID.randomUUID().toString() + "." + extension;

            // Save file
            Path filePath = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            // Build URL
            String url = "/uploads/images/" + user.getId() + "/" + filename;

            return ResponseEntity.ok(Map.of("url", url));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to save file: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // If auth failed or any other runtime exception occurred, return 401 for auth issues
            String msg = e.getMessage() == null ? "Unauthorized or internal error" : e.getMessage();
            return ResponseEntity.status(401).body(Map.of("error", msg));
        }
    }
}