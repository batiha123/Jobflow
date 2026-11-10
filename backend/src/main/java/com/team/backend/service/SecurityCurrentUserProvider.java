package com.team.backend.service;

import com.team.backend.entity.User;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Component
public class SecurityCurrentUserProvider implements CurrentUserProvider {

    @Override
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw unauthorized();
        }

        Long userId = extractUserId(authentication.getPrincipal());
        if (userId == null || userId <= 0) {
            throw unauthorized();
        }
        return userId;
    }

    private Long extractUserId(Object principal) {
        if (principal instanceof User user) {
            return user.getId();
        }

        if (principal instanceof Number number) {
            try {
                return new BigDecimal(number.toString()).longValueExact();
            } catch (NumberFormatException | ArithmeticException exception) {
                return null;
            }
        }

        return null;
    }

    private ResponseStatusException unauthorized() {
        return new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authenticated user ID is unavailable");
    }
}
