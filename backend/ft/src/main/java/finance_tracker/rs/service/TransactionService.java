package finance_tracker.rs.service;


import finance_tracker.rs.configuration.JwtUtil;
import finance_tracker.rs.model.Transaction;
import finance_tracker.rs.model.User;
import finance_tracker.rs.model.dto.TransactionDto;
import finance_tracker.rs.model.dto.TransactionFilter;
import finance_tracker.rs.repository.TransactionRepository;
import finance_tracker.rs.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

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

        return transactionRepository.findByFilters(
                filter.isIncome(),
                filter.startDate(),
                filter.endDate(),
                filter.minAmount(),
                filter.maxAmount(),
                filter.category(),
                pageable
        );
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
