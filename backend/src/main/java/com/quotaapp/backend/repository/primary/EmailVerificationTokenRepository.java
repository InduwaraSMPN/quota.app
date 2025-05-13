package com.quotaapp.backend.repository.primary;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.EmailVerificationToken;
import com.quotaapp.backend.model.User;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    
    /**
     * Find the most recent token for a user
     * 
     * @param user the user to search for
     * @return an Optional containing the token if found
     */
    Optional<EmailVerificationToken> findFirstByUserOrderByCreatedAtDesc(User user);
    
    /**
     * Find a token by its value
     * 
     * @param token the token value to search for
     * @return an Optional containing the token if found
     */
    Optional<EmailVerificationToken> findByToken(String token);
    
    /**
     * Find a token by user and token value
     * 
     * @param user the user to search for
     * @param token the token value to search for
     * @return an Optional containing the token if found
     */
    Optional<EmailVerificationToken> findByUserAndToken(User user, String token);
}