package com.quotaapp.backend.filter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Simple CORS filter to ensure proper CORS headers are set
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
@Slf4j
public class SimpleCorsFilter implements Filter {

    private final List<String> allowedOrigins = Arrays.asList(
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002"
    );

    private final boolean allowMobileApps = true; // Allow mobile apps without origin restrictions

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String origin = request.getHeader("Origin");
        String mobileAppHeader = request.getHeader("X-Mobile-App");

        // Check if the origin is allowed (for web frontends)
        boolean isAllowedOrigin = origin != null && allowedOrigins.contains(origin);

        // Check if this is a mobile app request (no origin or has mobile app header)
        boolean isMobileApp = allowMobileApps && (origin == null || mobileAppHeader != null);

        if (isAllowedOrigin || isMobileApp) {
            // Set appropriate origin header
            if (isAllowedOrigin) {
                response.setHeader("Access-Control-Allow-Origin", origin);
                response.setHeader("Access-Control-Allow-Credentials", "true");
            } else if (isMobileApp) {
                response.setHeader("Access-Control-Allow-Origin", "*");
                response.setHeader("Access-Control-Allow-Credentials", "false");
            }

            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
            response.setHeader("Access-Control-Allow-Headers",
                "Authorization, Content-Type, X-Requested-With, Accept, Origin, " +
                "Access-Control-Request-Method, Access-Control-Request-Headers, " +
                "X-Mobile-App, X-App-Version");
            response.setHeader("Access-Control-Max-Age", "3600");

            // Handle preflight requests
            if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
                response.setStatus(HttpServletResponse.SC_OK);
                return;
            }
        }

        chain.doFilter(req, res);
    }

    @Override
    public void init(FilterConfig filterConfig) {
        log.info("SimpleCorsFilter initialized");
    }

    @Override
    public void destroy() {
        log.info("SimpleCorsFilter destroyed");
    }
}
