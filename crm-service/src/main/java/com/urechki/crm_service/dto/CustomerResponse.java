package com.urechki.crm_service.dto;

import com.urechki.crm_service.model.Customer;

/** Публичный профиль клиента: без пароля. */
public class CustomerResponse {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private Integer discountPercent;
    private Integer bonusPoints;
    private String role;

    public CustomerResponse() {
    }

    public static CustomerResponse from(Customer customer) {
        CustomerResponse dto = new CustomerResponse();
        dto.id = customer.getId();
        dto.name = customer.getName();
        dto.phone = customer.getPhone();
        dto.email = customer.getEmail();
        dto.discountPercent = customer.getDiscountPercent() == null ? 0 : customer.getDiscountPercent();
        dto.bonusPoints = customer.getBonusPoints() == null ? 0 : customer.getBonusPoints();
        dto.role = customer.getRole() == null ? "Клиент" : customer.getRole();
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }
    public Integer getBonusPoints() { return bonusPoints; }
    public void setBonusPoints(Integer bonusPoints) { this.bonusPoints = bonusPoints; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
