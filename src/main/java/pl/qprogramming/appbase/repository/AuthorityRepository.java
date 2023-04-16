package pl.qprogramming.appbase.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.qprogramming.appbase.domain.Authority;

/**
 * Spring Data JPA repository for the {@link Authority} entity.
 */
public interface AuthorityRepository extends JpaRepository<Authority, String> {}
