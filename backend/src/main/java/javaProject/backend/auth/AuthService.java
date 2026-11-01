package javaProject.backend.auth;
import org.hibernate.exception.ConstraintViolationException;
import javaProject.backend.user.AppUser;
import javaProject.backend.user.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private static boolean isEmailConflict(DataIntegrityViolationException e) {
        return e.getCause() instanceof ConstraintViolationException cve && cve.getConstraintName() != null
                && cve.getConstraintName().toLowerCase().contains("email");
        }

    public UserResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        AppUser user = new AppUser();
        user.setEmail(email);
        user.setDisplayName(request.displayName().trim());
        user.setPassword(passwordEncoder.encode(request.password()));

        try {
            userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException e) {
            if (isEmailConflict(e)) {
                              throw new IllegalArgumentException("Email already exists");
                        }
                     throw e;
        }

        return new UserResponse(user.getId(), user.getEmail(), user.getDisplayName());
    }

    public UserResponse getByEmail(String email) {
        AppUser user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
        return new UserResponse(user.getId(), user.getEmail(), user.getDisplayName());
    }
}
