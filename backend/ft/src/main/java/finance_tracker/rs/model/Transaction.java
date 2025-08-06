package finance_tracker.rs.model;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private boolean isIncome;
    @Column(nullable = false)
    private LocalDateTime date;
    @Column(nullable = false)
    private Double amount;
    @Column(nullable = false)
    private String category;
    @ManyToOne
    private User user;
}
