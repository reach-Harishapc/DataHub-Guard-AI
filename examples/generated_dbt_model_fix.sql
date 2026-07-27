-- Fix for DataHub Incident incident_1710928372
-- Root Cause: Upstream table changed 'PAYMENT_STATUS' to 'PAY_STATUS'

WITH source_data AS (
    SELECT
        order_id,
        customer_id,
        amount,
        -- PAYMENT_STATUS removed, using PAY_STATUS instead
        PAY_STATUS AS payment_status,
        created_at
    FROM {{ ref('stg_orders') }}
)

SELECT * FROM source_data;
