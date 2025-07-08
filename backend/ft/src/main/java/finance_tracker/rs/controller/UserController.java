package finance_tracker.rs.controller;

import finance_tracker.rs.model.User;
import finance_tracker.rs.model.dto.AuthResponse;
import finance_tracker.rs.model.dto.UserDto;
import finance_tracker.rs.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@CrossOrigin
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{username}")
    public ResponseEntity<User> getUser(@PathVariable String username) {
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody UserDto user) {
        User createdUser = userService.registerUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PutMapping
    public ResponseEntity<User> changePassword(@RequestHeader("Authorization") String authorization, @RequestBody String oldPassword, @RequestBody String newPassword) {
        User updatedUser = userService.changePassword(authorization, oldPassword, newPassword);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{username}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String username, @RequestHeader("Authorization") String authorization) {
        userService.deleteUser(username, authorization);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody UserDto userDto) {
        AuthResponse response = userService.authenticate(userDto);
        return ResponseEntity.ok(response);
    }
}
