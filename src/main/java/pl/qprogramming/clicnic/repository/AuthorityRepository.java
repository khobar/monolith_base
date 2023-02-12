package pl.qprogramming.clicnic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.qprogramming.clicnic.domain.Authority;

/**
 * Spring Data JPA repository for the {@link Authority} entity.
 */
public interface AuthorityRepository extends JpaRepository<Authority, String> {}
