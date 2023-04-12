package pl.qprogramming.clinic.service;

import java.util.Arrays;
import java.util.HashSet;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pl.qprogramming.clinic.config.ApplicationProperties;
import pl.qprogramming.clinic.service.api.dto.AccountDTO;
import pl.qprogramming.clinic.service.api.dto.Role;

@Component
@RequiredArgsConstructor
@Slf4j
public class InitialDataLoader implements ApplicationRunner {

    private final AccountService accountService;
    private final ApplicationProperties properties;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (accountService.noUsers()) {
            log.info("There are no users yet , presuming it's initial app startup");
            val administrator = new AccountDTO()
                .firstName("Administrator")
                .login(properties.getDefaults().getAdminAccount())
                .email(properties.getDefaults().getAdminEmail())
                .authorities(new HashSet<>(Arrays.asList(Role.ADMIN, Role.USER)));
            accountService.registerUser(administrator, properties.getDefaults().getAdminPassword(), true);
            log.info("Administrator user created with default password");
        }
    }
}
