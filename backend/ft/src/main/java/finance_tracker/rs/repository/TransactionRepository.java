package finance_tracker.rs.repository;

import finance_tracker.rs.model.Transaction;
import finance_tracker.rs.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query("SELECT t FROM Transaction t WHERE " +
            "(:isIncome IS NULL OR t.isIncome = :isIncome) AND " +
            "(:startDate IS NULL OR t.date >= :startDate) AND " +
            "(:endDate IS NULL OR t.date <= :endDate) AND " +
            "(:minAmount IS NULL OR t.amount >= :minAmount) AND " +
            "(:maxAmount IS NULL OR t.amount <= :maxAmount) AND " +
            "(:category IS NULL OR t.category LIKE %:category%)")
    Page<Transaction> findByFilters(
            @Param("isIncome") Boolean isIncome,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("minAmount") Double minAmount,
            @Param("maxAmount") Double maxAmount,
            @Param("category") String category,
            Pageable pageable);
    Optional<Transaction> findByIdAndUser(Long transactionId, User user);

}
