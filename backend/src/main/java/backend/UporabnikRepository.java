package backend;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

// JPA poizvedbe za iskanje in shranjevanje uporabniških računov.
public interface UporabnikRepository extends JpaRepository<Uporabnik, Long> {

    boolean existsByEmail(String email);

    Optional<Uporabnik> findByEmail(String email);
}
