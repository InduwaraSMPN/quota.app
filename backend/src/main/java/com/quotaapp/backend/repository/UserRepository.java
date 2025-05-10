package com.quotaapp.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quotaapp.backend.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Basic JPA repository methods are automatically provided
}