package backend;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

// JPA poizvedbe za iskanje in shranjevanje uporabniških računov.
public interface UporabnikRepository extends JpaRepository<Uporabnik, Long> {

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    Optional<Uporabnik> findByEmail(String email);

    List<Uporabnik> findByPriljubljeniRecepti_Id(Long receptId);
}
