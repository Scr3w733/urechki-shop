package com.urechki.loyalty_service.service;

import com.urechki.loyalty_service.dto.AccrueRequest;
import com.urechki.loyalty_service.dto.LoyaltyQuote;
import com.urechki.loyalty_service.dto.LoyaltyQuoteRequest;
import com.urechki.loyalty_service.model.LoyaltyAccount;
import com.urechki.loyalty_service.model.LoyaltyLevel;
import com.urechki.loyalty_service.model.LoyaltyTransaction;
import com.urechki.loyalty_service.repository.LoyaltyAccountRepository;
import com.urechki.loyalty_service.repository.LoyaltyTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LoyaltyService {

    private final LoyaltyAccountRepository accountRepository;
    private final LoyaltyTransactionRepository transactionRepository;

    /** Возвращает счёт клиента, создавая его при первом обращении. */
    public synchronized LoyaltyAccount getOrCreateAccount(Long customerId) {
        validateCustomerId(customerId);
        return accountRepository.findByCustomerId(customerId)
                .orElseGet(() -> accountRepository.save(newAccount(customerId)));
    }

    public LoyaltyQuote quote(LoyaltyQuoteRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Укажите данные запроса");
        }
        validateCustomerId(request.getCustomerId());
        validateAmount(request.getAmount());

        LoyaltyAccount account = accountRepository.findByCustomerId(request.getCustomerId())
                .orElseGet(() -> newAccount(request.getCustomerId()));
        LoyaltyLevel level = currentLevel(account);

        return LoyaltyQuote.builder()
                .level(level.getTitle())
                .cashbackPercent(level.getCashbackPercent())
                .bonusPointsEarned(level.calculateBonus(request.getAmount()))
                .discountPercent(level.getDiscountPercent())
                .nextLevel(level.next() == null ? null : level.next().getTitle())
                .pointsToNextLevel(level.pointsToNextLevel(account.getSpentTotal()))
                .build();
    }

    /**
     * Начисляет баллы за оплаченный заказ. Повторный вызов с тем же orderId
     * не изменяет счёт и не создаёт новую транзакцию.
     */
    @Transactional
    public synchronized LoyaltyAccount accrue(AccrueRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Укажите данные запроса");
        }
        validateCustomerId(request.getCustomerId());
        if (request.getOrderId() == null) {
            throw new IllegalArgumentException("Укажите номер заказа");
        }
        validateAmount(request.getAmount());

        Optional<LoyaltyTransaction> existing = transactionRepository.findByOrderId(request.getOrderId());
        if (existing.isPresent()) {
            LoyaltyTransaction previous = existing.get();
            if (!request.getCustomerId().equals(previous.getCustomerId())) {
                throw new IllegalArgumentException("Заказ уже учтён для другого клиента");
            }
            return findOrCreateAccount(request.getCustomerId());
        }

        LoyaltyAccount account = findOrCreateAccount(request.getCustomerId());
        LoyaltyLevel level = currentLevel(account);
        long earned = level.calculateBonus(request.getAmount());

        LoyaltyTransaction transaction = new LoyaltyTransaction();
        transaction.setCustomerId(request.getCustomerId());
        transaction.setOrderId(request.getOrderId());
        transaction.setType("Начисление");
        transaction.setAmount(BigDecimal.valueOf(earned));
        transaction.setDescription(String.format(
                "Начисление за заказ №%d: сумма %s ₽, кэшбэк %d%%",
                request.getOrderId(), request.getAmount().toPlainString(), level.getCashbackPercent()));
        transactionRepository.save(transaction);

        BigDecimal spentTotal = account.getSpentTotal().add(request.getAmount());
        int orderCount = account.getOrderCount() + 1;
        account.setPoints(nvl(account.getPoints()) + earned);
        account.setSpentTotal(spentTotal);
        account.setOrderCount(orderCount);
        account.setLevel(LoyaltyLevel.resolve(spentTotal, orderCount).getTitle());
        account.setUpdatedAt(LocalDateTime.now());
        return accountRepository.save(account);
    }

    public List<LoyaltyTransaction> history(Long customerId) {
        validateCustomerId(customerId);
        return transactionRepository.findTop50ByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    private LoyaltyAccount findOrCreateAccount(Long customerId) {
        return accountRepository.findByCustomerId(customerId)
                .orElseGet(() -> accountRepository.save(newAccount(customerId)));
    }

    private LoyaltyAccount newAccount(Long customerId) {
        LoyaltyAccount account = new LoyaltyAccount();
        account.setCustomerId(customerId);
        account.setLevel(LoyaltyLevel.NOVICE.getTitle());
        account.setPoints(0L);
        account.setSpentTotal(BigDecimal.ZERO);
        account.setOrderCount(0);
        account.setUpdatedAt(LocalDateTime.now());
        return account;
    }

    private LoyaltyLevel currentLevel(LoyaltyAccount account) {
        return LoyaltyLevel.resolve(account.getSpentTotal(), account.getOrderCount());
    }

    private long nvl(Long value) {
        return value == null ? 0L : value;
    }

    private void validateCustomerId(Long customerId) {
        if (customerId == null) {
            throw new IllegalArgumentException("Укажите клиента");
        }
    }

    private void validateAmount(BigDecimal amount) {
        if (amount == null) {
            throw new IllegalArgumentException("Укажите сумму покупки");
        }
        if (amount.signum() <= 0) {
            throw new IllegalArgumentException("Сумма покупки должна быть положительной");
        }
    }
}
