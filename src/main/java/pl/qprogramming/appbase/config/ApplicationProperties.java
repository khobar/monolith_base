package pl.qprogramming.appbase.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to AppBase.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
@Getter
@Setter
public class ApplicationProperties {

    private AppDefaults defaults;
    private boolean activateNewAccounts;

    // jhipster-needle-application-properties-property
    // jhipster-needle-application-properties-property-getter
    // jhipster-needle-application-properties-property-class

    @Getter
    @Setter
    public static class AppDefaults {

        private String adminPassword;
        private String adminAccount;
        private String adminEmail;
        private String defaultLang;
    }
}
