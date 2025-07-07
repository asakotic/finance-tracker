package finance_tracker.rs.repository;

import finance_tracker.rs.model.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    @Transactional
    @Modifying
    @Query("DELETE FROM User u WHERE u.username = :username")
    int deleteByUsername(String username);

    @Transactional
    @Modifying
    @Query("UPDATE User u SET u.password = :password WHERE u.username = :username")
    int updatePasswordByUsername(String username, String password);

    boolean existsByUsername(String username);
}
