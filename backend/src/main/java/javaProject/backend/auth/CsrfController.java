package javaProject.backend.auth;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CsrfController {

    @GetMapping("/api/auth/csrf")
    public ResponseEntity<CsrfTokenResponse> getCsrfToken(
            CsrfToken csrfToken) {

        String headerName = csrfToken.getHeaderName();
        String token = csrfToken.getToken();

        CsrfTokenResponse response =
                new CsrfTokenResponse(headerName, token);

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(response);
    }

    public record CsrfTokenResponse(
            String headerName,
            String token) {
    }
}
