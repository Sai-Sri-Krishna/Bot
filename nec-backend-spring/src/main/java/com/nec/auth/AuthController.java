package com.nec.auth;

import com.nec.auth.dto.AuthResponse;
import com.nec.auth.dto.LoginRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/guest")
    public ResponseEntity<AuthResponse> guest() {
        return ResponseEntity.ok(authService.guestLogin());
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.me(userDetails.getUsername()));
    }
}
