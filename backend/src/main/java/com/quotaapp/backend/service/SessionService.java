package com.quotaapp.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.quotaapp.backend.dto.signup.BusinessInfoDTO;
import com.quotaapp.backend.dto.signup.LoginInfoDTO;
import com.quotaapp.backend.dto.signup.OwnerInfoDTO;
import com.quotaapp.backend.dto.signup.PasswordSetupDTO;
import com.quotaapp.backend.dto.signup.StationOwnerInfoDTO;
import com.quotaapp.backend.dto.signup.VehicleInfoDTO;

import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SessionService {

    private static final String LOGIN_INFO_SESSION_KEY = "registration_login_info";
    private static final String PASSWORD_SESSION_KEY = "registration_password";
    private static final String OWNER_INFO_SESSION_KEY = "registration_owner_info";
    private static final String VEHICLE_INFO_SESSION_KEY = "registration_vehicle_info";
    private static final String STATION_OWNER_INFO_SESSION_KEY = "registration_station_owner_info";
    private static final String BUSINESS_INFO_SESSION_KEY = "registration_business_info";
    private static final String EMAIL_VERIFIED_SESSION_KEY = "registration_email_verified";
    private static final String CURRENT_STEP_SESSION_KEY = "registration_current_step";

    /**
     * Get the current HTTP session
     *
     * @return the HTTP session
     */
    private HttpSession getSession() {
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        return attr.getRequest().getSession(true);
    }

    /**
     * Store login information in the session
     *
     * @param loginInfo the login information
     */
    public void storeLoginInfo(LoginInfoDTO loginInfo) {
        getSession().setAttribute(LOGIN_INFO_SESSION_KEY, loginInfo);
        log.debug("Stored login info in session for email: {}", loginInfo.getEmail());
    }

    /**
     * Get login information from the session
     *
     * @return the login information, or null if not found
     */
    public LoginInfoDTO getLoginInfo() {
        return (LoginInfoDTO) getSession().getAttribute(LOGIN_INFO_SESSION_KEY);
    }

    /**
     * Store password in the session
     *
     * @param passwordSetup the password setup information
     */
    public void storePassword(PasswordSetupDTO passwordSetup) {
        getSession().setAttribute(PASSWORD_SESSION_KEY, passwordSetup);
        log.debug("Stored password in session");
    }

    /**
     * Get password from the session
     *
     * @return the password setup information, or null if not found
     */
    public PasswordSetupDTO getPassword() {
        return (PasswordSetupDTO) getSession().getAttribute(PASSWORD_SESSION_KEY);
    }

    /**
     * Store owner information in the session
     *
     * @param ownerInfo the owner information
     */
    public void storeOwnerInfo(OwnerInfoDTO ownerInfo) {
        getSession().setAttribute(OWNER_INFO_SESSION_KEY, ownerInfo);
        log.debug("Stored owner info in session for: {}", ownerInfo.getFullName());
    }

    /**
     * Get owner information from the session
     *
     * @return the owner information, or null if not found
     */
    public OwnerInfoDTO getOwnerInfo() {
        return (OwnerInfoDTO) getSession().getAttribute(OWNER_INFO_SESSION_KEY);
    }

    /**
     * Store vehicle information in the session
     *
     * @param vehicleInfo the vehicle information
     */
    public void storeVehicleInfo(VehicleInfoDTO vehicleInfo) {
        getSession().setAttribute(VEHICLE_INFO_SESSION_KEY, vehicleInfo);
        log.debug("Stored vehicle info in session for: {}", vehicleInfo.getRegistrationNumber());
    }

    /**
     * Get vehicle information from the session
     *
     * @return the vehicle information, or null if not found
     */
    public VehicleInfoDTO getVehicleInfo() {
        return (VehicleInfoDTO) getSession().getAttribute(VEHICLE_INFO_SESSION_KEY);
    }

    /**
     * Mark email as verified in the session
     *
     * @param verified whether the email is verified
     */
    public void setEmailVerified(boolean verified) {
        getSession().setAttribute(EMAIL_VERIFIED_SESSION_KEY, verified);
        log.debug("Set email verified status in session: {}", verified);
    }

    /**
     * Check if email is verified in the session
     *
     * @return true if the email is verified, false otherwise
     */
    public boolean isEmailVerified() {
        Boolean verified = (Boolean) getSession().getAttribute(EMAIL_VERIFIED_SESSION_KEY);
        return verified != null && verified;
    }

    /**
     * Set the current step in the session
     *
     * @param currentStep the current step
     */
    public void setCurrentStep(Integer currentStep) {
        getSession().setAttribute(CURRENT_STEP_SESSION_KEY, currentStep);
        log.debug("Set current step in session: {}", currentStep);
    }

    /**
     * Get the current step from the session
     *
     * @return the current step, or null if not found
     */
    public Integer getCurrentStep() {
        return (Integer) getSession().getAttribute(CURRENT_STEP_SESSION_KEY);
    }

    /**
     * Store station owner information in the session
     *
     * @param stationOwnerInfo the station owner information
     */
    public void storeStationOwnerInfo(StationOwnerInfoDTO stationOwnerInfo) {
        getSession().setAttribute(STATION_OWNER_INFO_SESSION_KEY, stationOwnerInfo);
        log.debug("Stored station owner info in session for: {}", stationOwnerInfo.getFullName());
    }

    /**
     * Get station owner information from the session
     *
     * @return the station owner information, or null if not found
     */
    public StationOwnerInfoDTO getStationOwnerInfo() {
        return (StationOwnerInfoDTO) getSession().getAttribute(STATION_OWNER_INFO_SESSION_KEY);
    }

    /**
     * Store business information in the session
     *
     * @param businessInfo the business information
     */
    public void storeBusinessInfo(BusinessInfoDTO businessInfo) {
        getSession().setAttribute(BUSINESS_INFO_SESSION_KEY, businessInfo);
        log.debug("Stored business info in session for: {}", businessInfo.getBusinessName());
    }

    /**
     * Get business information from the session
     *
     * @return the business information, or null if not found
     */
    public BusinessInfoDTO getBusinessInfo() {
        return (BusinessInfoDTO) getSession().getAttribute(BUSINESS_INFO_SESSION_KEY);
    }

    /**
     * Clear all registration data from the session
     */
    public void clearRegistrationData() {
        getSession().removeAttribute(LOGIN_INFO_SESSION_KEY);
        getSession().removeAttribute(PASSWORD_SESSION_KEY);
        getSession().removeAttribute(OWNER_INFO_SESSION_KEY);
        getSession().removeAttribute(VEHICLE_INFO_SESSION_KEY);
        getSession().removeAttribute(STATION_OWNER_INFO_SESSION_KEY);
        getSession().removeAttribute(BUSINESS_INFO_SESSION_KEY);
        getSession().removeAttribute(EMAIL_VERIFIED_SESSION_KEY);
        getSession().removeAttribute(CURRENT_STEP_SESSION_KEY);
        log.debug("Cleared all registration data from session");
    }
}
