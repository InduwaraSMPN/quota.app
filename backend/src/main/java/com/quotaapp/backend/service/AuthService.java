package com.quotaapp.backend.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.quotaapp.backend.dto.AuthRequest;
import com.quotaapp.backend.dto.AuthResponse;
import com.quotaapp.backend.model.RefreshToken;
import com.quotaapp.backend.model.User;
import com.quotaapp.backend.repository.primary.RefreshTokenRepository;
import com.quotaapp.backend.repository.primary.UserRepository;
import com.quotaapp.backend.security.JwtTokenUtil;

import lombok.extern.slf4j.Slf4j;

@Service("authService")
@Slf4j
public class AuthService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;

    /**
     * Constructor with @Lazy annotation on AuthenticationManager to break circular dependency
     */
    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            @Lazy AuthenticationManager authenticationManager,
            JwtTokenUtil jwtTokenUtil) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    /**
     * Authenticate a user and generate tokens
     *
     * @param authRequest the authentication request
     * @return the authentication response with tokens
     */
    @Transactional
    public AuthResponse authenticate(AuthRequest authRequest) {
        try {
            // Check if the user exists (will throw UsernameNotFoundException if not found)
            userRepository.findByEmail(authRequest.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + authRequest.getUsername()));

            // Authenticate the user using the AuthenticationManager
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword()));

            // Set the authentication in the security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Get the user details
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            // Generate JWT token
            String token = jwtTokenUtil.generateToken(userDetails.getUsername());

            // Generate refresh token
            String refreshToken = generateRefreshToken(userDetails.getUsername());

            // Get the user role
            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                    .orElse("USER");

            // Return the authentication response
            return AuthResponse.builder()
                    .token(token)
                    .refreshToken(refreshToken)
                    .username(userDetails.getUsername())
                    .role(role)
                    .build();
        } catch (UsernameNotFoundException e) {
            // Re-throw with the same message to maintain consistent error handling
            throw new UsernameNotFoundException(e.getMessage());
        } catch (BadCredentialsException e) {
            // Re-throw to maintain consistent error handling
            throw new BadCredentialsException("Invalid credentials");
        } catch (Exception e) {
            // Log the error and re-throw
            log.error("Authentication error: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Generate a refresh token for a user
     *
     * @param username the username
     * @return the refresh token
     */
    @Transactional
    public String generateRefreshToken(String username) {
        // Find the user
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Generate a random token
        String token = UUID.randomUUID().toString();

        // Create the refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        // Save the refresh token
        refreshTokenRepository.save(refreshToken);

        return token;
    }

    /**
     * Refresh an access token using a refresh token
     *
     * @param refreshToken the refresh token
     * @return the new authentication response with tokens
     */
    @Transactional
    public Optional<AuthResponse> refreshToken(String refreshToken) {
        // Find the refresh token
        return refreshTokenRepository.findByToken(refreshToken)
                .filter(token -> !token.isExpired())
                .map(token -> {
                    // Get the user
                    User user = token.getUser();

                    // Generate a new JWT token
                    String newToken = jwtTokenUtil.generateToken(user.getEmail());

                    // Generate a new refresh token
                    String newRefreshToken = generateRefreshToken(user.getEmail());

                    // Delete the old refresh token
                    refreshTokenRepository.delete(token);

                    // Return the new authentication response
                    return AuthResponse.builder()
                            .token(newToken)
                            .refreshToken(newRefreshToken)
                            .username(user.getEmail())
                            .role(user.getRole().name())
                            .build();
                });
    }

    /**
     * Load a user by username
     *
     * @param username the username
     * @return the user details
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}
