package finance_tracker.rs.service;


import finance_tracker.rs.configuration.JwtUtil;
import finance_tracker.rs.model.Transaction;
import finance_tracker.rs.model.User;
import finance_tracker.rs.model.dto.TransactionDto;
import finance_tracker.rs.model.dto.TransactionFilter;
import finance_tracker.rs.repository.TransactionRepository;
import finance_tracker.rs.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    @PersistenceContext
    private EntityManager entityManager;

    public TransactionService(TransactionRepository transactionRepository, UserRepository userRepository, JwtUtil jwtUtil) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public Page<Transaction> getAllTransactions(
            TransactionFilter filter,
            int page,
            int size,
            String sortBy,
            String sortDirection) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.fromString(sortDirection), sortBy)
        );

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Transaction> cq = cb.createQuery(Transaction.class);
        Root<Transaction> root = cq.from(Transaction.class);

        List<Predicate> predicates = new ArrayList<>();

        if (filter.isIncome() != null) {
            predicates.add(cb.equal(root.get("isIncome"), filter.isIncome()));
        }
        if (filter.startDate() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("date"), filter.startDate()));
        }
        if (filter.endDate() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("date"), filter.endDate()));
        }
        if (filter.minAmount() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("amount"), filter.minAmount()));
        }
        if (filter.maxAmount() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("amount"), filter.maxAmount()));
        }
        if (filter.category() != null && !filter.category().isEmpty()) {
            predicates.add(cb.like(root.get("category"), "%" + filter.category() + "%"));
        }

        cq.where(predicates.toArray(new Predicate[0]));

        if (sortDirection.equalsIgnoreCase("desc")) {
            cq.orderBy(cb.desc(root.get(sortBy)));
        } else {
            cq.orderBy(cb.asc(root.get(sortBy)));
        }

        TypedQuery<Transaction> query = entityManager.createQuery(cq);

        query.setFirstResult((int) pageable.getOffset());
        query.setMaxResults(pageable.getPageSize());

        List<Transaction> resultList = query.getResultList();

        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Transaction> countRoot = countQuery.from(Transaction.class);
        countQuery.select(cb.count(countRoot));
        countQuery.where(predicates.toArray(new Predicate[0]));
        Long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(resultList, pageable, total);
    }


    public Optional<Transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    @Transactional
    public Transaction createTransaction(TransactionDto transactionDto, String auth) {

        String username = jwtUtil.extractUserUsername(auth);
        User u = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = new Transaction();
        transaction.setIncome(transactionDto.isIncome());
        transaction.setDate(transactionDto.date());
        transaction.setAmount(transactionDto.amount());
        transaction.setCategory(transactionDto.category());
        transaction.setUser(u);

        if (transactionDto.isIncome()) {
            u.setBalance(u.getBalance() + transactionDto.amount());
        } else {
            u.setBalance(u.getBalance() - transactionDto.amount());
        }

        transactionRepository.save(transaction);
        userRepository.save(u);

        return transaction;
    }

    @Transactional
    public Transaction updateTransaction(Long id, TransactionDto transactionDto, String auth) {
        String username = jwtUtil.extractUserUsername(auth);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Transaction not found or not owned by user"));

        // store old values
        boolean wasIncome = transaction.isIncome();
        double oldAmount = transaction.getAmount();
        boolean isIncomeNow = transactionDto.isIncome();
        double newAmount = transactionDto.amount();

        transaction.setIncome(isIncomeNow);
        transaction.setDate(transactionDto.date());
        transaction.setAmount(newAmount);
        transaction.setCategory(transactionDto.category());

        double balanceAdjustment = 0.0;

        if (wasIncome && isIncomeNow) {
            balanceAdjustment = newAmount - oldAmount;
        } else if (!wasIncome && !isIncomeNow) {
            balanceAdjustment = oldAmount - newAmount;
        } else if (wasIncome && !isIncomeNow) {
            balanceAdjustment = -oldAmount - newAmount;
        } else if (!wasIncome && isIncomeNow) {
            balanceAdjustment = oldAmount + newAmount;
        }

        user.setBalance(user.getBalance() + balanceAdjustment);

        transactionRepository.save(transaction);
        userRepository.save(user);

        return transaction;
    }

    public boolean deleteTransaction(Long id) {
        if (transactionRepository.existsById(id)) {
            transactionRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
