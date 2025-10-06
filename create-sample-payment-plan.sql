-- Create a sample payment plan for demonstration
INSERT INTO payment_plans (
  id, 
  user_id, 
  course_id, 
  total_amount, 
  installment_count, 
  monthly_amount, 
  start_date, 
  end_date, 
  status, 
  description, 
  sms_notifications, 
  created_at, 
  updated_at
) VALUES (
  'sample-payment-plan-1',
  'cmg8fszoi000elig099knsv2u',
  NULL,
  1200.00,
  6,
  200.00,
  '2025-10-15T00:00:00.000Z',
  '2026-03-15T00:00:00.000Z',
  'ACTIVE',
  'Photography Course Payment Plan - 6 months installment',
  true,
  NOW(),
  NOW()
);

-- Create sample installments
INSERT INTO payment_installments (
  id,
  payment_plan_id,
  installment_number,
  amount,
  due_date,
  status,
  created_at,
  updated_at
) VALUES 
  ('installment-1', 'sample-payment-plan-1', 1, 200.00, '2025-10-15T00:00:00.000Z', 'PENDING', NOW(), NOW()),
  ('installment-2', 'sample-payment-plan-1', 2, 200.00, '2025-11-15T00:00:00.000Z', 'PENDING', NOW(), NOW()),
  ('installment-3', 'sample-payment-plan-1', 3, 200.00, '2025-12-15T00:00:00.000Z', 'PENDING', NOW(), NOW()),
  ('installment-4', 'sample-payment-plan-1', 4, 200.00, '2026-01-15T00:00:00.000Z', 'PENDING', NOW(), NOW()),
  ('installment-5', 'sample-payment-plan-1', 5, 200.00, '2026-02-15T00:00:00.000Z', 'PENDING', NOW(), NOW()),
  ('installment-6', 'sample-payment-plan-1', 6, 200.00, '2026-03-15T00:00:00.000Z', 'PENDING', NOW(), NOW());

