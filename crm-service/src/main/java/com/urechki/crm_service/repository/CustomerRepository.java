package com.urechki.crm_service.repository;

import com.urechki.crm_service.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
}