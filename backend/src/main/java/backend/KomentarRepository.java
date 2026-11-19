package backend;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface KomentarRepository extends JpaRepository<Komentar, Long> {

    List<Komentar> findByRecept_IdOrderByUstvarjenoDesc(Long receptId);

    Optional<Komentar> findByIdAndRecept_Id(Long id, Long receptId);

    void deleteByRecept_Id(Long receptId);
}
