package com.quotaapp.backend.repository.primary;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.RefreshToken;
import com.quotaapp.backend.model.User;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    
    /**
     * Find a refresh token by its value
     * 
     * @param token the token value to search for
     * @return an Optional containing the refresh token if found
     */
    Optional<RefreshToken> findByToken(String token);
    
    /**
     * Delete all refresh tokens for a user
     * 
     * @param user the user
     */
    void deleteByUser(User user);
}