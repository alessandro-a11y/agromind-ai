-- Índice principal de listagem: userId → fazendas
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_farms_userid
    ON "Farms" ("UserId");

-- Alertas ativos por fazenda
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_alerts_farmid_status
    ON "Alerts" ("FarmId", "Status")
    WHERE "Status" = 0;

-- Diagnóstico mais recente por talhão
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_diagnoses_fieldid_createdat
    ON "Diagnoses" ("FieldId", "CreatedAt" DESC);

-- FarmId via Field — join de diagnósticos por fazenda
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_fields_farmid
    ON "Fields" ("FarmId");
