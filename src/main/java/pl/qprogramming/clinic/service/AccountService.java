package pl.qprogramming.clinic.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.val;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import pl.qprogramming.clinic.config.Constants;
import pl.qprogramming.clinic.domain.Account;
import pl.qprogramming.clinic.domain.Authority;
import pl.qprogramming.clinic.exceptions.EmailAlreadyUsedException;
import pl.qprogramming.clinic.exceptions.InvalidPasswordException;
import pl.qprogramming.clinic.exceptions.UsernameAlreadyUsedException;
import pl.qprogramming.clinic.repository.AuthorityRepository;
import pl.qprogramming.clinic.repository.UserRepository;
import pl.qprogramming.clinic.security.SecurityUtils;
import pl.qprogramming.clinic.service.api.dto.AccountDTO;
import pl.qprogramming.clinic.service.api.dto.Role;
import pl.qprogramming.clinic.service.api.dto.UserDTO;
import pl.qprogramming.clinic.service.mapper.AccountMapper;
import tech.jhipster.security.RandomUtil;

/**
 * Service class for managing users.
 */
@Service
@Transactional
@RequiredArgsConstructor
public class AccountService {

    private final Logger log = LoggerFactory.getLogger(AccountService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthorityRepository authorityRepository;
    private final AccountMapper accountMapper;

    public Optional<Account> activateRegistration(String key) {
        log.debug("Activating user for activation key {}", key);
        return userRepository
            .findOneByActivationKey(key)
            .map(user -> {
                // activate given user for the registration key.
                user.setActivated(true);
                user.setActivationKey(null);
                log.debug("Activated user: {}", user);
                return user;
            });
    }

    public Optional<Account> completePasswordReset(String newPassword, String key) {
        log.debug("Reset user password for reset key {}", key);
        return userRepository
            .findOneByResetKey(key)
            .filter(user -> user.getResetDate().isAfter(Instant.now().minus(1, ChronoUnit.DAYS)))
            .map(user -> {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetKey(null);
                user.setResetDate(null);
                return user;
            });
    }

    public Optional<Account> requestPasswordReset(String mail) {
        return userRepository
            .findOneByEmailIgnoreCase(mail)
            .filter(Account::isActivated)
            .map(user -> {
                user.setResetKey(RandomUtil.generateResetKey());
                user.setResetDate(Instant.now());
                return user;
            });
    }

    public Account registerUser(AccountDTO accountDTO, String password) {
        return registerUser(accountDTO, password, false);
    }

    public Account registerUser(AccountDTO accountDTO, String password, boolean activated) {
        userRepository
            .findOneByLogin(accountDTO.getLogin().toLowerCase())
            .ifPresent(existingUser -> {
                boolean removed = removeNonActivatedUser(existingUser);
                if (!removed) {
                    throw new UsernameAlreadyUsedException();
                }
            });
        userRepository
            .findOneByEmailIgnoreCase(accountDTO.getEmail())
            .ifPresent(existingUser -> {
                boolean removed = removeNonActivatedUser(existingUser);
                if (!removed) {
                    throw new EmailAlreadyUsedException();
                }
            });
        String encryptedPassword = passwordEncoder.encode(password);
        Account newAccount = accountMapper.accountDTOToAccount(accountDTO);
        // new user gets initially a generated password
        newAccount.setPassword(encryptedPassword);
        newAccount.setActivated(activated);
        // new user gets registration key
        newAccount.setActivationKey(RandomUtil.generateActivationKey());
        if (CollectionUtils.isEmpty(accountDTO.getAuthorities())) {
            accountDTO.setAuthorities(Collections.singleton(Role.USER));
        }
        newAccount.setAuthorities(accountDTO.getAuthorities().stream().map(this::findByRole).collect(Collectors.toSet()));
        userRepository.save(newAccount);
        log.debug("Created Information for Account: {}", newAccount);
        return newAccount;
    }

    private boolean removeNonActivatedUser(Account existingUser) {
        if (existingUser.isActivated()) {
            return false;
        }
        userRepository.delete(existingUser);
        userRepository.flush();
        return true;
    }

    public Account createUser(AccountDTO accountDTO) {
        Account account = accountMapper.accountDTOToAccount(accountDTO);
        if (account.getLangKey() == null) {
            account.setLangKey(Constants.DEFAULT_LANGUAGE); // default language
        }
        String encryptedPassword = passwordEncoder.encode(RandomUtil.generatePassword());
        account.setPassword(encryptedPassword);
        account.setResetKey(RandomUtil.generateResetKey());
        account.setResetDate(Instant.now());
        account.setActivated(true);
        //        if (userDTO.getAuthorities() != null) {
        //            Set<Authority> authorities = userDTO
        //                .getAuthorities()
        //                .stream()
        //                .map(accountMapper::roleToAuthority)
        //                .collect(Collectors.toSet());
        //            user.setAuthorities(authorities);
        //        }
        userRepository.save(account);
        log.debug("Created Information for User: {}", account);
        return account;
    }

    /**
     * Update all information for a specific user, and return the modified user.
     *
     * @param userDTO user to update.
     * @return updated user.
     */
    public Optional<AccountDTO> updateUser(AccountDTO userDTO) {
        return Optional
            .of(userRepository.findById(userDTO.getId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .map(user -> {
                user.setLogin(userDTO.getLogin().toLowerCase());
                user.setFirstName(userDTO.getFirstName());
                user.setLastName(userDTO.getLastName());
                if (userDTO.getEmail() != null) {
                    user.setEmail(userDTO.getEmail().toLowerCase());
                }
                user.setImageUrl(userDTO.getImageUrl());
                user.setActivated(userDTO.getActivated());
                user.setLangKey(userDTO.getLangKey());
                Set<Authority> managedAuthorities = user.getAuthorities();
                managedAuthorities.clear();
                userDTO.getAuthorities().stream().map(accountMapper::roleToAuthority).forEach(managedAuthorities::add);
                log.debug("Changed Information for User: {}", user);
                return user;
            })
            .map(accountMapper::accountToAccountDTO);
    }

    public void deleteUser(String login) {
        userRepository
            .findOneByLogin(login)
            .ifPresent(user -> {
                userRepository.delete(user);
                log.debug("Deleted User: {}", user);
            });
    }

    /**
     * Update basic information (first name, last name, email, language) for the current user.
     *
     * @param firstName first name of user.
     * @param lastName  last name of user.
     * @param email     email id of user.
     * @param langKey   language key.
     * @param imageUrl  image URL of user.
     */
    public void updateUser(String firstName, String lastName, String email, String langKey, String imageUrl) {
        SecurityUtils
            .getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .ifPresent(user -> {
                user.setFirstName(firstName);
                user.setLastName(lastName);
                if (email != null) {
                    user.setEmail(email.toLowerCase());
                }
                user.setLangKey(langKey);
                user.setImageUrl(imageUrl);
                log.debug("Changed Information for User: {}", user);
            });
    }

    @Transactional
    public void changePassword(String currentClearTextPassword, String newPassword) {
        SecurityUtils
            .getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .ifPresent(user -> {
                String currentEncryptedPassword = user.getPassword();
                if (!passwordEncoder.matches(currentClearTextPassword, currentEncryptedPassword)) {
                    throw new InvalidPasswordException();
                }
                String encryptedPassword = passwordEncoder.encode(newPassword);
                user.setPassword(encryptedPassword);
                log.debug("Changed password for User: {}", user);
            });
    }

    @Transactional(readOnly = true)
    public Page<AccountDTO> getAllManagedUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(accountMapper::accountToAccountDTO);
    }

    public boolean noUsers() {
        return userRepository.findAll().isEmpty();
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> getAllPublicUsers(Pageable pageable) {
        return userRepository.findAllByIdNotNullAndActivatedIsTrue(pageable).map(accountMapper::accountToUserDTO);
    }

    @Transactional(readOnly = true)
    public Optional<Account> getUserWithAuthoritiesByLogin(String login) {
        return userRepository.findOneWithAuthoritiesByLogin(login);
    }

    @Transactional(readOnly = true)
    public Optional<Account> getUserWithAuthorities() {
        return SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOneWithAuthoritiesByLogin);
    }

    /**
     * Not activated users should be automatically deleted after 3 days.
     * <p>
     * This is scheduled to get fired everyday, at 01:00 (am).
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void removeNotActivatedUsers() {
        userRepository
            .findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(Instant.now().minus(3, ChronoUnit.DAYS))
            .forEach(user -> {
                log.debug("Deleting not activated user {}", user.getLogin());
                userRepository.delete(user);
            });
    }

    /**
     * Gets a list of all the authorities.
     *
     * @return a list of all the authorities.
     */
    @Transactional(readOnly = true)
    public List<String> getAuthorities() {
        return authorityRepository.findAll().stream().map(Authority::getName).collect(Collectors.toList());
    }

    public Authority findByRole(Role role) {
        var authority = authorityRepository.findById(role.toString());
        return authority.orElseGet(() -> {
            val auth = new Authority();
            auth.setName(role.toString());
            return authorityRepository.save(auth);
        });
    }
}
