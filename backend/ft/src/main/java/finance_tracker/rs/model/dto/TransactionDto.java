package finance_tracker.rs.model.dto;

import java.time.LocalDateTime;

public record TransactionDto(
        boolean isIncome,
        LocalDateTime date,
        Double amount,
        String category
) {}