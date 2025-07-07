package finance_tracker.rs.service;

import finance_tracker.rs.configuration.JwtUtil;
import finance_tracker.rs.model.User;
import finance_tracker.rs.model.UserRole;
import finance_tracker.rs.model.dto.AuthResponse;
import finance_tracker.rs.model.dto.UserDto;
import finance_tracker.rs.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;


@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User registerUser(UserDto userDto) {
        if (userDto.getUsername() == null || userDto.getUsername().isEmpty()) {
            throw new IllegalArgumentException("Username is required");
        }

        if (userDto.getPassword() == null || userDto.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }

        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new IllegalStateException("Username already exists");
        }

        User newUser = new User();
        newUser.setUsername(userDto.getUsername());
        newUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
        newUser.setRole(UserRole.ROLE_CLIENT);
        newUser.setEnabled(true);

        return userRepository.save(newUser);
    }

    public User changePassword(String authorizationHeader, String oldPassword, String newPassword) {
        String token = authorizationHeader.substring(7);
        String username = jwtUtil.extractUsername(token);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, oldPassword));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        if (newPassword == null || newPassword.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters long");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }

    public boolean deleteUser(String username, String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new SecurityException("Unauthorized - Missing or invalid token");
        }

        String token = authorization.substring(7);
        String requestingUsername = jwtUtil.extractUsername(token);
        User requestingUser = userRepository.findByUsername(requestingUsername)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        User userToDelete = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User to delete not found"));

        if (!requestingUser.getRole().equals(UserRole.ROLE_ADMIN) &&
                !requestingUsername.equals(username)) {
            throw new SecurityException("Forbidden - You don't have permission to delete this user");
        }

        userRepository.delete(userToDelete);
        return !userRepository.existsByUsername(username);
    }

    public AuthResponse authenticate(UserDto userDto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            userDto.getUsername(),
                            userDto.getPassword()
                    )
            );

            User user = (User) authentication.getPrincipal();
            String token = jwtUtil.generateToken(user);

            return new AuthResponse(token);
        } catch (AuthenticationException e) {
            throw new RuntimeException("Invalid username/password");
        }
    }
}

