package com.quotaapp.backend.filter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.stream.Collectors;

/**
 * Filter to log CORS headers for debugging purposes
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class CorsLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Log request details
        String origin = request.getHeader("Origin");
        String method = request.getMethod();
        String uri = request.getRequestURI();
        
        log.info("Request: {} {} from Origin: {}", method, uri, origin);
        
        // Log all request headers for debugging
        if (log.isDebugEnabled()) {
            Enumeration<String> headerNames = request.getHeaderNames();
            if (headerNames != null) {
                Collections.list(headerNames).forEach(headerName -> {
                    String headerValue = request.getHeader(headerName);
                    log.debug("Request Header: {} = {}", headerName, headerValue);
                });
            }
        }
        
        // Continue with the filter chain
        filterChain.doFilter(request, response);
        
        // Log response CORS headers
        String allowOrigin = response.getHeader("Access-Control-Allow-Origin");
        String allowMethods = response.getHeader("Access-Control-Allow-Methods");
        String allowHeaders = response.getHeader("Access-Control-Allow-Headers");
        String allowCredentials = response.getHeader("Access-Control-Allow-Credentials");
        
        log.info("Response CORS Headers for {} {}", method, uri);
        log.info("Access-Control-Allow-Origin: {}", allowOrigin);
        log.info("Access-Control-Allow-Methods: {}", allowMethods);
        log.info("Access-Control-Allow-Headers: {}", allowHeaders);
        log.info("Access-Control-Allow-Credentials: {}", allowCredentials);
    }
}
