package pl.qprogramming.clinic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.qprogramming.clinic.domain.Authority;

/**
 * Spring Data JPA repository for the {@link Authority} entity.
 */
public interface AuthorityRepository extends JpaRepository<Authority, String> {}
