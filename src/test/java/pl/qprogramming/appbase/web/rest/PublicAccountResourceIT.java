package pl.qprogramming.appbase.web.rest;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasItems;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static pl.qprogramming.appbase.web.rest.UserResourceIT.createEntity;

import java.util.Objects;
import javax.persistence.EntityManager;

import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.cache.CacheManager;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import pl.qprogramming.appbase.IntegrationTest;
import pl.qprogramming.appbase.domain.Account;
import pl.qprogramming.appbase.repository.UserRepository;
import pl.qprogramming.appbase.security.AuthoritiesConstants;

/**
 * Integration tests for the {@link UserResource} REST controller.
 */
@AutoConfigureMockMvc
@WithMockUser(authorities = AuthoritiesConstants.ADMIN)
@IntegrationTest
@Slf4j
class PublicAccountResourceIT {

    private static final String DEFAULT_LOGIN = "johndoe";
    private static final String DEFAULT_EMAIL = "johndoe@localhost";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restUserMockMvc;

    @Autowired
    private CacheManager cacheManager;

    private Account user;

    public Account initTestUser(UserRepository userRepository, EntityManager em) {
        userRepository.deleteAll();
        Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE)).invalidate();
        Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_LOGIN_AUTHORITIES_CACHE)).invalidate();
        Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE)).invalidate();
        Account user = createEntity(em);
        user.setLogin(DEFAULT_LOGIN);
        user.setEmail(DEFAULT_EMAIL);
        log.info("Current accounts :" + userRepository.findAll());
        return user;
    }

    @BeforeEach
    public void initTest() {
        user = initTestUser(userRepository, em);
    }

    @Test
    @Transactional
    void getAllPublicUsers() throws Exception {
        // Initialize the database
        userRepository.saveAndFlush(user);

        // Get all the users
        restUserMockMvc
            .perform(get("/api/users?sort=id,desc").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].login").value(hasItem(DEFAULT_LOGIN)))
            .andExpect(jsonPath("$.[*].email").doesNotExist())
            .andExpect(jsonPath("$.[*].imageUrl").doesNotExist())
            .andExpect(jsonPath("$.[*].langKey").doesNotExist());
    }

    @Test
    @Transactional
    void getAllAuthorities() throws Exception {
        restUserMockMvc
            .perform(get("/api/authorities").accept(MediaType.APPLICATION_JSON).contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").value(hasItems(AuthoritiesConstants.USER, AuthoritiesConstants.ADMIN)));
    }

    @Test
    @Transactional
    void getAllUsersSortedByParameters() throws Exception {
        // Initialize the database
        userRepository.save(user);

        restUserMockMvc.perform(get("/api/users?sort=resetKey,desc").accept(MediaType.APPLICATION_JSON)).andExpect(status().isBadRequest());
        restUserMockMvc.perform(get("/api/users?sort=password,desc").accept(MediaType.APPLICATION_JSON)).andExpect(status().isBadRequest());
        restUserMockMvc
            .perform(get("/api/users?sort=resetKey,desc&sort=id,desc").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isBadRequest());
        restUserMockMvc.perform(get("/api/users?sort=id,desc").accept(MediaType.APPLICATION_JSON)).andExpect(status().isOk());
    }
}
