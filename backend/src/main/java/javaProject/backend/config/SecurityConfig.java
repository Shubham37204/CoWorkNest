package javaProject.backend.config;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

// Marks this class as a source of Spring configuration.
// Spring reads this class to register security-related beans.
@Configuration
public class SecurityConfig {

    // Defines the HTTP security rules for incoming requests.
    // Spring Security uses this filter chain to process each request.
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // Starts configuring HTTP security using the provided HttpSecurity object.
        http
                // Applies the CORS configuration defined in this class.
                // This allows the configured frontend origin to call the backend.
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Keeps CSRF protection enabled and configures how tokens are stored and read.
                // CSRF protection is important when browsers automatically send authentication cookies.
                .csrf(csrf -> csrf
                        // Stores the CSRF token in a cookie named XSRF-TOKEN by default.
                        // HttpOnly is false so frontend JavaScript can read the CSRF cookie.
                        .csrfTokenRepository(
                                CookieCsrfTokenRepository.withHttpOnlyFalse()
                        )

                        // Uses Spring Security's standard CSRF token request-attribute handling.
                        // The frontend must send the token correctly on requests that require CSRF validation.
                        .csrfTokenRequestHandler(
                                new CsrfTokenRequestAttributeHandler()
                        )
                )

                // Configures protection against session fixation attacks.
                // After authentication, Spring changes the session ID instead of keeping the old ID.
                .sessionManagement(session -> session
                        .sessionFixation(fixation -> fixation.changeSessionId())
                )

                // Defines which endpoints can be accessed without authentication.
                // Rules are evaluated in order, so specific public endpoints come first.
                .authorizeHttpRequests(auth -> auth

                        // Allows browser CORS preflight requests without authentication.
                        // Browsers commonly send OPTIONS requests before cross-origin requests.
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Allows health check endpoints to be accessed publicly.
                        // Useful for checking application health without logging in.
                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/health/**"
                        ).permitAll()

                        // Allows login, registration, and CSRF-token endpoints publicly.
                        // Users must be able to log in or register before authenticating.
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/csrf"
                        ).permitAll()

                        // Requires authentication for every other endpoint.
                        // Authorization rules for specific user roles can be added separately.
                        .anyRequest().authenticated()
                )

                // Customizes what happens when a request is not authenticated.
                .exceptionHandling(ex -> ex

                        // Returns HTTP 401 Unauthorized instead of redirecting to a login page.
                        // This is generally suitable for a REST API consumed by Next.js.
                        .authenticationEntryPoint(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)
                        )
                )

                // Configures the logout endpoint and its behavior.
                .logout(logout -> logout

                        // Defines the URL used to trigger logout.
                        .logoutUrl("/api/auth/logout")

                        // Invalidates the current HTTP session on logout.
                        .invalidateHttpSession(true)

                        // Clears the current authentication information.
                        .clearAuthentication(true)

                        // Asks the browser to delete its JSESSIONID cookie.
                        .deleteCookies("JSESSIONID")

                        // Returns HTTP 204 No Content after successful logout.
                        .logoutSuccessHandler(
                                new HttpStatusReturningLogoutSuccessHandler(
                                        HttpStatus.NO_CONTENT
                                )
                        )
                )

                // Disables HTTP Basic authentication, which uses an HTTP Authorization header.
                // This application is configured to use a different authentication flow.
                .httpBasic(basic -> basic.disable())

                // Disables Spring Security's default HTML form-login flow.
                // Your API can instead expose a custom JSON login endpoint.
                .formLogin(form -> form.disable());

        // Builds and returns the configured security filter chain.
        return http.build();
    }

    // Exposes an AuthenticationManager as a Spring bean.
    // It coordinates authentication using the configured authentication providers.
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {

        // Retrieves the AuthenticationManager configured by Spring Security.
        // It can be injected into a custom login service or controller.
        return configuration.getAuthenticationManager();
    }

    // Defines the password encoder used to hash and verify passwords.
    // Passwords should be stored as hashes, not as plain text.
    @Bean
    public PasswordEncoder passwordEncoder() {

        // Creates Spring Security's delegating password encoder.
        // It supports encoding formats identified by prefixes such as {bcrypt}.
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    // Defines the CORS rules used by the backend.
    // CORS controls which browser origins may make cross-origin requests.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        // Creates a configuration object for cross-origin requests.
        CorsConfiguration config = new CorsConfiguration();

        // Allows requests from your local Next.js frontend.
        // Other origins are not allowed by this setting.
        config.setAllowedOrigins(
                List.of("http://localhost:3000")
        );

        // Lists the HTTP methods permitted for cross-origin requests.
        // OPTIONS is included for browser preflight checks.
        config.setAllowedMethods(
                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        );

        // Allows these request headers to be sent by the frontend.
        // X-XSRF-TOKEN carries the CSRF token in this configuration.
        config.setAllowedHeaders(
                List.of("Content-Type", "X-XSRF-TOKEN", "Accept")
        );

        // Allows the browser to include cookies in cross-origin requests.
        // The frontend must also use credentials: "include" when calling the API.
        config.setAllowCredentials(true);

        // Creates a source that maps URL patterns to CORS configurations.
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        // Applies the configured CORS rules to all backend URL paths.
        source.registerCorsConfiguration("/**", config);

        // Returns the CORS configuration source to Spring Security.
        return source;
    }
}
