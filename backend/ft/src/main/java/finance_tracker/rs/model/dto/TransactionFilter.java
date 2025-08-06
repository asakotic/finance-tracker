package finance_tracker.rs.model.dto;

import java.time.LocalDateTime;

public record TransactionFilter(
        Boolean isIncome,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Double minAmount,
        Double maxAmount,
        String category
) {}
