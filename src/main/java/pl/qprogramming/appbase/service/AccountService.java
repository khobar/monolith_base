package pl.qprogramming.appbase.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.val;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import pl.qprogramming.appbase.config.Constants;
import pl.qprogramming.appbase.domain.Account;
import pl.qprogramming.appbase.domain.Authority;
import pl.qprogramming.appbase.exceptions.EmailAlreadyUsedException;
import pl.qprogramming.appbase.exceptions.InvalidPasswordException;
import pl.qprogramming.appbase.exceptions.UsernameAlreadyUsedException;
import pl.qprogramming.appbase.repository.AuthorityRepository;
import pl.qprogramming.appbase.repository.UserRepository;
import pl.qprogramming.appbase.security.SecurityUtils;
import pl.qprogramming.appbase.service.api.dto.AccountDTO;
import pl.qprogramming.appbase.service.api.dto.Role;
import pl.qprogramming.appbase.service.api.dto.UserDTO;
import pl.qprogramming.appbase.service.mapper.AccountMapper;
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
    private final CacheManager cacheManager;

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
        return registerUser(accountDTO, password, false, false);
    }

    /**
     * Registers user with User role ( ignoring any attempts to create itself as admin
     */
    public Account registerUser(AccountDTO accountDTO, String password, boolean activated, boolean keepRoles) {
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
        if (!keepRoles) {
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
        if (account.getAuthorities() != null) {
            account.setAuthorities(accountDTO.getAuthorities().stream().map(this::findByRole).collect(Collectors.toSet()));
        }
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
                this.clearUserCaches(user);
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

    @Transactional(readOnly = true)
    public List<AccountDTO> getAllUsers() {
        return userRepository.findAll().stream().map(accountMapper::accountToAccountDTO).collect(Collectors.toList());
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

    private void clearUserCaches(Account account) {
        Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE)).evict(account.getLogin());
        Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_LOGIN_AUTHORITIES_CACHE)).evict(account.getLogin());
        if (account.getEmail() != null) {
            Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE)).evict(account.getEmail());
        }
    }
}
