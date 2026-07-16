ALTER TABLE casademiranda.suppliers
  ADD COLUMN invoice_number_pattern VARCHAR(255) NULL,
  ADD COLUMN nif_pattern            VARCHAR(255) NULL,
  ADD COLUMN base_amount_pattern    VARCHAR(255) NULL,
  ADD COLUMN vat_rate_pattern       VARCHAR(255) NULL,
  ADD COLUMN total_amount_pattern   VARCHAR(255) NULL;
