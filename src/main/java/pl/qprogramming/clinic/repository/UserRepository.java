package pl.qprogramming.clinic.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pl.qprogramming.clinic.domain.Account;

/**
 * Spring Data JPA repository for the {@link Account} entity.
 */
@Repository
public interface UserRepository extends JpaRepository<Account, Long> {
    Optional<Account> findOneByActivationKey(String activationKey);
    List<Account> findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(Instant dateTime);
    Optional<Account> findOneByResetKey(String resetKey);
    Optional<Account> findOneByEmailIgnoreCase(String email);
    Optional<Account> findOneByLogin(String login);

    @EntityGraph(attributePaths = "authorities")
    Optional<Account> findOneWithAuthoritiesByLogin(String login);

    @EntityGraph(attributePaths = "authorities")
    Optional<Account> findOneWithAuthoritiesByEmailIgnoreCase(String email);

    Page<Account> findAllByIdNotNullAndActivatedIsTrue(Pageable pageable);
}
