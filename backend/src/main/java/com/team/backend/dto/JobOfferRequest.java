package com.team.backend.dto;

import com.team.backend.entity.enums.ContractType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class JobOfferRequest {

    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    private String description;

    @Size(max = 255)
    private String location;

    @NotNull
    private ContractType contractType;

    @DecimalMin("0.0")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal salaryMin;

    @DecimalMin("0.0")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal salaryMax;

    public JobOfferRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public ContractType getContractType() {
        return contractType;
    }

    public void setContractType(ContractType contractType) {
        this.contractType = contractType;
    }

    public BigDecimal getSalaryMin() {
        return salaryMin;
    }

    public void setSalaryMin(BigDecimal salaryMin) {
        this.salaryMin = salaryMin;
    }

    public BigDecimal getSalaryMax() {
        return salaryMax;
    }

    public void setSalaryMax(BigDecimal salaryMax) {
        this.salaryMax = salaryMax;
    }
}
