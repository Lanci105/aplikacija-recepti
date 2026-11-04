package backend;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReceptRepository extends JpaRepository<Recept, Long> {

    List<Recept> findByImeContainingIgnoreCase(String ime);

    List<Recept> findByCasPripraveLessThanEqual(int casPriprave);

    List<Recept> findByKategorijeContainingIgnoreCase(String kategorije);

    List<Recept> findByVrstaObrokaIgnoreCase(String vrstaObroka);
}